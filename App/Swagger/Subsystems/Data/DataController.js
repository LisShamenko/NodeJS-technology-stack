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

let joiDataResponse = null;
let joiIdRequest = null;
let joiDataRow = null;

function initController() {

    joiDataResponse = joi.array().items(
        joi.object().pattern(/^/,
            joi.alternatives().try(joi.string(), joi.number(), joi.boolean()).allow(null)
        )
    ).allow(null);

    joiIdRequest = joi.number().required();

    joiDataRow = joi.array().items(
        joi.object().keys({
            is_primary: joi.boolean(),
            column_id: joi.number().required(),
            column_value: joi.alternatives().try(joi.string(), joi.number(), joi.boolean()).allow(null)
        })
    );

    // get['название']Declaration = get['название']Action(actionsRouter, model.['метод']['название']);
    actionsRouter = express.Router();
    let getInsertDataDeclaration = getInsertDataAction(actionsRouter, model.insertData);
    let getUpdateDataDeclaration = getUpdateDataAction(actionsRouter, model.updateData);
    let getDeleteDataDeclaration = getDeleteDataAction(actionsRouter, model.deleteData);
    let getSelectDataDeclaration = getSelectDataAction(actionsRouter, model.selectData);

    // 
    swaggerDeclaration = {
        "/api/insert_data": { "post": { ...getInsertDataDeclaration } },
        "/api/update_data": { "post": { ...getUpdateDataDeclaration } },
        "/api/delete_data": { "delete": { ...getDeleteDataDeclaration } },
        "/api/select_data": { "get": { ...getSelectDataDeclaration } },
    }

    return {
        router: actionsRouter,
        paths: swaggerDeclaration,
    };
}

// --------------- insert

function getInsertDataAction(router, modelFunc) {

    // валидация запроса
    const joiRequest = joi.object().keys({
        table_id: joi.number().required(),
        data_rows: joi.array().items(joiDataRow),
    });

    // документация 
    const actionSchema = {
        "summary": "Добавление данных в динамические таблицы.",
        "tags": ["Database / Data"],
        "description": "Добавляет данные в указанную таблицу.",
        "requestBody": subsystemsHelper.getRequestBody(
            "Добавляемые данные это массив добавляемых в таблицу строк, где каждая строка является массивом колонок: идентификатор и значение.",
            joiRequest, examplesRequestInsertData()),
        "responses": {
            "200": subsystemsHelper.getCodeResponse(
                "Список добавленных строк.",
                joiDataResponse, examplesResponseInsertData()),
        }
    };

    // действие
    router.post('/api/insert_data', (req, res) => {
        resultProcessing.requestProcessing(req.body, res, joiRequest, joiDataResponse, modelFunc);
    });

    // 
    return actionSchema;
}

function examplesRequestInsertData() {

    let example_1 = {
        "table_id": 44,
        "data_rows": [
            [{ "column_id": 139, "column_value": "title 0" }, { "column_id": 140, "column_value": 0 }],
            [{ "column_id": 139, "column_value": "title 1" }, { "column_id": 140, "column_value": 1 }],
            [{ "column_id": 139, "column_value": "title 2" }, { "column_id": 140, "column_value": 2 }],
            [{ "column_id": 139, "column_value": "title 3" }, { "column_id": 140, "column_value": 3 }],
            [{ "column_id": 139, "column_value": "title 4" }, { "column_id": 140, "column_value": 4 }],
            [{ "column_id": 139, "column_value": "title 5" }, { "column_id": 140, "column_value": 5 }],
            [{ "column_id": 139, "column_value": "title 6" }, { "column_id": 140, "column_value": 6 }],
            [{ "column_id": 139, "column_value": "title 7" }, { "column_id": 140, "column_value": 7 }],
            [{ "column_id": 139, "column_value": "title 8" }, { "column_id": 140, "column_value": 8 }],
            [{ "column_id": 139, "column_value": "title 9" }, { "column_id": 140, "column_value": 9 }]
        ]
    }

    let example_2 = {
        "table_id": 45,
        "data_rows": [
            [{ "column_id": 143, "column_value": "title 0" }, { "column_id": 144, "column_value": 0 }, { "column_id": 145, "column_value": 0 }, { "column_id": 146, "column_value": null }],
            [{ "column_id": 143, "column_value": "title 1" }, { "column_id": 144, "column_value": 1 }, { "column_id": 145, "column_value": 1 }, { "column_id": 146, "column_value": null }],
            [{ "column_id": 143, "column_value": "title 2" }, { "column_id": 144, "column_value": 2 }, { "column_id": 145, "column_value": 2 }, { "column_id": 146, "column_value": 0 }],
            [{ "column_id": 143, "column_value": "title 3" }, { "column_id": 144, "column_value": 3 }, { "column_id": 145, "column_value": 3 }, { "column_id": 146, "column_value": 0 }],
            [{ "column_id": 143, "column_value": "title 4" }, { "column_id": 144, "column_value": 4 }, { "column_id": 145, "column_value": 4 }, { "column_id": 146, "column_value": 1 }],
            [{ "column_id": 143, "column_value": "title 5" }, { "column_id": 144, "column_value": 5 }, { "column_id": 145, "column_value": 5 }, { "column_id": 146, "column_value": 1 }],
            [{ "column_id": 143, "column_value": "title 6" }, { "column_id": 144, "column_value": 6 }, { "column_id": 145, "column_value": 6 }, { "column_id": 146, "column_value": 2 }],
            [{ "column_id": 143, "column_value": "title 7" }, { "column_id": 144, "column_value": 7 }, { "column_id": 145, "column_value": 7 }, { "column_id": 146, "column_value": 3 }],
            [{ "column_id": 143, "column_value": "title 8" }, { "column_id": 144, "column_value": 8 }, { "column_id": 145, "column_value": 8 }, { "column_id": 146, "column_value": 4 }],
            [{ "column_id": 143, "column_value": "title 9" }, { "column_id": 144, "column_value": 9 }, { "column_id": 145, "column_value": 9 }, { "column_id": 146, "column_value": 5 }]
        ]
    }

    return {
        ['таблица с колонкой ключем']: { value: example_1 },
        ['древовидная таблица']: { value: example_2 },
    };
}

