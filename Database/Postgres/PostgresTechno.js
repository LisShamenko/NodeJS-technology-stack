// --------------- execute

module.exports = async (cbFunc) => {
    await getCallbackPromise(createPool);
    await getCallbackPromise(parameterized_query);
    await getCallbackPromise(client_queryConfig_callback);
    await getCallbackPromise(client_queryConfig_promise);
    await getCallbackPromise(pool_connect_callback);
    await pool_connect_async();
    await getCallbackPromise(pool_query_callback);
    await getCallbackPromise(pool_query_promise);
    await pool_query_async();
    await getCallbackPromise(transaction_callback);
    await transaction_async();
    await type_parsing_examples();
    await getCallbackPromise(client_query_callback);
    await getCallbackPromise(client_query_promise);
    await client_query_async();
    await client_pgQuery_events();
    await client_events();
    await result_async();
    await pg_cursor_async();
    await pool_end_async();

    // 
    if (cbFunc) cbFunc();
}

function getCallbackPromise(exeFunc) {
    return new Promise((resolve, reject) => {
        exeFunc(() => {
            resolve();
        });
    })
}

function logClient(client) {
    return `--- ${client.host}:${client.port}/${client.user}/${client.password}`;
}

// --------------- пакеты

const pg = require('pg');

// пакет pg-promise
//      https://github.com/vitaly-t/pg-promise

// --------------- способы подключения

//      https://node-postgres.com/features/connecting

// pools will use environment variables for connection information
// переменные среды (libpq) использующиеся для подключения к PostgreSQL серверу
//      https://www.postgresql.org/docs/9.1/libpq-envars.html
//      $ PGUSER=dbuser PGHOST=database.server.com PGPASSWORD=secretpassword PGDATABASE=mydb PGPORT=3211 node script.js
//      PGHOST='localhost' PGUSER=process.env.USER PGDATABASE=process.env.USER PGPASSWORD=null PGPORT=5432 

// clients will also use environment variables for connection information
//      let connectConfig = {
//          user?: string,                                  // default process.env.PGUSER || process.env.USER
//          password?: string,                              // default process.env.PGPASSWORD
//          host?: string,                                  // default process.env.PGHOST
//          database?: string,                              // default process.env.PGDATABASE || process.env.USER
//          port?: number,                                  // default process.env.PGPORT
//          connectionString?: string,                      // postgres://user:password@host:5432/database
//          ssl?: any,                                      //      passed directly to node.TLSSocket, supports all tls.connect options
//          types?: any,                                    //      custom type parsers
//          statement_timeout?: number,                     //      number of milliseconds before a statement in query will time out, default is no timeout
//          query_timeout?: number,                         //      number of milliseconds before a query call will timeout, default is no timeout
//          connectionTimeoutMillis?: number,               //      number of milliseconds to wait for connection, default is no timeout
//          idle_in_transaction_session_timeout?: number    //      number of milliseconds before terminating any session with an open idle transaction, default is no timeout
//      }

// опции подключения к бд по умолчанию
let defaultOptions = {
    host: 'localhost',
    port: '5432',
    user: 'postgres',
    password: 'postgres',
    database: 'myClassDB',
};

// вместо опций можно использовать строку подключения для создания Client и Pool
const connectionString = 'postgres://someuser:somepassword@somehost:381/somedatabase';

// пакет для парсинга строки подключения
//      https://github.com/brianc/node-postgres/tree/master/packages/pg-connection-string

const { parse } = require('pg-connection-string');
let parseConfig = parse(connectionString);
console.log(`pg-connection-string --- host = ${parseConfig.host} --- port = ${parseConfig.port} --- user = ${parseConfig.user} --- password = ${parseConfig.password} --- database = ${parseConfig.database}`);

// пакет aws-sdk
//      https://github.com/aws/aws-sdk-js
//      https://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/RDS/Signer.html

