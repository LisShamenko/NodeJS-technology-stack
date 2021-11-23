// --------------- фабрика

let dataOperations;
//let metadataOperations;
//let queriesOperations;
//let executorOperations;
let Errors;
let resultProcessing;

module.exports = (inDataOperations, inMetadataOperations, inQueriesOperations, inExecutorOperations, inErrors, inResultProcessing) => {

    dataOperations = inDataOperations;
    metadataOperations = inMetadataOperations;
    queriesOperations = inQueriesOperations;
    executorOperations = inExecutorOperations;
    Errors = inErrors;
    resultProcessing = inResultProcessing;

    return {
        insertData: insertData,
        updateData: updateData,
        deleteData: deleteData,
        selectData: selectData,
    };
}

// --------------- 

async function getTableWithColumns(tableId) {
    let table = await metadataOperations.selectTable(tableId);
    if (table === null) {
        return null;
    }
    table.columns = await metadataOperations.selectColumns(tableId);
    return table;
}

// --------------- insert

async function insertData(data) {
    try {
        let table = await getTableWithColumns(data.table_id);
        if (table === null) {
            return resultProcessing.getErrorResult(Error(Errors.messages.selectTableMessage), Errors.selectTableError);
        }

        let treeLinks = await queriesOperations.selectTreeLinksById(table.id, null, null);
        let insertOperations = await dataOperations.getInsertOperations(table.columns, treeLinks);

        return await dataOperations.insertData(insertOperations, table, table.columns, data.data_rows);
    }
    catch (err) {
        return resultProcessing.getErrorResult(err, Errors.insertDataError);
    }
}

// --------------- update

async function updateData(data) {
    try {

        let primaryOption = data.data_rows.find(item => item.is_primary);
        if (!primaryOption) {
            return resultProcessing.getErrorResult(Error(Errors.messages.primaryColumnNotExists), Errors.updateDataError);
        }

        let table = await getTableWithColumns(data.table_id);
        if (table === null) {
            return resultProcessing.getErrorResult(Error(Errors.messages.selectTableMessage), Errors.selectTableError);
        }

        let treeLinks = await queriesOperations.selectTreeLinksById(table.id, null, null);
        let updateBuilder = dataOperations.getUpdateBuilder(table);
        let transactQueries = [];

        let primaryResult = await dataOperations.selectDataTable(table, table.columns, [primaryOption]);
        let primaryData = primaryResult[0];

        // 
        let columnIds = [];
        for (let i = 0; i < data.data_rows.length; i++) {
            const optionItem = data.data_rows[i];
            if (columnIds.includes(optionItem.column_id)) {
                continue;
            }
            columnIds.push(optionItem.column_id);

            // 
            let isContinue = false;
            for (let j = 0; j < treeLinks.length; j++) {
                const linkItem = treeLinks[j];

                // нельзя изменить идентификатор в дереве
                if (optionItem.column_id === linkItem.table_key_id) {
                    optionItem.column_id = -1;
                    optionItem.column_value = null;
                    isContinue = true;
                    break;
                }

                // смена родителя
                if (optionItem.column_id === linkItem.parent_key_id) {

                    let tableKeyColumn = table.columns.find(item => item.id === linkItem.table_key_id);
                    let keyColumnValue = primaryData[tableKeyColumn.name];

                    // не может быть родителем самого себя
                    if (keyColumnValue !== optionItem.column_value) {
                        let parentKeyColumn = table.columns.find(item => item.id === linkItem.parent_key_id);
                        let updateTransacts = await dataOperations.getUpdateParent(
                            table.schema, linkItem.tree_table_name,
                            optionItem.column_value, keyColumnValue);

                        updateBuilder.addColumnObject(parentKeyColumn.name, optionItem.column_value);
                        transactQueries.push(...updateTransacts);
                    }

                    isContinue = true;
                    break;
                }
            }

            // обработка остальных колонок
            if (isContinue === false) {
                let column = table.columns.find(item => item.id === optionItem.column_id);
                if (column) {
                    updateBuilder.addColumnObject(column.name, optionItem.column_value);
                }
            }
        }

        updateBuilder.addWhereObject('id', primaryOption.column_value);

        let result = await dataOperations.updateData(updateBuilder, transactQueries);

        return await dataOperations.selectDataTable(table, table.columns, [primaryOption]);
    }
    catch (err) {
        return resultProcessing.getErrorResult(err, Errors.updateDataError);
    }
}

// --------------- delete

function parseOptions(options) {
    if (typeof options === 'string') {
        return [JSON.parse(options)];
    }
    else if (Array.isArray(options)) {
        return options.map(item => JSON.parse(item));
        //return options.map(item => (typeof item === 'string') ? JSON.parse(item) : item);
    }
    else if (typeof options === 'object') {
        return [options];
    }
    return options;
}

async function deleteData(data) {
    try {
        let table = await getTableWithColumns(data.table_id);
        if (table === null) {
            return resultProcessing.getErrorResult(Error(Errors.messages.selectTableMessage), Errors.selectTableError);
        }

        let options = parseOptions(data.options);
        return await dataOperations.deleteData(table, table.columns, options);
    }
    catch (err) {
        return resultProcessing.getErrorResult(err, Errors.deleteDataError);
    }
}

// --------------- select

async function selectData(data) {
    try {

        // запрос через исполнитель
        let executor = null;
        if (data.executor_id && data.executor_id !== 'null') {
            executor = await executorOperations.selectExecutor(data.executor_id);
            if (executor) {
                return await dataOperations.selectDataExecutor(executor);
            }
            else if (!data.table_id && data.table_id !== 0) {
                return [];
            }
        }

        // запрос через таблицу
        let table = await getTableWithColumns(data.table_id);
        if (table === null) {
            return resultProcessing.getErrorResult(Error(Errors.messages.selectTableMessage), Errors.selectTableError);
        }

        // 
        let options = parseOptions(data.options);
        return await dataOperations.selectDataTable(table, table.columns, options);

    }
    catch (err) {
        return resultProcessing.getErrorResult(err, Errors.selectDataError);
    }
}
