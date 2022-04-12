const { MongoClient, Decimal128, Int32 } = require("mongodb");
const { dropCollection } = require("./../helpers");



// --- --- map

//      https://www.mongodb.com/docs/manual/reference/operator/aggregation/map/

// Применяет выражение к каждому элементу массива и возвращает массив 
//      с примененными результатами.

// Сигнатура:
//      {
//          $map: {
//              input: <expression>,
//              as: <string>,
//              in: <expression> 
//          } 
//      }
//          input - выражение, которое возвращает массив;
//          as - имя переменной, которая представляет каждый отдельный элемент 
//              массива; значение по умолчанию 'this';
//          in - выражение, которое применяется к каждому элементу массива;
//              в выражениях доступна переменная указанная в as.

// 
module.exports = async () => {

    const client = new MongoClient("mongodb://localhost:27017");

    try {
        await client.connect();
        const database = client.db("aggregation");

        // --- --- Add to each element of an array using $map

        const grades = database.collection("grades");

        await dropCollection(grades);
        await grades.insertMany([
            { "_id": 1, "quizzes": [5, 6, 7] },
            { "_id": 2, "quizzes": [] },
            { "_id": 3, "quizzes": [3, 8, 9] }
        ]);

        // увеличивает каждый элемент в массиве на 2
        const cursor1 = await grades.aggregate([
            {
                $project: {
                    adjustedGrades: {
                        $map: {
                            input: "$quizzes",
                            as: "grade",
                            in: { $add: ["$$grade", 2] }
                        }
                    }
                }
            }
        ])
        await cursor1.forEach(item => console.dir(JSON.stringify(item)));

        // --- --- Truncate each array element with $map

        const deliveries = database.collection("deliveries");

        await dropCollection(deliveries);
        await deliveries.insertMany([
            { "_id": 1, "city": "Bakersfield", "distances": [34.57, 81.96, 44.24] },
            { "_id": 2, "city": "Barstow", "distances": [73.28, 9.67, 124.36] },
            { "_id": 3, "city": "San Bernadino", "distances": [16.04, 3.25, 6.82] }
        ]);

        // усекает элементы массива до целого числа
        const cursor2 = await deliveries.aggregate([
            {
                $project: {
                    city: "$city",
                    integerValues: {
                        $map: {
                            input: "$distances",
                            as: "decimalValue",
                            in: { $trunc: "$$decimalValue" }
                        }
                    }
                }
            }
        ])
        await cursor2.forEach(item => console.dir(JSON.stringify(item)));

        // --- --- Convert Celsius Temperatures to Fahrenheit Using $map

        const temperatures = database.collection("temperatures");

        await dropCollection(temperatures);
        await temperatures.insertMany([
            { "_id": 1, "date": new Date("2019-06-23"), "tempsC": [4, 12, 17] },
            { "_id": 2, "date": new Date("2019-07-07"), "tempsC": [14, 24, 11] },
            { "_id": 3, "date": new Date("2019-10-30"), "tempsC": [18, 6, 8] }
        ]);

        // добавление нового поля в документы tempsF, которое содержит эквиваленты 
        //      элементов массива tempsC в градусах Фаренгейта
        const cursor3 = await temperatures.aggregate([
            {
                $addFields: {
                    "tempsF": {
                        $map: {
                            input: "$tempsC",
                            as: "tempInCelsius",
                            in: { $add: [{ $multiply: ["$$tempInCelsius", 9 / 5] }, 32] }
                        }
                    }
                }
            }
        ])
        await cursor3.forEach(item => console.dir(JSON.stringify(item)));
    }
    catch (err) {
        console.log(`--- err: ${err}`);
    }
    finally {
        await client.close();
    }
}