// пример подключения к облаку
//      const { RDS } = require('aws-sdk');
//      const signerOptions = {
//          credentials: {
//              accessKeyId: 'YOUR-ACCESS-KEY',
//              secretAccessKey: 'YOUR-SECRET-ACCESS-KEY',
//          },
//          region: 'us-east-1',
//          hostname: 'example.aslfdewrlk.us-east-1.rds.amazonaws.com',
//          port: 5432,
//          username: 'api-user',
//      }
//      const signer = new RDS.Signer();
//      let authToken = signer.getAuthToken(signerOptions);
//      console.log(`aws-sdk --- authToken = ${authToken}`);
//      let pgOptions = {
//          host: signerOptions.hostname,
//          port: signerOptions.port,
//          user: signerOptions.username,
//          password: () => signer.getAuthToken(signerOptions),
//      };

// Connection to Sockets
//      https://github.com/brianc/node-postgres/issues/16

// пример подключения к сокету ubuntu
//      let pgOptions = {
//          host: '/cloudsql/myproject:zone:mydb',
//          user: 'username',
//          password: 'password',
//          database: 'database_name',
//      };

// --------------- создать pool

// https://node-postgres.com/api/pool

// параметры специфичные для pool:
//      let poolConfig = {
//          // all valid client config options are also valid here
//          // in addition here are the pool specific configuration parameters:
//      
//          // number of milliseconds to wait before timing out when connecting a new client
//          // by default this is 0 which means no timeout
//          connectionTimeoutMillis?: int,
//      
//          // number of milliseconds a client must sit idle in the pool and not be checked out
//          // before it is disconnected from the backend and discarded
//          // default is 10000 (10 seconds) - set to 0 to disable auto-disconnection of idle clients
//          idleTimeoutMillis?: int,
//      
//          // maximum number of clients the pool should contain
//          // by default this is set to 10.
//          max?: int,
//      }

let pool;

// создать pool
function createPool(cbFunc) {

    // 
    pool = new pg.Pool({
        ...defaultOptions,
        idleTimeoutMillis: 30000,
        connectionTimeoutMillis: 2000,
    });

    // pool является экземпляром EventEmitter

    // срабатывает при подключении клиента к базе
    pool.on('connect', client => {
        client.query('SET DATESTYLE = iso, mdy');
        console.log(`pool_query_ways --- pool event --- connect --- client = ${logClient(client)}`);

        // используется для настройки клиента
        // не правильно настроеного клиента можно удалить из клиента вызвать: client.release(true)
        //      https://www.postgresql.org/docs/7.2/sql-set.html
    })

    // срабатывает при получении клиента из pool
    pool.on('acquire', client => {
        console.log(`pool_query_ways --- pool event --- acquire --- client = ${logClient(client)}`);
    })

    // при возникновении ошибки в клиенте, не используемые клиенты в пуле так же могут вызвать ошибку, например, если сервер выйдет из строя
    pool.on('error', (err, client) => {
        console.log(`pool_query_ways --- pool event --- error --- err = ${err} --- client = ${logClient(client)}`);
    })

    // срабатывает при удалении клиента из pool
    pool.on('remove', client => {
        console.log(`pool_query_ways --- pool event --- remove --- client = ${logClient(client)}`);
    })

    // pool.totalCount      - общее количество клиентов
    // pool.idleCount       - количество простаивающих клиентов
    // pool.waitingCount    - количество запросов ожидающих клиента, полезно для регулирования размера очереди
    console.log(`pool_query_ways --- pool.totalCount = ${pool.totalCount}`);
    console.log(`pool_query_ways --- pool.idleCount = ${pool.idleCount}`);
    cbFunc();
}

// --------------- параметризованные запросы

// PostgreSQL does not support parameters for identifiers. If you need to have dynamic 
// database, schema, table, or column names (e.g. in DDL statements) use pg-format package 
// for handling escaping these values to ensure you do not have SQL injection!

// пакет pg-format
//      https://github.com/datalanche/node-pg-format

// форматы:
//      %% outputs a literal % character.
//      %I outputs an escaped SQL identifier. - database, schema, table, or column names
//      %L outputs an escaped SQL literal.
//      %s outputs a simple string.

