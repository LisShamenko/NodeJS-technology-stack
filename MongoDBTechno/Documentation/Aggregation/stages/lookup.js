const { MongoClient, Decimal128, Int32 } = require("mongodb");
const { dropCollection } = require("./../helpers");



// --- --- lookup

//      https://www.mongodb.com/docs/manual/reference/operator/aggregation/lookup/

// Выполняет объединение 'left outer join' с коллекцией для фильтрации документов. 
//      Добавляет к каждому документу поле массива, в котором будут перечисленны 
//      документы из joined коллекции.

// --- --- Equality Match with a Single Join Condition.

// Сигнатура: 
//      {
//          $lookup:
//          {
//              from: <collection to join>,
//              localField: <field from the input documents>,
//              foreignField: <field from the documents of the "from" collection>,
//              as: <output array field>
//          }
//      }
//      from - указывает коллекцию в той же базе данных для выполнения соединения;
//      localField - задает поле документа входной коллекции;
//      foreignField - задает поле из коллекции from;
//      as - указывает имя поля массива, в которое будут помещены документы 
//          из коллекции from после сопоставления; если поле уже существует, то оно
//          будет перезаписано.

// Поле localField документов из входной коллекции будет сопоставляться с полем 
//      foreignField документов из коллекции from. Если поле localField/foreignField 
//      отсутствует в документе коллекции, то соответствующее поле будет иметь 
//      значение null при сопоставлении.

// Операция будет соответствовать следующему оператору SQL:
//      SELECT *, <output array field>
//      FROM collection
//      WHERE <output array field> IN (
//          SELECT *
//          FROM <collection to join>
//          WHERE <foreignField> = <collection.localField>
//      );

// --- --- Join Conditions and Subqueries on a Joined Collection.

// Коррелированный подзапрос - это конвейер на стадии $lookup, который ссылается
//      на поля документа из объединенной коллекции. Некоррелированный подзапрос 
//      не ссылается на объединенные поля. Коррелированный подзапрос SQL - это 
//      внутренний запрос, который ссылается на значения внешнего запроса. 
//      Некоррелированный подзапрос SQL не ссылается на значения внешнего запроса.

//      {
//          $lookup:
//          {
//              from: <joined collection>,
//              let: { <var_1>: <expression>, …, <var_n>: <expression> },
//              pipeline: [ <pipeline to run on joined collection> ],
//              as: <output array field>
//          }
//      }
//      from - указывает коллекцию в той же базе данных для выполнения соединения;
//      let (необязательный) - задает переменные для доступа к полям документов 
//          объединенной коллекции; переменные являются входными данными для pipeline;
//      pipeline - форматирует документы из объединенной коллекции; чтобы вернуть
//          все документы следует указать []; не может включать стадии $out и $merge;
//          не может напрямую обратится к полям документов из объединенной коллекци,
//          вместо этого следует использовать переменные let;
//      as - указывает имя поля массива, в которое будут помещены документы 
//          из коллекции from после сопоставления; если поле уже существует, то оно
//          будет перезаписано.

// To reference variables in pipeline stages, use the "$$<variable>" syntax.
// The let variables can be accessed by the stages in the pipeline, including additional 
//      $lookup stages nested in the pipeline.
//      - A $match stage requires the use of an $expr operator to access the variables. 
//          The $expr operator allows the use of aggregation expressions inside of the 
//          $match syntax.
//          Starting in MongoDB 5.0, the $eq, $lt, $lte, $gt, and $gte comparison operators 
//              placed in an $expr operator can use an index on the from collection referenced 
//              in a $lookup stage. Limitations:
//              - Multikey indexes are not used.
//              - Indexes are not used for comparisons where the operand is an array or 
//                  the operand type is undefined.
//              - Indexes are not used for comparisons with more than one field path operand.
//      - Other (non-$match) stages in the pipeline do not require an $expr operator to access 
//          the variables.

// Операция будет соответствовать следующему оператору SQL:
//      SELECT *, <output array field>
//      FROM collection
//      WHERE <output array field> IN (
//          SELECT <documents as determined from the pipeline>
//          FROM <collection to join>
//          WHERE <pipeline>
//      );

// --- --- Correlated Subqueries Using Concise Syntax.

