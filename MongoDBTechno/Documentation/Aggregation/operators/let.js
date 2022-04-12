const { MongoClient, Decimal128, Int32 } = require("mongodb");
const { dropCollection } = require("./../helpers");



// --- --- let

//      https://www.mongodb.com/docs/manual/reference/operator/aggregation/let/

// Выполняет привязку переменной для использования в указанном выражении и 
//      возвращает результат выражения.

// Сигнатура:
//      {
//          $let: {
//              vars: { <var1>: <expression>, ... },
//              in: <expression>
//          }
//      }
//          vars - переменные, которые будут доступны в выражении in; переменные
//              не имеют значения вне выражения in, даже внутри самого блока vars.
//          in - выражение.

// Синтаксис доступа к переменной в выражении:
//      '$$<var>'

// Оператор $let может использовать переменные, созданные вне его блока vars, включая 
//      системные переменные. Если блок vars меняет значение внешней переменной, то
//      это повлияет только на выражение in, вне которого переменная не изменится.

// Порядок присваивания в блоке vars значения не имеет. Блок vars может получить 
//      доступ к внешним переменным, но он не может использовать собственные 
//      переменные для инициализации. Например, переменная "$$low" ссылается 
//      на значение внешней переменной low, а не на переменную, определенную 
//      в том же блоке vars:
//          vars: { low: 1, high: "$$low" }

module.exports = async () => {

    const client = new MongoClient("mongodb://localhost:27017");

    try {
        await client.connect();
        const database = client.db("aggregation");

        // 
        const sales = database.collection("sales");

        await dropCollection(sales);
        await sales.insertMany([
            { _id: 1, price: 10, tax: 0.50, applyDiscount: true },
            { _id: 2, price: 10, tax: 0.25, applyDiscount: false }
        ]);

        // оператор $let используется для расчета и возврата finalTotal
        const cursor1 = await sales.aggregate([
            {
                $project: {
                    finalTotal: {
                        $let: {
                            vars: {
                                total: { $add: ['$price', '$tax'] },
                                discounted: {
                                    $cond: {
                                        if: '$applyDiscount',
                                        then: 0.9,
                                        else: 1
                                    }
                                }
                            },
                            in: { $multiply: ["$$total", "$$discounted"] }
                        }
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