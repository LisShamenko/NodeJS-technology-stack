const { MongoClient } = require("mongodb");



// --------------- 7. Aggregation.

//      https://www.mongodb.com/docs/drivers/node/current/fundamentals/aggregation/

async function agg_collection() {

    const client = new MongoClient("mongodb://localhost:27017");

    try {
        await client.connect();
        const db = client.db("aggregation");

        // 
        const restaurants = db.collection("restaurants");
        const result1 = await restaurants.insertMany([
            { stars: 3, categories: ["Bakery", "Sandwiches"], name: "Rising Sun Bakery" },
            { stars: 4, categories: ["Bakery", "Cafe", "Bar"], name: "Cafe au Late" },
            { stars: 5, categories: ["Coffee", "Bakery"], name: "Liz's Coffee Bar" },
            { stars: 3, categories: ["Steak", "Seafood"], name: "Oak Steakhouse" },
            { stars: 4, categories: ["Bakery", "Dessert"], name: "Petit Cookie" },
        ]);
        console.log(result1);

        // 'ISODate' в NodeJS заменяется на 'new Date'
        const orders = db.collection("orders");
        const result2 = await orders.insertMany([
            { _id: 0, name: "Pepperoni", size: "small", price: 19, quantity: 10, date: new Date("2021-03-13T08:14:30Z") },
            { _id: 1, name: "Pepperoni", size: "medium", price: 20, quantity: 20, date: new Date("2021-03-13T09:13:24Z") },
            { _id: 2, name: "Pepperoni", size: "large", price: 21, quantity: 30, date: new Date("2021-03-17T09:22:12Z") },
            { _id: 3, name: "Cheese", size: "small", price: 12, quantity: 15, date: new Date("2021-03-13T11:21:39.736Z") },
            { _id: 4, name: "Cheese", size: "medium", price: 13, quantity: 50, date: new Date("2022-01-12T21:23:13.331Z") },
            { _id: 5, name: "Cheese", size: "large", price: 14, quantity: 10, date: new Date("2022-01-12T05:08:13Z") },
            { _id: 6, name: "Vegan", size: "small", price: 17, quantity: 10, date: new Date("2021-01-13T05:08:13Z") },
            { _id: 7, name: "Vegan", size: "medium", price: 18, quantity: 10, date: new Date("2021-01-13T05:10:13Z") }
        ]);
        console.log(result2);
    }
    catch (err) {
        console.log(`--- err: ${err}`);
    }
    finally {
        await client.close();
    }
}

// Операции агрегирования - это выражения, которые можно использовать для получения 
//      reduced и summarized результатов в MongoDB. Конвейер агрегации MongoDB
//      может состоять из одного или нескольких этапов, каждый из которых выполняет 
//      определенную операцию с данными.

// --- --- Aggregation vs. Query.

// Операции запросов позволяют: отфильтровать документы, выбрать возвращаемые поля и 
//      отсортировать результаты.

// Операции агрегации позволяют: выполнить все операции запроса, переименовать поля, 
//      выполнить вычисления над полями, суммирование данных, группировка данных.

// Ограничения операций агрегирования:
// - ограничение размера BSON-документа в 16 Мб;
// - этапы конвейера имеют ограничение памяти в 100 Мб, которое можно превысить
//      с помощью настроек 'AggregateOptions.allowDiskUse:true', этап '$graphLookup'
//      игнорирует настройку allowDiskUse и всегда имеет ограничение в 100 Мб.

async function agg_1() {

    const client = new MongoClient("mongodb://localhost:27017");

    try {
        await client.connect();
        const database = client.db("aggregation");
        const restaurants = database.collection("restaurants");

        // стадии агрегации
        const pipeline = [
            // $match фильтрует документы по полю categories
            //      { $match: { $expr: { $in: ["Bakery", "$categories"] } } },
            { $match: { categories: "Bakery" } },
            // $group группирует документы по полю stars
            { $group: { _id: "$stars", count: { $sum: 1 } } }
        ];

        // метод collection.aggregate выполняет агрегацию
        const aggCursor = restaurants.aggregate(pipeline);

        // await cursor.forEach(item => console.dir(JSON.stringify(item)));
        for await (const doc of aggCursor) {
            console.log(doc);
        }
        //      { _id: 4, count: 2 }
        //      { _id: 3, count: 1 }
        //      { _id: 5, count: 1 }
    }
    catch (err) {
        console.log(`--- err: ${err}`);
    }
    finally {
        await client.close();
    }
}

// --- 7.1 Aggregation Pipeline.

//      https://www.mongodb.com/docs/manual/core/aggregation-pipeline/

