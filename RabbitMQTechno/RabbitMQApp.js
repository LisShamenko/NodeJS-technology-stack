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
    }
}