// --------------- фабрика

let metadataOperations;
let queriesOperations;
let executorOperations;
let Errors;
let resultProcessing;

module.exports = (inMetadataOperations, inQueriesOperations, inExecutorOperations, inErrors, inResultProcessing) => {

    metadataOperations = inMetadataOperations;
    queriesOperations = inQueriesOperations;
    executorOperations = inExecutorOperations;
    Errors = inErrors;
    resultProcessing = inResultProcessing;

    return {
        insertExecutor: insertExecutor,
        deleteExecutor: deleteExecutor,
        selectExecutors: selectExecutors,
    };
}

// --------------- insert executor

async function insertExecutor(data) {
    try {

        // метаданные запроса
        let query = await queriesOperations.selectQuery(data.query_id);
        if (query === null) {
            return resultProcessing.getErrorResult(Error(Errors.messages.selectQueryMessage), Errors.selectQueryError);
        }

        // метаданные ссылок на таблицы
        let links = await queriesOperations.selectLinks(query.id);
        // refactoring - сортировка колонок в порядке указзаном в базе

        // парсинг и проверка связей
        let parsedLinks = executorOperations.parseLinks(links);
        if (!parsedLinks.rootLink) {
            return resultProcessing.getErrorResult(Error(Errors.messages.rootLinkNotExists), Errors.insertExecutorError);
        }

        // 
        if (parsedLinks.treeLinkValues.length > 0) {
            parsedLinks.treeLinkTables = await queriesOperations.selectTreeLinks(parsedLinks.treeLinkValues);
        }

        // метаданные таблиц
        let tables = await metadataOperations.selectTables(links.map(item => item.table_id));

        // метаданные колонок
        let columns = await metadataOperations.selectColumns(tables.map(item => item.id));

        // 
        return await executorOperations.insertExecutor(data.title, parsedLinks, tables, columns, data.options);
    }
    catch (err) {
        return resultProcessing.getErrorResult(err, Errors.insertExecutorError);
    }
}

// --------------- delete column

async function deleteExecutor(data) {
    try {
        return await executorOperations.deleteExecutor(data.id);
    }
    catch (err) {
        return resultProcessing.getErrorResult(err, Errors.deleteExecutorError);
    }
}

// --------------- select columns

async function selectExecutors(data) {
    try {
        return await executorOperations.selectExecutors();
    }
    catch (err) {
        return resultProcessing.getErrorResult(err, Errors.selectExecutorError);
    }
}
