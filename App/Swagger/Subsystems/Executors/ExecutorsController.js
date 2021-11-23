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

let joiExecutorResponse = null;
let joiIdRequest = null;

function initController() {

    joiExecutorResponse = joi.object().keys({
        id: joi.number().required(),
        title: joi.string().regex(subsystemsHelper.lowercaseSpace).required(),
    });

    joiIdRequest = joi.number().required();

    // get['название']Declaration = get['название']Action(actionsRouter, model.['метод']['название']);
    actionsRouter = express.Router();
    let getInsertExecutorDeclaration = getInsertExecutorAction(actionsRouter, model.insertExecutor);
    let getDeleteExecutorDeclaration = getDeleteExecutorAction(actionsRouter, model.deleteExecutor);
    let getSelectExecutorsDeclaration = getSelectExecutorsAction(actionsRouter, model.selectExecutors);

    // 
    swaggerDeclaration = {
        "/api/insert_executor": { "post": { ...getInsertExecutorDeclaration } },
        "/api/delete_executor": { "delete": { ...getDeleteExecutorDeclaration } },
        "/api/select_executors": { "get": { ...getSelectExecutorsDeclaration } },
    }

    return {
        router: actionsRouter,
        paths: swaggerDeclaration,
    };
}

// --------------- actions: insert executor

function getInsertExecutorAction(router, modelFunc) {

    // валидация запроса
    const joiRequest = joi.object().keys({
        query_id: joi.number().required(),
        title: joi.string().regex(subsystemsHelper.lowercaseSpace).required(),
        options: joi.object().keys({
            type: joi.string().valid(...subsystemsHelper.executorType).required(),
            links: joi.array().items(
                joi.object().keys({
                    link_id: joi.number().required(),
                    // опции для древовидной таблицы
                    tree_options: joi.object().keys({
                        layer: joi.number().required(),
                        parent: joi.number(),
                        path: joi.string().regex(subsystemsHelper.lowercaseDot),
                    }),
                    // опции колонок
                    columns: joi.array().items(
                        joi.object().keys({
                            column_id: joi.number().required(),
                            type: joi.string().valid(...subsystemsHelper.executeColumnType).required(),
                            alias: joi.string().regex(subsystemsHelper.lowercaseUnderscore),
                            agg_func: joi.string().valid(...subsystemsHelper.aggFuncs),
                            where: joi.object().keys({
                                left: joi.number().required(),
                                right: joi.number().required(),
                            })
                        })
                    ),
                })
            ).required(),
        }).required(),
    });

    // документация 
    const actionSchema = {
        "summary": "Добавление исполнителя запроса.",
        "tags": ["Metadata / Executor"],
        "description": "Добавить исполнитель запроса с описанием выбираемых полей условий и прочих настроек. Название запроса может быть не уникальным.",
        "requestBody": subsystemsHelper.getRequestBody(
            "В опциях указать: идентификатор запроса, тип запроса, опции табличных связок. В опциях связок указываются выбираемые колонки, условия, сортировка.",
            joiRequest, examplesRequestInsertExecutor()),
        "responses": {
            "200": subsystemsHelper.getCodeResponse(
                "Объект с идентификатором.",
                joiExecutorResponse, examplesResponseInsertExecutor()),
        }
    };

    // действие
    router.post('/api/insert_executor', (req, res) => {
        resultProcessing.requestProcessing(req.body, res, joiRequest, joiExecutorResponse, modelFunc);
    });

    // 
    return actionSchema;
}

function examplesRequestInsertExecutor() {

    let example_1 = {
        query_id: 0,
        title: 'example 1',
        options: {
            type: 'select',
            links: [
                {
                    link_id: 0,
                    columns: [
                        { column_id: 0, type: 'select' },
                        { column_id: 1, type: 'select' },
                        { column_id: 2, type: 'select' },
                    ]
                },
            ]
        }
    };

    return {
        ['select: 1 таблица на 3 колонки']: { value: example_1 },
    };
}

function examplesResponseInsertExecutor() {

    let example_1 = {
        id: 0,
        query_test: '',
    };

    return {
        ['test']: { value: example_1 },
    };
}

// --------------- actions: delete executor

function getDeleteExecutorAction(router, modelFunc) {

    // валидация ответа
    const joiResponse = joi.object().keys({
        rowCount: joi.number().required(),
    });

    // документация 
    const actionSchema = {
        "summary": "Удаление исполнителей.",
        "tags": ["Metadata / Executor"],
        "description": "Удалить исполнителя запроса по идентификатору.",
        "parameters": [
            subsystemsHelper.getParameter("id", "Идентификатор запроса.", joiIdRequest, examplesParameterId()),
        ],
        "responses": {
            "200": subsystemsHelper.getCodeResponse(
                "Успешный ответ.",
                joiResponse, examplesResponseDeleteExecutor()),
        }
    };

    // действие
    router.delete('/api/delete_executor', (req, res) => {
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

function examplesResponseDeleteExecutor() {
    let example_1 = { rowCount: 1 }
    return {
        ['удаление запроса']: { value: example_1 },
    };
}

// --------------- actions: select executors

function getSelectExecutorsAction(router, modelFunc) {

    // валидация ответа
    const joiResponse = joi.array().items(joiExecutorResponse);

    // документация 
    const actionSchema = {
        "summary": "Список всех исполнителей запрососв.",
        "tags": ["Metadata / Executor"],
        "description": "Список содержит идентификаторы и названия запросов.",
        "responses": {
            "200": subsystemsHelper.getCodeResponse(
                "Успешный ответ.",
                joiResponse, examplesResponseSelectExecutors()),
        }
    };

    // действие
    router.get('/api/select_executors', (req, res) => {
        resultProcessing.requestProcessing(req.query, res, null, joiResponse, modelFunc);
    });

    // 
    return actionSchema;
}

function examplesResponseSelectExecutors() {

    let example_1 = [
        { id: 0, title: 'исполнитель 1' },
    ];

    return {
        ['список исполнителей']: { value: example_1 },
    };
}