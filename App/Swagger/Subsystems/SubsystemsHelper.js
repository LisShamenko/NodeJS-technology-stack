// --------------- фабрика

let joiToSwagger;

module.exports = (inJoiToSwagger) => {

    joiToSwagger = inJoiToSwagger;

    return {
        // --------------- regExp
        uuidV4RegExp: /^[A-F\d]{8}-[A-F\d]{4}-4[A-F\d]{3}-[89AB][A-F\d]{3}-[A-F\d]{12}$/i,
        dateTimeISO8601: /(\d{4})-(\d{2})-(\d{2})T(\d{2})\:(\d{2})\:(\d{2})[+-](\d{2})\:(\d{2})/,
        lowercaseUnderscore: /^[a-z]+(?:_[a-z]+)*$/,
        lowercaseDot: /^[0-9]+(?:.[0-9]+)*$/,
        lowercaseSpace: /^[0-9,a-z]+(?:\s[0-9,a-z]+)*$/,
        // --------------- enums
        columnTypes: columnTypes,
        queryTypes: queryTypes,
        groupAggFuncs: groupAggFuncs,
        executorType: executorType,
        aggFuncs: aggFuncs,
        executeColumnType: executeColumnType,
        // --------------- swagger
        getRequestBody: getRequestBody,
        getCodeResponse: getCodeResponse,
        getParameter: getParameter,
    };
}

// --------------- enums

const columnTypes = ['integer', 'text', 'uuid', 'timestamp with time zone', 'timestamp without time zone'];
const queryTypes = ['root', 'tree', 'join'];
const groupAggFuncs = ['none', 'sum', 'count', 'group', 'select'];
const executorType = ['select', 'group'];
const aggFuncs = ['count', 'sum'];
const executeColumnType = ['agg', 'select', 'group', 'where', 'order', 'having'];


// --------------- swagger

function getRequestBody(description, joiResponse, examples) {
    return {
        "description": description,
        "content": {
            "application/json": {
                "schema": { ...(joiToSwagger(joiResponse).swagger) },
                "examples": { ...examples }
            }
        }
    };
}

function getCodeResponse(description, joiResponse, examples) {
    return {
        "description": description,
        "content": {
            "application/json": {
                "schema": { ...(joiToSwagger(joiResponse).swagger) },
                "examples": { ...examples }
            }
        }
    };
}

function getParameter(name, description, joiRequest, examples) {
    return {
        "name": name,
        "in": "query",
        "description": description,
        "required": true,
        "style": "form",
        "explode": true,
        "schema": { ...(joiToSwagger(joiRequest).swagger) },
        "examples": { ...examples }
    };
}



