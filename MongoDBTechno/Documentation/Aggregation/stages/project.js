const { MongoClient, Decimal128, Int32 } = require("mongodb");
const { dropCollection } = require("./../helpers");



// --- --- project

//      https://www.mongodb.com/docs/manual/reference/operator/aggregation/project/

// Передает документы с указанными полями на следующий этап конвейера. Поля могут
//      быть уже существующими в документе или новыми.

// Сигнатура:
//      { $project: { <specification(s)> } }
//          <specification(s)> - не пустой объект, включают следующие формы:
//              <field>: <1 or true> - inclusion поле;
//              _id: <0 or false> - suppression поле _id; $$REMOVE удаляет поле;
//              <field>: <expression> - добавляет новое поле или сбрасывает 
//                  значение существующего; $$REMOVE удаляет поле;
//              <field>: <0 or false> - exclusion поле; $$REMOVE удаляет поле;

// нельзя использовать индекс массива на стадии $project.

// --- --- Include Existing Fields.

// Поле _id включается в выходной документ по умолчанию. Чтобы включить другие поля 
//      из входного документа в выходной следует использовать '<field>:1'. Если
//      включаемого поля нет во входном документе, то оно будет проигнорировано.

// --- --- Suppress the _id Field.

// Чтобы исключить поле _id из выходного документа следует использовать '_id:0'.

// --- --- Exclude Fields.

// Если указать только исключаемые поля с помощью '<field>:0', то все оставшиеся
//      поля будут включены в выходной документ. То есть '<field>:0' нельзя
//      использовать с другими настройками спецификации. Но это ограничение 
//      не относится к переменной $$REMOVE.

// --- --- Exclude Fields Conditionally

// Переменная $$REMOVE может быть использована для удаления поля из документа.

// --- --- Add New Fields or Reset Existing Fields

// Чтобы добавить новое поле или сбросить значение существующего следует использовать
//      форму спецификации: '<field>:<expression>'.

// Literal Values - чтобы установить для поля числовое или логическое значение
//      следует использовать опратор $literal. 

// Field Rename - существующее поле можно переименовать, если для нового поля 
//      в качестве значения указать путь к существующему полю.

// New Array Fields - стадия $project поддерживает использование квадратных скобок 
//      для создания новых полей массива. 

// --- --- Embedded Document Fields

// Можно использовать dot notation:
//      "contact.address.country": <1 or 0 or expression>

// Можно вложить поля:
//      contact: { address: { country: <1 or 0 or expression> } }

// При вложении полей нельзя использовать dot notation внутри встроенного документа: 
//      contact: { "address.country": <1 or 0 or expression> }

// Нельзя одновременно указать встроенный документ и поле внутри встроенного документа:
//      { $project: { contact: 1, "contact.address.country": 1 } }
//      { $project: { "contact.address.country": 1, contact: 1 } }