const format = require('pg-format');
let sql_1 = format('SELECT * FROM %I WHERE my_col = %L %s', 'my_table', 34, 'LIMIT 10');
console.log(`пример pg-format 1 --- sql_1 = ${sql_1}`);     // SELECT * FROM my_table WHERE my_col = '34' LIMIT 10

let sql_2 = format('SELECT * FROM t WHERE c1 IN (%L) AND c2 = %L', [1, 2, 3], { a: 1, b: 2 });
console.log(`пример pg-format 2 --- sql_2 = ${sql_2}`);     // SELECT * FROM t WHERE c1 IN ('1','2','3') AND c2 = '{"a":1,"b":2}'

let sql_3 = format('INSERT INTO t (name, age) VALUES %L', [['a', 1], ['b', 2]]);
console.log(`пример pg-format 3 --- sql_3 = ${sql_3}`);     // INSERT INTO t (name, age) VALUES ('a', '1'), ('b', '2')

// параметризованные параметры передаются вторым аргументом в функцию query() 
// и конвертируются в raw data следующим образом:
// NodeJS               => raw data
// null/undefined       => null
// Date                 => UTC date string
// Buffer               => без изменений
// Array                => Postgres Array (каждый элемент массива конвертируется по тем же правилам)
// Object               => 
//  -   если объект содержит функцию toPostgres, то ее результат вставляется в запрос
//      toPostgres (prepareValue: (value) => any): any
//          prepareValue используется для преобразования данных в raw data 
//  -   в противном случае используется функция JSON.stringify
// остальные типы данных конвертируются через вызов функции toString()

function parameterized_query(cbFunc) {

    let queryStr = 'SELECT $1::text as first_name, $2::text as last_name';
    let paramsArray = ['Brian', 'Carlson'];
    pool.query(queryStr, paramsArray, (err, res) => {
        console.log(`parameterized_query --- err = ${err} --- res = ${JSON.stringify(res.rows[0])}`);
        cbFunc();
    });
}

// --------------- QueryConfig 

// pool.query и client.query поддерживают настройку запроса через объект конфигурации (Query Config)

// interface QueryConfig {
//     text: string;                // the raw query text
//     values?: Array<mixed>;       // an array of query parameters
//     name?: string;               // name of the query - used for prepared statements, в примере: fooplan
//     rowMode?: string;            // by default rows come out as a key/value pair for each row pass the string 'array' here to receive rows as an array of values
//     types?: Types;               // custom type parsers just for this query result
// }

// prepared statement - метод оптимизации, заранее выполняется синтаксический разбор sql и далее только вызывается с передачей параметров
// стоит использовать для сложных запросов (операторы union и switch, множественные join) и выполняющихся достаточно часто
//      https://www.postgresql.org/docs/9.3/sql-prepare.html

// свойство name в объекте QueryConfig отвечает за использование prepared statement
// для каждого клиента: первый запрос выполняется с синтаксическим анализом, после анализ не выполняется, только вызывается prepared statement

// пример PREPARE в postgres:
//      PREPARE fooplan (int, text, bool, numeric) AS           // подготовить
//          INSERT INTO foo VALUES($1, $2, $3, $4);
//      EXECUTE fooplan(1, 'Hunter Valley', 't', 200.00);       // выполнить

// пакет node-pg-types
// типы содержатся в файле 'node_modules\pg-types\lib\builtins.js' 
//      https://github.com/brianc/node-pg-types

// преобразование postgres данных типа INT8 (возвращается COUNT(*)) в 32 битные числа nodeJS
const types = pg.types;
types.setTypeParser(types.builtins.INT8, function (val) {
    return parseInt(val, 10);
})

