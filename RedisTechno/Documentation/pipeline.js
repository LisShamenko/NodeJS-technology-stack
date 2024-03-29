"use strict";

const redis = require("redis");



// --------------- 2. Using pipelining to speedup Redis queries.

//      https://redis.io/topics/pipelining

// --- 2.1 Протокол 'request/response' и RTT.

// Redis - это TCP-сервер, использующий модель 'client/server' и так протокол 
//      'request/response'. Запрос выполняется следующим образом:
//      - клиент отправляет запрос на сервер, блокирует выполнение и получает 
//          ответ через socket;
//      - сервер обрабатывает запрос и отправляет ответ клиенту;
//      - последовательность выполнения: Client -> Server -> Client -> Server.

// RTT (Round Trip Time) - это время задержки сетевого соединения, для передачи 
//      пакетов от клиента к серверу и обратно. RTT может сильно влияеть 
//      на производительность, если клиент выполняет много запросов подряд.
//      Например, если RTT=250ms, то независимо от своей мощности сервер сможет 
//      обрабатывать только четыре запроса в секунду.

// --- 2.2 Redis Pipelining.

// Pipelining - это конвейер обработки, который позволяет не дожидаясь ответа 
//      от клиента, отправлять на сервер сразу все запросы и обработать ответы 
//      за один раз. Многие реализации протокола POP3 поддерживают эту функцию, 
//      что значительно ускоряет процесс загрузки новых сообщений электронной 
//      почты с сервера. Последовательность выполнения: 
//          Client, Client -> Server, Server.

// Пример использования утилиты netcat, одновременно выполняется три запроса PING:
//      $ (printf "PING\r\nPING\r\nPING\r\n"; sleep 1) | nc localhost 6379
//      +PONG
//      +PONG
//      +PONG

// Пока клиент отправляет запросы с помощью конвейера, сервер ставит ответы 
//      в очередь, используя память. Поэтому следует отправлять пакеты с заданным
//      количеством запросов и сразу обрабатывать ответы. Например, отправка
//      пакета из 1000 команд, обработка овтета, отпарвка следующего пакета и т.д.
//      Чередование пакетов и обработка ответов практически не снижает скорость, но
//      позволяет оптимально использовать память сервера.

// --- 2.3 Auto-Pipelining.

// Без использования конвейера обслуживание запросов будет дешёвым с точки зрения 
//      доступа к данным и получения ответа, но затратно с точки зрения работы сокета I/О. 
//      Это включает системные вызовы read/write, что означает переключение контекста
//      между пользователем и ядром, а переключение контекста является дорогой операцией.

// При использовании конвейера группа запросов считывается одной операцией read, 
//      а ответы одной операцией write. При этом Количество запросов в секунду 
//      достигает 10-кратного увеличения относительно выполнения без использования 
//      конвейера.

async function using_pipeline() {

    // 
    const client = redis.createClient({ url: process.env.REDIS_URL });
    client.on('error', (err) => {
        console.log(`--- redis client error: ${err}`);
    });

    // 
    await client.connect();
    console.log(`--- redis: connection`);

    //
    await Promise.all([
        client.SET('Tm9kZSBSZWRpcw==', 'users:1'),
        client.SADD('users:1:tokens', 'Tm9kZSBSZWRpcw==')
    ]);

    //
    console.log(`--- key: 
        --- GET = ${await client.GET('Tm9kZSBSZWRpcw==')}
        --- SMEMBERS = ${await client.SMEMBERS('users:1:tokens')}
    `);

    //
    client.quit();
}

// --- 2.4 Pipelining vs Scripting.

// Преимущество сценариев заключаются в том, что они могут читать/записывать данные 
//      с минимальной задержкой, делая эти операции очень быстрыми. Redis поддерживает 
//      отправку команд EVAL/EVALSHA с помощью команды SCRIPT LOAD.

// Почему запросы работают медленно, когда сервер и клиент работают на одной машине?
//      'loopback interface' предполагает сетевую задержку, поскольку планировщику ядра
//      требуется время, чтобы считать ответ с сервера Redis, записать команду в буфер 
//      callback и заплонировать выполнение серверного процесса для вызова callback.

// --- Запуск.

(async () => {
    await using_pipeline();
})();