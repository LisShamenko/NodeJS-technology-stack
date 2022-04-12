const { MongoClient } = require("mongodb");
const { dropCollection } = require("./../helpers");



// --- --- addFields

//      https://www.mongodb.com/docs/manual/reference/operator/aggregation/addFields/

// Сигнатура:
//      { $addFields: { <newField>: <expression>, ... } }

// использование двух стадий $addFields
async function mongo_add_fields() {

    const client = new MongoClient("mongodb://localhost:27017");

    try {
        await client.connect();
        const database = client.db("aggregation");

        // 
        const scores = database.collection("scores");

        await dropCollection(scores);
        await scores.insertMany([
            { _id: 1, student: "Maya", homework: [10, 5, 10], quiz: [10, 8], extraCredit: 0 },
            { _id: 2, student: "Ryan", homework: [5, 6, 5], quiz: [8, 8], extraCredit: 8 },
        ]);

        const cursor = scores.aggregate([
            {
                $addFields: {
                    totalHomework: { $sum: "$homework" },
                    totalQuiz: { $sum: "$quiz" }
                }
            },
            {
                $addFields: {
                    totalScore:
                        { $add: ["$totalHomework", "$totalQuiz", "$extraCredit"] }
                }
            }
        ])
        await cursor.forEach(item => console.dir(JSON.stringify(item)));
    }
    catch (err) {
        console.log(`--- err: ${err}`);
    }
    finally {
        await client.close();
    }
}

// добавление полей во встроенный документ
async function mongo_add_fields_dot() {

    const client = new MongoClient("mongodb://localhost:27017");

    try {
        await client.connect();
        const database = client.db("aggregation");

        // 
        const vehicles = database.collection("vehicles");

        await dropCollection(vehicles);
        await vehicles.insertMany([
            { _id: 1, type: "car", specs: { doors: 4, wheels: 4 } },
            { _id: 2, type: "motorcycle", specs: { doors: 0, wheels: 2 } },
            { _id: 3, type: "jet ski" },
        ]);

        const cursor = vehicles.aggregate([
            {
                $addFields: {
                    "specs.fuel_type": "unleaded"
                }
            }
        ])
        await cursor.forEach(item => console.dir(JSON.stringify(item)));
    }
    catch (err) {
        console.log(`--- err: ${err}`);
    }
    finally {
        await client.close();
    }
}

// замены полей
async function mongo_add_fields_replace() {

    const client = new MongoClient("mongodb://localhost:27017");

    try {
        await client.connect();
        const database = client.db("aggregation");

        // --- --- замена существующего поля

        const animals = database.collection("animals");

        await dropCollection(animals);
        await animals.insertMany([
            { _id: 1, dogs: 10, cats: 15 }
        ]);

        const cursor1 = await animals.aggregate([
            {
                $addFields: { "cats": 20 }
            }
        ]);
        await cursor1.forEach(item => console.dir(JSON.stringify(item)));

        // --- --- замена одного поля на другое

        const fruit = database.collection("fruit");

        await dropCollection(fruit);
        await fruit.insertMany([
            { "_id": 1, "item": "tangerine", "type": "citrus" },
            { "_id": 2, "item": "lemon", "type": "citrus" },
            { "_id": 3, "item": "grapefruit", "type": "citrus" },
        ]);

        const cursor2 = fruit.aggregate([
            {
                $addFields: {
                    // замена поля _id знчачением item
                    _id: "$item",
                    // замена поля item статическим значением
                    item: "fruit"
                }
            }
        ]);
        await cursor2.forEach(item => console.dir(JSON.stringify(item)));
    }
    catch (err) {
        console.log(`--- err: ${err}`);
    }
    finally {
        await client.close();
    }
}

// добавление элемента в массив
async function mongo_add_fields_add() {

    const client = new MongoClient("mongodb://localhost:27017");

    try {
        await client.connect();
        const database = client.db("aggregation");

        // 
        const scores = database.collection("scores");

        await dropCollection(scores);
        await scores.insertMany([
            { _id: 1, student: "Maya", homework: [10, 5, 10], quiz: [10, 8], extraCredit: 0 },
            { _id: 2, student: "Ryan", homework: [5, 6, 5], quiz: [8, 8], extraCredit: 8 }
        ]);

        const cursor = await scores.aggregate([
            {
                $match: {
                    _id: 1
                }
            },
            {
                $addFields: {
                    homework: {
                        // выражение $concatArrays позволяет добавить элементв поле 
                        //      массива, массив homework будет состоять из собственных 
                        //      элементов и элементов массива '[7]'
                        $concatArrays: ["$homework", [7]]
                    }
                }
            }
        ]);
        await cursor.forEach(item => console.dir(JSON.stringify(item)));
    }
    catch (err) {
        console.log(`--- err: ${err}`);
    }
    finally {
        await client.close();
    }
}

// --- Запуск.

module.exports = async () => {
    await mongo_add_fields();
    await mongo_add_fields_dot();
    await mongo_add_fields_replace();
    await mongo_add_fields_add();
};