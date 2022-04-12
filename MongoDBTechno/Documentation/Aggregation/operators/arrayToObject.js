const { MongoClient, Decimal128, Int32 } = require("mongodb");
const { dropCollection } = require("./../helpers");



// --- --- arrayToObject

//      https://www.mongodb.com/docs/manual/reference/operator/aggregation/arrayToObject

// Преобразует массив в документ.

// Сигнатура:
//      { $arrayToObject: <expression> }
//          <expression> - любое допустимое выражение, которое возвращает
//              допустимый массив, где k - ключ, v - значение: 
//              - [[k,v], ... ] 
//              - [{ k: "key", "v": "value"}, ... ]

//  {                                           | { "item" : "abc123", "qty" : 25 }
//      $arrayToObject: {                       |
//          $literal: [                         |
//              { "k": "item", "v": "abc123" }, |
//              { "k": "qty", "v": 25 }         |
//          ]                                   |
//      }                                       |
//  }                                           |
//  ────────────────────────────────────────────┼───────────────────────────────────
//  {                                           | { "item" : "abc123", "qty" : 25 }
//      $arrayToObject: {                       |
//          $literal: [                         |
//              ["item", "abc123"], ["qty", 25] |
//          ]                                   |
//      }                                       |
//  }                                           |
//  ────────────────────────────────────────────┼───────────────────────────────────
//  {                                           | { "item" : "abc123" }
//      $arrayToObject: {                       |
//          $literal: [                         |
//              { "k": "item", "v": "123abc" }, |
//              { "k": "item", "v": "abc123" }  |
//          ]                                   |
//      }                                       |
//  }                                           |

module.exports = async () => {

    const client = new MongoClient("mongodb://localhost:27017");

    try {
        await client.connect();
        const database = client.db("aggregation");

        // --- --- 1

        const inventory1 = database.collection("inventory");

        await dropCollection(inventory1);
        await inventory1.insertMany([
            { "_id": 1, "item": "ABC1", dimensions: [{ "k": "l", "v": 25 }, { "k": "w", "v": 10 }, { "k": "uom", "v": "cm" }] },
            { "_id": 2, "item": "ABC2", dimensions: [["l", 50], ["w", 25], ["uom", "cm"]] },
            { "_id": 3, "item": "ABC3", dimensions: [["l", 25], ["l", "cm"], ["l", 50]] },
        ]);

        // возвращает поле массива dimensions в виде документа
        const cursor1 = await inventory1.aggregate([
            {
                $project: {
                    item: 1,
                    dimensions: { $arrayToObject: "$dimensions" }
                }
            }
        ])
        await cursor1.forEach(item => console.dir(JSON.stringify(item)));

        // --- --- 2

        const inventory2 = database.collection("inventory");

        await dropCollection(inventory2);
        await inventory2.insertMany([
            { "_id": 1, "item": "ABC1", instock: { warehouse1: 2500, warehouse2: 500 } },
            { "_id": 2, "item": "ABC2", instock: { warehouse2: 500, warehouse3: 200 } },
        ]);

        // 
        const cursor2 = await inventory2.aggregate([
            { $addFields: { instock: { $objectToArray: "$instock" } } },
            { $addFields: { instock: { $concatArrays: ["$instock", [{ "k": "total", "v": { $sum: "$instock.v" } }]] } } },
            { $addFields: { instock: { $arrayToObject: "$instock" } } }
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