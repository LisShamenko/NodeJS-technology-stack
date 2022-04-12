const { MongoClient, Decimal128, Int32 } = require("mongodb");
const { dropCollection } = require("./../helpers");



// --- --- sort

//      https://www.mongodb.com/docs/manual/reference/method/cursor.sort

// Сортирует входные документы и возвращает их в конвейер в отсортированном порядке.

// Сигнатура:
//      { $sort: { <field1>: <sort order>, <fieldN>: <sort order> ... } }
//          <field1>, ..., <fieldN> - поля сортировки, порядок сортировки оценивается 
//              слева направо, сортировать можно максимум 32 ключа;
//          <sort order> может иметь одно из следующих значений:
//               1                       сортировка по возрастанию;
//              -1                       сортировка по убыванию;
//               { $meta: "textScore" }  сортировка по метаданным в порядке убывания. 

// MongoDB не хранит документы в коллекции в определенном порядке. При сортировке 
//      по полю, содержащему повторяющиеся значения, документы могут быть возвращены 
//      в любом порядке. Если требуется постоянный порядок сортировки, то следует 
//      включите в запрос хотя бы одно поле, содержащее уникальные значения. Самое
//      простое это использовать поле _id.

// --- --- Оптимизация памяти.

// Если стадия $sort идёт перед $limit без промежуточных этапов, изменяющих количество 
//      документов, то стадии $sort и $limit будут объединены для оптимизации. Это 
//      гарантирует, что количество документов хранящихся в памяти будет ограничено
//      значением $limit. Оптимизация работает со значением 'allowDiskUse:true'.

// --- --- Ограничения памяти.

// Стадия $sort имеет ограничение в 100 мегабайт ОЗУ для сортировки в памяти. 
//      По умолчанию, превышение этого лимита приводит к ошибке. Параметр allowDiskUse
//      позволяет преодолеть ограничение через запись данных во временные файлы.

// --- --- Производительность.

// На стадии $sort можно использовать индекс, если это первый этап конвейера или перед
//      этим стоит стадия $match. В сегментированном кластере на стадии $sort, каждый
//      кластер сортирует свои документы, используя индекс, если он доступен. Затем
//      mongos или один из сегментов выполняет слияние.

// 
module.exports = async () => {

    const client = new MongoClient("mongodb://localhost:27017");

    try {
        await client.connect();
        const database = client.db("aggregation");

        // 
        const restaurants = database.collection("restaurants");

        await dropCollection(restaurants);
        await restaurants.insertMany([
            { _id: 1, score: "16", name: "Central Park Cafe", borough: "Manhattan" },
            { _id: 2, score: "27", name: "Rock A Feller Bar and Grill", borough: "Queens" },
            { _id: 3, score: "38", name: "Empire State Pub", borough: "Brooklyn" },
            { _id: 4, score: "49", name: "Stan's Pizzaria", borough: "Manhattan" },
            { _id: 5, score: "50", name: "Jane's Deli", borough: "Brooklyn" },
        ]);

        const indexResult = await restaurants.createIndex(
            { borough: "text" },
        );
        console.log(`--- Index created: ${indexResult}`);

        // --- --- сортировка по полю borough

        const cursor1 = await restaurants.aggregate([
            {
                $sort: {
                    // порядок сортировки будет несогласованным, поскольку 
                    //      поле borough содержит повторяющиеся значения
                    borough: 1
                }
            }
        ])
        await cursor1.forEach(item => console.dir(JSON.stringify(item)));

        // --- --- сортировка по полям borough и _id

        const cursor2 = await restaurants.aggregate([
            {
                $sort: {
                    // порядок сортировки будет согласованным, поскольку 
                    //      поле _id содержит уникальные значения
                    _id: 1,
                    // сортировка по убыванию
                    borough: -1,
                }
            }
        ])
        await cursor2.forEach(item => console.dir(JSON.stringify(item)));

        // --- --- сортировка метаданных textScore

        const cursor3 = await restaurants.aggregate([
            {
                $match: {
                    $text: {
                        $search: "Brooklyn"
                    }
                }
            },
            {
                $sort: {
                    score: {
                        // конвейер, включающий оператор $text, может выполнять 
                        //      сортировку по убыванию 
                        $meta: "textScore"
                    },
                    name: -1 // posts: -1
                }
            }
        ])
        console.log('--- --- ---');
        await cursor3.forEach(item => console.dir(JSON.stringify(item)));

        // --- --- textScore

        const articles = database.collection("articles");

        await dropCollection(articles);
        await articles.insertMany([
            { "_id": 1, "title": "cakes and ale" },
            { "_id": 2, "title": "more cakes" },
            { "_id": 3, "title": "bread" },
            { "_id": 4, "title": "some cakes" },
        ]);

        const indexResult4 = await articles.createIndex(
            { title: "text" },
        );
        console.log(`--- Index created: ${indexResult4}`);

        //
        const cursor4 = await articles.aggregate([
            {
                $match: {
                    $text: { $search: "cake" }
                }
            },
            {
                $group: {
                    _id: { $meta: "textScore" },
                    count: { $sum: 1 }
                }
            }
        ])
        console.log('--- textScore ---');
        await cursor4.forEach(item => console.dir(JSON.stringify(item)));
    }
    catch (err) {
        console.log(`--- err: ${err}`);
    }
    finally {
        await client.close();
    }
}