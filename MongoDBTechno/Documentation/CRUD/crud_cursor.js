const { MongoClient } = require("mongodb");



// --- 3.8 Iterate a Cursor.

//      https://www.mongodb.com/docs/manual/tutorial/iterate-a-cursor/
//      https://www.mongodb.com/docs/manual/reference/method/js-cursor/

// Метод db.collection.find возвращает курсор, который предоставляет доступ 
//      к документам через перебор итератора. Если курсор не присвоить переменной
//      при помощи var, то он сможет итерировать только 20 первых документов. 
//      Значение 20 может быть изменено с помощью аттрибута DBQuery.shellBatchSize.

// --- --- Итерация курсора.

async function cursor_iterate() {

    const uri = "mongodb://localhost:27017/?maxPoolSize=20&w=majority";
    const client = new MongoClient(uri);

    try {
        await client.connect();
        const database = client.db("sample_mflix");
        const movies = database.collection("movies");

        // 
        const query = { title: "Random Harvest" };
        const options = { projection: { _id: 0, title: 1, imdb: 1 } };

        // курсор не выполняет итерацию автоматически, если его присвоить переменной
        const cursor1 = await movies.find(query, options);
        while (true) {
            let isEnd = await cursor1.hasNext();
            if (!isEnd) break;

            // метод next предоставляет доступ к документам
            let doc = await cursor1.next();
            console.dir(JSON.stringify(doc));

            // вспомогательный метод printjson
            //      print(tojson(doc));
            //      printjson(myCursor.next());
        }

        // метод forEach используется для итерации курсора и доступа к документам
        const cursor2 = await movies.find(query, options);

        // print a message if no documents were found
        //      cursor.count - deprecated:
        //          collection.estimatedDocumentCount
        //          collection.countDocuments 
        let count = await cursor2.count();
        if (count === 0) {
            console.log("--- No documents found!");
        }
        else {
            await cursor2.forEach(item => console.dir(JSON.stringify(item)));
        }
    }
    catch (err) {
        console.log(`--- err: ${err}`);
    }
    finally {
        await client.close();
    }
}

// --- --- Метод toArray.

// Метод toArray использует итерацию курсора для загрузки всех документов, возвращаемых
//      курсором в оперативную память. Метод toArray исчерпывает курсор.

async function cursor_toArray() {

    const uri = "mongodb://localhost:27017/?maxPoolSize=20&w=majority";
    const client = new MongoClient(uri);

    try {

        await client.connect();
        const database = client.db("sample_mflix");
        const movies = database.collection("movies");

        // 
        let cursor = await movies.find();
        let documentArray = await cursor.toArray();
        console.log(documentArray[3]);

        // Доступ к документам можно получить с помощью указателя на курсоре, 
        //      например, cursor[index], что является аналогом вызова метода 
        //      toArray и использование индекса массива на результате.

        // следующие две строки эквивалентны:
        //      var myDocument = myCursor[1];
        //      var myDocument = myCursor.toArray()[1];
    }
    catch (err) {
        console.log(`--- err: ${err}`);
    }
    finally {
        await client.close();
    }
}

// --- --- Cursor.

// Начиная с MongoDB 5.0, если курсор был создан в контексте сеанса сервера, то
//      он может быть закрыт, если сеанс будет закрыт при помощи команды killSessions, 
//      если истечет время сеанса или клиент исчерпал курсор. По умолчанию сеансы 
//      сервера имеют время существования 30 минут. Это значение может быть изменено 
//      при помощи параметра localLogicalSessionTimeoutMinutes при запуске mongod.

// Курсор, который создается в не контекста сеанса сервера, будет автоматически 
//      закрыт через 10 минут бездействия или если клиент исчерпал курсор. 

// Метод cursor.noCursorTimeout отключает временное ограничение. После вызова 
//      этого метода курсор может быть закрыт вручную с помощью метода close или 
//      автоматически после исчерпания курсора.

//      var myCursor = db.users.find().noCursorTimeout();

// Cursor Isolation: 
//      as a cursor returns documents, other operations may interleave with the query.

// --- --- Cursor Batches.

// Сервер MongoDB возвращает результаты запроса пакетами. Объем данных в пакете 
//      не будет превышать максимальный размер документа BSON, который можно
//      выставить при помощи методов cursor.batchSize и cursor.limit.

// Для запросов, включающих операцию сортировки без индекса, сервер должен загрузить 
//      все документы в память, чтобы выполнить сортировку, прежде чем возвращать 
//      какие-либо результаты.

// При достижении конца пакета, Курсор вызывает специальный метод для получения 
//      следующего пакета. Чтобы увидеть, сколько документов осталось в пакете
//      можно использовать метод objsLeftInBatch.

//      var myCursor = db.inventory.find();
//      console.log('--- first document: ' + (await myCursor.hasNext() ? await myCursor.next() : null));
//      myCursor.objsLeftInBatch();

// --- --- Метод serverStatus.

// Метод db.serverStatus возвращает документ, содержащий metrics поле, которое 
//      содержит поле metrics.cursor со следующей информацией:
//      - количество курсоров с истекшим временем ожидания начиная с последней 
//          перезагрузки сервера;
//      - количество открытых курсоров с установленной опцией 'DBQuery.Option.noTimeout';
//      - количество открытых pinned-курсоров;
//      - общее количество открытых курсоров;

//      console.log(`--- serverStatus -> metrics.cursor: ${db.serverStatus().metrics.cursor}`);

async function cursor_topology() {

    const uri = "mongodb://localhost:27017/?maxPoolSize=20&w=majority";
    const client = new MongoClient(uri);

    try {
        await client.connect();
        const database = client.db("sample_mflix");
        console.log(`--- ${JSON.stringify(client.topology.clientMetadata)}`);
        console.log(`--- ${JSON.stringify(client.topology.capabilities)}`);
        console.log(`--- ${JSON.stringify(client.topology.bson)}`);
        console.log(`--- ${JSON.stringify(client.topology.description)}`);
    }
    catch (err) {
        console.log(`--- err: ${err}`);
    }
    finally {
        await client.close();
    }
}

//      {
//          "timedOut" : <number>
//          "open" : {
//              "noTimeout" : <number>,
//              "pinned" : <number>,
//              "total" : <number>
//          }
//      }

// --- Запуск.

module.exports = async () => {
    await cursor_iterate();
    await cursor_toArray();
    await cursor_topology();
};