// --------------- фабрика

let metadataOperations;
let Errors;
let resultProcessing;

module.exports = (inMetadataOperations, inErrors, inResultProcessing) => {

    metadataOperations = inMetadataOperations;
    Errors = inErrors;
    resultProcessing = inResultProcessing;

    return {
        insertColumn: insertColumn,
        deleteColumn: deleteColumn,
        selectColumn: selectColumn,
        selectColumns: selectColumns,
    };
}

// --------------- insert column

async function insertColumn(data) {
    try {

        let table = await metadataOperations.selectTable(data.table_id);
        if (table === null) {
            return resultProcessing.getErrorResult(Error(Errors.messages.selectTableMessage), Errors.selectTableError);
        }

        let columns = await metadataOperations.selectColumns(table.id);
        let existColumn = columns.find(item => item.name === data.column.name);
        if (existColumn) {
            return resultProcessing.getErrorResult(Error(Errors.messages.columnNameExistsMessage), Errors.columnNameExists);
        }

        return await metadataOperations.insertColumn(table, data.column);
    }
    catch (err) {
        return resultProcessing.getErrorResult(err, Errors.insertColumnError);
    }
}

// --------------- delete column

async function deleteColumn(data) {
    try {

        let table = await metadataOperations.selectTable(data.table_id);
        if (table === null) {
            return resultProcessing.getErrorResult(Error(Errors.messages.selectTableMessage), Errors.selectTableError);
        }

        let column = await metadataOperations.selectColumn(data.table_id, data.column_id);
        if (column === null) {
            return resultProcessing.getErrorResult(Error(Errors.messages.selectColumnMessage), Errors.selectColumnError);
        }

        return await metadataOperations.deleteColumn(table, column);
    }
    catch (err) {
        return resultProcessing.getErrorResult(err, Errors.deleteColumnError);
    }
}

// --------------- select column

async function selectColumn(data) {
    try {
        return await metadataOperations.selectColumn(data.table_id, data.column_id);
    }
    catch (err) {
        return resultProcessing.getErrorResult(err, Errors.selectColumnError);
    }
}

// --------------- select columns

async function selectColumns(data) {
    try {
        return await metadataOperations.selectColumns(data.table_id);
    }
    catch (err) {
        return resultProcessing.getErrorResult(err, Errors.selectColumnError);
    }
}