// callback
function client_queryConfig_callback(cbFunc) {
    pool.connect((err, client, releaseCallback) => {

        // простой параметризованный запрос
        let queryConfig = {
            text: 'INSERT INTO users(name, email) VALUES($1, $2)',
            values: ['brianc', 'brian.m.carlson@gmail.com'],
        }

        // запрос с использованием prepared statement
        queryConfig = {
            name: 'fetch-user',                         // give the query a unique name
            text: 'SELECT * FROM user WHERE id = $1',
            values: [1],
        }

        // использовать режим 'Row mode', при котором каждая строка в res.rows будет содержать массив значений а не объект  
        queryConfig = {
            text: 'SELECT $1::text as first_name, $2::text as last_name',
            values: ['Brian', 'Carlson'],
            rowMode: 'array',
            // парсинг types результатов, использует пакет node-pg-types
            types: {
                getTypeParser: () => val => val,
            },
        }

        client.query(queryConfig, (err, res) => {
            if (err) {
                console.log(`client_queryConfig_callback --- client.query --- err = ${err}`);
            } else {
                console.log(`client_queryConfig_callback --- client.query --- res.rows = ${res.rows}`);
                console.log(res.fields.map(field => field.name));   // ['first_name', 'last_name']
                console.log(res.rows[0]);                           // ['Brian', 'Carlson']
            }
            releaseCallback();
            cbFunc();
        })
    })
}

// promise
function client_queryConfig_promise(cbFunc) {
    pool.connect((err, client, releaseCallback) => {

        const queryConfig = {
            name: 'get-name',
            text: 'SELECT $1::text',
            values: ['brianc'],
            rowMode: 'array',
        }

        client.query(queryConfig)
            .then(res => {
                console.log(`client_queryConfig_promise --- client.query --- res.rows = ${res.rows}`);
            })
            .catch(err => {
                console.log(`client_queryConfig_promise --- client.query --- err = ${err}`);
            })
            .finally(() => {
                releaseCallback();
                cbFunc();
            })
    })
}

// --------------- Pooling

// https://node-postgres.com/features/pooling

// 1. на подключения клиента к базе тратится 20-30 мс
// 2. сервер PostgreSQL поддерживает ограниченное количество клиентов
// 3. PostgreSQL может обрабатывать на одном клиенте только один запрос одновременно

// --------------- pool.query

// https://node-postgres.com/api/pool

// callback
function pool_connect_callback(cbFunc) {

    // получить клиента
    pool.connect((err, client, releaseCallback) => {
        if (err) {
            console.log(`pool_connect_callback --- pool.connect --- err = ${err}`);
            return cbFunc();
        }

        console.log(`pool_connect_callback --- (releaseCallback === client.release) --- ${releaseCallback === client.release}`);

        // запрос через клиента полученного из pool
        client.query('SELECT NOW()', (err, res) => {
            if (err) {
                console.log(`pool_connect_callback --- pool.connect --- client.query --- err = ${err}`);
            }
            else {
                console.log(`pool_connect_callback --- pool.connect --- client.query --- res = ${JSON.stringify(res.rows[0])}`);
            }

            // необходимо освобождать клиента, иначе приложение исчерпает ресурсы
            releaseCallback();
            cbFunc();
        })
    })
}

// async/await
async function pool_connect_async() {

    // получить клиента
    const client = await pool.connect();

    // выполнить запрос
    let res = await client.query('SELECT NOW()');
    console.log(`pool_connect_async --- pool.connect --- client.query --- res = ${JSON.stringify(res.rows[0])}`);

    // true - уничтожить клиента, в пуле будет освобождено место для нового клиента
    console.log(`pool_connect_async --- pool.totalCount = ${pool.totalCount}`);
    console.log(`pool_connect_async --- pool.idleCount = ${pool.idleCount}`);
    client.release(true);
    console.log(`pool_connect_async --- pool.totalCount = ${pool.totalCount}`);
    console.log(`pool_connect_async --- pool.idleCount = ${pool.idleCount}`);
}

// callback
function pool_query_callback(cbFunc) {

    // pool.query не требует вызова client.release
    // pool.query не поддерживает транзакции

    // callback
    pool.query('SELECT NOW()', (err, res) => {
        console.log(`pool_query_callback --- pool.query --- err = ${err} --- res = ${JSON.stringify(res.rows[0])}`);
        cbFunc();
    })
}

