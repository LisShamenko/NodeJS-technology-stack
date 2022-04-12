const { MongoClient } = require("mongodb");



// --------------- 3. Методы CRUD (Create, Read, Update, Delete).

//      https://www.mongodb.com/docs/manual/crud/
//      https://www.mongodb.com/docs/drivers/node/current/fundamentals/crud/
//      https://www.mongodb.com/docs/manual/reference/method/js-collection/
//      https://mongodb.github.io/node-mongodb-native/4.4/classes/Collection.html
//      https://mongodb.github.io/node-mongodb-native/4.4/interfaces/InsertManyResult.html

// Многие методы CRUD существуют в двух вариантах: 
// - в метод передается функция обратного вызова, метод ничего не возвращает;
// - метод возвращает Promise;

// В качестве первого аргумента методы принимают объект запроса, по которому
//      выполняется фильтрация документов в коллекции. Результатом запроса 
//      является коллекция документов, над которыми выполняется операция. 
//      Если объект запроса не предоставлен или является пустым, то запрос 
//      возвращает все документы коллекции. Операция CRUD может применяться,
//      как к одному документу, так и ко всей коллекции, возвращаемой запросом.

// В качестве второго аргумента методы принимает дополнительные опции.

// Метод bulkWrite позволяет выполнять пакетные операции, состоящие из нескольких
//      операций CRUD.

// --- 3.1 Insert.

// Методы insertOne/insertMany позволяет вставить один/несколько документов.

// При вставке к документам применяется ограничение ключа: каждый документ 
//      должен содержать уникальное поле _id. Значение идентификатора может
//      устанавливаться клиентом или библиотекой mongodb. В первом случае 
//      клиент должен гарантировать уникальность ключа, а во втором библиотека
//      автоматически генерирует уникальные значения ObjectId. При нарушении
//      ограничения уникальности ключа будет генерироваться ошибка.

// --- --- insertOne.

// Метод collection.insertOne позволяет вставить документ в коллекцию. При успешной 
//      вставке метод возвращает значение InsertOneResult, которое содержит поле _id
//      нового документа. Побочным эффектом является создание коллекции, указанной
//      в методе, если она не существует.

async function mongo_insert_one() {

    const uri = "mongodb://localhost:27017/?maxPoolSize=20&w=majority";
    const client = new MongoClient(uri);

    try {
        await client.connect();

        const database = client.db("insertDB");

        const haiku = database.collection("haiku");

        const doc = {
            title: "Record of a Shriveled Datum",
            content: "No bytes, no problem. Just insert a document, in MongoDB",
        }

        const result = await haiku.insertOne(doc);

        console.log(`--- doc insert --- insertedId: ${result.insertedId}`);
    }
    catch (err) {
        console.log(`--- err: ${err}`);
    }
    finally {
        await client.close();
    }
}

// --- --- insertMany

// Метод collection.insertMany позволяет вставить несколько документов за один вызов. 
//      Метод вставляет документы в указанном порядке, пока не возникнет исключение.
//      При успешной вставке метод возвращает экземпляр InsertManyResult, представляющий 
//      количество вставленных документов и _id новых документов.

async function mongo_insert_many() {

    const uri = "mongodb://localhost:27017/?maxPoolSize=20&w=majority";
    const client = new MongoClient(uri);

    try {
        await client.connect();
        const database = client.db("insertDB");

        const docs = [
            { name: "cake", healthy: false },
            { name: "lettuce", healthy: true },
            { name: "donut", healthy: false }
        ];

        const options = {
            // значение 'ordered:true' позволяет предотвратить вставку оставшихся 
            //      документов, если не удалась вставка предыдущего документа 
            //      в массиве
            ordered: true
        };

        const foods = database.collection("foods");
        const result = await foods.insertMany(docs, options);

        console.log(`--- docs insert --- insertedCount: ${result.insertedCount}`);
    }
    catch (err) {
        console.log(`--- err: ${err}`);
    }
    finally {
        await client.close();
    }
}

