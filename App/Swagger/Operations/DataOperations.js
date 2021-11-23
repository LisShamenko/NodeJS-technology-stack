// --------------- фабрика

let poolWrapper;

module.exports = (inPoolWrapper) => {
    poolWrapper = inPoolWrapper;

    return {
        getInsertOperations: getInsertOperations,
        insertData: insertData,
        getUpdateBuilder: getUpdateBuilder,
        updateData: updateData,
        getUpdateParent: getUpdateParent,
        deleteData: deleteData,
        selectDataExecutor: selectDataExecutor,
        selectDataTable: selectDataTable,
    };
}

// --------------- insert

async function getInsertOperations(columns, treeLinks) {

    let transactOperations = [];

    for (let i = 0; i < treeLinks.length; i++) {
        const treeLinkItem = treeLinks[i];
        const parentColumn = columns.find(item => item.id === treeLinkItem.parent_key_id);
        const childColumn = columns.find(item => item.id === treeLinkItem.table_key_id);

        transactOperations.push((results) => {

            let insertedRows = results[0].rows;

            // собрать все родительские индексы
            let parentIds = insertedRows.map(item => item[parentColumn.name]);

            // найти существующих родителей
            return {
                queryParams: [parentIds],
                queryString: `SELECT * FROM metadata.${treeLinkItem.tree_table_name} WHERE id = ANY($1)`,
            }
        });

        transactOperations.push((results) => {

            let insertedRows = results[0].rows;
            let existingParents = results[(i * 2) + 1].rows;

            // сортировка по родительскому индексу 
            insertedRows.sort(function (rowA, rowB) {
                if (rowA[parentColumn.name] > rowB[parentColumn.name]) {
                    return 1;
                }
                if (rowA[parentColumn.name] < rowB[parentColumn.name]) {
                    return -1;
                }
                return 0;
            });

            // 
            let valueStrings = [];
            for (let j = 0; j < insertedRows.length; j++) {
                const insertedRow = insertedRows[j];

                let parentId = insertedRow[parentColumn.name];
                let childId = insertedRow[childColumn.name];
                let parentRow = existingParents.find(item => item.id === parentId);

                let rowValues = [];
                rowValues.push(childId); // insertedRow.id);
                rowValues.push((parentId || parentId === 0) ? parentId : 'null');
                if (parentRow) {
                    rowValues.push(parentRow.layer + 1);
                    if (parentRow.path && parentRow.path !== 'null' && parentRow.path.length > 0) {
                        rowValues.push(`${parentRow.path}.${parentRow.id}`);
                    }
                    else {
                        rowValues.push(`${parentRow.id}`);
                    }
                }
                else {
                    rowValues.push(0);
                    rowValues.push('null');
                }
                valueStrings.push(`(${rowValues.join(', ')})`);
                existingParents.push({ id: rowValues[0], parent: rowValues[1], layer: rowValues[2], path: rowValues[3] });
            }

            return {
                queryParams: [],
                queryString: `
                    INSERT INTO metadata.${treeLinkItem.tree_table_name}(id, parent, layer, path) 
                    VALUES ${valueStrings.join(', ')}
                    returning *
                `,
            }
        });
    }

    return transactOperations;
}

async function insertData(transactOperations, table, columns, dataRows) {

    let dataValues = [];
    dataRows.forEach(dataItem => {
        let rowValues = [];
        columns.forEach(columnItem => {
            let findItem = dataItem.find(item => item.column_id === columnItem.id);

            let rowValue = 'null';
            if (findItem && findItem.column_value !== null) {
                if (columnItem.type === 'integer') {
                    rowValue = `${findItem.column_value}`;
                }
                else if (columnItem.type === 'text') {
                    rowValue = `'${findItem.column_value}'`;
                }
            }
            rowValues.push(rowValue);
        });
        dataValues.push(`(${rowValues.join(', ')})`);
    });

    let columnStrings = [];
    columns.forEach(columnItem => columnStrings.push(columnItem.name));

    let allResults = await poolWrapper.transactArray([
        (results) => {
            return {
                queryParams: [],
                queryString: `
                    INSERT INTO ${table.schema}.${table.name}(${columnStrings.join(',')}) 
                    VALUES ${dataValues.join(', ')}
                    returning *
                `,
            }
        },
        ...transactOperations
    ]);

    return allResults[0].rows;
}

// --------------- update builder

