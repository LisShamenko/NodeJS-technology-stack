const { MongoClient, Decimal128, Int32 } = require("mongodb");
const { dropCollection } = require("./../helpers");



// --- --- set

//      https://www.mongodb.com/docs/manual/reference/operator/aggregation/set/

// Добавляет новые поля в документы. Является псевдонимом $addFields. Стадия $project
//      явно указывает все существующие поля во входных документах и ​​добавляет новые 
//      поля.

// Сигнатура:
//      { $set: { <newField>: <expression>, ... } }
//          <newField> - имена полей;
//          <expression> - выражения, определяющие значения полей.

// Добавить поле во встроенный документ можно использовать dot нотацию. Чтобы 
//      добавить элемент в поле массива следует использовать операцию $concatArrays.

module.exports = async () => {

    const client = new MongoClient("mongodb://localhost:27017");

    try {
        await client.connect();
        const database = client.db("aggregation");

        // --- --- две стадии $set

        const scores1 = database.collection("scores");

        await dropCollection(scores1);
        await scores1.insertMany([
            { _id: 1, student: "Maya", homework: [10, 5, 10], quiz: [10, 8], extraCredit: 0 },
            { _id: 2, student: "Ryan", homework: [5, 6, 5], quiz: [8, 8], extraCredit: 8 }
        ]);

        // 
        const cursor1 = await scores1.aggregate([
            {
                $set: {
                    totalHomework: { $sum: "$homework" },
                    totalQuiz: { $sum: "$quiz" }
                }
            },
            {
                $set: {
                    totalScore: { $add: ["$totalHomework", "$totalQuiz", "$extraCredit"] }
                }
            }
        ])
        await cursor1.forEach(item => console.dir(JSON.stringify(item)));

        // --- --- добавление полей во встроенный документ

        const vehicles = database.collection("vehicles");

        await dropCollection(vehicles);
        await vehicles.insertMany([
            { _id: 1, type: "car", specs: { doors: 4, wheels: 4 } },
            { _id: 2, type: "motorcycle", specs: { doors: 0, wheels: 2 } },
            { _id: 3, type: "jet ski" }
        ]);

        // добавления поля во встроенный документ
        const cursor2 = await vehicles.aggregate([
            { $set: { "specs.fuel_type": "unleaded" } }
        ])
        await cursor2.forEach(item => console.dir(JSON.stringify(item)));

        // --- --- перезапись существующего поля

        const animals = database.collection("animals");

        await dropCollection(animals);
        await animals.insertMany([
            { _id: 1, dogs: 10, cats: 15 }
        ]);

        // переопределить поле cats
        const cursor3 = await animals.aggregate([
            { $set: { "cats": 20 } }
        ])
        await cursor3.forEach(item => console.dir(JSON.stringify(item)));

        // --- --- замена одного поля на другое

        const fruits = database.collection("fruits");

        await dropCollection(fruits);
        await fruits.insertMany([
            { "_id": 1, "item": "tangerine", "type": "citrus" },
            { "_id": 2, "item": "lemon", "type": "citrus" },
            { "_id": 3, "item": "grapefruit", "type": "citrus" }
        ]);

        // замена поля _id значением поля item, поле item принимает 
        //      постоянное значение
        const cursor4 = await fruits.aggregate([
            { $set: { _id: "$item", item: "fruit" } }
        ])
        await cursor4.forEach(item => console.dir(JSON.stringify(item)));

        // --- --- добавить элемент в массив

        const scores5 = database.collection("scores");

        await dropCollection(scores5);
        await scores5.insertMany([
            { _id: 1, student: "Maya", homework: [10, 5, 10], quiz: [10, 8], extraCredit: 0 },
            { _id: 2, student: "Ryan", homework: [5, 6, 5], quiz: [8, 8], extraCredit: 8 }
        ])

        // 
        const cursor5 = await scores5.aggregate([
            {
                $match: { _id: 1 }
            },
            {
                // добавить значение в поле массива
                $set: {
                    // заменяет поле массива homework
                    homework: {
                        // на результат опрации concatArrays, которая создает
                        //      массив из поля homework и массива [7]
                        $concatArrays: ["$homework", [7]]
                    }
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