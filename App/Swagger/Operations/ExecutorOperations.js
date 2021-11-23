// --------------- фабрика

let poolWrapper;

module.exports = (inPoolWrapper) => {
    poolWrapper = inPoolWrapper;

    return {
        parseLinks: parseLinks,
        insertExecutor: insertExecutor,
        deleteExecutor: deleteExecutor,
        selectExecutor: selectExecutor,
        selectExecutors: selectExecutors,
    };
}

// --------------- executors: query builder

function getQueryBuilder(tables, columns, options) {

    let curIndex = -1;

    let queryStrings = {
        fromString: '',
        joinStrings: [],
        selectStrings: [],
        whereStrings: [],
        havingString: [],
        orderStrings: [],
        groupStrings: [],
        groupColumns: [],
    };

    return {

        getTableAlias() {
            curIndex++;
            return `table_${curIndex}`;
        },

        getLinkItem(link) {

            let linkTable = tables.find(item => item.id === link.table_id);
            let linkColumns = columns.filter(item => item.table_id === link.table_id);
            let keyColumn = linkColumns.find(item => item.id === link.table_key_id);
            let linkOptions = options.links.find(item => item.link_id === link.id);

            linkColumns.forEach(linkColumn => {
                let columnOptions = null;
                if (linkOptions) {
                    columnOptions = linkOptions.columns.filter(item => item.column_id === linkColumn.id);
                    if (columnOptions) {
                        columnOptions.forEach(item => item.column = linkColumn);
                    }
                }
                linkColumn.options = columnOptions;
            });

            return {
                link: link,
                table: linkTable,
                columns: linkColumns,
                keyColumn: keyColumn,
                options: linkOptions,
                tableAlias: this.getTableAlias(),
            }
        },

        // --------------- 

        getQueryString() {

            let whereString = this.getPartialString('WHERE', queryStrings.whereStrings, ' AND ');
            let groupString = this.getPartialString('GROUP BY', queryStrings.groupStrings, ', ');
            let havingString = this.getPartialString('HAVING', queryStrings.havingString, ' AND ');
            let orderString = this.getPartialString('ORDER BY', queryStrings.orderStrings, ', ');

            return `
                SELECT ${queryStrings.selectStrings.join(', ')}
                ${queryStrings.fromString}
                ${queryStrings.joinStrings.join('\n')}
                ${whereString}
                ${groupString}
                ${havingString}
                ${orderString}
            `;
        },
        getPartialString(prefix, parts, separator) {
            if (parts.length > 0) {
                return `${prefix} ${parts.join(separator)}`;
            }
            return '';
        },

        addFromString(rootTable, rootItem) {
            queryStrings.fromString = `
                FROM ${rootTable.schema}.${rootItem.table.name} AS ${rootItem.tableAlias}
            `;
        },

        addJoinString(curTable, curItem, rootAndJoinItems) {
            let prevItem = rootAndJoinItems.find(item => item.link.table_id === curItem.link.parent_id);
            let parentColumn = prevItem.columns.find(item => item.id === curItem.link.parent_key_id);
            queryStrings.joinStrings.push(`
                INNER JOIN ${curTable.schema}.${curItem.table.name} AS ${curItem.tableAlias} 
                ON ${curItem.tableAlias}.${curItem.keyColumn.name} = ${prevItem.tableAlias}.${parentColumn.name}
            `);
        },

        addTreeStrings(treeTable, treeLinkTable, treeLinkItem, rootAndJoinItems) {

            let treeLinkOptions = options.links.find(item => item.link_id === treeLinkItem.id);
            if (treeLinkOptions) {
                treeLinkOptions = treeLinkOptions.tree_options;
            }
            else {
                return;
            }

            let tableItem = rootAndJoinItems.find(item => item.link.table_id === treeLinkTable.table_id);
            let parentColumn = tableItem.columns.find(item => item.id === treeLinkTable.parent_key_id);
            let tableColumn = tableItem.columns.find(item => item.id === treeLinkTable.table_key_id);
            let alias = this.getTableAlias();

            let joinString = `
                INNER JOIN ${treeTable.schema}.${treeLinkTable.tree_table_name} AS ${alias}
                ON ${alias}.id = ${tableItem.tableAlias}."${tableColumn.name}"
            `;
            queryStrings.joinStrings.push(joinString);

            let whereStrings = [];
            if (treeLinkOptions.layer || treeLinkOptions.layer === 0) {
                whereStrings.push(`${alias}.layer = ${treeLinkOptions.layer}`);
            }
            if (treeLinkOptions.parent || treeLinkOptions.parent === 0) {
                whereStrings.push(`${alias}.parent = ${treeLinkOptions.parent}`);
            }
            if (treeLinkOptions.path) {
                whereStrings.push(`${alias}.path LIKE '${treeLinkOptions.path}%'`);
            }
            queryStrings.whereStrings.push(`(${whereStrings.join(' AND ')})`);
        },

        // ---------------  

        getAggString(columnOption, tableAlias) {
            return `${columnOption.agg_func}(${tableAlias}.${columnOption.column.name})` +
                ((columnOption.alias) ? ` AS ${columnOption.alias}` : '');
        },

        getWhereString(linkItem, columnOption) {
            return [
                `${linkItem.tableAlias}.${columnOption.column.name} >= ${columnOption.where.left}`,
                `${linkItem.tableAlias}.${columnOption.column.name} <= ${columnOption.where.right}`,
            ];
        },

        getSelectString(linkItem, columnOption) {
            let aliasString = columnOption.alias ? ` AS "${columnOption.alias}"` : '';
            return `${linkItem.tableAlias}.${columnOption.column.name}${aliasString}`;
        },

        addGroupString(linkItem, columnOption) {
            if (!queryStrings.groupColumns.includes(columnOption.column.name)) {
                queryStrings.groupStrings.push(`${linkItem.tableAlias}.${columnOption.column.name}`);
                queryStrings.groupColumns.push(columnOption.column.name);
            }
        },

        addColumnStrings(linkItem) {

            if (!linkItem.options) {
                return;
            }

            if (options.type === 'select') {
                linkItem.options.columns.forEach(columnOption => {

                    if (columnOption.type === 'select') {
                        queryStrings.selectStrings.push(this.getSelectString(linkItem, columnOption));
                    }
                    else if (columnOption.type === 'where') {
                        queryStrings.whereStrings.push(...this.getWhereString(linkItem, columnOption));
                    }
                    else if (columnOption.type === 'order') {
                        queryStrings.orderStrings.push(`${linkItem.tableAlias}.${columnOption.column.name}`);
                    }
                });
            }
            else if (options.type === 'group') {
                linkItem.options.columns.forEach(columnOption => {

                    if (columnOption.type === 'group') {
                        let selectString = this.getSelectString(linkItem, columnOption);
                        queryStrings.selectStrings.push(selectString);
                        queryStrings.groupStrings.push(selectString);
                    }
                    else if (columnOption.type === 'agg') {
                        let aggString = this.getAggString(columnOption, linkItem.tableAlias);
                        queryStrings.selectStrings.push(aggString);
                        this.addGroupString(linkItem, columnOption);
                    }
                    else if (columnOption.type === 'where') {
                        queryStrings.whereStrings.push(...this.getWhereString(linkItem, columnOption));
                    }
                    else if (columnOption.type === 'having') {
                        queryStrings.havingString.push(...this.getWhereString(linkItem, columnOption));
                        this.addGroupString(linkItem, columnOption);
                    }
                    else if (columnOption.type === 'order') {
                        queryStrings.orderStrings.push(`${linkItem.tableAlias}.${columnOption.column.name}`);
                    }
                });
            }
        },
    }
}

