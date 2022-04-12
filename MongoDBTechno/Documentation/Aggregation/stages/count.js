const { MongoClient } = require("mongodb");
const { dropCollection } = require("./../helpers");



// --- --- count

//      https://www.mongodb.com/docs/manual/reference/operator/aggregation/count/

// Сигнатура:
//      { $count: <string> }
//          <string> - имя поля, которое не является пустой строкой, не начинается
//                     с '$' и не содержит '.'

// 
module.exports = async () => {

    const client = new MongoClient("mongodb://localhost:27017");

    try {
        await client.connect();
        const database = client.db("aggregation");

        // 
        const scores = database.collection("scores");

        await dropCollection(scores);
        await scores.insertMany([
            { "_id": 1, "subject": "History", "score": 88 },
            { "_id": 2, "subject": "History", "score": 92 },
            { "_id": 3, "subject": "History", "score": 97 },
            { "_id": 4, "subject": "History", "score": 71 },
            { "_id": 5, "subject": "History", "score": 79 },
            { "_id": 6, "subject": "History", "score": 83 },
        ]);

        // --- --- эквивалент оператора $count

        // применение count эквивалентно следующей конструкции:
        const cursor1 = await scores.aggregate([
            // поле myCount содержит количество записей
            { $group: { _id: null, myCount: { $sum: 1 } } },
            { $project: { _id: 0 } }
        ])
        await cursor1.forEach(item => console.dir(JSON.stringify(item)));

        // --- --- оператор $count

        const cursor2 = await scores.aggregate([
            {
                // исключает документы, имеющие score <= 80 
                $match: {
                    score: {
                        $gt: 80
                    }
                }
            },
            {
                // возвращает количество оставшихся документов в конвейере
                //      в поле passing_scores
                $count: "passing_scores"
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