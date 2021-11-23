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

let joiTableResponse = null;
let joiIdRequest = null;

function initController() {

    joiTableResponse = joi.object().keys({
        table: joi.object().keys({
            id: joi.number().required(),
            name: joi.string().regex(subsystemsHelper.lowercaseUnderscore).required(),
            schema: joi.string().required(),
        }),
        columns: joi.array().items(
            joi.object().keys({
                id: joi.number().required(),
                name: joi.string().regex(subsystemsHelper.lowercaseUnderscore).required(),
                type: joi.string().valid(...subsystemsHelper.columnTypes).required(),
                is_not_null: joi.boolean(),
                table_id: joi.number().required(),
            })
        ).required(),
    });

    joiIdRequest = joi.number().required();

    // get['название']Declaration = get['название']Action(actionsRouter, model.['метод']['название']);
    actionsRouter = express.Router();
    let getInsertTableDeclaration = getInsertTableAction(actionsRouter, model.insertTable);
    let getDeleteTableDeclaration = getDeleteTableAction(actionsRouter, model.deleteTable);
    let getSelectTableDeclaration = getSelectTableAction(actionsRouter, model.selectTable);
    let getSelectTablesDeclaration = getSelectTablesAction(actionsRouter, model.selectTables);

    // 
    swaggerDeclaration = {
        "/api/insert_table": { "post": { ...getInsertTableDeclaration } },
        "/api/delete_table": { "delete": { ...getDeleteTableDeclaration } },
        "/api/select_table": { "get": { ...getSelectTableDeclaration } },
        "/api/select_tables": { "get": { ...getSelectTablesDeclaration } },
    }

    return {
        router: actionsRouter,
        paths: swaggerDeclaration,
    };
}

// --------------- actions: insert table

function getInsertTableAction(router, modelFunc) {

    // валидация запроса
    const joiRequest = joi.object().keys({
        table: joi.object().keys({
            name: joi.string().regex(subsystemsHelper.lowercaseUnderscore).required(),
            schema: joi.string().required(),
        }).required(),
        columns: joi.array().items(
            joi.object().keys({
                name: joi.string().regex(subsystemsHelper.lowercaseUnderscore).required(),
                type: joi.string().valid(...subsystemsHelper.columnTypes).required(),
                is_not_null: joi.boolean(),
            })
        ).required(),
    });

    // документация 
    const actionSchema = {
        "summary": "Операция добавления таблицы в базу. (OK)",
        "tags": ["Metadata / Tables"],
        "description": "В случае успешного выполнения будет создана таблица в схеме 'data' и добавлена запись в таблицу метаданных 'tables'. Для добавленных в таблицу колонок будут сделаны записи в таблице метаданных 'columns'.",
        "requestBody": subsystemsHelper.getRequestBody(
            "Тело запроса содержит описание таблицы и колонок.",
            joiRequest, examplesRequestInsertTable()),
        "responses": {
            "200": subsystemsHelper.getCodeResponse(
                "Вернет полное описание таблицы с id записей метаданных таблицы и колонок.",
                joiTableResponse, examplesResponseInsertTable()),
        }
    };

    // действие
    router.post('/api/insert_table', (req, res) => {
        resultProcessing.requestProcessing(req.body, res, joiRequest, joiTableResponse, modelFunc);
    });

    // 
    return actionSchema;
}

function examplesRequestInsertTable() {

    let example_1 = {
        table: {
            name: 'empty_table',
            schema: 'metadata',
        },
        columns: [],
    };

    let example_2 = {
        table: {
            name: 'goods',
            schema: 'metadata',
        },
        columns: [
            { name: 'title', type: 'text' },
            { name: 'arrived_at', type: 'timestamp with time zone' },
            { name: 'count', type: 'integer' },
        ],
    };

    let example_3 = {
        table: {
            name: 'products_by_category',
            schema: 'metadata',
        },
        columns: [
            { name: 'parent_id', type: 'integer' },
            { name: 'count', type: 'integer' },
            { name: 'released_at', type: 'timestamp without time zone' },
            { name: 'storage_id', type: 'uuid' },
        ],
    };

    return {
        ['таблица без колонок']: { value: example_1 },
        ['таблица: текст, время, число']: { value: example_2 },
        ['таблица: parent_id, число, время, UUID']: { value: example_3 },
    };
}

