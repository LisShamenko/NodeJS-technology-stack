// --------------- фабрика
let pg;

module.exports = (inPg) => {
    pg = inPg;

    return {
        // клиент
        getClientWrapper: getClientWrapper,
        // pool
        getPoolWrapper: getPoolWrapper,
        // структуры из документации (с патчами)
        structures: structures,
    };
}

// --------------- client

// создать клиента с заданной конфигурацией подключения
// - длительное использование одного клиента
// - клиент не применяется при обработки множественных запросов (иначе нужен pool)
// - необходимо подключение к не основной базе (например, к базе пользователя)
async function getClientWrapper(options) {

    // создать клиента
    const client = new pg.Client(options);

    try {
        // подключение
        await client.connect();
    }
    catch (err) {
        console.log(`client connect error: ${err.message}
            ${error.stack}`);
        return null;
    }

    // вернуть обертку с клиентом
    return {
        // запрос
        query: (queryString, queryParams) => {
            return client.query(queryString, queryParams);
        },
        // освобождение
        release: () => {
            client.end();
        }
    };
}

// --------------- pool

// 
function getPoolWrapper(options) {
    const pool = new pg.Pool(options);
    return {
        query: (queryString, queryParams) => poolQuery(pool, queryString, queryParams),
        queryJson: (queryString, queryParams) => poolQueryJson(pool, queryString, queryParams),
        transactTwo: (getFirstQuery, getSecondQuery) => transactTwo(pool, getFirstQuery, getSecondQuery),
        transactArray: (queryFuncs) => transactArray(pool, queryFuncs),
        resolveResult: resolveResult,
        rejectResult: rejectResult,
        end: () => pool.end(),
    };
}

// 
function poolQuery(pool, queryString, queryParams) {
    return pool.query(queryString, queryParams);
}

// запрос через создание клиента Client
function poolQueryJson(pool, queryString, queryParams) {
    return new Promise((resolve, reject) => {

        // подключение к pool для получения client
        pool.connect()
            .then(client => {

                // выполнить запрос через client
                return client.query(queryString, queryParams)
                    .then(res => {
                        client.release();
                        resolve({ err: null, result: res.rows[0] });
                    })
                    .catch(err => {
                        client.release();
                        reject({ err: err, result: null });
                    })
            })
            .catch((err) => {
                reject({ err: err, result: null });
            })
    });
}

// транзакиця из двух связанных запросов
function transactTwo(pool, getFirstQuery, getSecondQuery) {
    return new Promise((resolve, reject) => {

        // соединение
        pool.connect((err, client, done) => {
            if (err) {
                return reject({ err: err, result: null });
            }

            // начать транзакцию
            client.query('BEGIN', err => {
                if (rollback(err, client, done)) {
                    return reject({ err: err, result: null });
                }

                // getFirstQuery - функция возвращает первый запрос
                let firstQuery = getFirstQuery();

                // выполнить первый запрос
                client.query(firstQuery, (err, firstRes) => {
                    if (rollback(err, client, done)) {
                        return reject({ err: err, result: null });
                    }

                    // getSecondQuery - функция возвращает второй запрос с учетом результата первого запроса
                    let secondQuery = getSecondQuery(firstRes);

                    // выполнить второй запрос
                    client.query(secondQuery, (err, secondRes) => {
                        if (rollback(err, client, done)) {
                            return reject({ err: err, result: null });
                        }

                        // подтвердить транзакцию
                        client.query('COMMIT', err => {
                            done();
                            if (err) {
                                return reject({ err: err, result: null });
                            }
                            resolve(firstRes, secondRes);
                        })
                    })
                })
            })
        })
    });
}
// отмена транзакции
function rollback(err, client, done) {
    if (err) {
        client.query('ROLLBACK', err => {
            if (err) {
                console.error('Error rolling back client', err.stack);
            }
            done();
        });
        return true;
    }
    return false; // !!err;
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
                                resolveResult(resolve, results);
                            })
                        }
                    });
            });
        })
    });
}
// 
function resolveResult(resolve, results) {
    resolve(results);
    //// более подробный результат
    //resolve({
    //    results: results,
    //    error: null
    //});
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
    //// более подробный результат
    //reject({
    //    results: null,
    //    error: {
    //        query: queryError,
    //        transaction: transactionError,
    //        type: type
    //    }
    //});
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

// --------------- Suggested Project Structure

// https://node-postgres.com/guides/project-structure

// 
const structures = {

    // использует callback
    withCallback: (options) => {

        const pool = new pg.Pool(options);

        return {

            query: (text, params, callback) => {
                const start = Date.now();
                return pool.query(text, params, (err, res) => {
                    const duration = Date.now() - start;
                    console.log('executed query', { text, duration, rows: res.rowCount });
                    callback(err, res);
                })
            },

            getClient: (callback) => {
                pool.connect((err, client, done) => {

                    // monkey patch the query method to keep track of the last query executed
                    const query = client.query;
                    client.query = (...args) => {
                        client.lastQuery = args;
                        return query.apply(client, args);
                    }

                    // set a timeout of 5 seconds, after which we will log this client's last query
                    const timeout = setTimeout(() => {
                        console.error('A client has been checked out for more than 5 seconds!');
                        console.error(`The last executed query on this client was: ${client.lastQuery}`);
                    }, 5000)

                    // функция освобождения клиента (без патча)
                    const release = (err) => {
                        // call the actual 'done' method, returning this client to the pool
                        done(err);
                        // clear our timeout
                        clearTimeout(timeout);
                        // set the query method back to its old un-monkey-patched version
                        client.query = query;
                    }

                    // 
                    callback(err, client, release);
                })
            }
        }
    },

    // использует async/await
    withAsync: () => {

        const pool = new pg.Pool(options);

        return {

            async query(text, params) {
                const start = Date.now();
                const res = await pool.query(text, params);
                const duration = Date.now() - start;
                console.log('executed query', { text, duration, rows: res.rowCount });
                return res;
            },

            async getClient() {

                // 
                const client = await pool.connect();

                // monkey patch the query method to keep track of the last query executed
                const query = client.query;
                client.query = (...args) => {
                    client.lastQuery = args;
                    return query.apply(client, args);
                }

                // set a timeout of 5 seconds, after which we will log this client's last query
                const timeout = setTimeout(() => {
                    console.error('A client has been checked out for more than 5 seconds!');
                    console.error(`The last executed query on this client was: ${client.lastQuery}`);
                }, 5000)

                // функция освобождения клиента (с патчем)
                const release = client.release;
                client.release = () => {
                    // clear our timeout
                    clearTimeout(timeout);
                    // set the methods back to their old un-monkey-patched version
                    client.query = query;
                    client.release = release;
                    return release.apply(client);
                }
                return client;
            }
        }
    },
}
