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

        // --------------- 3. CRUD.
        if (isExample(3))
            require('./Documentation/CRUD/crud');

        // --------------- 4. Transactions.
        if (isExample(4))
            require('./Documentation/transactions');

        // --------------- 5. BSON Types.
        if (isExample(5))
            require('./Documentation/bsonTypes');

        // --------------- 6. Indexes.
        if (isExample(6))
            require('./Documentation/Indexes/indexes');

        // --------------- 7. Aggregation.
        if (isExample(7))
            require('./Documentation/Aggregation/aggregation');
    }
}