// promise
function pool_query_promise(cbFunc) {

    pool.query('SELECT NOW()')
        .then(res => {
            console.log(`pool_query_promise --- pool.query --- res = ${JSON.stringify(res.rows[0])}`);
        })
        .catch(err => {
            console.log(`pool_query_promise --- pool.query --- err = ${err}`);
        })
        .finally(() => {
            cbFunc();
        })
}

// async/await 
async function pool_query_async() {

    try {
        const res = await pool.query('SELECT NOW()');
        console.log(`pool_query_async --- pool.query --- res = ${JSON.stringify(res.rows[0])}`);
    }
    catch (err) {
        console.log(`pool_query_async --- pool.query --- err = ${err}`);
    }
    finally { }
}

// --------------- Transactions

// https://node-postgres.com/features/transactions

// транзакции выполняются на одном клиенте, через запросы BEGIN / COMMIT / ROLLBACK

// пакет async
//      https://github.com/caolan/async
//      https://caolan.github.io/async/v3/

// callback
function transaction_callback(cbFunc) {

    // транзакции выполняются на одном клиенте
    pool.connect((err, client, done) => {

        console.log(`transaction_callback --- pool.connect --- client = ${logClient(client)}`);

        // начать транзакцию
        client.query('BEGIN', err => {
            if (shouldAbort(err, done, 'BEGIN')) return cbFunc();

            // выполнить первый запрос
            const queryText = 'INSERT INTO temp_users(name) VALUES($1) RETURNING id';
            client.query(queryText, ['brianc'], (err, res) => {
                if (shouldAbort(err, done, 'QUERY I')) return cbFunc();

                // выполнить второй запрос
                const insertPhotoText = 'INSERT INTO temp_photos(user_id, photo_url) VALUES ($1, $2)';
                const insertPhotoValues = [res.rows[0].id, 's3.bucket.foo'];
                client.query(insertPhotoText, insertPhotoValues, (err, res) => {
                    if (shouldAbort(err, done, 'QUERY II')) return cbFunc();

                    // подтвердить транзакцию
                    client.query('COMMIT', err => {
                        if (err) {
                            console.log(`transaction_callback --- COMMIT --- err = ${err}`);
                        }
                        else {
                            console.log(`transaction_callback --- COMMIT`);
                        }
                        done();
                        cbFunc();
                    })
                })
            })
        })
    })
}
// 
function shouldAbort(err, done, place) {
    if (err) {
        console.log(`transaction_callback --- ${place} --- err = ${err}`);

        // отменить транзакцию
        client.query('ROLLBACK', err => {
            if (err) {
                console.log(`transaction_callback --- ROLLBACK --- err = ${err}`);
            }
            // release the client back to the pool
            done();
        })
    }
    else {
        console.log(`transaction_callback --- ${place}`);
    }
    return !!err;
}

// async/await
async function transaction_async() {

    // note: we don't try/catch this because if connecting throws an exception
    // we don't need to dispose of the client (it will be undefined)
    const client = await pool.connect();
    console.log(`transaction_async --- CONNECT`);

    try {
        // начать транзакцию
        await client.query('BEGIN');
        console.log(`transaction_async --- CONNECT`);

        // выполнить первый запрос
        const queryText = 'INSERT INTO temp_users(name) VALUES($1) RETURNING id';
        let res = await client.query(queryText, ['brianc']);
        console.log(`transaction_async --- QUERY I --- res = ${JSON.stringify(res.rows[0])}`);

        // выполнить второй запрос
        const insertPhotoText = 'INSERT INTO temp_photos(user_id, photo_url) VALUES ($1, $2)';
        const insertPhotoValues = [res.rows[0].id, 's3.bucket.foo'];
        res = await client.query(insertPhotoText, insertPhotoValues);
        console.log(`transaction_async --- QUERY II --- rowCount = ${res.rowCount}`);

        // подтвердить транзакцию
        await client.query('COMMIT');
        console.log(`transaction_async --- COMMIT`);
    }
    catch (e) {
        // отменить транзакцию
        await client.query('ROLLBACK');
        console.log(`transaction_async --- ROLLBACK --- err = ${err}`);
    }
    finally {
        // освободить клиента
        client.release();
        console.log(`transaction_async --- client release`);
    }
}