function examplesResponseInsertTable() {

    let example_1 = {
        table: {
            id: 0,
            name: 'empty_table',
            schema: 'metadata',
        },
        columns: [],
    };

    let example_2 = {
        table: {
            id: 5,
            name: "goods",
            schema: 'metadata',
        },
        columns: [
            { id: 13, name: "title", type: "text", is_not_null: false },
            { id: 14, name: "arrived_at", type: "timestamp with time zone", is_not_null: false },
            { id: 15, name: "count", type: "integer", is_not_null: false }
        ]
    };

    let example_3 = {
        table: {
            id: 9,
            name: "products_by_category",
            schema: 'metadata',
        },
        columns: [
            { id: 16, name: "parent_id", type: "integer", is_not_null: false },
            { id: 17, name: "count", type: "integer", is_not_null: false },
            { id: 18, name: "released_at", type: "timestamp without time zone", is_not_null: false },
            { id: 19, name: "storage_id", type: "uuid", is_not_null: false }
        ]
    };

    return {
        ['таблица без колонок']: { value: example_1 },
        ['таблица: текст, время, число']: { value: example_2 },
        ['таблица: parent_id, число']: { value: example_3 },
    };
}

// --------------- actions: delete table

function getDeleteTableAction(router, modelFunc) {

    // валидация ответа
    const joiResponse = joi.object().keys({
        rowCountTable: joi.number().required(),
        rowCountColumns: joi.number().required(),
    });

    // документация 
    const actionSchema = {
        "summary": "Операция удаления таблицы из базы. (OK)",
        "tags": ["Metadata / Tables"],
        "description": "Удаляет таблицу из базы и все связанные метаданные.",
        "parameters": [
            subsystemsHelper.getParameter("id", "Идентификатор таблицы.", joiIdRequest, examplesParameterId()),
        ],
        "responses": {
            "200": subsystemsHelper.getCodeResponse(
                "Успешный ответ.",
                joiResponse, examplesResponseDeleteTable()),
        }
    };

    // действие
    router.delete('/api/delete_table', (req, res) => {
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
        rowCountTable: 1,
        rowCountColumns: 4,
    }

    return {
        ['удаление таблицы с 4-мя колонками']: { value: example_1 },
    };
}

// --------------- actions: select table

function getSelectTableAction(router, modelFunc) {

    // документация 
    const actionSchema = {
        "summary": "Запрос метаданных таблицы. (OK)",
        "tags": ["Metadata / Tables"],
        "description": "Запрос возвращает метаданные для одной таблицы включая метаданные колонок.",
        "parameters": [
            subsystemsHelper.getParameter("id", "Идентификатор таблицы.", joiIdRequest, examplesParameterId()),
        ],
        "responses": {
            "200": subsystemsHelper.getCodeResponse(
                "Вернет полное описание таблицы с id записей метаданных таблицы и колонок.",
                joiTableResponse, examplesResponseInsertTable()),
        }
    };

    // действие
    router.get('/api/select_table', (req, res) => {
        resultProcessing.requestProcessing(req.query, res, null, joiTableResponse, modelFunc);
    });

    // 
    return actionSchema;
}

// --------------- actions: select tables

function getSelectTablesAction(router, modelFunc) {

    // валидация ответа
    const joiResponse = joi.array().items(
        joi.object().keys({
            id: joi.number().required(),
            name: joi.string().regex(subsystemsHelper.lowercaseUnderscore).required(),
            schema: joi.string().regex(subsystemsHelper.lowercaseUnderscore).required(),
        })
    );

    // документация 
    const actionSchema = {
        "summary": "Запрос массива таблиц. (OK)",
        "tags": ["Metadata / Tables"],
        "description": "Запрос метаданных о созданных таблицах. Чтобы получить полную информацию по каждой таблице используйте запрос 'select_table'.",
        "responses": {
            "200": subsystemsHelper.getCodeResponse(
                "Вернет массив таблиц с идентификаторами и именами.",
                joiResponse, examplesResponseSelectTables()),
        }
    };

    // действие
    router.get('/api/select_tables', (req, res) => {
        resultProcessing.requestProcessing(req.query, res, null, joiResponse, modelFunc);
    });

    // 
    return actionSchema;
}

function examplesResponseSelectTables() {

    let example_1 = [
        { id: 0, name: 'empty_table', schema: 'metadata' },
        { id: 5, name: 'goods', schema: 'metadata' },
        { id: 9, name: 'products_by_category', schema: 'metadata' },
    ];

    return {
        ['массив таблиц']: { value: example_1 },
    };
}