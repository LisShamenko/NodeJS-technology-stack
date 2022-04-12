const { MongoClient, Decimal128, Int32 } = require("mongodb");
const { dropCollection } = require("./../helpers");



// --- --- sample

//      https://www.mongodb.com/docs/manual/reference/operator/aggregation/sample/

// Случайно выбирает указанное количество документов.

// Сигнатура:
//      { $sample: { size: <positive integer N> } }
//          <positive integer N> - количество документов для случайного выбора

// Стадия $sample выбирает N случайных документов, если выполняются условия:
//      - $sample идет первой стадией в конвейере;
//      - N составляет менее 5% от общего числа документов в коллекции;
//      - коллекция содержит более 100 документов.

// Если любое из условий не выполняется, то $sample выполняет случайную сортировку 
//      для выбора N документов из коллекции.

module.exports = async () => {

    const client = new MongoClient("mongodb://localhost:27017");

    try {
        await client.connect();
        const database = client.db("aggregation");

        // 
        const users = database.collection("users");

        await dropCollection(users);
        await users.insertMany([
            { "_id": 1, "name": "dave123", "q1": true, "q2": true },
            { "_id": 2, "name": "dave2", "q1": false, "q2": false },
            { "_id": 3, "name": "ahn", "q1": true, "q2": true },
            { "_id": 4, "name": "li", "q1": true, "q2": false },
            { "_id": 5, "name": "annT", "q1": false, "q2": true },
            { "_id": 6, "name": "li", "q1": true, "q2": true },
            { "_id": 7, "name": "ty", "q1": false, "q2": true },
        ]);

        // операция возвращает три случайных документа
        const cursor1 = await users.aggregate([
            { $sample: { size: 3 } }
        ])
        await cursor1.forEach(item => console.dir(JSON.stringify(item)));
    }
    catch (err) {
        console.log(`--- err: ${err}`);
    }
    finally {
        await client.close();
    }
}