// --------------- Data Types

// https://node-postgres.com/features/types
// https://www.postgresql.org/docs/9.5/datatype.html

// по умолчанию все типы данных PostgreSQL конвертируются в строки
// uuid/guid конвертируются в строки
// json/jsonb конвертируются в объекты javascript и обратно при передачи объекта в запрос (при помощи JSON.parse / JSON.stringify)
// даты javascript преобразуются в типы даты PostgreSQL, а столбцы date, timestamp, timestamptz будут преобразовываться в объекты даты javascript
// DATE и TIMESTAMP конвертируются в локальное время node-процесса (process.env.TZ)
// note: I generally use TIMESTAMPTZ when storing dates; otherwise, inserting a time from a process in one timezone and reading it out in a process in another timezone can cause unexpected differences in the time.
// PostgreSQL поддерживает микросекунды в датах, JavaScript поддерживает даты только с точностью до миллисекунды, поэтому микросекунды будут усечены при преобразовании в объект даты JavaScript

// 
async function type_parsing_examples() {

    // 1 - простые строки
    const client = await pool.connect();

    // will contain the unparsed string value of each column
    let queryText = `SELECT int_col::text, date_col::text, json_col::text FROM my_table`;
    queryText = `SELECT 1000::text AS number, '2021-05-09 14:10:34.920793+03'::text AS date, '{"a":100,"b":"c"}'::text AS json`;
    let res = await client.query(queryText);
    console.log(`type_parsing_examples --- ${JSON.stringify(res.rows[0])}`);

    // 2 - UUID
    try {
        await client.query('BEGIN');

        // create our temp table
        //      https://postgrespro.ru/docs/postgrespro/9.6/pgcrypto
        //      https://postgrespro.ru/docs/postgresql/9.6/sql-createextension
        const createTableText = `
            CREATE EXTENSION IF NOT EXISTS "pgcrypto";
            CREATE TEMP TABLE IF NOT EXISTS temp_users (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                data JSONB
            );
        `;
        await client.query(createTableText);

        // create a new user
        const newUser = { email: 'brian.m.carlson@gmail.com' };
        await client.query('INSERT INTO temp_users(data) VALUES($1)', [newUser]);

        // select temp_users
        res = await client.query('SELECT * FROM temp_users');
        console.log(`type_parsing_examples --- ${JSON.stringify(res.rows[0])}`);

        //output:
        //[{
        //  id: 'd70195fd-608e-42dc-b0f5-eee975a621e9',
        //  data: { email: 'brian.m.carlson@gmail.com' }
        //}]

        await client.query('COMMIT');
    }
    catch (e) {
        await client.query('ROLLBACK');
    }

    // 3 - даты
    try {
        await client.query('BEGIN');

        // create our temp table
        const createTableText = `
            CREATE TEMP TABLE temp_dates(
                date_col DATE,
                timestamp_col TIMESTAMP,
                timestamptz_col TIMESTAMPTZ
            );
        `;
        await client.query(createTableText);

        // insert the current time into it
        const now = new Date();
        const insertText = 'INSERT INTO temp_dates(date_col, timestamp_col, timestamptz_col) VALUES ($1, $2, $3)';
        await client.query(insertText, [now, now, now]);

        // read the row back out
        res = await client.query('SELECT * FROM temp_dates');
        console.log(`type_parsing_examples --- ${JSON.stringify(res.rows[0])}`);

        // {
        //   date_col: 2017-05-29T05:00:00.000Z,
        //   timestamp_col: 2017-05-29T23:18:13.263Z,
        //   timestamptz_col: 2017-05-29T23:18:13.263Z
        // }

        await client.query('COMMIT');
    }
    catch (e) {
        await client.query('ROLLBACK');
    }

    client.release();
}

// --------------- TLS/SSL

// https://node-postgres.com/features/ssl
// https://nodejs.org/api/tls.html#tls_class_tls_tlssocket
// https://help.interfaceware.com/v6/how-to-create-self-certified-ssl-certificate-and-publicprivate-key-files
// https://postgrespro.ru/docs/postgresql/9.5/ssl-tcp#ssl-client-certificates

