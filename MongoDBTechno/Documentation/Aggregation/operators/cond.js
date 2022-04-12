const { MongoClient, Decimal128, Int32 } = require("mongodb");
const { dropCollection } = require("./../helpers");



// --- --- cond

//      https://www.mongodb.com/docs/manual/reference/operator/aggregation/cond/

// Операция выполняет логическое выражение. 

// Сигнатура:
//      { $cond: { if: <boolean-expression>, then: <true-case>, else: <false-case> } }
//      { $cond: [ <boolean-expression>, <true-case>, <false-case> ] }
//          <boolean-expression> - условное выражение, значение true приведет 
//              к возврату результат выражения <true-case>, иначе <false-case>;
//              все три аргумента являются обязательными; 

// 
module.exports = async () => {

    const client = new MongoClient("mongodb://localhost:27017");

    try {
        await client.connect();
        const database = client.db("aggregation");

        // 
        const inventory = database.collection("inventory");

        await dropCollection(inventory);
        await inventory.insertMany([
            { "_id": 1, "item": "abc1", qty: 300 },
            { "_id": 2, "item": "abc2", qty: 200 },
            { "_id": 3, "item": "xyz1", qty: 250 },
        ]);

        // 
        const cursor1 = await inventory.aggregate([
            {
                $project: {
                    item: 1,
                    discount: {
                        $cond: {
                            if: { $gte: ["$qty", 250] },
                            then: 30,
                            else: 20
                        }
                        // представление в виде массива:
                        //      $cond: [{ $gte: ["$qty", 250] }, 30, 20]
                    }
                }
            }
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