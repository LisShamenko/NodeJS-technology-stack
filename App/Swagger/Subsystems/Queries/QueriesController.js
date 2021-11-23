// --------------- фабрика

let model;
let express;
let joi;
let joiToSwagger;
let subsystemsHelper;
let resultProcessing;

let actionsRouter;
let swaggerDeclaration;

module.exports = (inModel, inExpress, inJoi, inJoiToSwagger, inSubsystemsHelper, inResultProcessing) => {
    model = inModel;
    express = inExpress;
    joi = inJoi;
    joiToSwagger = inJoiToSwagger;
    subsystemsHelper = inSubsystemsHelper;
    resultProcessing = inResultProcessing;

    return {
        initController: initController,
    };
}

// --------------- controller

let joiQueryResponse = null;
let joiIdRequest = null;

function initController() {

    joiQueryResponse = joi.object().keys({
        query: joi.object().keys({
            id: joi.number().required(),
            name: joi.string().regex(subsystemsHelper.lowercaseUnderscore).required(),
        }).required(),
        links: joi.array().items(
            joi.object().keys({
                query_id: joi.number().required(),
                id: joi.number().required(),
                index: joi.number().required(),
                table_id: joi.number().required(),
                table_key_id: joi.number().required(),
                parent_id: joi.number().default(null),
                parent_key_id: joi.number().required(),
                type: joi.string().valid(...subsystemsHelper.queryTypes).required(),
                groups: joi.array().items(
                    joi.object().keys({
                        column_id: joi.number().required(),
                        agg_func: joi.string().valid(...subsystemsHelper.groupAggFuncs).required(),
                    })
                ).required(),
            })
        ).required(),
    });

    joiIdRequest = joi.number().required();

    // get['название']Declaration = get['название']Action(actionsRouter, model.['метод']['название']);
    actionsRouter = express.Router();
    let getInsertQueryDeclaration = getInsertQueryAction(actionsRouter, model.insertQuery);
    let getDeleteQueryDeclaration = getDeleteQueryAction(actionsRouter, model.deleteQuery);
    let getSelectQueryDeclaration = getSelectQueryAction(actionsRouter, model.selectQuery);
    let getSelectQueriesDeclaration = getSelectQueriesAction(actionsRouter, model.selectQueries);

    // 
    swaggerDeclaration = {
        "/api/insert_query": { "post": { ...getInsertQueryDeclaration } },
        "/api/delete_query": { "delete": { ...getDeleteQueryDeclaration } },
        "/api/select_query": { "get": { ...getSelectQueryDeclaration } },
        "/api/select_queries": { "get": { ...getSelectQueriesDeclaration } },
    }

    return {
        router: actionsRouter,
        paths: swaggerDeclaration,
    };
}

// --------------- actions: insert table

function getInsertQueryAction(router, modelFunc) {

    // валидация запроса
    const joiRequest = joi.object().keys({
        query: joi.object().keys({
            name: joi.string().regex(subsystemsHelper.lowercaseUnderscore).required(),
        }),
        links: joi.array().items(
            joi.object().keys({
                index: joi.number().required(),
                table_id: joi.number().required(),
                table_key_id: joi.number().required(),
                parent_id: joi.number().default(null),
                parent_key_id: joi.number().required(),
                type: joi.string().valid(...subsystemsHelper.queryTypes).required(),
                groups: joi.array().items(
                    joi.object().keys({
                        column_id: joi.number().required(),
                        agg_func: joi.string().valid(...subsystemsHelper.groupAggFuncs).required(),
                    })
                ).required(),
            })
        ).required(),
    });

    // документация 
    const actionSchema = {
        "summary": "Операция добавления метаданных запроса SQL в базу.",
        "tags": ["Metadata / Query SQL"],
        "description": "Добавляет связи между таблицами на основе которых строятся запросы.",
        "requestBody": subsystemsHelper.getRequestBody(
            "Название запроса и массив связей между таблицами.",
            joiRequest, examplesRequestInsertQuery()),
        "responses": {
            "200": subsystemsHelper.getCodeResponse(
                "Вернет объект запроса с прописанными идентификаторами.",
                joiQueryResponse, examplesResponseInsertQuery()),
        }
    };

    // действие
    router.post('/api/insert_query', (req, res) => {
        resultProcessing.requestProcessing(req.body, res, joiRequest, joiQueryResponse, modelFunc);
    });

    // 
    return actionSchema;
}

