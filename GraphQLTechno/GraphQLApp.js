module.exports = (chapters, examples) => {

    const isChapter = (c) => {
        return (chapters.length === 0 || chapters.find(i => i === c));
    }

    const isExample = (e) => {
        return (examples.find(i => i === e));
    }

    // --------------- 4. Сервер GraphQL.
    if (isChapter(4)) {
        const graphql_server = require('./Manual/graphql_server');

        // 
        if (isExample(1)) graphql_server(1);
        if (isExample(2)) graphql_server(2);
        if (isExample(3)) graphql_server(3);
        if (isExample(4)) graphql_server(4);
        if (isExample(5)) graphql_server(5);
        if (isExample(6)) graphql_server(6);
        if (isExample(7)) graphql_server(7);
        if (isExample(8)) graphql_server(8);
        if (isExample(9)) graphql_server(9);
        if (isExample(10)) graphql_server(10);
    }

    // --------------- 5. Клиенты GraphQL.
    if (isChapter(5)) {
        const graphql_client = require('./Manual/graphql_client');

        // 
        if (isExample(1)) graphql_client(1);
        if (isExample(2)) graphql_client(2);
        if (isExample(3)) graphql_client(3);
        if (isExample(4)) graphql_client(4);
        if (isExample(5)) graphql_client(5);
        if (isExample(6)) graphql_client(6);
        if (isExample(7)) graphql_client(7);
    }

    // --------------- 6. Подписки.
    if (isChapter(6)) {
        const graphql_subscription = require('./Manual/graphql_subscription');

        // 
        if (isExample(1)) graphql_subscription(1);
        if (isExample(2)) graphql_subscription(2);
    }
}