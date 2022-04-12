const { MongoClient, Decimal128, Int32 } = require("mongodb");
const { dropCollection } = require("./../helpers");



// --- --- unwind

//      https://www.mongodb.com/docs/manual/reference/operator/aggregation/unwind/

// Деконструирует поле массива и выводит документ для каждого элемента, в котором
//      значение поля массива заменено его элементом.

// --- --- Field Path Operand

// На стадию $unwind можно передать путь к полю массива. 

// Сигнатура:
//      { $unwind: <field path> }
//          <field path> - путь к полю массива, если <field path> равно null, 
//              missing или [], то документ не выводится.

// --- --- Document Operand

// На стадию $unwind можно передать документ.

// Сигнатура:
//      {
//          $unwind:
//          {
//              path: <field path>,
//              includeArrayIndex: <string>,
//              preserveNullAndEmptyArrays: <boolean>
//          }
//      }
//      path - путь к полю массива;
//      includeArrayIndex - имя нового поля для хранения индекса элемента;
//      preserveNullAndEmptyArrays - если path равно null, missing или [], то:
//          true - выводит документ;
//          false (по умолчанию) - документ не выводится.

module.exports = async () => {

    const client = new MongoClient("mongodb://localhost:27017");

    try {
        await client.connect();
        const database = client.db("aggregation");

        // --- --- Unwind Array

        const inventory = database.collection("inventory");

        await dropCollection(inventory);
        await inventory.insertMany([
            { "_id": 1, "item": "ABC", price: Decimal128.fromString("80"), "sizes": ["S", "M", "L"] },
            { "_id": 2, "item": "EFG", price: Decimal128.fromString("120"), "sizes": [] },
            { "_id": 3, "item": "IJK", price: Decimal128.fromString("160"), "sizes": "M" },
            { "_id": 4, "item": "LMN", price: Decimal128.fromString("10") },
            { "_id": 5, "item": "XYZ", price: Decimal128.fromString("5.75"), "sizes": null }
        ]);

        // 
        const cursor1 = await inventory.aggregate([
            // документы будут идентичны исходным, за исключением поля sizes,
            //      которое будет содержать значения из исходного массива sizes
            { $unwind: "$sizes" }
            // аналогичная операция:
            //      { $unwind: { path: "$sizes" } }
        ])
        await cursor1.forEach(item => console.dir(JSON.stringify(item)));

        // --- --- includeArrayIndex

        const cursor2 = await inventory.aggregate([
            {
                // использует includeArrayIndex для включения индекса 
                //      массива в документ через новое поле arrayIndex
                $unwind:
                {
                    path: "$sizes",
                    includeArrayIndex: "arrayIndex"
                }
            }
        ])
        await cursor2.forEach(item => console.dir(JSON.stringify(item)));

        // --- --- preserveNullAndEmptyArrays

        const cursor3 = await inventory.aggregate([
            {
                // использует preserveNullAndEmptyArrays для включения в результат 
                //      документов, у которых поле sizes равно null, missing или []
                $unwind: {
                    path: "$sizes",
                    preserveNullAndEmptyArrays: true
                }
            }
        ])
        await cursor3.forEach(item => console.dir(JSON.stringify(item)));

        // --- --- Group by Unwound Values

        await dropCollection(inventory);
        await inventory.insertMany([
            { "_id": 1, "item": "ABC", price: Decimal128.fromString("80"), "sizes": ["S", "M", "L"] },
            { "_id": 2, "item": "EFG", price: Decimal128.fromString("120"), "sizes": [] },
            { "_id": 3, "item": "IJK", price: Decimal128.fromString("160"), "sizes": "M" },
            { "_id": 4, "item": "LMN", price: Decimal128.fromString("10") },
            { "_id": 5, "item": "XYZ", price: Decimal128.fromString("5.75"), "sizes": null }
        ]);

        // группирует полученные документы по значениям массива sizes:
        const cursor4 = await inventory.aggregate([
            // First Stage - выводит новый документ для каждого элемента массива 
            //      sizes с учетом документов, у которых sizes равно null, missing или []
            {
                $unwind: { path: "$sizes", preserveNullAndEmptyArrays: true }
            },
            // Second Stage - группирует документы sizes и вычисляет среднее значение 
            //      поля price
            {
                $group:
                {
                    _id: "$sizes",
                    averagePrice: { $avg: "$price" }
                }
            },
            // Third Stage - сортирует документы по полю averagePrice в порядке убывания
            {
                $sort: { "averagePrice": -1 }
            }
        ])
        await cursor4.forEach(item => console.dir(JSON.stringify(item)));

        // --- --- Unwind Embedded Arrays

        const sales = database.collection("sales");

        await dropCollection(sales);
        await sales.insertMany([
            {
                _id: "1",
                "items": [
                    { "name": "pens", "tags": ["writing", "office", "school", "stationary"], "price": Decimal128.fromString("12.00"), "quantity": Int32("5") },
                    { "name": "envelopes", "tags": ["stationary", "office"], "price": Decimal128.fromString("19.95"), "quantity": Int32("8") }
                ]
            },
            {
                _id: "2",
                "items": [
                    { "name": "laptop", "tags": ["office", "electronics"], "price": Decimal128.fromString("800.00"), "quantity": Int32("1") },
                    { "name": "notepad", "tags": ["stationary", "school"], "price": Decimal128.fromString("14.95"), "quantity": Int32("3") }
                ]
            }
        ]);

        // группирует документы по их тегам и вычисляет общую сумму продаж по каждому тегу
        const cursor5 = await sales.aggregate([
            // First Stage - выводит новый документ для каждого элемента массива
            { $unwind: "$items" },
            // Second Stage - выводит новый документ для каждого элемента в массивах 
            //      items.tags
            { $unwind: "$items.tags" },
            // Third Stage - группирует документы по полю tags и подсчитывает общую 
            //      сумму продаж товаров для каждого тега
            {
                $group:
                {
                    _id: "$items.tags",
                    totalSalesAmount:
                    {
                        $sum: { $multiply: ["$items.price", "$items.quantity"] }
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