async function mongo_insert_many_error() {

    const uri = "mongodb://localhost:27017/?maxPoolSize=20&w=majority";
    const client = new MongoClient(uri);

    // вставка с ошибкой
    try {

        // в третьем документе произойдет ошибка
        const docs = [
            { "_id": 1, "color": "red" },
            { "_id": 2, "color": "purple" },
            { "_id": 1, "color": "yellow" },
            { "_id": 3, "color": "blue" }
        ];

        await client.connect();
        const database = client.db("insertDB");
        const foods = database.collection("foods");

        const insertManyresult = await foods.insertMany(docs);
        let ids = insertManyresult.insertedIds;

        console.log(`--- insert docs --- insertedCount = ${insertManyresult.insertedCount}`);
        for (let id of Object.values(ids)) {
            console.log(`--- id = ${id}`);
        }
    }
    catch (err) {

        console.log(`--- success insert docs 
            --- count docs insert: ${err.result.result.nInserted}
        `);

        let ids = err.result.result.insertedIds;
        for (let id of Object.values(ids)) {
            console.log(`--- id = ${id._id}`);
        }

        console.log(`--- err: ${err}`);
    }
    finally {
        await client.close();
    }
}

// --- 3.2 Update.

// Документы можно изменять, используя два разных типа операций: update и replace. 
//      Операции обновления изменяют указанные поля в одном или нескольких документах, 
//      оставляя другие поля без изменений. Операции замены удаляют все существующие 
//      поля в одном или нескольких документах и ​​заменяют их указанными.

// При обновлении документа поле _id изменить нельзя. Если в документе указать значение 
//      для неизменяемого поля _id, то метод выдаст исключение: duplicate key error.

// В качестве третьего аргумента в методы передаются дополнительные параметры options.
//      Оба вида операции могут использовать опцию upsert. Значение 'upsert:true' 
//      приводит к созданию документа если при фильтрации объект не был найден.

// Операции обновления используют следующий формат:
//      <update document>: {
//          <update operator>: {
//              <field> : {
//                  ...
//              },
//              <field> : {
//                  ...
//              }
//          },
//          <update operator>: {
//              ...
//          }
//      }

// Элемент <update document> - это объект обновления документа.

// Элемент <update operator> - это операторы обновления, которые применяются 
//      к полям в <update document>:
//      $set        заменяет значение поля на указанное
//      $inc        увеличивает или уменьшает значения поля
//      $rename     переименовывает поля
//      $unset      удаляет поля
//      $mul        умножает значение поля на указанное число

// Операции замены используют следующий формат:
//      <replacement document>: {
//          <field>: {
//              <value>
//          },
//          <field>: {
//              ...
//          }
//      }

// Элемент <replacement document> - это объект замены документа.

async function mongo_replace_1() {

    const uri = "mongodb://localhost:27017/?maxPoolSize=20&w=majority";
    const client = new MongoClient(uri);

    try {
        await client.connect();
        const database = client.db("updateDB");
        const docs = database.collection("docs");

        // добавить запись, если не существует
        //      const result1 = await docs.insertOne({ _id: 465, z: 0 });
        //      console.log(`--- docs insert --- insertedCount: ${result1.insertedCount}`);

        // алфавит в объекте
        const dict = Array.from(new Array(26)).reduce((p, c, i) => (p[String.fromCharCode(i + 97)] = i, p), {})
        dict._id = 465;
        console.log(`--- alphabet: ${JSON.stringify(dict)}`);

        // операция замены:
        const result2 = await docs.replaceOne(
            { _id: 465 },
            // update the value of the 'z' field to 42
            { z: 40 }
            // следующая запись генерирует ошибку: 
            //      MongoInvalidArgumentError: Replacement document must not contain atomic operators
            //      { $set: { z: 42 } }
        );
        console.log(`--- docs insert --- ${JSON.stringify(result2)}`);

        // результат замены:
        //      {
        //          _id: 465,
        //          z: 42,
        //      }
    }
    catch (err) {
        console.log(`--- err: ${err}`);
    }
    finally {
        await client.close();
    }
}

// --- --- updateOne

// Метод collection.updateOne позволяет обновить один документ. Метод принимает 
//      объект фильтра и объект обновления. Метод применяет объект обновления 
//      к документам соответствующим фильтру. Объект обновления содержит операторы 
//      обновления, которые содержат применяемые изменения.

// Метод collection.findOneAndUpdate обновляет документ, как и collection.updateOne,
//      но также возвращает обновленный документ.

