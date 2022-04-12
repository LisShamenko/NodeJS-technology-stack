const { MongoClient, Decimal128, Int32 } = require("mongodb");
const { dropCollection } = require("./../helpers");



// --- --- redact

//      https://www.mongodb.com/docs/manual/reference/operator/aggregation/redact/

// Ограничивает содержимое документов на основе хранящейся в них информации.

// Сигнатура:
//      { $redact: <expression> }
//          <expression> - любое допустимое выражение, если оно возвращает одну 
//              из системных переменных: $$DESCEND, $$PRUNE, $$KEEP.

// $$DESCEND - $redact возвращает поля на текущем уровне документа, исключая
//      встроенные документы. Оператор $cond позволяет работать со встроенными 
//      документами и массивами.

// $$PRUNE - $redact исключает все поля на текущем уровне документа, включая
//      встроенные документы. 

// $$KEEP - $redact возвращает или сохраняет все поля на текущем уровне документа, 
//      включая встроенные документы. 

module.exports = async () => {

    const client = new MongoClient("mongodb://localhost:27017");

    try {
        await client.connect();
        const database = client.db("aggregation");

        // --- --- Evaluate Access at Every Document Level

        const forecasts = database.collection("forecasts");

        await dropCollection(forecasts);
        await forecasts.insertMany([
            {
                _id: 1,
                title: "123 Department Report",
                // различные значения доступа для этого уровня документа включая 
                //      встроенные; значения ["G", "STLW"] указывают, что "G" или 
                //      "STLW" могут получить доступ к данным
                tags: ["G", "STLW"],
                year: 2014,
                subsections: [
                    { subtitle: "Section 1: Overview", tags: ["SI", "G"], content: "Section 1: This is the content of section 1." },
                    { subtitle: "Section 2: Analysis", tags: ["STLW"], content: "Section 2: This is the content of section 2." },
                    { subtitle: "Section 3: Budgeting", tags: ["TK"], content: { text: "Section 3: This is the content of section3.", tags: ["HCS"] } }
                ]
            }
        ]);

        // выполнить запрос всех документов с 2014 года
        var userAccess = ["STLW", "G"];
        const cursor1 = await forecasts.aggregate([
            { $match: { year: 2014 } },
            {
                $redact: {
                    $cond: {
                        if: { $gt: [{ $size: { $setIntersection: ["$tags", userAccess] } }, 0] },
                        then: "$$DESCEND",
                        else: "$$PRUNE"
                    }
                }
            }
        ])
        await cursor1.forEach(item => console.dir(JSON.stringify(item)));

        // --- --- Exclude All Fields at a Given Level

        const accounts = database.collection("accounts");

        await dropCollection(accounts);
        await accounts.insertMany([
            {
                _id: 1,
                level: 1,
                acct_id: "xyz123",
                cc: {
                    level: 5,
                    type: "yy",
                    num: 000000000000,
                    exp_date: new Date("2015-11-01T00:00:00.000Z"),
                    billing_addr: { level: 5, addr1: "123 ABC Street", city: "Some City" },
                    shipping_addr: [
                        { level: 3, addr1: "987 XYZ Ave", city: "Some City" },
                        { level: 3, addr1: "PO Box 0123", city: "Some City" }
                    ]
                },
                status: "A"
            }
        ]);

        // выполняет запрос по всем документам со статусом A и исключает все поля
        //      документов на 5 уровне
        const cursor2 = await accounts.aggregate([
            { $match: { status: "A" } },
            {
                $redact: {
                    $cond: {
                        // поле level определяет уровень доступа, необходимый 
                        //      для просмотра данных
                        if: { $eq: ["$level", 5] },
                        // если поле level равно 5, то исключаются все поля на этом 
                        //      уровне, даже если исключенное поле содержит встроенные 
                        //      документы, которые могут иметь другие значения level
                        then: "$$PRUNE",
                        else: "$$DESCEND"
                    }
                }
            }
        ])
        await cursor2.forEach(item => console.dir(JSON.stringify(item)));
    }
    catch (err) {
        console.log(`--- err: ${err}`);
    }
    finally {
        await client.close();
    }
}