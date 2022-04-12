const { MongoClient, Decimal128, Int32 } = require("mongodb");
const { dropCollection } = require("./../helpers");



// --- --- anyElementTrue

//      https://www.mongodb.com/docs/manual/reference/operator/aggregation/anyElementTrue/

// Возвращает значение true, если хотя бы один элемент массива оценивается как true,
//      иначе возвращает false. Оценивает массив на верхнем уровне и не спускается 
//      во вложенные массивы.

// Сигнатура:
//      { $anyElementTrue: [ <expression> ] }
//          <expression> - выражение, которое возвращает массив; 

// Оператор anyElementTrue вернет false, если массив <expression> будет содержать
//      только значения [null, 0, undefined, false]. Если <expression> содержит
//      ненулевые числовые значения и массивы, то оператор вернет true.
//      { $anyElementTrue: [ [ true, false ] ] }        true
//      { $anyElementTrue: [ [ [ false ] ] ] }          true
//      { $anyElementTrue: [ [ null, false, 0 ] ] }     false
//      { $anyElementTrue: [ [ ] ] }                    false

module.exports = async () => {

    const client = new MongoClient("mongodb://localhost:27017");

    try {
        await client.connect();
        const database = client.db("aggregation");

        // 
        const survey = database.collection("survey");

        await dropCollection(survey);
        await survey.insertMany([
            { "_id": 1, "responses": [true] },
            { "_id": 2, "responses": [true, false] },
            { "_id": 3, "responses": [] },
            { "_id": 4, "responses": [1, true, "seven"] },
            { "_id": 5, "responses": [0] },
            { "_id": 6, "responses": [[]] },
            { "_id": 7, "responses": [[0]] },
            { "_id": 8, "responses": [[false]] },
            { "_id": 9, "responses": [null] },
            { "_id": 10, "responses": [undefined] }
        ]);

        // определяет содержит ли массив значения, которое оценивается как true
        //      { "responses" : [ true ],               "isAnyTrue" : true  }
        //      { "responses" : [ true, false ],        "isAnyTrue" : true  }
        //      { "responses" : [ ],                    "isAnyTrue" : false }
        //      { "responses" : [ 1, true, "seven" ],   "isAnyTrue" : true  }
        //      { "responses" : [ 0 ],                  "isAnyTrue" : false }
        //      { "responses" : [ [ ] ],                "isAnyTrue" : true  }
        //      { "responses" : [ [ 0 ] ],              "isAnyTrue" : true  }
        //      { "responses" : [ [ false ] ],          "isAnyTrue" : true  }
        //      { "responses" : [ null ],               "isAnyTrue" : false }
        //      { "responses" : [ undefined ],          "isAnyTrue" : false }
        const cursor1 = await survey.aggregate([
            {
                $project: {
                    _id: 0,
                    responses: 1,
                    isAnyTrue: {
                        $anyElementTrue: ["$responses"]
                    }
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