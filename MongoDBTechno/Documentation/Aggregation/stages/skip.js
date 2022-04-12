const { MongoClient, Decimal128, Int32 } = require("mongodb");
const { dropCollection } = require("./../helpers");



// --- --- skip

//      https://www.mongodb.com/docs/manual/reference/operator/aggregation/skip/

// Пропускает указанное количество документов а следующую стадию конвейера.

// Сигнатура:
//      { $skip: <positive 64-bit integer> }
//          <positive 64-bit integer> - число, указывающее максимальное количество 
//              пропускаемых документов.

// Стадию $skip следует использовать совместно со стадией $sort, методом sort или
//      методами findAndModify и findAndModify.

module.exports = async () => {

    const client = new MongoClient("mongodb://localhost:27017");

    try {
        await client.connect();
        const database = client.db("aggregation");

        // 
        const restaurants = database.collection("restaurants");

        await dropCollection(restaurants);
        await restaurants.insertMany([
            { "_id": 1, "borough": "Manhattan" },
            { "_id": 2, "borough": "Queens" },
            { "_id": 3, "borough": "Brooklyn" },
            { "_id": 4, "borough": "Manhattan" },
            { "_id": 5, "borough": "Brooklyn" },
        ]);

        // 
        const cursor1 = await restaurants.aggregate([
            { $skip: 3 }
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