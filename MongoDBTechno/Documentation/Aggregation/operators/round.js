const { MongoClient, Decimal128, Int32 } = require("mongodb");
const { dropCollection } = require("./../helpers");



// --- --- round

//      https://www.mongodb.com/docs/manual/reference/operator/aggregation/round/

// Округляет число до целого числа или до указанного десятичного знака.

// Сигнатура:
//      { $round: [<number>, <place>] }
//          <number> - любое допустимое выражение, которое возвращает число
//              [integer, double, decimal, long], иначе произойдет ошибка;
//          <place> - любое допустимое выражение, которое возвращает целое число
//              -20 and 100, по умолчанию 0; 

// Правила усечения, где N - это <place>:
// +N   [1234.5678, 2]  => 1234.57      округляет до N знаков после запятой
// -N   [1234.5678, -2] => 1200         округляет N цифр слева от десятичной дроби
// N>=  [1234.5678, -4] => 0            если N больше или равно числу, то возвращает 0
//  0   [1234.5678, 0]  => 1234         округляет все цифры справа от десятичной дроби

// --- --- Rounding to Even Values

// Значения округляются до ближайшего четного значения. Например, выполнение 
//      '$round: ["$value", 0]' даст следующие результаты:
//      {_id : 1, "value" : 10.5}   =>  10
//          10.5 ближе всего к четному значению 10
//      {_id : 2, "value" : 11.5}   =>  12
//      {_id : 3, "value" : 12.5}   =>  12
//          11.5 и 12.5 ближе всего к четному значению 12
//      {_id : 4, "value" : 13.5}   =>  14

// Округление до ближайшего четного значения обеспечивает более равномерное 
//      распределение округленных данных, чем округление в большую или меньшую 
//      сторону.

// --- --- Returned Data Type

// При округлении до определенного десятичного разряда возвращаемый тип данных 
//      соответствует типу данных входного выражения или значения. При округлении 
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
            { _id: 4, value: -45.39 },
        ]);

        // --- --- 1

        const cursor1 = await samples.aggregate([
            { $project: { roundedValue: { $round: ["$value", 1] } } }
        ])
        await cursor1.forEach(item => console.dir(JSON.stringify(item)));

        // --- --- 2

        const cursor2 = await samples.aggregate([
            { $project: { roundedValue: { $round: ["$value", -1] } } }
        ])
        await cursor2.forEach(item => console.dir(JSON.stringify(item)));

        // --- --- 3

        const cursor3 = await samples.aggregate([
            { $project: { roundedValue: { $round: ["$value", 0] } } }
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