function examplesResponseInsertData() {

    let example_1 = [
        { "title": "title 0", "to_first_key": 0, "tree_child_key": 0, "tree_parent_key": null, "id": 11 },
        { "title": "title 1", "to_first_key": 1, "tree_child_key": 1, "tree_parent_key": null, "id": 12 },
        { "title": "title 2", "to_first_key": 2, "tree_child_key": 2, "tree_parent_key": 0, "id": 13 },
    ]

    return {
        ['test']: { value: example_1 },
    };
}

// --------------- update

function getUpdateDataAction(router, modelFunc) {

    // валидация запроса
    const joiRequest = joi.object().keys({
        table_id: joi.number().required(),
        data_rows: joiDataRow,
    });

    // документация 
    const actionSchema = {
        "summary": "Обновление данных в таблицах.",
        "tags": ["Database / Data"],
        "description": "обновляет данные в динамических таблицах.",
        "requestBody": subsystemsHelper.getRequestBody(
            "Идентификатор таблицы и список обновляемых колонок, колонка is_primary определяет идентификатор обновляемой записи.",
            joiRequest, examplesRequestUpdateData()),
        "responses": {
            "200": subsystemsHelper.getCodeResponse(
                "Строка с новыми значениями.",
                joiDataResponse, examplesResponseInsertData()),
        }
    };

    // действие
    router.post('/api/update_data', (req, res) => {
        resultProcessing.requestProcessing(req.body, res, joiRequest, joiDataResponse, modelFunc);
    });

    // 
    return actionSchema;
}

function examplesRequestUpdateData() {

    // refactoring - сделать два поля: data_rows - для данных, options - для where

    let example_1 = {
        table_id: 44,
        data_rows: [
            { is_primary: true, column_id: 0, column_value: 45 },
            { is_primary: false, column_id: 139, column_value: 'update title' },
        ]
    };

    return {
        ['одна строка, одно значение']: { value: example_1 },
    };
}

// --------------- delete

function getDeleteDataAction(router, modelFunc) {

    // валидация ответа
    const joiResponse = joi.object().keys({
        rowCount: joi.number().required(),
    });

    // документация 
    const actionSchema = {
        "summary": "Удаление данных из таблиц.",
        "tags": ["Database / Data"],
        "description": "Идентификатор таблицы и опции поиска удаляемых строк.",
        "parameters": [
            subsystemsHelper.getParameter("table_id", "Идентификатор таблицы.", joiIdRequest, examplesParameterId()),
            subsystemsHelper.getParameter("options", "Опции поиска.", joiDataRow, examplesParameterOptions()),
        ],
        "responses": {
            "200": subsystemsHelper.getCodeResponse(
                "Успешный ответ.",
                joiResponse, examplesResponseDeleteExecutor()),
        }
    };

    // действие
    router.delete('/api/delete_data', (req, res) => {
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

function examplesParameterOptions() {
    let example_1 = [
        { is_primary: false, column_id: 0, column_value: 'value' },
        { is_primary: false, column_id: 1, column_value: 'value' },
    ];
    return {
        ['опции']: { value: example_1 },
    };
}

function examplesResponseDeleteExecutor() {
    let example_1 = { rowCount: 1 }
    return {
        ['удаление запроса']: { value: example_1 },
    };
}

// --------------- select

function getSelectDataAction(router, modelFunc) {

    // 
    const joiExecutorIdRequest = joi.alternatives().try(joi.string().allow(null), joi.number());

    // 
    let joiIdEmptyRequest = joi.number();

    // документация 
    const actionSchema = {
        "summary": "Запрос данных по таблиц.",
        "tags": ["Database / Data"],
        "description": "Данные из таблиц можно запрашивать напрямую с указанием идентификатора таблицы и опций поиска или через исполнитель запроса.",
        "parameters": [
            subsystemsHelper.getParameter("executor_id", "Идентификатор исполнителя запроса.", joiExecutorIdRequest, examplesParameterId()),
            subsystemsHelper.getParameter("table_id", "Идентификатор таблицы.", joiIdEmptyRequest, examplesParameterId()),
            subsystemsHelper.getParameter("options", "Опции поиска данных.", joiDataRow, examplesParameterOptions()),
        ],
        "responses": {
            "200": subsystemsHelper.getCodeResponse(
                "Успешный ответ.",
                joiDataResponse, examplesResponseInsertData()),
        }
    };

    // действие
    router.get('/api/select_data', (req, res) => {
        resultProcessing.requestProcessing(req.query, res, null, joiDataResponse, modelFunc);
    });

    // 
    return actionSchema;
}
