// --------------- фабрика

let metadataOperations;
let Errors;
let resultProcessing;

module.exports = (inMetadataOperations, inErrors, inResultProcessing) => {

    metadataOperations = inMetadataOperations;
    Errors = inErrors;
    resultProcessing = inResultProcessing;

    return {
        insertTable: insertTable,
        deleteTable: deleteTable,
        selectTable: selectTable,
        selectTables: selectTables,
    };
}

// --------------- insert table

async function insertTable(data) {
    try {

        let tables = await metadataOperations.selectTables();
        let existTable = tables.find(item => item.name === data.table.name);
        if (existTable) {
            return resultProcessing.getErrorResult(Error(Errors.messages.tableNameExistsMessage), Errors.tableNameExists);
        }

        return await metadataOperations.insertTable(data.table, data.columns);
    }
    catch (err) {
        return resultProcessing.getErrorResult(err, Errors.insertTableError);
    }
}

// --------------- delete table

async function deleteTable(data) {
    try {

        let table = await metadataOperations.selectTable(data.id);
        if (table === null) {
            return resultProcessing.getErrorResult(Error(Errors.messages.selectTableMessage), Errors.selectTableError);
        }

        return await metadataOperations.deleteTable(table);
    }
    catch (err) {
        return resultProcessing.getErrorResult(err, Errors.deleteTableError);
    }
}

// --------------- select table

async function selectTable(data) {
    try {

        let table = await metadataOperations.selectTable(data.id);
        if (table === null) {
            return resultProcessing.getErrorResult(Error(Errors.messages.selectTableMessage), Errors.selectTableError);
        }

        let columns = await metadataOperations.selectColumns(table.id);

        return {
            table: table,
            columns: columns
        };
    }
    catch (err) {
        return resultProcessing.getErrorResult(err, Errors.selectTableError);
    }
}

// --------------- select tables

async function selectTables() {
    try {
        return await metadataOperations.selectTables();
    }
    catch (err) {
        return resultProcessing.getErrorResult(err, Errors.selectTableError);
    }
}