//      {
//          $lookup:
//          {
//              from: <foreign collection>,
//              localField: <field from local collection's documents>,
//              foreignField: <field from foreign collection's documents>,
//              let: { <var_1>: <expression>, ..., <var_n>: <expression> },
//              pipeline: [ <pipeline to run> ],
//              as: <output array field>
//          }
//      }

//      from - указывает коллекцию в той же базе данных для выполнения соединения;
//      localField - задает поле документа входной коллекции;
//      foreignField - задает поле из коллекции from;
//      let (необязательный) - задает переменные для доступа к полям документов 
//          объединенной коллекции; переменные являются входными данными для pipeline;
//      pipeline - форматирует документы из объединенной коллекции; чтобы вернуть
//          все документы следует указать []; не может включать стадии $out и $merge;
//          не может напрямую обратится к полям документов из объединенной коллекци,
//          вместо этого следует использовать переменные let;
//      as - указывает имя поля массива, в которое будут помещены документы 
//          из коллекции from после сопоставления; если поле уже существует, то оно
//          будет перезаписано.

// Операция будет соответствовать следующему оператору SQL:
//      SELECT *, <output array field>
//      FROM localCollection
//      WHERE <output array field> IN (
//          SELECT <documents as determined from the pipeline>
//          FROM <foreignCollection>
//          WHERE <foreignCollection.foreignField> = <localCollection.localField>
//              AND <pipeline match condition>
//      );

// --- --- Ограничения.

// - If performing an aggregation that involves multiple views, such as with $lookup or 
//      $graphLookup, the views must have the same collation.
// - нельзя использовать стадии $out и $merge в поле pipeline на стадии $lookup;
// - сегментирование:
//      db.shardedCollection.aggregate([
//          { $lookup: { from: "unshardedCollection", ... } }
//      ])
//      - коллекция shardedCollection может быть сегментирована
//      - коллекция unshardedCollection не может быть сегментирована

// Альтернативы для объединения сегментированных коллекций:
// - ручной поиск вместо использования $lookup этапа агрегации;
// - использование модели данных, которая устраняет необходимость объединения коллекций;
// - использование 'Atlas Data Lake $lookup' для поиска в сегментированной коллекции.

