const { MongoClient, Decimal128, Int32 } = require("mongodb");
const { dropCollection } = require("./../helpers");



// --- --- group

//      https://www.mongodb.com/docs/manual/reference/operator/aggregation/group/

// Группирует входные документы по указанному выражению и для каждой группы выводит 
//      документ с полем _id, которое будет содержать уникальное значение группы. 
//      Для каждой группы могут быть выполнены accumulator-выражения, результаты
//      которых будут содержаться в соответствующих полях выходных документов.

// Сигнатура:
//      {
//          $group:
//          {
//              _id: <expression>,                  
//              <field1>: { <accumulator1> : <expression1> },
//              ...
//          }
//      }
//          _id - выражение, по которому быдут группироваться документы; если 
//              указать null или константу, то accumulator-выражения будут
//              вычислены для всех документов;
//          field - accumulator-выражения;
//          <accumulator> - это accumulator-операторв.

// Доступны следующие accumulator-операторы:
//      $accumulator - возвращает результат пользовательской accumulator-функции.
//      $addToSet - возвращает массив уникальных значений для каждой группы. 
//      $avg - возвращает среднее значений. Игнорирует нечисловые значения.
//      $count - возвращает количество документов в группе.
//      $first - возвращает значение из первого документа для каждой группы. 
//      $last - возвращает значение из последнего документа для каждой группы.
//      $max - возвращает наибольшее значение для каждой группы.
//      $mergeObjects - возвращает объединение входных документов для каждой группы.
//      $min - возвращает наименьшее значение для каждой группы.
//      $push - возвращает массив значений для документов в каждой группе.
//      $stdDevPop - возвращает population standard deviation входных значений.
//      $stdDevSamp - возвращает sample standard deviation входных значений.
//      $sum - возвращает сумму числовых значений. Игнорирует нечисловые значения.

// --- --- $group and Memory Restrictions

// --- --- Optimization to Return the First Document of Each Group



