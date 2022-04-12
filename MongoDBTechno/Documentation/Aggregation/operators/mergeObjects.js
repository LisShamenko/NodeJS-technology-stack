const { MongoClient, Decimal128, Int32 } = require("mongodb");
const { dropCollection } = require("./../helpers");



// --- --- mergeObjects 

//      https://www.mongodb.com/docs/manual/reference/operator/aggregation/mergeObjects/

// Операиця mergeObjects объяединяет несколько документов в один. Доступна на стадиях:
//      $bucket, $bucketAuto, $group. 

// Сигнатура:
//      { $mergeObjects: <document> }
//      { $mergeObjects: [ <document1>, <document2>, ... ] }
//          <document> - любое допустимое выражение, которое может быть преобразовано 
//              в документ.

// Операиця $mergeObjects игнорирует null значения и возвращает пустой документ, если
//      принимает только null значения. Значения полей перезаписываются при объединении 
//      документов: если документы содержат одно и то же поле, то поле в результирующем 
//      документе будет иметь значение из последнего документа. Например:
//      ──────────────────────────────────────┬─
//      { $mergeObjects: [ { a: 1 }, null ] } │ { a: 1 }
//      ──────────────────────────────────────┼─
//      { $mergeObjects: [ null, null ] }     │ { }
//      ──────────────────────────────────────┼─
//      {                                     │ { a: 3, b: 2, c: 3 }
//         $mergeObjects: [                   │
//            { a: 1 },                       │
//            { a: 2, b: 2 },                 │
//            { a: 3, c: 3 }                  │
//         ]                                  │
//      }                                     │
//      ──────────────────────────────────────┼─
//      {                                     │ { a: 3, b: null, c: 3 }
//        $mergeObjects: [                    │
//          { a: 1 },                         │
//          { a: 2, b: 2 },                   │
//          { a: 3, b: null, c: 3 }           │
//        ]                                   │
//      }                                     │
//      ──────────────────────────────────────┴─

// 
module.exports = async () => {

    const client = new MongoClient("mongodb://localhost:27017");

    try {
        await client.connect();
        const database = client.db("aggregation");

        // --- --- 

        // 
        const orders = database.collection("orders");

        await dropCollection(orders);
        await orders.insertMany([
            { "_id": 1, "item": "abc", "price": 12, "ordered": 2 },
            { "_id": 2, "item": "jkl", "price": 20, "ordered": 1 },
        ]);

        // 
        const items = database.collection("items");

        await dropCollection(items);
        await items.insertMany([
            { "_id": 1, "item": "abc", description: "product 1", "instock": 120 },
            { "_id": 2, "item": "def", description: "product 2", "instock": 80 },
            { "_id": 3, "item": "jkl", description: "product 3", "instock": 60 },
        ]);

        // 
        const cursor1 = await orders.aggregate([
            {
                // объединение двух коллекций по полю item
                $lookup: {
                    from: "items",
                    localField: "item",    // field in the orders collection
                    foreignField: "item",  // field in the items collection
                    as: "fromItems"
                }
            },
            {
                // объединение документов из items и orders
                $replaceRoot: {
                    newRoot: {
                        $mergeObjects: [
                            { $arrayElemAt: ["$fromItems", 0] },
                            "$$ROOT"
                        ]
                    }
                }
            },
            { $project: { fromItems: 0 } }
        ])
        await cursor1.forEach(item => console.dir(JSON.stringify(item)));

        // --- --- 

        const sales = database.collection("sales");

        await dropCollection(sales);
        await sales.insertMany([
            { _id: 1, year: 2017, item: "A", quantity: { "2017Q1": 500, "2017Q2": 500 } },
            { _id: 2, year: 2016, item: "A", quantity: { "2016Q1": 400, "2016Q2": 300, "2016Q3": 0, "2016Q4": 0 } },
            { _id: 3, year: 2017, item: "B", quantity: { "2017Q1": 300 } },
            { _id: 4, year: 2016, item: "B", quantity: { "2016Q3": 100, "2016Q4": 250 } },
        ]);

        // mergeObjects используется в качестве accumulator-выражения на стадии group
        const cursor2 = await sales.aggregate([
            {
                $group: {
                    _id: "$item",
                    // при использовании в качестве accumulator принимает один операнд
                    mergedSales: { $mergeObjects: "$quantity" }
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