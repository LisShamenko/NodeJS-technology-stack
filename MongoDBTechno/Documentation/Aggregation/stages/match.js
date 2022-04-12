const { MongoClient, Decimal128, Int32, ObjectId } = require("mongodb");
const { dropCollection } = require("./../helpers");



// --- --- match

//      https://www.mongodb.com/docs/manual/reference/operator/aggregation/match/

// Фильтрует документы.

// Сигнатура:
//      { $match: { <query> } }
//          <query> - объект запроса.

// --- --- Оптимизация конвейера.

// Стадию $match следует разместить как можно раньше в конвейер, поскольку на этой
//      стадии ограничивается количество документов в конвейере, что минимизирует
//      объем обработки по конвейеру.

// Если $match поместить в начало конвейера, то запрос может использовать преимущества 
//      индексов, как методы db.collection.find или db.collection.findOne.

// --- --- Ограничения.

// Чтобы использовать aggregation-выражения на стадии $match следует применить
//      оператор $expr:
//      { $match: { $expr: { <aggregation expression> } } }

// Нельзя использовать оператор $where на стадии $match, как часть конвейера.

// Нельзя использовать операторы $near или $nearSphere на стадии $match, как часть 
//      конвейера. В качестве альтернативы:
//      - можно использовать $geoNear вместо $match;
//      - можно использовать $geoWithin вместе с $center и $centerSphere 
//          на стадии $match.

// Чтобы использовать оператор $text, стадия $match должна быть первой в конвейере.
//      Views не поддерживают $text.

module.exports = async () => {

    const client = new MongoClient("mongodb://localhost:27017");

    try {
        await client.connect();
        const database = client.db("aggregation");

        // 
        const articles = database.collection("articles");

        await dropCollection(articles);
        await articles.insertMany([
            { "_id": ObjectId("512bc95fe835e68f199c8686"), "author": "dave", "score": 80, "views": 100 },
            { "_id": ObjectId("512bc962e835e68f199c8687"), "author": "dave", "score": 85, "views": 521 },
            { "_id": ObjectId("55f5a192d4bede9ac365b257"), "author": "ahn", "score": 60, "views": 1000 },
            { "_id": ObjectId("55f5a192d4bede9ac365b258"), "author": "li", "score": 55, "views": 5000 },
            { "_id": ObjectId("55f5a1d3d4bede9ac365b259"), "author": "annT", "score": 60, "views": 50 },
            { "_id": ObjectId("55f5a1d3d4bede9ac365b25a"), "author": "li", "score": 94, "views": 999 },
            { "_id": ObjectId("55f5a1d3d4bede9ac365b25b"), "author": "ty", "score": 95, "views": 1000 },
        ]);

        // --- --- простое сопоставление на равенство

        const cursor1 = await articles.aggregate([
            {
                $match: { author: "dave" }
            }
        ])
        await cursor1.forEach(item => console.dir(JSON.stringify(item)));

        // --- --- сложное сопоставление

        // документы фильтруются на стадии $match, а затем передаются на стадию $group
        //      для вычисления количества документов
        const cursor2 = await articles.aggregate([
            {
                // выбирает документы, в которых либо 70 < score < 90,
                //      либо views >= 1000
                $match: {
                    $or: [
                        { score: { $gt: 70, $lt: 90 } },
                        { views: { $gte: 1000 } }
                    ]
                }
            },
            {
                $group: { _id: null, count: { $sum: 1 } }
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