// конфигурация SSL
//      const configTLS = {
//          database: 'database-name',
//          host: 'host-or-ip',
//          // this object will be passed to the TLSSocket constructor
//          ssl: {
//              rejectUnauthorized: false,
//              ca: fs.readFileSync('/path/to/server-certificates/root.crt').toString(),
//              key: fs.readFileSync('/path/to/client-key/postgresql.key').toString(),
//              cert: fs.readFileSync('/path/to/client-certificates/postgresql.crt').toString(),
//          },
//      }

// --------------- client / client.connect / client.query

// callback
function client_query_callback(cbFunc) {

    const client = new pg.Client(defaultOptions);

    // подключение 
    client.connect(err => {
        if (err) {
            console.log(`client_query_callback --- client.connect --- err = ${err}`);
            return cbFunc();
        }

        // запрос
        client.query('SELECT NOW()', (err, res) => {
            console.log(`client_query_callback --- client.query --- err = ${err} --- res = ${res}`);

            // Disconnects the client from the PostgreSQL server
            client.end(err => {
                if (err) {
                    console.log(`client_query_callback --- client.end --- err = ${err}`);
                }
                else {
                    console.log(`client_query_callback --- client.end --- disconnected`);
                }
                cbFunc();
            });
        })
    })
}

// promise
function client_query_promise(cbFunc) {

    const client = new pg.Client(defaultOptions);

    // подключение
    client.connect()
        .then(() => {
            console.log(`client_query_promise --- client.connect --- connect`);

            // запрос
            client.query('SELECT NOW()')
                .then(res => {
                    console.log(`client_query_promise --- client.query --- res = ${JSON.stringify(res.rows[0])}`);
                })
                .catch(err => {
                    console.log(`client_query_promise --- client.query --- err = ${err}`);
                })
                .then(() => {
                    client.end()
                        .then(() => {
                            console.log(`client_query_promise --- client.end --- disconnected`);
                        })
                        .catch(err => {
                            console.log(`client_query_promise --- client.end --- err = ${err}`);
                        })
                        .finally(() => {
                            cbFunc();
                        })
                })
        })
        .catch(err => {
            console.log(`client_query_promise --- client.connect --- err = ${err}`);
        })
}

// async/await
async function client_query_async() {

    let client = new pg.Client(defaultOptions);
    try {
        await client.connect();
        const res = await client.query('SELECT NOW()');
        console.log(`client_query_async --- client.query --- res = ${JSON.stringify(res.rows[0])}`);
    }
    catch (err) {
        console.log(`client_query_async --- client.query --- err = ${err}`);
    }
    finally {
        await client.end();
    }
}

// --------------- Query object / events

// события объекта Query
async function client_pgQuery_events() {

    const query = new pg.Query('select $1::text as name', ['brianc']);
    const client = await pool.connect();
    const queryResult = await client.query(query);
    console.log(`client_pgQuery_events --- query === queryResult --- ${query === queryResult}`);

    // 
    query.on('row', row => {
        console.log(`client_pgQuery_events --- on row --- row = ${JSON.stringify(row)}`);
    })

    // 
    query.on('end', () => {
        console.log(`client_pgQuery_events --- on end`);
        //client.release();
        client.end((err) => {
            if (err) {
                console.log(`client_pgQuery_events --- client.end --- err = ${err}`);
            }
            else {
                console.log(`client_pgQuery_events --- client.end`);
            }
        });
    })

    // 
    query.on('error', err => {
        console.log(`client_pgQuery_events --- on error --- err = ${err}`);
    })
}