module.exports = async () => {

    const client = new MongoClient("mongodb://localhost:27017");

    try {
        await client.connect();
        const database = client.db("aggregation");

        // --- --- Count the Number of Documents in a Collection

        const sales = database.collection("sales");

        // NumberDecimal, NumberInt, ISODate -> Decimal128, Int32, Date
        await dropCollection(sales);
        await sales.insertMany([
            { "_id": 1, "item": "abc", "price": Decimal128.fromString("10"), "quantity": Int32("2"), "date": new Date("2014-03-01T08:00:00Z") },
            { "_id": 2, "item": "jkl", "price": Decimal128.fromString("20"), "quantity": Int32("1"), "date": new Date("2014-03-01T09:00:00Z") },
            { "_id": 3, "item": "xyz", "price": Decimal128.fromString("5"), "quantity": Int32("10"), "date": new Date("2014-03-15T09:00:00Z") },
            { "_id": 4, "item": "xyz", "price": Decimal128.fromString("5"), "quantity": Int32("20"), "date": new Date("2014-04-04T11:21:39.736Z") },
            { "_id": 5, "item": "abc", "price": Decimal128.fromString("10"), "quantity": Int32("10"), "date": new Date("2014-04-04T21:23:13.331Z") },
            { "_id": 6, "item": "def", "price": Decimal128.fromString("7.5"), "quantity": Int32("5"), "date": new Date("2015-06-04T05:08:13Z") },
            { "_id": 7, "item": "def", "price": Decimal128.fromString("7.5"), "quantity": Int32("10"), "date": new Date("2015-09-10T08:43:00Z") },
            { "_id": 8, "item": "abc", "price": Decimal128.fromString("10"), "quantity": Int32("5"), "date": new Date("2016-02-06T20:20:13Z") },
        ]);

        // использует $group для подсчета количества документов, эквивалент SQL:
        //      SELECT COUNT(*) AS count FROM sales
        const cursor1 = await sales.aggregate([
            {
                $group: {
                    _id: null,
                    count: { $count: {} }
                }
            }
        ])
        await cursor1.forEach(item => console.dir(JSON.stringify(item)));

        // --- --- Retrieve Distinct Values

        // использует $group для извлечения отдельных значений элементов
        const cursor2 = await sales.aggregate([
            { $group: { _id: "$item" } }
        ])
        await cursor2.forEach(item => console.dir(JSON.stringify(item)));

        // --- --- Group by Item Having

        // эквивалент SQL:
        //      SELECT    item, Sum(( price * quantity )) AS totalSaleAmount
        //      FROM      sales
        //      GROUP BY  item
        //      HAVING    totalSaleAmount >= 100
        const cursor3 = await sales.aggregate([
            // First Stage - группирует документы по полю item и 
            //      вычисляет общую сумму продажи по товару
            {
                $group:
                {
                    _id: "$item",
                    totalSaleAmount: { $sum: { $multiply: ["$price", "$quantity"] } }
                }
            },
            // Second Stage - фильтрует результирующие документы, чтобы возвращать 
            //    только элементы со значением totalSaleAmount больше или равным 100
            {
                $match: { "totalSaleAmount": { $gte: 100 } }
            }
        ])
        await cursor3.forEach(item => console.dir(JSON.stringify(item)));

        // --- --- Calculate Count, Sum, and Average

        // вычисляет общую сумму продаж, средний объем продаж и количество продаж 
        //    за каждый день в 2014 году, эквивалент SQL:
        //    SELECT    date,
        //              Sum(( price * quantity )) AS totalSaleAmount,
        //              Avg(quantity)             AS averageQuantity,
        //              Count(*)                  AS Count
        //    FROM      sales
        //    GROUP BY  Date(date)
        //    ORDER BY  totalSaleAmount DESC
        const cursor4 = await sales.aggregate([
            // First Stage - фильтрует документы, чтобы передать на следующий этап 
            //      только документы из 2014 года
            {
                $match: { "date": { $gte: new Date("2014-01-01"), $lt: new Date("2015-01-01") } }
            },
            // Second Stage - группирует документы по дате и вычисляет общую сумму продажи, 
            //      среднее количество и общее количество документов в каждой группе
            {
                $group: {
                    _id: { $dateToString: { format: "%Y-%m-%d", date: "$date" } },
                    totalSaleAmount: { $sum: { $multiply: ["$price", "$quantity"] } },
                    averageQuantity: { $avg: "$quantity" },
                    count: { $sum: 1 }
                }
            },
            // Third Stage - сортирует результаты по общей сумме продаж для каждой группы 
            //      в порядке убывания
            {
                $sort: { totalSaleAmount: -1 }
            }
        ])
        await cursor4.forEach(item => console.dir(JSON.stringify(item)));

        // --- --- Group by null

        // группирует по полю _id равное null, вычисляет общую сумму продаж, среднее 
        //      количество и количество всех документов, эквивалент SQL:
        //      SELECT  Sum(price * quantity) AS totalSaleAmount,
        //              Avg(quantity)         AS averageQuantity,
        //              Count(*)              AS Count
        //      FROM    sales
        const cursor5 = await sales.aggregate([
            {
                $group: {
                    _id: null,
                    totalSaleAmount: { $sum: { $multiply: ["$price", "$quantity"] } },
                    averageQuantity: { $avg: "$quantity" },
                    count: { $sum: 1 }
                }
            }
        ])
        await cursor5.forEach(item => console.dir(JSON.stringify(item)));

        // --- --- Pivot Data

        const books = database.collection("books");

        await dropCollection(books);
        await books.insertMany([
            { "_id": 8751, "title": "The Banquet", "author": "Dante", "copies": 2 },
            { "_id": 8752, "title": "Divine Comedy", "author": "Dante", "copies": 1 },
            { "_id": 8645, "title": "Eclogues", "author": "Dante", "copies": 2 },
            { "_id": 7000, "title": "The Odyssey", "author": "Homer", "copies": 10 },
            { "_id": 7020, "title": "Iliad", "author": "Homer", "copies": 10 },
        ]);

        // --- --- Group title by author

        // группирует заголовки по авторам
        const cursor6 = await books.aggregate([
            { $group: { _id: "$author", books: { $push: "$title" } } }
        ])
        await cursor6.forEach(item => console.dir(JSON.stringify(item)));

        // --- --- Group Documents by author

        // группирует документы по author
        const cursor7 = await books.aggregate([
            // First Stage - использует системную переменную $$ROOT 
            //      для группировки всех документов по авторам
            {
                $group: { _id: "$author", books: { $push: "$$ROOT" } }
            },
            // Second Stage - добавляет поле totalCopies, содержащее общее количество 
            //      копий книг для каждого автора
            {
                $addFields:
                {
                    totalCopies: { $sum: "$books.copies" }
                }
            }
        ])
        await cursor7.forEach(item => console.dir(JSON.stringify(item)));
    }
    catch (err) {
        console.log(`--- err: ${err}`);
    }
    finally {
        await client.close();
    }
}