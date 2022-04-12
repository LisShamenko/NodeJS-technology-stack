const { MongoClient, Decimal128, Int32 } = require("mongodb");
const { dropCollection } = require("./../helpers");



// --- --- limit

//      https://www.mongodb.com/docs/manual/reference/operator/aggregation/limit/

// Сигнатура:
//      { $limit: <positive 64-bit integer> }
//          <positive 64-bit integer> - положительное целое число, указывающее 
//              максимальное количество документов для передачи на следующую стадию.

// Стадию $limit можно использовать с любыми средствами сортировки:
// - стадия $sort;
// - метод cursor.sort;
// - поле sort при выполнении команд findAndModify и findAndModify.

// Чтобы гарантировать согласованность сортировки следует включить в запрос хотя бы 
//      одно поле, содержащее уникальные значения. Самый простой вариант это поле _id. 
//      Сортировка полей, содержащих повторяющиеся значения, может возвращать 
//      несогласованный порядок сортировки при многократном выполнении, особенно 
//      когда в коллекцию добавляются записи.

// Если стадия $sort идёт перед $limit без промежуточных этапов, изменяющих количество 
//      документов, то стадии $sort и $limit будут объединены для оптимизации. Это 
//      гарантирует, что количество документов хранящихся в памяти будет ограничено
//      значением $limit. Оптимизация работает со значением 'allowDiskUse:true'.

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
        ]);

        // применение count эквивалентно следующей конструкции:
        const cursor1 = await scores.aggregate([
            { $limit: 3 }
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