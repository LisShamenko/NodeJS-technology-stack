module.exports = {
    // 
    swaggerRequestValidation: { category: 'validation', code: 'swagger request', space: 'swaggerRequestValidation' },
    swaggerResponseValidation: { category: 'validation', code: 'swagger response', space: 'swaggerResponseValidation' },
    swaggerUnknown: { category: 'validation', code: 'swagger unknown', space: 'swaggerUnknown' },
    // tables
    tableNameExists: { category: 'metadata: tables', code: 'name exists', space: 'tableNameExists' },
    insertTableError: { category: 'metadata: tables', code: 'insert', space: 'insertTableError' },
    selectTableError: { category: 'metadata: tables', code: 'select', space: 'selectTableError' },
    deleteTableError: { category: 'metadata: tables', code: 'delete', space: 'deleteTableError' },
    // columns
    columnNameExists: { category: 'metadata: columns', code: 'name exists', space: 'columnNameExists' },
    insertColumnError: { category: 'metadata: columns', code: 'insert', space: 'insertColumnError' },
    selectColumnError: { category: 'metadata: columns', code: 'select', space: 'selectColumnError' },
    deleteColumnError: { category: 'metadata: columns', code: 'delete', space: 'deleteColumnError' },
    // queries
    insertQueryError: { category: 'metadata: queries', code: 'insert', space: 'insertQueryError' },
    selectQueryError: { category: 'metadata: queries', code: 'select', space: 'selectQueryError' },
    deleteQueryError: { category: 'metadata: queries', code: 'delete', space: 'deleteQueryError' },
    // links
    insertLinkError: { category: 'metadata: links', code: 'insert', space: 'insertLinkError' },
    selectLinkError: { category: 'metadata: links', code: 'select', space: 'selectLinkError' },
    updateLinkError: { category: 'metadata: links', code: 'update', space: 'updateLinkError' },
    deleteLinkError: { category: 'metadata: links', code: 'delete', space: 'deleteLinkError' },
    // executors
    insertExecutorError: { category: 'metadata: executors', code: 'insert', space: 'insertExecutorError' },
    deleteExecutorError: { category: 'metadata: executors', code: 'select', space: 'deleteExecutorError' },
    selectExecutorError: { category: 'metadata: executors', code: 'delete', space: 'selectExecutorError' },
    // data
    insertDataError: { category: 'metadata: data', code: 'insert', space: 'insertDataError' },
    updateDataError: { category: 'metadata: data', code: 'select', space: 'updateDataError' },
    deleteDataError: { category: 'metadata: data', code: 'delete', space: 'deleteDataError' },

    // 
    messages: {
        selectTableMessage: 'Таблица не найдена.',
        selectColumnMessage: 'Колонка не найдена.',
        columnNameExistsMessage: 'В таблице найдена колонка с тем же имеющемся именем.',
        primaryColumnNotExists: 'Отсутствует идентификатор строки.',
        selectQueryMessage: 'Метаданные для запроса SQL не найдены.',
        rootLinkNotExists: 'Метаданные запроса не содержат корневую таблицу.',
        selectLinkMessage: 'Табличная связка не найдена.',
        tableNameExistsMessage: 'Найдена таблица с уже имеющемся именем.',
    }
};