async function mongo_update_one() {

    const uri = "mongodb://localhost:27017/?maxPoolSize=20&w=majority";
    const client = new MongoClient(uri);

    try {
        await client.connect();

        // 
        const database = client.db("sample_mflix");

        // 
        const movies = database.collection("movies");

        // create a filter for a movie to update
        const filter = { title: "Random Harvest" };

        // create a document that sets the plot of the movie
        const updateDoc = {
            // оператор обновления $set задает значения обновления для полей документа
            $set: {
                plot: `A harvest of random numbers, such as: ${Math.random()}`
            },
        };

        // this option instructs the method to create a document if no documents match the filter
        const options = { upsert: true };

        // 
        const result = await movies.updateOne(filter, updateDoc, options);
        console.log(`
            --- document(s) matched the filter: ${result.matchedCount}
            --- document(s) updated: ${result.modifiedCount}
        `);
    }
    catch (err) {
        console.log(`--- err: ${err}`);
    }
    finally {
        await client.close();
    }
}

// --- --- updateMany

// Метод collection.updateMany позволяет обновить несколько документов. Метод 
//      работает аналогично collection.updateOne.

async function mongo_update_many() {

    const uri = "mongodb://localhost:27017/?maxPoolSize=20&w=majority";
    const client = new MongoClient(uri);

    try {
        await client.connect();

        // 
        const database = client.db("sample_mflix");
        const movies = database.collection("movies");

        // 
        await movies.insertMany([
            { title: "Random Harvest", rated: "A", rnd: 100 * Math.random(), },
            { title: "Random Harvest", rated: "C", rnd: 100 * Math.random(), },
            { title: "Random Harvest", rated: "G", rnd: 100 * Math.random(), }
        ]);

        // create a filter to update all movies with a 'G' rating
        const filter = { rated: "G" };

        // increment every document matching the filter with 2 more comments
        const updateDoc = {
            $set: {
                rnd: 100 * Math.random()
            },
        };

        const result = await movies.updateMany(filter, updateDoc);
        console.log(`Updated ${result.modifiedCount} documents`);
    }
    catch (err) {
        console.log(`--- err: ${err}`);
    }
    finally {
        await client.close();
    }
}

// --- --- replaceOn

// Метод collection.replaceOn выполняет замену документа. Эта операция удаляет 
//      все поля и значения в исходном документе и заменяет их полями и значениями 
//      замещающего документа. Значение поля _id остается прежним, если явно 
//      не указано новое значение.

// Метод collection.findOneAndReplace работает аналогично collection.replaceOn,
//      но также возвращает искомый или замещающий документ.

async function mongo_replace_2() {

    const uri = "mongodb://localhost:27017/?maxPoolSize=20&w=majority";
    const client = new MongoClient(uri);

    try {
        await client.connect();

        // 
        const database = client.db("sample_mflix");
        const movies = database.collection("movies");

        // вставка если требуется
        //      await movies.insertMany([
        //          { title: "The Cat from lalala.", rated: "A", rnd: 100 * Math.random(), },
        //      ]);


        // create a query for a movie to update
        const query = {
            title: {
                $regex: "The Cat from"
            }
        };

        // create a new document that will be used to replace the existing document
        const replacement = {
            title: `The Cat from Sector ${Math.floor(Math.random() * 1000) + 1}`,
        };

        // 
        const result = await movies.replaceOne(query, replacement);
        console.log(`Modified ${result.modifiedCount} document(s)`);
    }
    catch (err) {
        console.log(`--- err: ${err}`);
    }
    finally {
        await client.close();
    }
}

// --- 3.3 Delete.

// Количество удаленных документов можно определить, обратившись к полю deletedCount:
//      deleteResult.deletedCount
//      deleteManyResult.deletedCount

// --- --- deleteOne

// Метод collection.deleteOne позволяет удалить один документ в коллекции, который
//      будет соответствовать объекту запроса. Если объект запроса не предоставлен
//      или является пустым, то операция удалит первый попавшийся документ в коллекции.

// Метод collection.findOneAndDelete работает аналогично collection.deleteOne, но 
//      также возвращает искомый или замещающий документ.