// 
module.exports = async () => {

    const client = new MongoClient("mongodb://localhost:27017");

    try {
        await client.connect();
        const database = client.db("aggregation");

        // --- --- объединение документов

        // 
        const orders1 = database.collection("orders");

        await dropCollection(orders1);
        await orders1.insertMany([
            { "_id": 1, "item": "almonds", "price": 12, "quantity": 2 },
            { "_id": 2, "item": "pecans", "price": 20, "quantity": 1 },
            { "_id": 3 }
        ]);

        // 
        const inventory = database.collection("inventory");

        await dropCollection(inventory);
        await inventory.insertMany([
            { "_id": 1, "sku": "almonds", "description": "product 1", "instock": 120 },
            { "_id": 2, "sku": "bread", "description": "product 2", "instock": 80 },
            { "_id": 3, "sku": "cashews", "description": "product 3", "instock": 60 },
            { "_id": 4, "sku": "pecans", "description": "product 4", "instock": 70 },
            { "_id": 5, "sku": null, "description": "Incomplete" },
            { "_id": 6 }
        ]);

        //      SELECT *, inventory_docs
        //      FROM orders
        //      WHERE inventory_docs IN (
        //          SELECT *
        //          FROM inventory
        //          WHERE sku = orders.item
        //      );

        // объединение документов из коллекций orders и inventory, по полям item и sku
        const cursor1 = await orders1.aggregate([
            {
                $lookup:
                {
                    from: "inventory",
                    localField: "item",
                    foreignField: "sku",
                    as: "inventory_docs"
                }
            }
        ])
        await cursor1.forEach(item => console.dir(JSON.stringify(item)));

        // --- --- использование $lookup с массивом

        const classes = database.collection("classes");

        await dropCollection(classes);
        await classes.insertMany([
            { _id: 1, title: "Reading is ...", enrollmentlist: ["giraffe2", "pandabear", "artie"], days: ["M", "W", "F"] },
            { _id: 2, title: "But Writing ...", enrollmentlist: ["giraffe1", "artie"], days: ["T", "F"] }
        ])

        // 
        const members = database.collection("members");

        await dropCollection(members);
        await members.insertMany([
            { _id: 1, name: "artie", joined: new Date("2016-05-01"), status: "A" },
            { _id: 2, name: "giraffe", joined: new Date("2017-05-01"), status: "D" },
            { _id: 3, name: "giraffe1", joined: new Date("2017-10-01"), status: "A" },
            { _id: 4, name: "panda", joined: new Date("2018-10-11"), status: "A" },
            { _id: 5, name: "pandabear", joined: new Date("2018-12-01"), status: "A" },
            { _id: 6, name: "giraffe2", joined: new Date("2018-12-01"), status: "D" }
        ])

        // 
        const cursor2 = await classes.aggregate([
            {
                $lookup:
                {
                    from: "members",
                    // если поле localField это массив, то элементы массива можно
                    //      сопоставить со скалярными элементами поля foreignField 
                    //      без стадии $unwind
                    localField: "enrollmentlist",
                    foreignField: "name",
                    as: "enrollee_info"
                }
            }
        ])
        await cursor2.forEach(item => console.dir(JSON.stringify(item)));

        // --- --- оператор $mergeObjects

        // 
        const orders3 = database.collection("orders");

        await dropCollection(orders3);
        await orders3.insertMany([
            { "_id": 1, "item": "almonds", "price": 12, "quantity": 2 },
            { "_id": 2, "item": "pecans", "price": 20, "quantity": 1 }
        ])

        //
        const items = database.collection("items");

        await dropCollection(items);
        await items.insertMany([
            { "_id": 1, "item": "almonds", description: "almond clusters", "instock": 120 },
            { "_id": 2, "item": "bread", description: "raisin and nut bread", "instock": 80 },
            { "_id": 3, "item": "pecans", description: "candied pecans", "instock": 60 }
        ])

        // оператор $mergeObjects объединяет несколько документов в один
        const cursor3 = await orders3.aggregate([
            {
                // объединение двух коллекций
                $lookup: {
                    from: "items",
                    localField: "item",    // field in the orders collection
                    foreignField: "item",  // field in the items collection
                    as: "fromItems"
                }
            },
            {
                // слияние документов из коллекций items и orders
                $replaceRoot: {
                    newRoot: {
                        $mergeObjects: [
                            { $arrayElemAt: ["$fromItems", 0] },
                            "$$ROOT"]
                    }
                }
            },
            { $project: { fromItems: 0 } }
        ])
        await cursor3.forEach(item => console.dir(JSON.stringify(item)));

        // --- --- множественные объединения и коррелированный подзапрос

        const orders4 = database.collection("orders");

        await dropCollection(orders4);
        await orders4.insertMany([
            { "_id": 1, "item": "almonds", "price": 12, "ordered": 2 },
            { "_id": 2, "item": "pecans", "price": 20, "ordered": 1 },
            { "_id": 3, "item": "cookies", "price": 10, "ordered": 60 }
        ])

        //
        const warehouses = database.collection("warehouses");

        await dropCollection(warehouses);
        await warehouses.insertMany([
            { "_id": 1, "stock_item": "almonds", warehouse: "A", "instock": 120 },
            { "_id": 2, "stock_item": "pecans", warehouse: "A", "instock": 80 },
            { "_id": 3, "stock_item": "almonds", warehouse: "B", "instock": 60 },
            { "_id": 4, "stock_item": "cookies", warehouse: "B", "instock": 40 },
            { "_id": 5, "stock_item": "cookies", warehouse: "A", "instock": 80 }
        ])

        // 
        const cursor4 = await orders4.aggregate([
            {
                $lookup: {
                    from: "warehouses",
                    let: { order_item: "$item", order_qty: "$ordered" },
                    // коррелированный подзапрос с объединением полей orders.item и 
                    //      warehouse.stock_item
                    pipeline: [
                        {
                            $match: {
                                // Начиная с MongoDB 5.0, операторы [$eq, $lt, $lte, $gt, $gte] 
                                //      в операторе $expr могут использовать индекс коллекции 
                                //      from на стадии $lookup. 
                                //      Ограничения:
                                //      - не используются индексы на несколько ключей;
                                //      - индексы не используются для сравнений, если тип 
                                //          операнда является массивом или не определен;
                                //      - индексы не используются для сравнения более чем 
                                //          с одним field path;
                                $expr: {
                                    $and: [
                                        { $eq: ["$stock_item", "$$order_item"] },
                                        { $gte: ["$instock", "$$order_qty"] }
                                    ]
                                }
                            }
                        },
                        {
                            $project: { stock_item: 0, _id: 0 }
                        }
                    ],
                    as: "stockdata"
                }
            }
        ])
        await cursor4.forEach(item => console.dir(JSON.stringify(item)));

        // --- --- некоррелированный подзапрос

        // 
        const absences = database.collection("absences");

        await dropCollection(absences);
        await absences.insertMany([
            { "_id": 1, "student": "Ann Aardvark", sickdays: [new Date("2018-05-01"), new Date("2018-08-23")] },
            { "_id": 2, "student": "Zoe Zebra", sickdays: [new Date("2018-02-01"), new Date("2018-05-23")] },
        ])

        //
        const holidays = database.collection("holidays");

        await dropCollection(holidays);
        await holidays.insertMany([
            { "_id": 1, year: 2018, name: "New Years", date: new Date("2018-01-01") },
            { "_id": 2, year: 2018, name: "Pi Day", date: new Date("2018-03-14") },
            { "_id": 3, year: 2018, name: "Ice Cream Day", date: new Date("2018-07-15") },
            { "_id": 4, year: 2017, name: "New Years", date: new Date("2017-01-01") },
            { "_id": 5, year: 2017, name: "Ice Cream Day", date: new Date("2017-07-16") }
        ])

        //      SELECT *, holidays
        //      FROM absences
        //      WHERE holidays IN(
        //          SELECT name, date
        //          FROM holidays
        //          WHERE year = 2018
        //      );

        //
        const cursor5 = await absences.aggregate([
            {
                $lookup: {
                    from: "holidays",
                    pipeline: [
                        { $match: { year: 2018 } },
                        { $project: { _id: 0, date: { name: "$name", date: "$date" } } },
                        { $replaceRoot: { newRoot: "$date" } }
                    ],
                    as: "holidays"
                }
            }
        ])
        await cursor5.forEach(item => console.dir(JSON.stringify(item)));

        // --- --- краткий коррелированный подзапрос 

        // 
        const orders6 = database.collection("orders");

        await dropCollection(orders6);
        await orders6.insertMany([
            { _id: 1, item: "filet", restaurant_name: "American Steak House" },
            { _id: 2, item: "cheese pizza", restaurant_name: "Honest John Pizza", drink: "lemonade" },
            { _id: 3, item: "cheese pizza", restaurant_name: "Honest John Pizza", drink: "soda" }
        ])

        // 
        const restaurants = database.collection("restaurants");

        await dropCollection(restaurants);
        await restaurants.insertMany([
            { _id: 1, name: "American Steak House", food: ["filet", "sirloin"], beverages: ["beer", "wine"] },
            { _id: 2, name: "Honest John Pizza", food: ["cheese pizza", "pepperoni pizza"], beverages: ["soda"] }
        ])

        //      SELECT *, matches
        //      FROM orders
        //      WHERE matches IN(
        //          SELECT *
        //          FROM restaurants
        //          WHERE restaurants.name = orders.restaurant_name
        //          AND restaurants.beverages = orders.drink
        //      );

        // начиная с MongoDB 5.0
        const cursor6 = await orders6.aggregate([
            {
                $lookup: {
                    from: "restaurants",
                    localField: "restaurant_name",
                    foreignField: "name",
                    let: { orders_drink: "$drink" },
                    pipeline: [{
                        // краткий синтаксис устраняет необходимость равенства полей
                        //      localField и foreignField внутри оператора $expr 
                        //      на стадии $match
                        $match: {
                            $expr: { $in: ["$$orders_drink", "$beverages"] }
                        }
                    }],
                    as: "matches"
                }
            }
        ])
        await cursor6.forEach(item => console.dir(JSON.stringify(item)));

        // до MongoDB 5.0
        const cursor7 = await orders6.aggregate([
            {
                $lookup: {
                    from: "restaurants",
                    let: {
                        orders_restaurant_name: "$restaurant_name",
                        orders_drink: "$drink"
                    },
                    pipeline: [{
                        $match: {
                            $expr: {
                                $and: [
                                    { $eq: ["$$orders_restaurant_name", "$name"] },
                                    { $in: ["$$orders_drink", "$beverages"] }
                                ]
                            }
                        }
                    }],
                    as: "matches"
                }
            }
        ])
        await cursor7.forEach(item => console.dir(JSON.stringify(item)));
    }
    catch (err) {
        console.log(`--- err: ${err}`);
    }
    finally {
        await client.close();
    }
}