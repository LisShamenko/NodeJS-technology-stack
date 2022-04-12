module.exports = (chapters, examples) => {

    const isChapter = (c) => {
        return (chapters.length === 0 || chapters.find(i => i === c));
    }

    const isExample = (e) => {
        return (examples.find(i => i === e));
    }

    // Documentation
    if (isChapter(1)) {

        // --------------- 1. Connect.
        if (isExample(1))
            require('./Documentation/connect');

        // --------------- 2. Authentication.
        if (isExample(2))
            require('./Documentation/authentication');
    }
}