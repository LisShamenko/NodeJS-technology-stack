// --------------- фабрика
let pg;

module.exports = (inPg) => {
    pg = inPg;
    return {
        getPoolWrapper: getPoolWrapper,
    };
}

// --------------- pool

// 
function getPoolWrapper(options) {
    const pool = new pg.Pool(options);
    return {
        query: (queryString, queryParams) => poolQuery(pool, queryString, queryParams),
        transactArray: (queryFuncs) => transactArray(pool, queryFuncs),
    };
}

// 
function poolQuery(pool, queryString, queryParams) {
    return pool.query(queryString, queryParams);
}

// --------------- transaction

// транзакция из нескольких запросов
function transactArray(pool, queryFuncs) {
    return new Promise((resolve, reject) => {

        // соединение
        pool.connect((connectError, client, done) => {
            if (connectError) {
                return rejectResult(reject, null, connectError, 'connect');
            }

            // начать транзакцию
            client.query('BEGIN', beginError => {
                if (beginError) {
                    return rejectResult(reject, null, beginError, 'begin');
                }

                // рекурсивное выполнение запросов
                transactionQueryRecursion(client, queryFuncs, 0, [], {},
                    (queryError, results) => {
                        if (queryError) {

                            // отменить транзакцию
                            client.query('ROLLBACK', rollbackError => {
                                done();
                                return rejectResult(reject, queryError, rollbackError, 'rollback');
                            });
                        }
                        else {

                            // подтвердить транзакцию
                            client.query('COMMIT', commitError => {
                                if (commitError) {
                                    return rejectResult(reject, null, commitError, 'commit');
                                }
                                resolve(results);
                            })
                        }
                    });
            });
        })
    });
}
// 
function rejectResult(reject, queryError, transactionError, type) {
    if (queryError) {
        reject(queryError);
    }
    else if (transactionError) {
        reject(transactionError);
    }
    else {
        reject(Error('Не известная ошибка.'));
    }
}
// выполнить запросы в транзакции
function transactionQueryRecursion(client, queryFuncs, index, results, between, cbFunc) {
    if (index >= queryFuncs.length) {
        return cbFunc(null, results);
    }
    else {

        // вернуть строку запроса        
        const queryFunc = queryFuncs[index];
        const nextQuery = queryFunc(results, between);

        // итерация заканчивается с ошибкой
        if (nextQuery.current === 'error') {
            return cbFunc(nextQuery.error, results);
        }

        // итерация завершает транзакцию без ошибки
        if (nextQuery.current === 'break') {
            results.push({ rows: [], rowCount: 0 });
            return cbFunc(null, results);
        }

        // итерация завершается, транзакция продолжается
        if (nextQuery.current === 'continue') {
            results.push({ rows: [], rowCount: 0 });
            transactionQueryRecursion(client, queryFuncs, index + 1, results, between, cbFunc);
            return;
        }

        // выполнить текущий запрос
        client.query(nextQuery.queryString, nextQuery.queryParams, (err, result) => {
            if (err) {
                err.queryString = nextQuery.queryString;
                return cbFunc(err, results);
            }
            results.push(result);
            transactionQueryRecursion(client, queryFuncs, index + 1, results, between, cbFunc);
        })
    }
}