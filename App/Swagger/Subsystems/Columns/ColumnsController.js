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

let joiColumnResponse = null;
let joiIdRequest = null;

function initController() {

    joiColumnResponse = joi.object().keys({
        id: joi.number().required(),
        name: joi.string().regex(subsystemsHelper.lowercaseUnderscore).required(),
        type: joi.string().valid(...subsystemsHelper.columnTypes).required(),
        is_not_null: joi.boolean().required(),
        table_id: joi.number().required(),
    });

    joiIdRequest = joi.number().required();

    // get['название']Declaration = get['название']Action(actionsRouter, model.['метод']['название']);
    actionsRouter = express.Router();
    let getInsertColumnDeclaration = getInsertColumnAction(actionsRouter, model.insertColumn);
    let getDeleteColumnDeclaration = getDeleteColumnAction(actionsRouter, model.deleteColumn);
    let getSelectColumnDeclaration = getSelectColumnAction(actionsRouter, model.selectColumn);
    let getSelectColumnsDeclaration = getSelectColumnsAction(actionsRouter, model.selectColumns);

    // 
    swaggerDeclaration = {
        "/api/insert_column": { "post": { ...getInsertColumnDeclaration } },
        "/api/delete_column": { "delete": { ...getDeleteColumnDeclaration } },
        "/api/select_column": { "get": { ...getSelectColumnDeclaration } },
        "/api/select_columns": { "get": { ...getSelectColumnsDeclaration } },
    }

    return {
        router: actionsRouter,
        paths: swaggerDeclaration,
    };
}

// --------------- actions: insert column

function getInsertColumnAction(router, modelFunc) {

    // валидация запроса
    const joiRequest = joi.object().keys({
        table_id: joi.number().required(),
        column: joi.object().keys({
            name: joi.string().regex(subsystemsHelper.lowercaseUnderscore).required(),
            type: joi.string().valid(...subsystemsHelper.columnTypes).required(),
            is_not_null: joi.boolean(),
        }).required()
    });

    // документация 
    const actionSchema = {
        "summary": "Операция добавления колонки в таблицу.",
        "tags": ["Metadata / Columns"],
        "description": "Добавляет колонку в указанную таблицу. Добавляет запись метаданных.",
        "requestBody": subsystemsHelper.getRequestBody(
            "Содержит идентификатор таблицы и описание добавляемой колонки.",
            joiRequest, examplesRequestInsertColumn()),
        "responses": {
            "200": subsystemsHelper.getCodeResponse(
                "Успешный ответ.",
                joiColumnResponse, examplesResponseInsertColumn()),
        }
    };

    // действие
    router.post('/api/insert_column', (req, res) => {
        resultProcessing.requestProcessing(req.body, res, joiRequest, joiColumnResponse, modelFunc);
    });

    // 
    return actionSchema;
}

function examplesRequestInsertColumn() {

    let example_1 = {
        table_id: 0,
        column: { name: 'new_field_text', type: 'text', is_not_null: true }
    };

    return {
        ['текстовая колонка']: { value: example_1 },
    };
}

function examplesResponseInsertColumn() {

    let example_1 = {
        id: 0,
        name: 'column_name',
        type: 'text',
        is_not_null: true,
        table_id: 0,
    };

    return {
        ['текстовая колонка']: { value: example_1 },
    };
}

// --------------- actions: delete column

function getDeleteColumnAction(router, modelFunc) {

    // валидация ответа
    const joiResponse = joi.object().keys({
        rowCount: joi.number().required(),
    });

    // документация 
    const actionSchema = {
        "summary": "Операция удаленя колонки из таблицы.",
        "tags": ["Metadata / Columns"],
        "description": "Удаляет колонку из таблицы. Удаляет запись колонки из метаданных.",
        "parameters": [
            subsystemsHelper.getParameter("table_id", "Идентификатор таблицы.", joiIdRequest, examplesParameterId()),
            subsystemsHelper.getParameter("column_id", "Идентификатор колонки.", joiIdRequest, examplesParameterId()),
        ],
        "responses": {
            "200": subsystemsHelper.getCodeResponse(
                "Успешный ответ.",
                joiResponse, examplesResponseDeleteColumn()),
        }
    };

    // действие
    router.delete('/api/delete_column', (req, res) => {
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

function examplesResponseDeleteColumn() {
    let example_1 = { rowCount: 1 }
    return {
        ['удаление колонки']: { value: example_1 },
    };
}

// --------------- actions: select column

function getSelectColumnAction(router, modelFunc) {

    // документация 
    const actionSchema = {
        "summary": "Запрос метаданных о колонке.",
        "tags": ["Metadata / Columns"],
        "description": "Вернет метаданные о колонке в указанной таблице.",
        "parameters": [
            subsystemsHelper.getParameter("table_id", "Идентификатор таблицы.", joiIdRequest, examplesParameterId()),
            subsystemsHelper.getParameter("column_id", "Идентификатор колонки.", joiIdRequest, examplesParameterId()),
        ],
        "responses": {
            "200": subsystemsHelper.getCodeResponse(
                "Успешный ответ.",
                joiColumnResponse, examplesResponseInsertColumn()),
        }
    };

    // действие
    router.get('/api/select_column', (req, res) => {
        resultProcessing.requestProcessing(req.query, res, null, joiColumnResponse, modelFunc);
    });

    // 
    return actionSchema;
}

// --------------- actions: select columns

function getSelectColumnsAction(router, modelFunc) {

    // валидация ответа
    const joiResponse = joi.array().items(joiColumnResponse);

    // документация 
    const actionSchema = {
        "summary": "Запрос колонок.",
        "tags": ["Metadata / Columns"],
        "description": "Вернет метаданные всех колонок в указанной таблице.",
        "parameters": [
            subsystemsHelper.getParameter("table_id", "Идентификатор таблицы.", joiIdRequest, examplesParameterId()),
        ],
        "responses": {
            "200": subsystemsHelper.getCodeResponse(
                "Успешный ответ.",
                joiResponse, examplesResponseSelectColumns()),
        }
    };

    // действие
    router.get('/api/select_columns', (req, res) => {
        resultProcessing.requestProcessing(req.query, res, null, joiResponse, modelFunc);
    });

    // 
    return actionSchema;
}

function examplesResponseSelectColumns() {

    let example_1 = [
        { id: 0, name: 'first_column', type: 'text', is_not_null: false, table_id: 0 },
        { id: 1, name: 'second_column', type: 'integer', is_not_null: false, table_id: 0 },
        { id: 2, name: 'third_column', type: 'uuid', is_not_null: true, table_id: 0 },
    ];

    return {
        ['список колонок']: { value: example_1 },
    };
}