const { MongoClient, Decimal128, Int32 } = require("mongodb");
const { dropCollection } = require("./../helpers");



// --- --- replaceWith

//      https://www.mongodb.com/docs/manual/reference/operator/aggregation/replaceWith/

// Заменяет входной документ указанным. Операция заменяет все существующие поля 
//      во входном документе, включая _id. С помощью $replaceWith можно перенести
//      встроенный документ на верхний уровень. 

// Стадия $replaceWith является псевдонимом для $replaceRoot.

// Сигнатура:
//      { $replaceWith: <replacementDocument> }
//          <replacementDocument> - любое выражение, возвращающее документ. 

function example_1() {

    db.collection.insertMany([
        { "_id": 1, "name": { "first": "John", "last": "Backus" } },
        { "_id": 2, "name": { "first": "John", "last": "McCarthy" } },
        { "_id": 3, "name": { "first": "Grace", "last": "Hopper" } },
        { "_id": 4, "firstname": "Ole-Johan", "lastname": "Dahl" },
    ])

    // операция завершится ошибкой, поскольку один из документов не содержит поле name
    db.collection.aggregate([
        { $replaceWith: "$name" }
    ])

    // операция $mergeObjects возвращает документ, объединяя указанные поля
    db.collection.aggregate([
        { $replaceWith: { $mergeObjects: [{ _id: "$_id", first: "", last: "" }, "$name"] } }
    ])

    // операция $match позволяет отфильтровать документ, которые не содержат поле name
    db.collection.aggregate([
        { $match: { name: { $exists: true, $not: { $type: "array" }, $type: "object" } } },
        { $replaceWith: "$name" }
    ])

    // выражение $ifNull указывает документ если поле name равно null
    db.collection.aggregate([
        { $replaceWith: { $ifNull: ["$name", { _id: "$_id", missingName: true }] } }
    ])
}