async function mongo_delete_one() {

    const uri = "mongodb://localhost:27017/?maxPoolSize=20&w=majority";
    const client = new MongoClient(uri);

    try {
        await client.connect();

        // 
        const database = client.db("sample_mflix");

        // 
        const movies = database.collection("movies");

        // Query for a movie that has title "Random Harvest"
        const query = {
            title: "Random Harvest"
        };

        const result = await movies.deleteOne(query);

        if (result.deletedCount === 1) {
            console.log("Successfully deleted one document.");
        }
        else {
            console.log("No documents matched the query. Deleted 0 documents.");
        }
    }
    catch (err) {
        console.log(`--- err: ${err}`);
    }
    finally {
        await client.close();
    }
}

// --- --- deleteMany

// Метод collection.deleteMany позволяет удалять сразу несколько документов из коллекции.
//      Метод принимает объект запроса для указания подмножества документов для удаления. 
//      Если объект запроса не предоставлен или является пустым, то операция удалит 
//      все документы в коллекции. Для удаления всех документов в коллекции рекомендуется 
//      использовать метод drop, что повышает производительность и дает более чистый код.

async function mongo_delete_many() {

    const uri = "mongodb://localhost:27017/?maxPoolSize=20&w=majority";
    const client = new MongoClient(uri);

    try {
        await client.connect();

        // 
        const database = client.db("sample_mflix");

        // 
        const movies = database.collection("movies");

        // Query for all movies with a title containing the string "Santa"
        const query = {
            title: {
                $regex: "Random Harvest"
            }
        };

        const result = await movies.deleteMany(query);

        console.log(`--- delete documents: ${result.deletedCount}`);
    }
    catch (err) {
        console.log(`--- err: ${err}`);
    }
    finally {
        await client.close();
    }
}

// --- 3.4 Find.

// --- --- findOne

// Метод collection.findOne позволяет выбрать один документ из коллекции с помощью 
//      объекта запроса. Если объект запроса не предоставлен или является пустым, то 
//      операция вернет первый попавшийся документ в коллекции.

async function mongo_find() {

    const uri = "mongodb://localhost:27017/?maxPoolSize=20&w=majority";
    const client = new MongoClient(uri);

    try {
        await client.connect();

        const database = client.db("sample_mflix");

        const movies = database.collection("movies");

        // 
        await movies.insertMany([
            { title: "Random Harvest", imdb: { rated: 10 }, rnd: 100 * Math.random(), },
            { title: "Random Harvest", imdb: { rated: 34 }, rnd: 100 * Math.random(), },
            { title: "Random Harvest", imdb: { rated: 15 }, rnd: 100 * Math.random(), }
        ]);

        // запрос фильмов с названием "The Room"
        const query = {
            title: "Random Harvest"
        };

        const options = {
            // сортировка упорядочивает найденные документы в порядке убывания поля 
            //        rating, если запрос выдает несколько документов, то метод 
            //        вернет документом с наивысшим рейтингом
            sort: { "imdb.rating": -1 },
            // проекция исключает поле _id и включает поля [title, imdb]
            projection: { _id: 0, title: 1, imdb: 1 },
        };

        const movie = await movies.findOne(query, options);

        // since this method returns the matched document, not a cursor, print it directly
        console.log(`--- movie: ${JSON.stringify(movie)}`);
    }
    catch (err) {
        console.log(`--- err: ${err}`);
    }
    finally {
        await client.close();
    }
}

// --- --- find

// Метод collection.find позволяет запросить несколько документов из коллекции. 
//      При отсутствии данных объекта запроса, метод вернет все документы коллекции.

// Метод collection.find возвращает объект FindCursor, который управляет итерацией 
//      по результатам запроса с помощью следующих методов: next, toArray, forEach.