// события клиента
async function client_events() {

    const client = await pool.connect();

    // ошибка клиента (разрыв соединения с сервером)
    client.on('error', err => {
        console.log(`client_events --- on error --- err = ${err}`);
    })

    // событие client.release
    client.on('end', err => {
        console.log(`client_events --- on end --- err = ${err}`);
    })

    // notification
    //      https://www.postgresql.org/docs/9.6/sql-listen.html
    //      https://www.postgresql.org/docs/9.6/plpgsql-errors-and-messages.html

    // подписаться на уведомления
    client.on('notification', msg => {
        console.log(`client_events --- on notification --- msg.processId = ${msg.processId}`);
        console.log(`client_events --- on notification --- msg.channel = ${msg.channel}`);
        console.log(`client_events --- on notification --- msg.payload = ${msg.payload}`);
    });

    // Used to log out notice messages from the PostgreSQL server
    client.on('notice', msg => {
        console.log(`client_events --- on notice --- msg = ${msg}`);
    });

    // подписать клиента на канал
    await client.query('LISTEN foo');

    // отправить уведомление в канал
    await client.query(`NOTIFY foo, 'bar!'`);

    client.release();
}

// --------------- Result

// https://node-postgres.com/api/result

// async/await 
async function result_async() {

    try {
        const res = await pool.query(
            'SELECT $1::text as first_name, $2::text as last_name',
            ['Brian', 'Carlson']);

        // 
        console.log(`result_async --- res.rows = ${JSON.stringify(res.rows)}`);
        console.log(`result_async --- res.fields = ${res.fields.map(field => field.name)}`);
        console.log(`result_async --- res.command = ${res.command}`);
        console.log(`result_async --- res.rowCount = ${res.rowCount}`);

        // для DML команд rowCount определяет количе6ство измененных строк
        // для команд SELECT и COPY сколько строк было возвращено 
        //      https://www.postgresql.org/docs/current/protocol-message-formats.html (смотреть CommandComplete)

        // note: this does not reflect the number of rows returned from a query. e.g. an update statement 
        // could update many rows (so high result.rowCount value) but result.rows.length would 
        // be zero. To check for an empty query reponse on a SELECT query use result.rows.length === 0.
        // @sehrope has a good explanation:
        // The rowCount is populated from the command tag supplied by the PostgreSQL server. It's 
        // generally of the form: COMMAND [OID] [ROWS]
        // For DML commands (INSERT, UPDATE, etc), it reflects how many rows the server modified to 
        // process the command. For SELECT or COPY commands it reflects how many rows were 
        // retrieved or copied.
    }
    catch (err) {
        console.log(`result_async --- err = ${err}`);
    }
}

// --------------- pg-cursor

// пакет pg-cursor
//      https://node-postgres.com/api/cursor
//      https://github.com/brianc/node-postgres#readme

const Cursor = require('pg-cursor');

// настройки для Query Config при использовании курсора
//      interface CursorQueryConfig {
//          // by default rows come out as a key/value pair for each row
//          // pass the string 'array' here to receive rows as an array of values
//          rowMode?: string;
//          // custom type parsers just for this query result
//          types?: Types;
//      }

async function pg_cursor_async() {

    // клиент
    const client = await pool.connect();

    // курсор
    const cursor = new Cursor('SELECT * FROM temp_users');

    // запрос с курсором
    const queryCursor = client.query(cursor);

    // читать 100 записей
    queryCursor.read(100, (err, rows) => {

        console.log(`pg_cursor_async --- read I --- rows.lengths = ${rows.length}`);

        // читать еще 100 записей
        queryCursor.read(100, (err, rows) => {

            // если курсор прочитал все записи в таблице то rows.length == 0
            if (rows.length === 0) {
                console.log(`pg_cursor_async --- read II --- read complete`);
            }
            else {
                console.log(`pg_cursor_async --- read II --- rows.length = ${rows.length}`);
            }

            // закрывает курсор, даже если не все строки были прочитаны
            queryCursor.close(() => {
                client.release();
            })
        });
    })
}

// --------------- pool end

// async/await 
async function pool_end_async() {
    try {
        const res = await pool.query('SELECT NOW()');
        console.log(`pool_end_async --- ${JSON.stringify(res.rows[0])}`);
    }
    catch (err) {
        console.log(`pool_end_async --- err = ${err}`);
    }

    // отключает всех клиентов и таймеры, вызывается при завершении приложения
    pool.end(() => {
        console.log(`pool_end_async --- pool.end`);
    })
}
