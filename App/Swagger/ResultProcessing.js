// --------------- фабрика

let Errors;

module.exports = (inErrors) => {
    Errors = inErrors;

    return {
        requestProcessing: requestProcessing,
        validateAsync: validateAsync,
        getErrorResult: getErrorResult,
        getError: getError,
    };
}

// --------------- 

// 
async function requestProcessing(data, res, joiRequest, joiResponse, modelFunc) {
    let result = await validateAsync(data, joiRequest, joiResponse, modelFunc);
    if (result.err) {
        res.status(400).json(result.err);
    }
    else {
        res.status(200).json(result.result);
    }
}

// валидация 
async function validateAsync(data, joiRequest, joiResponse, modelFunc) {

    // валидация запроса
    if (joiRequest) {
        try {
            await joiRequest.validateAsync(data);
        } catch (err) {
            return getError(err, Errors.swaggerRequestValidation);
        }
    }

    // выполнение запроса
    let result = null;
    try {
        result = await modelFunc(data);
        if (result && result.error) {
            return getError(result.error.errObj, result.error.errAdd);
        }
    }
    catch (err) {
        return getError(err, Errors.swaggerUnknown);
    }

    // валидация ответа
    if (joiResponse) {
        try {
            await joiResponse.validateAsync(result);
        } catch (err) {
            return getError(err, Errors.swaggerResponseValidation);
        }
    }

    // отправка результата
    return {
        err: null,
        result: result,
    };
}

// 
function getErrorResult(errObj, errAdd) {
    return {
        error: {
            errObj: errObj,
            errAdd: errAdd,
        }
    }
}

// 
function getError(err, signature) {
    return {
        err: {
            message: err?.message,
            stack: err?.stack,
            ...signature,
        }
    };
}
