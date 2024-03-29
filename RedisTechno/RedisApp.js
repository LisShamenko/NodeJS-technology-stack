
module.exports = (chapters, examples) => {

    const isChapter = (c) => {
        return (chapters.length === 0 || chapters.find(i => i === c));
    }

    const isExample = (e) => {
        return (examples.find(i => i === e));
    }

    // ошибка:
    //      ReferenceError: queueMicrotask is not defined
    // решение:
    //      добавить в файл './node_modules/@node-redis/client/dist/lib/client/socket.js' 
    //      следующее объявление из пакета 'queue-microtask':
    //          const queueMicrotask = require('queue-microtask');

    // ошибка:
    //      Error: connect ECONNREFUSED 127.0.0.1: 6379
    // решение:
    //      lis@lis-vb:~$ cd ./redis/redis-6.2.6
    //      lis@lis-vb:~/redis/redis-6.2.6$ redis-server

    process.env.REDIS_URL = 'redis://192.168.56.107:6379';

    // --------------- Programming with Redis.
    if (isChapter(1)) {

        // --- 1. Data types.
        if (isExample(1))
            require('./Documentation/dataTypes');

        // --- 2. Pipelining.
        if (isExample(2))
            require('./Documentation/pipeline');

        // --- 3. Redis Pub/Sub.
        //      https://redis.io/topics/pubsub
        //          про кластеры
        if (isExample(3))
            require('./Documentation/pubsub');

        // --- 4. Expires.
        //      https://redis.io/commands/expire
        //          последний пункт
        if (isExample(4))
            require('./Documentation/expires');

        // --- 5. Streams.
        if (isExample(5))
            require('./Documentation/streams');

        // --- 6. Scan Iterator.
        if (isExample(6))
            require('./Documentation/scanIterator');

        // --- 7. Lua Scripts.
        if (isExample(7))
            require('./Documentation/lua_scripts');
    }
}
