const { MongoClient, Decimal128, Int32 } = require("mongodb");
const { dropCollection } = require("./../helpers");



// --- --- replaceRoot

//      https://www.mongodb.com/docs/manual/reference/operator/aggregation/replaceRoot/

// Заменяет входной документ указанным документом. Операция заменяет все существующие 
//      поля во входном документе, включая поле _id. 

// Сигнатура:
//      { $replaceRoot: { newRoot: <replacementDocument> } }
//          <replacementDocument> - любое выражение, возвращающее документ. Если 
//              выражение не возвращает документ или возвращает пустой объект, то
//              генерируется ошибка.

function example_1() {

    db.collection.insertMany([
        { "_id": 1, "name": { "first": "John", "last": "Backus" } },
        { "_id": 2, "name": { "first": "John", "last": "McCarthy" } },
        { "_id": 3, "name": { "first": "Grace", "last": "Hopper" } },
        { "_id": 4, "firstname": "Ole-Johan", "lastname": "Dahl" },
    ])

    // операция завершится ошибкой, поскольку один из документов не содержит поле name
    db.collection.aggregate([
        { $replaceRoot: { newRoot: "$name" } }
    ])

    // операция $mergeObjects возвращает документ, объединяя указанные поля
    db.collection.aggregate([
        { $replaceRoot: { newRoot: { $mergeObjects: [{ _id: "$_id", first: "", last: "" }, "$name"] } } }
    ])

    // операция $match позволяет отфильтровать документ, которые не содержат поле name
    db.collection.aggregate([
        { $match: { name: { $exists: true, $not: { $type: "array" }, $type: "object" } } },
        { $replaceRoot: { newRoot: "$name" } }
    ])

    // выражение $ifNull указывает документ если поле name равно null
    db.collection.aggregate([
        { $replaceRoot: { newRoot: { $ifNull: ["$name", { _id: "$_id", missingName: true }] } } }
    ])
}

// 
module.exports = async () => {

    const client = new MongoClient("mongodb://localhost:27017");

    try {
        await client.connect();
        const database = client.db("aggregation");

        // --- --- $replaceRoot со встроенным полем документа

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
                $replaceRoot: {
                    newRoot: {
                        $mergeObjects: [
                            { dogs: 0, cats: 0, birds: 0, fish: 0 },
                            "$pets"
                        ]
                    }
                }
            }
        ])
        await cursor1.forEach(item => console.dir(JSON.stringify(item)));

        // --- --- $replaceRoot с документом, вложенным в массив

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
            { $replaceRoot: { newRoot: "$grades" } }
        ])
        await cursor2.forEach(item => console.dir(JSON.stringify(item)));

        // --- --- $replaceRoot со вновь созданным документом

        const contacts = database.collection("contacts");

        await dropCollection(contacts);
        await contacts.insertMany([
            { "_id": 1, "first_name": "Gary", "last_name": "Sheffield", "city": "New York" },
            { "_id": 2, "first_name": "Nancy", "last_name": "Walker", "city": "Anaheim" },
            { "_id": 3, "first_name": "Peter", "last_name": "Sumner", "city": "Toledo" },
        ]);

        // операция создает новый документ из полей first_name и last_name
        const cursor3 = await contacts.aggregate([
            {
                $replaceRoot: {
                    newRoot: {
                        full_name: {
                            $concat: ["$first_name", " ", "$last_name"]
                        }
                    }
                }
            }
        ])
        await cursor3.forEach(item => console.dir(JSON.stringify(item)));

        // --- --- $replaceRoot с новым документом, созданным из $$ROOT

        const users = database.collection("users");

        await dropCollection(users);
        await users.insertMany([
            { "_id": 1, name: "Fred", email: "fred@example.net" },
            { "_id": 2, name: "Frank N. Stine", cell: "012-345-9999" },
            { "_id": 3, name: "Gren Dell", home: "987-654-3210", email: "beo@example.net" },
        ]);

        // создание документов со значениями по умолчанию для отсутствующих полей
        const cursor4 = await users.aggregate([
            {
                $replaceRoot:
                {
                    newRoot:
                    {
                        $mergeObjects:
                            [
                                { _id: "", name: "", email: "", cell: "", home: "" },
                                "$$ROOT"
                            ]
                    }
                }
            }
        ])
        await cursor4.forEach(item => console.dir(JSON.stringify(item)));
    }
    catch (err) {
        console.log(`--- err: ${err}`);
    }
    finally {
        await client.close();
    }
}
