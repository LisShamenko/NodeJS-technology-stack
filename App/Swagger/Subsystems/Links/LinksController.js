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

let joiLinkResponse = null;
let joiIdRequest = null;

function initController() {

    joiLinkResponse = joi.object().keys({
        id: joi.number().required(),
        query_id: joi.number().required(),
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
    });

    joiIdRequest = joi.number().required();

    // get['название']Declaration = get['название']Action(actionsRouter, model.['метод']['название']);
    actionsRouter = express.Router();
    let getInsertLinkDeclaration = getInsertLinkAction(actionsRouter, model.insertLink);
    let getUpdateLinkDeclaration = getUpdateLinkAction(actionsRouter, model.updateLink);
    let getDeleteLinkDeclaration = getDeleteLinkAction(actionsRouter, model.deleteLink);
    let getSelectLinkDeclaration = getSelectLinkAction(actionsRouter, model.selectLink);
    let getSelectLinksDeclaration = getSelectLinksAction(actionsRouter, model.selectLinks);

    // 
    swaggerDeclaration = {
        "/api/insert_link": { "post": { ...getInsertLinkDeclaration } },
        "/api/update_link": { "post": { ...getUpdateLinkDeclaration } },
        "/api/delete_link": { "delete": { ...getDeleteLinkDeclaration } },
        "/api/select_link": { "get": { ...getSelectLinkDeclaration } },
        "/api/select_links": { "get": { ...getSelectLinksDeclaration } },
    }

    return {
        router: actionsRouter,
        paths: swaggerDeclaration,
    };
}

// --------------- actions: insert link

function getInsertLinkAction(router, modelFunc) {

    // валидация запроса
    const joiRequest = joi.object().keys({
        query_id: joi.number().required(),
        link: joi.object().keys({
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
        }).required()
    });

    // документация 
    const actionSchema = {
        "summary": "Операция добавления связи.",
        "tags": ["Metadata / Links"],
        "description": "Добавляет одну связь между таблицами для указанного запроса.",
        "requestBody": subsystemsHelper.getRequestBody(
            "Указать идентификатор запроса и описание связи между таблицами.",
            joiRequest, examplesRequestInsertLink()),
        "responses": {
            "200": subsystemsHelper.getCodeResponse(
                "Вернет тот же объект с идентификаторами.",
                joiLinkResponse, examplesResponseInsertLink()),
        }
    };

    // действие
    router.post('/api/insert_link', (req, res) => {
        resultProcessing.requestProcessing(req.body, res, joiRequest, joiLinkResponse, modelFunc);
    });

    // 
    return actionSchema;
}

function examplesRequestInsertLink() {

    let example_1 = {
        query_id: 0,
        link: {
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
    };

    return {
        ['ссылка на одну таблицу']: { value: example_1 },
    };
}

function examplesResponseInsertLink() {

    let example_1 = {
        id: 0,
        query_id: 5,
        index: 0,
        table_id: 5,
        table_key_id: 3,
        parent_id: 0,
        parent_key_id: 0,
        type: 'root',
        groups: [
            { column_id: 4, agg_func: 'count' }
        ]
    };

    return {
        ['ссылка на одну таблицу']: { value: example_1 },
    };
}

// --------------- actions: update link

function getUpdateLinkAction(router, modelFunc) {

    // документация 
    const actionSchema = {
        "summary": "Изменение связей.",
        "tags": ["Metadata / Links"],
        "description": "Изменяет имеющиеся связи между таблицами в указанном запросе.",
        "requestBody": subsystemsHelper.getRequestBody(
            "Объект с идентификаторами изменяемого запроса и табличной связки.",
            joiLinkResponse, examplesResponseInsertLink()),
        "responses": {
            "200": subsystemsHelper.getCodeResponse(
                "Объект с теми же идентификаторами.",
                joiLinkResponse, examplesResponseInsertLink()),
        }
    };

    // действие
    router.post('/api/update_link', (req, res) => {
        resultProcessing.requestProcessing(req.body, res, joiLinkResponse, joiLinkResponse, modelFunc);
    });

    // 
    return actionSchema;
}

// --------------- actions: delete link

function getDeleteLinkAction(router, modelFunc) {

    // валидация ответа
    const joiResponse = joi.object().keys({
        rowCount: joi.number().required(),
    });

    // документация 
    const actionSchema = {
        "summary": "Удаление связей.",
        "tags": ["Metadata / Links"],
        "description": "Удаляет одну связь по идентификатору запроса и табличной связки.",
        "parameters": [
            subsystemsHelper.getParameter("query_id", "Идентификатор запроса.", joiIdRequest, examplesParameterId()),
            subsystemsHelper.getParameter("link_id", "Идентификатор табличной связки.", joiIdRequest, examplesParameterId()),
        ],
        "responses": {
            "200": subsystemsHelper.getCodeResponse(
                "Успешный ответ.",
                joiResponse, examplesResponseDeleteLink()),
        }
    };

    // действие
    router.delete('/api/delete_link', (req, res) => {
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

function examplesResponseDeleteLink() {
    let example_1 = { rowCount: 1 }
    return {
        ['удаление ссылки на таблицу']: { value: example_1 },
    };
}

// --------------- actions: select link

function getSelectLinkAction(router, modelFunc) {

    // документация 
    const actionSchema = {
        "summary": "Описание табличных связок.",
        "tags": ["Metadata / Links"],
        "description": "Вернет полное описание одной табличной связки.",
        "parameters": [
            subsystemsHelper.getParameter("query_id", "Идентификатор запроса.", joiIdRequest, examplesParameterId()),
            subsystemsHelper.getParameter("link_id", "Идентификатор табличной связки.", joiIdRequest, examplesParameterId()),            
        ],
        "responses": {
            "200": subsystemsHelper.getCodeResponse(
                "Вернет описание табличной связки.",
                joiLinkResponse, examplesResponseInsertLink()),
        }
    };

    // действие
    router.get('/api/select_link', (req, res) => {
        resultProcessing.requestProcessing(req.query, res, null, joiLinkResponse, modelFunc);
    });

    // 
    return actionSchema;
}

// --------------- actions: select links

function getSelectLinksAction(router, modelFunc) {

    // валидация ответа
    const joiResponse = joi.array().items(joiLinkResponse);

    // документация 
    const actionSchema = {
        "summary": "Список связок в запросе.",
        "tags": ["Metadata / Links"],
        "description": "Вернет все табличные связки в указанном запросе.",
        "parameters": [
            subsystemsHelper.getParameter("query_id", "Идентификатор запроса.", joiIdRequest, examplesParameterId()),
        ],
        "responses": {
            "200": subsystemsHelper.getCodeResponse(
                "Успешный ответ.",
                joiResponse, examplesResponseSelectLinks()),
        }
    };

    // действие
    router.get('/api/select_links', (req, res) => {
        resultProcessing.requestProcessing(req.query, res, null, joiResponse, modelFunc);
    });

    // 
    return actionSchema;
}

function examplesResponseSelectLinks() {

    let example_1 = [
        {
            id: 0,
            query_id: 5,
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
    ];

    return {
        ['список ссылок для запроса на одну таблицу']: { value: example_1 },
    };
}