// Термины:
//      Aggregation pipeline
//      Aggregation stages
//      Aggregation expressions
//      Aggregation operations

// Aggregation Pipeline - это конвейер, состоящий из одного или нескольких стадий 
//      обработки документов:
// - каждая стадия выполняет операцию над входными документами;
// - документы, полученные после обработки, передаются на следующую стадию;
// - конвейер может вернуть результаты для группы документов;
// - стадии конвейера не обязаны возвращать документ в ответ на каждый входной 
//      документ, этапы могут создавать и отфильтровывать документы;
// - стадии могут повторяться в конвейере, за исключением следующих: 
//      $out, $merge, $geoNear;
// - для различных вычислений используются выражения (aggregation expressions) и 
//      операторы (aggregation operators);

// Aggregation stages - стадии обработки документов.

// Aggregation expressions - это выражения, которые:
// - задают преобразование, применяемое к входным документам текущей стадии;
// - преобразуют документы в памяти;
// - позволяют использовать операторы (aggregation operators) для вычисления значений;
// - могут содержать вложенные выражения (aggregation expressions).

// Начиная с MongoDB 4.4 можно использовать операторы $accumulator и $function, чтобы
//      объявлять пользовательские выражения (aggregation expressions).

async function agg_2() {

    const client = new MongoClient("mongodb://localhost:27017");

    try {
        await client.connect();
        const database = client.db("aggregation");
        const orders = database.collection("orders");

        //
        const aggCursor = orders.aggregate([
            // Stage 1: фильтрует документы у которых поле size равно medium и
            //      передает результат на стадию $group
            {
                $match: { size: "medium" }
            },
            // Stage 2: группирует оставшиеся документы поп полю name, рассчитывает сумму
            //      по полю quantity для каждой группы и сохраняет в поле totalQuantity
            {
                $group: { _id: "$name", totalQuantity: { $sum: "$quantity" } }
            }
        ])

        // await cursor.forEach(item => console.dir(JSON.stringify(item)));
        for await (const doc of aggCursor) {
            console.log(doc);
        }
        //      [
        //          { _id: 'Cheese', totalQuantity: 50 },
        //          { _id: 'Vegan', totalQuantity: 10 },
        //          { _id: 'Pepperoni', totalQuantity: 20 },
        //      ]
    }
    catch (err) {
        console.log(`--- err: ${err}`);
    }
    finally {
        await client.close();
    }
}

async function agg_3() {

    const client = new MongoClient("mongodb://localhost:27017");

    try {
        await client.connect();
        const database = client.db("aggregation");
        const orders = database.collection("orders");

        //
        const aggCursor = orders.aggregate([
            // Stage 1: фильтрует документы в диапазоне дат между $gte и $lt
            {
                $match: {
                    "date": { $gte: new Date("2020-01-30"), $lt: new Date("2022-01-30") }
                }
            },
            // Stage 2: группирует документы по дате с помощью $dateToString и 
            //      рассчитывает для каждой группы:
            //      - стоимость заказа с использованием $sum и $multiply,
            //      - средний объем заказа с использованием $avg.
            {
                $group: {
                    _id: { $dateToString: { format: "%Y-%m-%d", date: "$date" } },
                    totalOrderValue: { $sum: { $multiply: ["$price", "$quantity"] } },
                    averageOrderQuantity: { $avg: "$quantity" }
                }
            },
            // Stage 3: сортирует документы по полю totalOrderValue в порядке убывания (-1)
            {
                $sort: {
                    totalOrderValue: -1
                }
            }
        ]);

        // await cursor.forEach(item => console.dir(JSON.stringify(item)));
        for await (const doc of aggCursor) {
            console.log(doc);
        }
        //      [
        //          { _id: '2022-01-12', totalOrderValue: 790, averageOrderQuantity: 30 },
        //          { _id: '2021-03-13', totalOrderValue: 770, averageOrderQuantity: 15 },
        //          { _id: '2021-03-17', totalOrderValue: 630, averageOrderQuantity: 30 },
        //          { _id: '2021-01-13', totalOrderValue: 350, averageOrderQuantity: 10 }
        //      ]
    }
    catch (err) {
        console.log(`--- err: ${err}`);
    }
    finally {
        await client.close();
    }
}

// --- 7.2 Stages.

const stages = require('./stages');

// --- 7.3 Operators.

const operators = require('./operators');

// --- 7.4 Aggregation Stages.

require('./variables');

// --- Запуск.

(async () => {
    await agg_collection();
    await agg_1();
    await agg_2();
    await agg_3();
    await stages();
    await operators();
})();