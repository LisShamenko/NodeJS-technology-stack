const { MongoClient } = require("mongodb");



// --- 6.2 Single Field Indexes.

//      https://www.mongodb.com/docs/manual/core/index-single/

// MongoDB обеспечивает поддержку индексов для любых полей в коллекции. 
//      По умолчанию все коллекции имеют индекс для поля _id.

module.exports = async () => {

    const client = new MongoClient("mongodb://localhost:27017");

    try {
        await client.connect();
        const database = client.db("aggregation");

        // 
        const records = database.collection("records");
        await records.insertMany([
            {
                "_id": ObjectId("570c04a4ad233577f97dc459"),
                "score": 1034,
                "location": { state: "NY", city: "New York" }
            }
        ]);

        // --- --- Create an Ascending Index on a Single Field

        // Значение для поля в индексе определяет порядок сортировки: 
        //        1 - упорядочивает элементы в порядке возрастания;
        //       -1 - упорядочивает элементы в порядке убывания.

        // создает индекс в порядке возрастания
        records.createIndex({ score: 1 });

        // Созданный индекс будет поддерживать запросы, которые выбирают поле score:
        let cursor1 = await records.find({ score: 2 });
        await cursor1.forEach(item => console.dir(JSON.stringify(item)));
        let cursor2 = await records.find({ score: { $gt: 10 } });
        await cursor2.forEach(item => console.dir(JSON.stringify(item)));

        // --- --- Create an Index on an Embedded Field

        // Можно создавать индексы для полей вложенных документов.

        // создает индекс для поля location.state вложенного документа:
        records.createIndex({ "location.state": 1 });

        // индекс поддерживает запросы, которые выбирают поле location.state:
        let cursor3 = records.find({ "location.state": "CA" });
        await cursor3.forEach(item => console.dir(JSON.stringify(item)));
        let cursor4 = records.find({ "location.city": "Albany", "location.state": "NY" });
        await cursor4.forEach(item => console.dir(JSON.stringify(item)));

        // --- --- Create an Index on Embedded Document

        // Можно создавать индексы для вложенного документа в целом.

        // создает индекс для вложенного документа
        records.createIndex({ location: 1 })

        // запрос использует индекс поля location:
        let cursor5 = records.find({ location: { city: "New York", state: "NY" } })
        await cursor5.forEach(item => console.dir(JSON.stringify(item)));
    }
    catch (err) {
        console.log(`--- err: ${err}`);
    }
    finally {
        await client.close();
    }
}