module.exports = async () => {

    const client = new MongoClient("mongodb://localhost:27017");

    try {
        await client.connect();
        const database = client.db("aggregation");

        // 
        const books = database.collection("books");

        await dropCollection(books);
        await books.insertMany([
            { "_id": 1, "x": 1, "y": 1, testArray: [1, 2, 3], title: "abc123", isbn: "0001122223334", author: { last: "zzz", first: "aaa" }, copies: 5, lastModified: "2016-07-28" },
            { "_id": 2, "x": 2, "y": 2, testArray: [4, 5, 6], title: "Baked Goods", isbn: "9999999999999", author: { last: "xyz", first: "abc", middle: "" }, copies: 2, lastModified: "2017-07-21" },
            { "_id": 3, "x": 3, "y": 3, testArray: [7, 8, 9], title: "Ice Cream Cakes", isbn: "8888888888888", author: { last: "xyz", first: "abc", middle: "mmm" }, copies: 5, lastModified: "2017-07-22" },
        ]);

        // 
        const bookmarks = database.collection("bookmarks");

        await dropCollection(bookmarks);
        await bookmarks.insertMany([
            { _id: 1, user: "1234", stop: { title: "book1", author: "xyz", page: 32 } },
            { _id: 2, user: "7890", stop: [{ title: "book2", author: "abc", page: 5 }, { title: "book3", author: "ijk", page: 100 }] }
        ]);

        // --- --- Include Specific Fields in Output Documents

        // включает поля в выходной документ: _id, title, author
        const cursor1 = await books.aggregate([
            { $project: { title: 1, author: 1 } }
        ])
        await cursor1.forEach(item => console.dir(JSON.stringify(item)));

        // --- --- Suppress _id Field in the Output Documents

        // исключает поле _id, но включает поля title и author в выходные документы
        const cursor2 = await books.aggregate([
            { $project: { _id: 0, title: 1, author: 1 } }
        ])
        await cursor2.forEach(item => console.dir(JSON.stringify(item)));

        // --- --- Exclude Fields from Output Documents

        // исключает lastModified поле из вывода
        const cursor3 = await books.aggregate([
            { $project: { "lastModified": 0 } }
        ])
        await cursor3.forEach(item => console.dir(JSON.stringify(item)));

        // --- --- Exclude Fields from Embedded Documents

        // исключает поля author.first и lastModified из вывода
        const cursor4 = await books.aggregate([
            { $project: { "author.first": 0, "lastModified": 0 } }
            //      { $project: { "author": { "first": 0 }, "lastModified": 0 } }
        ])
        await cursor4.forEach(item => console.dir(JSON.stringify(item)));

        // --- --- Conditionally Exclude Fields

        // использует переменную $$REMOVE для удаления поля
        const cursor5 = await books.aggregate([
            {
                $project: {
                    title: 1,
                    "author.first": 1,
                    "author.last": 1,
                    "author.middle": {
                        $cond: {
                            // исключает поле author.middle, если оно равно ""
                            if: { $eq: ["", "$author.middle"] },
                            then: "$$REMOVE",
                            else: "$author.middle"
                        }
                    }
                }
            }
        ])
        await cursor5.forEach(item => console.dir(JSON.stringify(item)));

        // --- --- Include Specific Fields from Embedded Documents

        // включить поле встроенного документа
        const cursor6 = await books.aggregate([
            // использовать dot notation
            { $project: { "stop.title": 1 } }
            // или использовать вложенные спецификации:
            //      { $project: { stop: { title: 1 } } }
        ])
        await cursor6.forEach(item => console.dir(JSON.stringify(item)));

        // --- --- Include Computed Fields

        // добавление новых полей: isbn, lastName, copiesSold
        const cursor7 = await books.aggregate([
            {
                $project: {
                    title: 1,
                    isbn: {
                        prefix: { $substr: ["$isbn", 0, 3] },
                        group: { $substr: ["$isbn", 3, 2] },
                        publisher: { $substr: ["$isbn", 5, 4] },
                        title: { $substr: ["$isbn", 9, 3] },
                        checkDigit: { $substr: ["$isbn", 12, 1] }
                    },
                    lastName: "$author.last",
                    copiesSold: "$copies"
                }
            }
        ])
        await cursor7.forEach(item => console.dir(JSON.stringify(item)));

        // --- --- Project New Array Fields

        // проецирует поля x и y как элементы в новом поле массива myArray,
        //      если поле не существует в документе, то в качестве значения 
        //      этого поля в массив будет передан null
        const cursor8 = await books.aggregate([
            { $project: { myArray: ["$x", "$y", "$someField"] } }
        ])
        await cursor8.forEach(item => console.dir(JSON.stringify(item)));

        // --- --- Array Indexes are Unsupported

        // на стадии $project нельзя использовать индекс массива
        const cursor9 = await books.aggregate([
            // попытка использовать индекс массива
            { $project: { x: '$testArray.0', _id: 0 } },
        ])
        await cursor9.forEach(item => console.dir(JSON.stringify(item)));
    }
    catch (err) {
        console.log(`--- err: ${err}`);
    }
    finally {
        await client.close();
    }
}