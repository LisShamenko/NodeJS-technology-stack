const { MongoClient, Decimal128, Int32 } = require("mongodb");
const { dropCollection } = require("./../helpers");



// --- --- literal 

//      https://www.mongodb.com/docs/manual/reference/operator/aggregation/literal/

// Возвращает значение без парсинга. Используется для значений, которые конвейер 
//      может интерпретировать как выражения.

// Сигнатура:
//      { $literal: <value> }
//          <value> - выражение, которое не будет вычислятся:
//              { $literal: { $add: [ 2, 3 ] } }    | { "$add" : [ 2, 3 ] }
//              ────────────────────────────────────┼──────────────────────
//              { $literal: { $literal: 1 } }       | { "$literal" : 1 }

module.exports = async () => {

    const client = new MongoClient("mongodb://localhost:27017");

    try {
        await client.connect();
        const database = client.db("aggregation");

        // --- --- Treat $ as a Literal

        // В выражении символ '$' оценивается как путь к полю, то есть обеспечивает 
        //      доступ к полю. Например, выражение '$eq: [ "$price", "$1" ]' выполняет
        //      проверку на равенство двух полей $price и $1. 

        const records = database.collection("records");

        await dropCollection(records);
        await records.insertMany([
            { "_id": 1, "item": "abc123", price: "$2.50" },
            { "_id": 2, "item": "xyz123", price: "1" },
            { "_id": 3, "item": "ijk123", price: "$1" },
        ]);

        // 
        const cursor1 = await records.aggregate([
            {
                $project: {
                    costsOneDollar: {
                        // проверка на равенство поля "$price" и строки "$1", а не 
                        //      поля с именем $1
                        $eq: [
                            "$price",
                            { $literal: "$1" }
                        ]
                    }
                }
            }
        ])
        await cursor1.forEach(item => console.dir(JSON.stringify(item)));

        // --- --- Project a New Field with Value 1

        const bids = database.collection("bids");

        await dropCollection(bids);
        await bids.insertMany([
            { "_id": 1, "item": "abc123", condition: "new" },
            { "_id": 2, "item": "xyz123", condition: "new" },
        ]);

        // стадия $project использует запись '<field>:1' для вывода поля <field>
        //      в результирующий документ, но { $literal: 1 } позволяет создать
        //      новое поле со значением 1
        const cursor2 = await bids.aggregate([
            {
                $project: {
                    item: 1,
                    startAt: { $literal: 1 }
                }
            }
        ])
        await cursor2.forEach(item => console.dir(JSON.stringify(item)));
    }
    catch (err) {
        console.log(`--- err: ${err}`);
    }
    finally {
        await client.close();
    }
}