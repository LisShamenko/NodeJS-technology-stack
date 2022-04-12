const { MongoClient, Decimal128, Int32 } = require("mongodb");
const { dropCollection } = require("./../helpers");



// --- --- setIntersection

//      https://www.mongodb.com/docs/manual/reference/operator/aggregation/setIntersection/

// Принимает несколько массиов в качестве аргументов и возвращает массив, содержащий
//      общие элементы для всех входных массивов, то есть находит пересечение массивов.

// Сигнатура:
//      { $setIntersection: [ <array1>, <array2>, ... ] }
//          <arrayN> - любое допустимое выражение, возвращающее массив;

// Оператор setIntersection может выполнять операции множеств над массивами. Такие 
//      операции игнорируют повторяющиеся элементы и порядок следования элементов.

// Оператор setIntersection игнорирует вложенные массивы.

// { $setIntersection: [["a", "b", "a"], ["b", "a"]] } | ["b", "a"]
// ────────────────────────────────────────────────────┼───────────
// { $setIntersection: [["a", "b"], [["a", "b"]]] }    | []

module.exports = async () => {

    const client = new MongoClient("mongodb://localhost:27017");

    try {
        await client.connect();
        const database = client.db("aggregation");

        // 
        const experiments = database.collection("experiments");

        await dropCollection(experiments);
        await experiments.insertMany([
            { "_id": 1, "A": ["red", "blue"], "B": ["red", "blue"] },
            { "_id": 2, "A": ["red", "blue"], "B": ["blue", "red", "blue"] },
            { "_id": 3, "A": ["red", "blue"], "B": ["red", "blue", "green"] },
            { "_id": 4, "A": ["red", "blue"], "B": ["green", "red"] },
            { "_id": 5, "A": ["red", "blue"], "B": [] },
            { "_id": 6, "A": ["red", "blue"], "B": [["red"], ["blue"]] },
            { "_id": 7, "A": ["red", "blue"], "B": [["red", "blue"]] },
            { "_id": 8, "A": [], "B": [] },
            { "_id": 9, "A": [], "B": ["red"] },
        ]);

        // возврат массива элементов, общих как для массивов: A, B
        const cursor1 = await experiments.aggregate([
            {
                $project: {
                    A: 1,
                    B: 1,
                    commonToBoth: {
                        $setIntersection: ["$A", "$B"]
                    },
                    _id: 0
                }
            }
        ])
        await cursor1.forEach(item => console.dir(JSON.stringify(item)));
    }
    catch (err) {
        console.log(`--- err: ${err}`);
    }
    finally {
        await client.close();
    }
}