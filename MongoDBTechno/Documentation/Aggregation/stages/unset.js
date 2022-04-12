const { MongoClient, Decimal128, Int32 } = require("mongodb");
const { dropCollection } = require("./../helpers");



// --- --- unset 

//      https://www.mongodb.com/docs/manual/reference/operator/aggregation/unset/
//      https://www.mongodb.com/docs/manual/reference/operator/update/unset/

// Удаляет/исключает одно или несколько полей из документа.

// Сигнатура:
//      { $unset: "<field>" }
//      { $unset: [ "<field1>", "<field2>", ... ] }

// Стадия $project является альтернативой стадии $unset.

//      { $project: { "<field1>": 0, "<field2>": 0, ... } }
//      { $unset: "<field.nestedfield>" }
//      { $unset: [ "<field1.nestedfield>", ...] }

module.exports = async () => {

    const client = new MongoClient("mongodb://localhost:27017");

    try {
        await client.connect();
        const database = client.db("aggregation");

        // 
        const books = database.collection("books");

        await dropCollection(books);
        await books.insertMany([
            { "_id": 1, title: "Antelope Antics", isbn: "0001122223334", author: { last: "An", first: "Auntie" }, copies: [{ warehouse: "A", qty: 5 }, { warehouse: "B", qty: 15 }] },
            { "_id": 2, title: "Bees Babble", isbn: "999999999333", author: { last: "Bumble", first: "Bee" }, copies: [{ warehouse: "A", qty: 2 }, { warehouse: "B", qty: 5 }] }
        ]);

        // --- --- удалить одно поле верхнего уровня

        const cursor1 = await books.aggregate([
            // альтернатива: { $unset: [ "copies" ] }
            { $unset: "copies" }
        ])
        await cursor1.forEach(item => console.dir(JSON.stringify(item)));

        // --- --- удалить поля верхнего уровня

        const cursor2 = await books.aggregate([
            { $unset: ["isbn", "copies"] }
        ])
        await cursor2.forEach(item => console.dir(JSON.stringify(item)));

        // --- --- удалить встроенные поля

        const cursor3 = await books.aggregate([
            // удалить поле верхнего уровня isbn, встроенное поле first и 
            //      встроенные поля warehouse для каждого элемента массива
            { $unset: ["isbn", "author.first", "copies.warehouse"] }
        ])
        await cursor3.forEach(item => console.dir(JSON.stringify(item)));
    }
    catch (err) {
        console.log(`--- err: ${err}`);
    }
    finally {
        await client.close();
    }
}