function examplesRequestInsertQuery() {

    let example_1 = {
        query: {
            name: 'first_request',
        },
        links: [
            {
                index: 0,
                table_id: 5,
                table_key_id: 3,
                parent_id: 0,
                parent_key_id: 0,
                type: 'root',
                groups: [
                    { column_id: 4, agg_func: 'count' }
                ]
            },
        ]
    };

    let example_2 = {
        query: {
            name: 'second_request',
        },
        links: [
            {
                index: 0,
                table_id: 10,
                table_key_id: 21,
                parent_id: 0,
                parent_key_id: 0,
                type: 'root',
                groups: [
                    { column_id: 20, agg_func: 'select' },
                    { column_id: 21, agg_func: 'select' },
                    { column_id: 22, agg_func: 'select' },
                ]
            },
            {
                index: 1,
                table_id: 20,
                table_key_id: 44,
                parent_id: 10,
                parent_key_id: 21,
                type: 'join',
                groups: [
                    { column_id: 43, agg_func: 'select' },
                    { column_id: 44, agg_func: 'select' },
                    { column_id: 45, agg_func: 'select' },
                ]
            },
        ]
    };

    let example_3 = {
        query: {
            name: 'third_request',
        },
        links: [
            {
                index: 0,
                table_id: 1,
                table_key_id: 20,
                parent_id: 0,
                parent_key_id: 0,
                type: 'root',
                groups: [
                    { column_id: 22, agg_func: 'count' },
                    { column_id: 23, agg_func: 'group' },
                ]
            },
            {
                index: 1,
                table_id: 1,
                table_key_id: 21,
                parent_id: 1,
                parent_key_id: 20,
                type: 'tree',
                groups: []
            },
        ]
    };

    return {
        ['агрегированный запрос по одной таблице']: { value: example_1 },
        ['группировка запрос по двум таблицам']: { value: example_2 },
        ['агрегированный запрос с деревом']: { value: example_3 },
    };
}

function examplesResponseInsertQuery() {

    let example_1 = {
        query: {
            id: 0,
            name: 'first_request',
        },
        links: [
            {
                id: 10,
                query_id: 0,
                index: 0,
                table_id: 5,
                table_key_id: 3,
                parent_id: 0,
                parent_key_id: 0,
                type: 'root',
                groups: [
                    { column_id: 4, agg_func: 'count' }
                ]
            },
        ]
    };

    let example_2 = {
        query: {
            id: 1,
            name: 'second_request',
        },
        links: [
            {
                id: 1,
                query_id: 1,
                index: 0,
                table_id: 10,
                table_key_id: 21,
                parent_id: 0,
                parent_key_id: 0,
                type: 'root',
                groups: [
                    { column_id: 20, agg_func: 'select' },
                    { column_id: 21, agg_func: 'select' },
                    { column_id: 22, agg_func: 'select' },
                ]
            },
            {
                id: 2,
                query_id: 1,
                index: 1,
                table_id: 20,
                table_key_id: 44,
                parent_id: 10,
                parent_key_id: 21,
                type: 'join',
                groups: [
                    { column_id: 43, agg_func: 'select' },
                    { column_id: 44, agg_func: 'select' },
                    { column_id: 45, agg_func: 'select' },
                ]
            },
        ]
    };

    let example_3 = {
        query: {
            id: 5,
            name: 'third_request',
        },
        links: [
            {
                id: 1,
                query_id: 5,
                index: 0,
                table_id: 1,
                table_key_id: 20,
                parent_id: 0,
                parent_key_id: 0,
                type: 'root',
                groups: [
                    { column_id: 22, agg_func: 'count' },
                    { column_id: 23, agg_func: 'group' },
                ]
            },
            {
                id: 2,
                query_id: 5,
                index: 1,
                table_id: 1,
                table_key_id: 21,
                parent_id: 1,
                parent_key_id: 20,
                type: 'tree',
                groups: []
            },
        ]
    };

    return {
        ['агрегированный запрос по одной таблице']: { value: example_1 },
        ['группировка запрос по двум таблицам']: { value: example_2 },
        ['агрегированный запрос с деревом']: { value: example_3 },
    };
}