// --------------- executors: insert executor

function parseLinks(links) {

    // разбор связей
    let rootLink = null;
    let joinLinks = [];
    let treeLinks = [];
    for (let i = 0; i < links.length; i++) {
        const curLink = links[i];
        if (curLink.type === 'join') {
            joinLinks.push(curLink);
        }
        else if (curLink.type === 'tree') {
            treeLinks.push(curLink);
        }
        else if (curLink.type === 'root') {
            rootLink = curLink;
        }
    }

    // 
    let treeLinkValues = [];
    treeLinks.forEach(item => {
        if (item.table_id === item.parent_id) {
            treeLinkValues.push({
                table_id: item.table_id,
                table_key_id: item.table_key_id,
                parent_key_id: item.parent_key_id,
            });
        }
    });

    return {
        rootLink: rootLink,
        joinLinks: joinLinks,
        treeLinks: treeLinks,
        treeLinkValues: treeLinkValues,
    };
}

async function insertExecutor(title, links, tables, columns, options) {

    // построитель запросов
    let queryBuilder = getQueryBuilder(tables, columns, options);

    // 
    let rootItem = queryBuilder.getLinkItem(links.rootLink);
    let joinItems = links.joinLinks.map(item => queryBuilder.getLinkItem(item));
    joinItems.sort(function (a, b) {
        return a.link.index - b.link.index;
    });

    // 
    let rootTable = tables.find(item => item.id === rootItem.link.table_id);
    queryBuilder.addFromString(rootTable, rootItem);
    queryBuilder.addColumnStrings(rootItem);
    let rootAndJoinItems = [rootItem, ...joinItems];
    for (let i = 1; i < rootAndJoinItems.length; i++) {
        const curItem = rootAndJoinItems[i];
        let curTable = tables.find(item => item.id === curItem.link.table_id);
        queryBuilder.addJoinString(curTable, curItem, rootAndJoinItems);
        queryBuilder.addColumnStrings(curItem);
    }

    if (links.treeLinkTables) {
        links.treeLinkTables.forEach(treeLinkTable => {
            let treeLinkItem = links.treeLinks.find(item => {
                return item.table_id === treeLinkTable.table_id &&
                    item.table_key_id === treeLinkTable.table_key_id &&
                    item.parent_key_id === treeLinkTable.parent_key_id
            });
            let treeTable = tables.find(item => item.id === treeLinkTable.table_id);
            if (treeLinkItem && treeTable) {
                queryBuilder.addTreeStrings(treeTable, treeLinkTable, treeLinkItem, rootAndJoinItems);
            }
        });
    }

    let queryString = queryBuilder.getQueryString();
    let result = await poolWrapper.query(
        `INSERT INTO metadata.query_executors(query_string, title) VALUES ($1, $2) returning id, title`,
        [queryString, title]);

    return (result.rows && result.rows.length > 0) ? result.rows[0] : null;
}

// --------------- executors: delete executor

async function deleteExecutor(id) {
    let result = await poolWrapper.query(`DELETE FROM metadata.query_executors WHERE id = $1`, [id]);
    return { rowCount: result.rowCount };
}

// --------------- executors: select executor

async function selectExecutor(id) {
    let result = await poolWrapper.query(`SELECT * FROM metadata.query_executors WHERE id = $1`, [id]);
    return (result.rows && result.rows.length > 0) ? result.rows[0] : null;
}

// --------------- executors: select executors

async function selectExecutors() {
    let result = await poolWrapper.query(`SELECT id, title FROM metadata.query_executors`, []);
    return result.rows;
}
