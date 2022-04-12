const { MongoClient, Decimal128, Int32 } = require("mongodb");
const { dropCollection } = require("./../helpers");



// --- --- setIsSubset

//      https://www.mongodb.com/docs/manual/reference/operator/aggregation/setIsSubset/

// Принимает два массива и возвращает true, если первый массив является 
//      подмножеством второго или равен ему, иначе возвращает false.

// Сигнатура:
//      { $setIsSubset: [ <expression1>, <expression2> ] }
//          <expression> - любое выражение, возвращающее массив

// Оценивает только массивы верхневого уровня и не спускается во вложенные массивы.
//      Массивы оцениваются, как множества, то есть игнорируются повторяющиеся 
//      записи и порядок элементов.
//      { $setIsSubset: [ [ "a", "b", "a" ], [ "b", "a" ] ] }       true
//      { $setIsSubset: [ [ "a", "b" ], [ [ "a", "b" ] ] ] }        false

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

        // { "A": ["red", "blue"],  "B": ["red", "blue"],           "AisSubset": true  }
        // { "A": ["red", "blue"],  "B": ["blue", "red", "blue"],   "AisSubset": true  }
        // { "A": ["red", "blue"],  "B": ["red", "blue", "green"],  "AisSubset": true  }
        // { "A": ["red", "blue"],  "B": ["green", "red"],          "AisSubset": false }
        // { "A": ["red", "blue"],  "B": [],                        "AisSubset": false }
        // { "A": ["red", "blue"],  "B": [["red"], ["blue"]],       "AisSubset": false }
        // { "A": ["red", "blue"],  "B": [["red", "blue"]],         "AisSubset": false }
        // { "A": [],               "B": [],                        "AisSubset": true  }
        // { "A": [],               "B": ["red"],                   "AisSubset": true  }

        // определяет является ли массив A подмножеством массива B
        const cursor1 = await experiments.aggregate([
            {
                $project: {
                    A: 1,
                    B: 1,
                    AisSubset: {
                        $setIsSubset: ["$A", "$B"]
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