// --------------- actions: delete table

function getDeleteQueryAction(router, modelFunc) {

    // валидация ответа
    const joiResponse = joi.object().keys({
        rowCountQueries: joi.number().required(),
        rowCountLinks: joi.number().required(),
    });

    // документация 
    const actionSchema = {
        "summary": "Операция удаления метаданных запроса SQL из базы.",
        "tags": ["Metadata / Query SQL"],
        "description": "По идентификатору удаляет запросы и описание связей таблиц.",
        "parameters": [
            subsystemsHelper.getParameter("id", "Идентификатор запроса.", joiIdRequest, examplesParameterId()),
        ],
        "responses": {
            "200": subsystemsHelper.getCodeResponse(
                "Успешный ответ.",
                joiResponse, examplesResponseDeleteTable()),
        }
    };

    // действие
    router.delete('/api/delete_query', (req, res) => {
        resultProcessing.requestProcessing(req.query, res, null, joiResponse, modelFunc);
    });

    // 
    return actionSchema;
}

function examplesParameterId() {
    let example_1 = 0;
    return {
        ['числовой идентификатор']: { value: example_1 },
    };
}

function examplesResponseDeleteTable() {

    let example_1 = {
        rowCountQueries: 1,
        rowCountLinks: 1,
    }

    return {
        ['удаление запроса: одна таблица']: { value: example_1 },
    };
}

// --------------- actions: select table

function getSelectQueryAction(router, modelFunc) {

    // документация 
    const actionSchema = {
        "summary": "Получение данных о запросе.",
        "tags": ["Metadata / Query SQL"],
        "description": "Вернет описание запроса включая связи между таблицами.",
        "parameters": [
            subsystemsHelper.getParameter("id", "Идентификатор запроса.", joiIdRequest, examplesParameterId()),
        ],
        "responses": {
            "200": subsystemsHelper.getCodeResponse(
                "Вернет полное описание запроса.",
                joiQueryResponse, examplesResponseInsertQuery()),
        }
    };

    // действие
    router.get('/api/select_query', (req, res) => {
        resultProcessing.requestProcessing(req.query, res, null, joiQueryResponse, modelFunc);
    });

    // 
    return actionSchema;
}

// --------------- actions: select tables

function getSelectQueriesAction(router, modelFunc) {

    // валидация ответа
    const joiResponse = joi.array().items(
        joi.object().keys({
            id: joi.number().required(),
            name: joi.string().regex(subsystemsHelper.lowercaseUnderscore).required(),
        })
    );

    // документация 
    const actionSchema = {
        "summary": "Список имеющихся запросов.",
        "tags": ["Metadata / Query SQL"],
        "description": "Вернет список всех созданных запросов. Только идентификаторы и названия запросов",
        "responses": {
            "200": subsystemsHelper.getCodeResponse(
                "Успешный ответ.",
                joiResponse, examplesResponseSelectQueries()),
        }
    };

    // действие
    router.get('/api/select_queries', (req, res) => {
        resultProcessing.requestProcessing(req.query, res, null, joiResponse, modelFunc);
    });

    // 
    return actionSchema;
}

function examplesResponseSelectQueries() {

    let example_1 = [
        { id: 0, name: 'first_request' },
        { id: 1, name: 'second_request' },
        { id: 2, name: 'third_request' },
    ];

    return {
        ['список запросов']: { value: example_1 },
    };
}