async function mongo_find() {

    const uri = "mongodb://localhost:27017/?maxPoolSize=20&w=majority";
    const client = new MongoClient(uri);

    try {
        await client.connect();

        const database = client.db("sample_mflix");

        const movies = database.collection("movies");

        // запрос фильмов продолжительностью менее 15 минут
        const query = {
            title: "Random Harvest"
            // runtime: { $lt: 15 }
        };

        const options = {
            // сортировка по возрастанию заголовков в алфавитном порядке
            sort: { title: 1 },
            // проекция исключает поле _id и включает поля [title, imdb]
            projection: { _id: 0, title: 1, imdb: 1 },
        };

        const cursor = await movies.find(query, options);

        // print a message if no documents were found
        //      cursor.count - deprecated:
        //          collection.estimatedDocumentCount
        //          collection.countDocuments 
        let count = await cursor.count();
        if (count === 0) {
            console.log("--- No documents found!");
        }

        // replace console.dir with your callback to access individual elements
        await cursor.forEach(item => console.dir(JSON.stringify(item)));
    }
    catch (err) {
        console.log(`--- err: ${err}`);
    }
    finally {
        await client.close();
    }
}

// --- 3.5 Пакетные (Bulk) операции.

//      https://www.mongodb.com/docs/drivers/node/current/usage-examples/bulkWrite/

// Метод bulkWrite() выполняет пакетные операции записи для одной коллекции и
//      возвращает набор результатов для всех операций после их завершения.
//      Метод уменьшает количество сетевых обращений к серверу, что увеличивает
//      пропускную способность и производительность.

// Можно указать одну или несколько следующих операций: insertOne, updateOne,
//      updateMany, deleteOne, deleteMany, replaceOne

// Метод bulkWrite принимает следующие аргументы:
// - operations - выполняемые операции, передаются как объекты в массиве;
// - options - дополнительные параметры.

// По умолчанию при пакетной обработке операции выполняются последовательно. В случае
//      возникновения ошибки одной из операций, оставшиеся операции не выполняются.
//      Если установить опцию 'ordered:false', то в случае ошибки оставшиеся операции
//      будут обработаны. Неупорядоченные операции могут выполняться параллельно, что
//      теоретически быстрее, но при этом операции не должны зависеть от порядка.

// При попытке записи повторяющегося ключа будет сгенерирована ошибка:
//      Error during bulkWrite, BulkWriteError: E11000 duplicate key error collection: ...

// Пакетная запись для коллекции, которая использует проверку схемы, может вызывать
//      ошибки, связанными с форматированием документов.

async function mongo_bulk_write() {

    const uri = "mongodb://localhost:27017/?maxPoolSize=20&w=majority";
    const client = new MongoClient(uri);

    try {
        await client.connect();

        //
        const database = client.db("sample_mflix");
        const theaters = database.collection("theaters");

        // выполняется операция записи коллекции theaters в базу данных sample_mflix
        const result = await theaters.bulkWrite([
            {
                insertOne: {
                    document: {
                        location: {
                            address: { street1: "3 Main St.", city: "Anchorage", state: "AK", zipcode: "99501" },
                        },
                    },
                },
            },
            {
                insertOne: {
                    document: {
                        location: {
                            address: { street1: "75 Penn Plaza", city: "New York", state: "NY", zipcode: "10001" },
                        },
                    },
                },
            },
            {
                updateMany: {
                    filter: { "location.address.zipcode": "44011" },
                    update: { $set: { is_in_ohio: true } },
                    upsert: true,
                },
            },
            {
                deleteOne: {
                    filter: { "location.address.street1": "221b Baker St" }
                },
            },
        ]);

        console.log(JSON.stringify(result.result.insertedIds));
    }
    catch (err) {
        console.log(`--- err: ${err}`);
    }
    finally {
        await client.close();
    }
}

// --- 3.6 Update Arrays.

// Коллекция test.pizza:
const pizzaConnection = [
    {
        name: "Steve Lobsters",
        address: "731 Yexington Avenue",
        items: [
            { type: "beverage", name: "Water", size: "17oz", },
            { type: "pizza", size: "large", toppings: ["pepperoni"], },
            { type: "pizza", size: "medium", toppings: ["mushrooms", "sausage", "green peppers"], comment: "Extra green peppers please!", },
            { type: "pizza", size: "large", toppings: ["pineapple, ham"], comment: "red pepper flakes on top", },
            { type: "calzone", fillings: ["canadian bacon", "sausage", "onion"], },
            { type: "beverage", name: "Diet Pepsi", size: "16oz", },
        ],
    },
    {
        name: "Popeye",
        address: "1 Sweethaven",
        items: [
            { type: "pizza", size: "large", toppings: ["garlic, spinach"], },
            { type: "calzone", toppings: ["ham"], },
        ],
    }
];