function getUpdateBuilder(table) {

    let index = 0;

    let queryStrings = {
        table: table,
        columnObjects: [],
        whereObjects: [],
        queryParams: [],
    };

    return {

        getItemObject(itemName) {
            index++;
            return {
                index: index,
                name: itemName,
            };
        },

        addColumnObject(itemName, itemValue) {
            let itemObject = this.getItemObject(itemName);
            queryStrings.columnObjects.push(itemObject);
            queryStrings.queryParams.push(itemValue);
        },

        addWhereObject(itemName, itemValue) {
            let itemObject = this.getItemObject(itemName);
            queryStrings.whereObjects.push(itemObject);
            queryStrings.queryParams.push(itemValue);
        },

        getStringFromArray(items, separator) {
            let itemStrings = [];
            items.forEach(item => {
                itemStrings.push(`${item.name} = $${item.index}`);
            });
            return itemStrings.join(separator);
        },

        getQueryString() {
            return `
                UPDATE ${queryStrings.table.schema}.${queryStrings.table.name}
                SET ${this.getStringFromArray(queryStrings.columnObjects, ', ')}
                WHERE ${this.getStringFromArray(queryStrings.whereObjects, ' AND ')}
            `;
        },

        getQueryParams() {
            return queryStrings.queryParams;
        }
    };
}

// --------------- updata

async function updateData(updateBuilder, transactQueries) {

    transactQueries.push(
        (results) => {
            return {
                queryParams: updateBuilder.getQueryParams(),
                queryString: updateBuilder.getQueryString(),
            }
        }
    );

    let allResults = await poolWrapper.transactArray(transactQueries);

    let retRes = {};
    for (let i = 0; i < allResults.length; i++) {
        const result = allResults[i];
        retRes[`rowCount_${i}`] = result.rowCount;
    }
    return retRes;
}

async function getUpdateParent(schema, treeName, newParentId, childId) {

    let fromTreeName = `${schema}.${treeName}`;
    //let fromTableName = `${schema}.${tableName}`;

    let results = await poolWrapper.query(
        `SELECT * FROM ${fromTreeName} WHERE id = ANY($1)`,
        [[newParentId, childId]]);

    let parentRow = results.rows.find(item => item.id === newParentId);
    let childRow = results.rows.find(item => item.id === childId);
    let newPath = `${parentRow.path}.${parentRow.id}`;
    let oldPath = `${childRow.path}.${childRow.id}`;

    //let allResults = await poolWrapper.transactArray([
    return [
        (results) => {
            return {
                queryParams: [parentRow.id, (parentRow.layer + 1), newPath, childId],
                queryString: `UPDATE ${fromTreeName} SET parent=$1, layer=$2, path=$3 WHERE id=$4`,
            }
        },
        (results) => {
            return {
                //queryParams: [childId, parentRow.id, parentRow.layer, (parentRow.path + '.' + parentRow.id)],
                queryParams: [],
                queryString: `
                    UPDATE ${fromTreeName}
                    SET
                        layer = (layer - ${childRow.layer} + ${parentRow.layer + 1}),
                        "path" = concat('${newPath}', substring("path" from ${oldPath.length - 1} for char_length("path")))
                    WHERE "path" LIKE '${oldPath}%'
                `,
            }
        },
    ];
    //    (results) => {
    //        return {
    //            queryParams: [newParentId, childId],
    //            queryString: `UPDATE ${fromTableName} SET ${columnName}=$1 WHERE id=$2`,
    //        }
    //    },
    //]);
}

// --------------- delete

function getWhere(columns, options) {

    let index = 1;
    let whereStrings = [];
    let whereParams = [];
    options.forEach(optionItem => {
        if (optionItem.is_primary) {
            whereStrings.push(`id = $${index}`);
            whereParams.push(optionItem.column_value);
        }
        else {
            let column = columns.find(item => item.id === optionItem.column_id);
            whereStrings.push(`${column.name} = $${index}`);
            whereParams.push(optionItem.column_value);
        }
    });

    return {
        whereStrings: whereStrings,
        whereParams: whereParams,
    }
}

async function deleteData(table, columns, options) {

    let { whereStrings, whereParams } = getWhere(columns, options);
    let result = await poolWrapper.query(`
            DELETE FROM ${table.schema}.${table.name}
            WHERE ${whereStrings.join(' AND ')}
        `,
        whereParams);

    return {
        rowCount: result.rowCount
    }
}

// --------------- select

async function selectDataExecutor(executor) {
    let result = await poolWrapper.query(executor.query_string, []);
    return (result.rows && result.rows.length > 0) ? result.rows : null;
}

async function selectDataTable(table, columns, options) {

    let columnStrings = [];
    columns.forEach(columnItem => columnStrings.push(columnItem.name));

    let { whereStrings, whereParams } = getWhere(columns, options);
    let result = await poolWrapper.query(`
            SELECT id, ${columnStrings.join(',')}
            FROM ${table.schema}.${table.name}
            WHERE ${whereStrings.join(' AND ')}
        `,
        whereParams);

    return result.rows;
}
