// --------------- фабрика

let queriesOperations;
let Errors;
let resultProcessing;

module.exports = (inQueriesOperations, inErrors, inResultProcessing) => {

    queriesOperations = inQueriesOperations;
    Errors = inErrors;
    resultProcessing = inResultProcessing;

    return {
        insertLink: insertLink,
        updateLink: updateLink,
        deleteLink: deleteLink,
        selectLink: selectLink,
        selectLinks: selectLinks,
    };
}

// --------------- insert link

async function insertLink(data) {
    try {
        return await queriesOperations.insertLink(data.query_id, data.link);
    }
    catch (err) {
        return resultProcessing.getErrorResult(err, Errors.insertLinkError);
    }
}

// --------------- update link

async function updateLink(data) {
    try {
        let oldLink = await queriesOperations.selectLink(data.query_id, data.id);
        if (oldLink === null) {
            return resultProcessing.getErrorResult(Error(Errors.messages.selectLinkMessage), Errors.selectLinkError);
        }

        return await queriesOperations.updateLink(oldLink, data);
    }
    catch (err) {
        return resultProcessing.getErrorResult(err, Errors.updateLinkError);
    }
}

// --------------- delete link

async function deleteLink(data) {
    try {
        let query = await queriesOperations.selectQuery(data.query_id);
        if (query === null) {
            return resultProcessing.getErrorResult(Error(Errors.messages.selectQueryMessage), Errors.selectQueryError);
        }

        return await queriesOperations.deleteLink(data.query_id, data.link_id);
    }
    catch (err) {
        return resultProcessing.getErrorResult(err, Errors.deleteLinkError);
    }
}

// --------------- select link

async function selectLink(data) {
    try {
        return await queriesOperations.selectLink(data.query_id, data.link_id);
    }
    catch (err) {
        return resultProcessing.getErrorResult(err, Errors.selectLinkError);
    }
}

// --------------- select links

async function selectLinks(data) {
    try {
        return await queriesOperations.selectLinks(data.query_id);
    }
    catch (err) {
        return resultProcessing.getErrorResult(err, Errors.selectLinkError);
    }
}
