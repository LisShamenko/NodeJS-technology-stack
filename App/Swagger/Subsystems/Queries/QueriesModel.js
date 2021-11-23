// --------------- фабрика

let queriesOperations;
let Errors;
let resultProcessing;

module.exports = (inQueriesOperations, inErrors, inResultProcessing) => {

    queriesOperations = inQueriesOperations;
    Errors = inErrors;
    resultProcessing = inResultProcessing;

    return {
        insertQuery: insertQuery,
        deleteQuery: deleteQuery,
        selectQuery: selectQuery,
        selectQueries: selectQueries,
    };
}

// --------------- insert query SQL

async function insertQuery(data) {
    try {
        return await queriesOperations.insertQuery(data.query, data.links);
    }
    catch (err) {
        return resultProcessing.getErrorResult(err, Errors.insertQueryError);
    }
}

// --------------- delete query SQL

async function deleteQuery(data) {
    try {

        let query = await queriesOperations.selectQuery(data.id);
        if (query === null) {
            return resultProcessing.getErrorResult(Error(Errors.messages.selectQueryMessage), Errors.selectQueryError);
        }

        return await queriesOperations.deleteQuery(query);
    }
    catch (err) {
        return resultProcessing.getErrorResult(err, Errors.deleteQueryError);
    }
}

// --------------- select query SQL

async function selectQuery(data) {
    try {

        let query = await queriesOperations.selectQuery(data.id);
        if (query === null) {
            return resultProcessing.getErrorResult(Error(Errors.messages.selectQueryMessage), Errors.selectQueryError);
        }

        let links = await queriesOperations.selectLinks(query.id);

        return {
            query: query,
            links: links,
        };
    }
    catch (err) {
        return resultProcessing.getErrorResult(err, Errors.selectQueryError);
    }
}

// --------------- select queries SQL

async function selectQueries() {
    try {
        return await queriesOperations.selectQueries();
    }
    catch (err) {
        return resultProcessing.getErrorResult(err, Errors.selectQueryError);
    }
}