// 
module.exports = async () => {

    const client = new MongoClient("mongodb://localhost:27017");

    try {
        await client.connect();
        const database = client.db("aggregation");

        // --- --- $replaceWith со встроенным полем документа

        const peoples = database.collection("peoples");

        await dropCollection(peoples);
        await peoples.insertMany([
            { "_id": 1, "name": "Arlene", "age": 34, "pets": { "dogs": 2, "cats": 1 } },
            { "_id": 2, "name": "Sam", "age": 41, "pets": { "cats": 1, "fish": 3 } },
            { "_id": 3, "name": "Maria", "age": 25 },
        ]);

        // замена каждого входного документа результатом операции $mergeObjects,
        //      которая объединяет указанный документ с документом pets
        const cursor1 = await peoples.aggregate([
            {
                $replaceWith: {
                    $mergeObjects: [
                        { dogs: 0, cats: 0, birds: 0, fish: 0 },
                        "$pets"
                    ]
                }
            }
        ])
        await cursor1.forEach(item => console.dir(JSON.stringify(item)));

        // --- --- $replaceWith с документом, вложенным в массив

        const students = database.collection("students");

        await dropCollection(students);
        await students.insertMany([
            {
                "_id": 1,
                "grades": [
                    { "test": 1, "grade": 80, "mean": 75, "std": 6 },
                    { "test": 2, "grade": 85, "mean": 90, "std": 4 },
                    { "test": 3, "grade": 95, "mean": 85, "std": 6 }
                ]
            },
            {
                "_id": 2,
                "grades": [
                    { "test": 1, "grade": 90, "mean": 75, "std": 6 },
                    { "test": 2, "grade": 87, "mean": 90, "std": 3 },
                    { "test": 3, "grade": 91, "mean": 85, "std": 4 }
                ]
            }
        ])

        // выбирает документы вложенные в массив
        const cursor2 = await students.aggregate([
            { $unwind: "$grades" },
            { $match: { "grades.grade": { $gte: 90 } } },
            { $replaceWith: "$grades" }
        ])
        await cursor2.forEach(item => console.dir(JSON.stringify(item)));

        // --- --- $replaceWith со вновь созданным документом

        const sales1 = database.collection("sales");

        await dropCollection(sales1);
        await sales1.insertMany([
            { "_id": 1, "item": "butter", "price": 10, "quantity": 2, date: new Date("2019-03-01T08:00:00Z"), status: "C" },
            { "_id": 2, "item": "cream", "price": 20, "quantity": 1, date: new Date("2019-03-01T09:00:00Z"), status: "A" },
            { "_id": 3, "item": "jam", "price": 5, "quantity": 10, date: new Date("2019-03-15T09:00:00Z"), status: "C" },
            { "_id": 4, "item": "muffins", "price": 5, "quantity": 10, date: new Date("2019-03-15T09:00:00Z"), status: "C" }
        ]);

        // 
        const cursor3 = await sales1.aggregate([
            {
                // находит все документы со 'status:C'
                $match: { status: "C" }
            },
            {
                // создает новый документ
                $replaceWith: {
                    _id: "$_id",
                    item: "$item",
                    // вычисляет общую сумму на момент выполнения отчета
                    amount: { $multiply: ["$price", "$quantity"] },
                    status: "Complete",
                    // переменная NOW возвращает текущее время
                    asofDate: "$$NOW"
                }
            }
        ])
        await cursor3.forEach(item => console.dir(JSON.stringify(item)));

        // --- --- $replaceWith со вновь созданным документом

        const sales2 = database.collection("sales");

        await dropCollection(sales2);
        await sales2.insertMany([
            { _id: 1, quarter: "2019Q1", region: "A", qty: 400 },
            { _id: 2, quarter: "2019Q1", region: "B", qty: 550 },
            { _id: 3, quarter: "2019Q1", region: "C", qty: 1000 },
            { _id: 4, quarter: "2019Q2", region: "A", qty: 660 },
            { _id: 5, quarter: "2019Q2", region: "B", qty: 500 },
            { _id: 6, quarter: "2019Q2", region: "C", qty: 1200 }
        ]);

        // 
        const cursor4 = await sales2.aggregate([
            // First Stage - добавляет новое поле obj, которое определяет 
            //      регион и количество
            {
                $addFields: {
                    obj: { k: "$region", v: "$qty" }
                }
            },
            // Second Stage - группирует по кварталам, использует $push 
            //      для накопления полей obj в новом поле массива items
            {
                $group: {
                    _id: "$quarter",
                    items: { $push: "$obj" }
                }
            },
            // Third Stage - использует $concatArrays для создания массива 
            //      items2, который содержит идентификаторы и массив items
            {
                $project: {
                    items2: {
                        $concatArrays: [[{ "k": "_id", "v": "$_id" }], "$items"]
                    }
                }
            },
            // Fourth Stage - конвертирует массив в объект при помощи arrayToObject и
            //      выполняет замену в исходной коллекции
            {
                $replaceWith: {
                    $arrayToObject: "$items2"
                }
            }
        ])
        await cursor4.forEach(item => console.dir(JSON.stringify(item)));

        // --- --- $replaceRoot с новым документом, созданным из $$ROOT

        const contacts = database.collection("contacts");

        await dropCollection(contacts);
        await contacts.insertMany([
            { "_id": 1, name: "Fred", email: "fred@example.net" },
            { "_id": 2, name: "Frank N. Stine", cell: "012-345-9999" },
            { "_id": 3, name: "Gren Dell", cell: "987-654-3210", email: "beo@example.net" },
        ]);

        // создание документов со значениями по умолчанию для отсутствующих полей
        const cursor5 = await contacts.aggregate([
            {
                $replaceWith: {
                    $mergeObjects: [
                        { _id: "", name: "", email: "", cell: "", home: "" },
                        "$$ROOT"
                    ]
                }
            }
        ])
        await cursor5.forEach(item => console.dir(JSON.stringify(item)));
    }
    catch (err) {
        console.log(`--- err: ${err}`);
    }
    finally {
        await client.close();
    }
}