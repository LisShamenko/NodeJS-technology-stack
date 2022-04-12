const { MongoClient, Decimal128, Int32 } = require("mongodb");
const { dropCollection } = require("./../helpers");



// --- --- trunc

//      https://www.mongodb.com/docs/manual/reference/operator/aggregation/trunc/

// Усекает число до целого или до указанного десятичного разряда. 
//      Не округляет усеченные данные.

// Сигнатура:
//      { $trunc: <number> }
//      { $trunc : [ <number>, <place> ] }
//          <number> - любое допустимое выражение, которое возвращает число
//              [integer, double, decimal, long], иначе произойдет ошибка;
//          <place> - любое допустимое выражение, которое возвращает целое число
//              -20 and 100, по умолчанию 0; 

// Правила усечения, где N - это <place>:
// +N   [1234.5678, 2]  => 1234.56      усекает число до N десятичных разрядов       
// -N   [1234.5678, -2] => 1200         заменяет N цифр слева от десятичной дроби на 0
// N>   [1234.5678, -5] => 0            если N больше числа, то возвращает 0
//  0   [1234.5678, 0]  => 1234         обрезаются все цифры справа от десятичной дроби

// --- --- Returned Data Type

// При усечении до определенного десятичного разряда возвращаемый тип данных 
//      соответствует типу данных входного выражения или значения. При усечении 
//      всех разрядов возвращает целое число.

// --- --- null, NaN, and +/- Infinity

//      { $trunc: [NaN, 1] }            NaN
//      { $trunc: [null, 1] }           null
//      { $trunc: [Infinity, 1] }       +Infinity
//      { $trunc: [-Infinity, 1] }      -Infinity

module.exports = async () => {

    const client = new MongoClient("mongodb://localhost:27017");

    try {
        await client.connect();
        const database = client.db("aggregation");

        // 
        const samples = database.collection("samples");

        await dropCollection(samples);
        await samples.insertMany([
            { _id: 1, value: 19.25 },
            { _id: 2, value: 28.73 },
            { _id: 3, value: 34.32 },
            { _id: 4, value: -45.34 },
        ]);

        // --- --- возвращает число, усеченое до первого десятичного знака

        const cursor1 = await samples.aggregate([
            { $project: { truncatedValue: { $trunc: ["$value", 1] } } }
        ])
        await cursor1.forEach(item => console.dir(JSON.stringify(item)));

        // --- --- возвращает число, усеченое до первого разряда

        const cursor2 = await samples.aggregate([
            { $project: { truncatedValue: { $trunc: ["$value", -1] } } }
        ])
        await cursor2.forEach(item => console.dir(JSON.stringify(item)));

        // --- --- возвращает число, усеченое до целого

        const cursor3 = await samples.aggregate([
            { $project: { truncatedValue: { $trunc: ["$value", 0] } } }
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