// Позиционный оператор '$' (Positional Operator) позволяет указать элементы массива, 
//      которые будут изменены. Оператор '$' можно использовать разными способами:
//      $                   Positional Operator
//      $[]                 All Positional Operator
//      $[<identifier>]     Filtered Positional Operator

// Позиционный оператор используется соместно с точечной нотацией (dot notation).
//      Точечная нотация — это синтаксис доступа к свойствам для навигации 
//      по объектам BSON. 
//      https://www.mongodb.com/docs/manual/core/document/#std-label-document-dot-notation

// --- --- операция '$'

// Операция '$' позволяет выбрать и изменить первый элемент массива. Не позволяет
//      выбрать вложенные массивы, для этого требуется использовать операцию 
//      '$[<identifier>]'.

// Операцию '$' нельзя использовать вместо с опцией upsert, поскольку символ '$'
//      будет рассматриваться, как часть имени поля в документе.

async function example_2() {

    // В запрос включены два поля 'name' и 'items.type' для фильтрации по полю
    //      массива, к которому применяется операция '$'. Если опустить поле 
    //      items.type из запроса, то будет сгенерирована ошибка:
    //      The positional operator did not find the match needed from the query.

    // запрос всех документов, которые содержат элементы 'type:"pizza"' 
    //      в массиве items
    const query = {
        name: "Steve Lobsters",
        "items.type": "pizza"
    };

    // операция обновления для установки первого совпадения элемента массива 
    //      items в значение 'size:"extra large"'
    const updateDocument = {
        $set: {
            "items.$.size": "extra large"
        }
    };

    const result = await pizza.updateOne(query, updateDocument);

    // результат:
    //      {
    //          name: "Steve Lobsters",
    //          address: "731 Yexington Avenue",
    //          items: [
    //              { type: "pizza", size: "extra large", ... },
    //              ...
    //          ]
    //      }
}

// --- --- операция '$[]'

// Операция '$[]' позволяет выполнить обновление для всех элементов массива каждого 
//      документа, соответствующего запросу.

async function example_3() {

    const query = { "name": "Popeye" };

    const updateDocument = {
        $push: { "items.$[].toppings": "fresh mozzarella" }
    };

    const result = await pizza.updateOne(query, updateDocument);

    // результат запроса:
    //      {
    //          name:"Popeye",
    //          address: "1 Sweethaven",
    //          items: [
    //              { type: "pizza", ... , toppings: ["garlic", "spinach", "fresh mozzarella"], },
    //              { type: "calzone", ... , toppings: ["ham", "fresh mozzarella"], },
    //          ]
    //      }
}

// --- --- операция $[<identifier>]

// Операция $[<identifier>] позволяет выполнить обновление для элементов массива,
//      которые удовлетворяют указанному фильтру. Оператор <identifier> - это 
//      заполнитель, который представляет элемент массива. Имя identifier должно
//      начинаться со строчной буквы и содержать только буквенно-цифровые символы.
//      Оператор <identifier> сопоставляется с фильтрами с помощью опции arrayFilters. 

async function example_4() {

    const query = {
        name: "Steve Lobsters"
    };

    // описание фильтра:
    //      $push       оператор обновления
    //      items       массив в документе для обновления
    //      orderItem   идентификатор отфильтрованного позиционного оператора
    //      toppings    поле в items элементе массива для обновления
    //      garlic      значение, которое нужно поместить в toppings массив
    const updateDocument = {
        $push: {
            "items.$[orderItem].toppings": "garlic"
        }
    };

    // arrayFilters представляет собой массив запросов, указывающих, какие элементы 
    //      массива следует включить в обновление
    const options = {
        arrayFilters: [{
            "orderItem.type": "pizza",
            "orderItem.size": "large",
        }]
    };

    const result = await pizza.updateMany(query, updateDocument, options);

    //      {
    //          name: "Steve Lobsters",
    //          address: "731 Yexington Avenue",
    //          items: [
    //              { type: "pizza", size: "large", toppings: ["pepperoni", "garlic"] },
    //              { type: "pizza", size: "large", toppings: ["pineapple", "ham", "garlic"], ...},
    //              ...
    //          ]
    //      }
}

