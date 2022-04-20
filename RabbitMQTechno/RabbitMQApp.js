module.exports = (chapters, examples) => {

    const isChapter = (c) => {
        return (chapters.length === 0 || chapters.find(i => i === c));
    }

    const isExample = (e) => {
        return (examples.find(i => i === e));
    }

    // RabbitMQ Tutorials
    if (isChapter(1)) {

        // --------------- 1. "Hello World!".
        if (isExample(1))
            require('./Tutorials/helloWorld');

        // --------------- 2. Work queues.
        if (isExample(2))
            require('./Tutorials/workQueues');

        // --------------- 3. Publish/Subscribe.
        if (isExample(3))
            require('./Tutorials/publishSubscribe');

        // --------------- 4. Routing.
        if (isExample(4))
            require('./Tutorials/routing');

        // --------------- 5. Topics.
        if (isExample(5))
            require('./Tutorials/topics');

        // --------------- 6. RPC.
        if (isExample(6))
            require('./Tutorials/rpc');
    }
}