async function example_5() {

    const query = {
        name: "Steve Lobsters"
    };

    const updateDocument = {
        $push: {
            "items.$[item].toppings": "salami"
        }
    };

    const options = {
        arrayFilters: [{
            "item.type": "pizza",
            "item.toppings": "pepperoni",
        }]
    };

    const result = await pizza.updateOne(query, updateDocument, options);

    //      {
    //          name: "Steve Lobsters",
    //          address: "731 Yexington Avenue",
    //          items: [
    //              { type: "pizza", size: "large", toppings: ["pepperoni", "salami"], },
    //              { type: "pizza", size: "medium", toppings: ["mushrooms", "sausage", "green peppers"], comment: "Extra green peppers please!", },
    //              { type: "pizza", size: "large", toppings: ["pineapple, ham"], comment: "red pepper flakes on top", },
    //              { type: "calzone", fillings: ["canadian bacon", "sausage", "onion"], },
    //              { type: "beverage", name: "Diet Pepsi", size: "16oz", },
    //          ],
    //      }
}

// --- 3.7 Опция upsert.

// В некоторых рабочих процессах может потребоваться выбор между вставкой и обновлением
//      в зависимости от того, существует ли документ. В этих случаях можно использовать
//      опцию upsert в следующих методах: updateOne, replaceOne, updateMany. Применение
//      значения 'upsert:true' приведет к вставке документа, если запрос не вернет 
//      ни одного документа.

async function example_6() {

    const query = { name: "Deli Llama" };

    const update = {
        $set: {
            name: "Deli Llama",
            address: "3 Nassau St"
        }
    };

    const options = {};

    // если фильтр не вернет документы, то updateOne ничего не сделает
    collection.updateOne(query, update, options);

    //      [
    //          { name: "Haute Skillet", address: "42 Avenue B" },
    //          { name: "Lady of the Latke", address: "35 Fulton Rd" },
    //          ...
    //      ]
}

async function example_7() {

    const query = {
        name: "Deli Llama"
    };

    const update = {
        $set: {
            name: "Deli Llama",
            address: "3 Nassau St"
        }
    };

    const options = {
        upsert: true
    };

    // опция upsert приводит к вставке документа
    collection.updateOne(query, update, options);

    //      [
    //          { name: "Haute Skillet", address: "42 Avenue B" },
    //          { name: "Lady of the Latke", address: "35 Fulton Rd" },
    //          { name: "Deli Llama", address: "3 Nassau St" },
    //          ...
    //      ]
}

// --- 3.8 Iterate a Cursor.

const crud_cursor = require("./crud_cursor");

// --- 3.9 Distinct Values.

//      https://www.mongodb.com/docs/drivers/node/current/usage-examples/distinct/

// Метод collection.distinct возвращает список уникальных значений поля указанной 
//      коллекции. С помощью dot можно обращаться к вложенным документам. Если в поле
//      записан массив, метод обрабатывает каждый элемент массива, как отдельное 
//      значение.

// Если поле документа указано не строкой, то метод вернет ошибку: 
//      "key" had the wrong type. Expected string, found <non-string type>

async function mongo_distinct() {

    const client = new MongoClient("mongodb://localhost:27017");

    try {
        await client.connect();

        // define a database and collection on which to run the method
        const database = client.db("sample_mflix");
        const movies = database.collection("movies");

        // specify the document field
        const fieldName = "imdb.rated";

        // specify an optional query document
        const query = { "title": "Random Harvest" };

        // извлекает данные поля "year"
        const distinctValues = await movies.distinct(fieldName, query);
        //      const distinctValues = collection.distinct("awards.wins", query);

        console.log(distinctValues);
    }
    catch (err) {
        console.log(`--- err: ${err}`);
    }
    finally {
        await client.close();
    }
}

// --- Запуск.

(async () => {
    await mongo_insert_one();
    await mongo_insert_many();
    await mongo_insert_many_error();
    await mongo_replace_1();
    await mongo_update_one();
    await mongo_update_many();
    await mongo_replace_2();
    await mongo_delete_one();
    await mongo_delete_many();
    await mongo_find();
    await mongo_find();
    await mongo_bulk_write();
    await crud_cursor();
    await mongo_distinct();
})();