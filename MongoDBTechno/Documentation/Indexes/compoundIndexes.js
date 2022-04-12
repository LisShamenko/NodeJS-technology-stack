const { MongoClient } = require("mongodb");



// --- 6.2 Compound Indexes.

//      https://www.mongodb.com/docs/manual/core/index-compound/

// MongoDB поддерживает составные индексы, которые содержат ссылки на несколько 
//      полей в документах коллекции. Существует ограничение в 32 поля на индекс.
//      Составные индексы поддерживают запросы нескольких полей. 

// Составной индекс для полей userid (по возрастанию) и score (по убыванию):
//      { userid: 1, score: -1 }

// --- --- Create a Compound Index

// Сигнатура метода создания индекса:
//      db.collection.createIndex( { <field1>: <type>, <field2>: <type2>, ... } )
//          <field> - индексируемые поля;
//          <type> - порядок сортировки: 1 - ascending, -1 - descending.

// Начиная с MongoDB 4.4 составные индексы могут содержать одно hashed-поле. 
//      Большее количество hashed-полей вызовет ошибку. В версиях до MongoDB 4.2
//      составные индексы не могут содержать hashed-поля.

module.exports = async () => {

    const client = new MongoClient("mongodb://localhost:27017");

    try {
        await client.connect();
        const database = client.db("aggregation");

        // 
        const products = database.collection("products");
        await products.insertMany([
            {
                "_id": ObjectId("512bc95fe835e68f199c8686"),
                "item": "Banana",
                "category": ["food", "produce", "grocery"],
                "location": "4th Street Store",
                "stock": 4,
                "type": "cases"
            }
        ]);

        // операция создает восходящий индекс для полей item и stock:
        products.createIndex({ "item": 1, "stock": 1 })

        // составные индексы могут поддерживать запросы с любыми полями, 
        //      входящими в индекс:
        let cursor1 = products.find({ item: "Banana" })
        await cursor1.forEach(item => console.dir(JSON.stringify(item)));
        let cursor2 = products.find({ item: "Banana", stock: { $gt: 5 } })
        await cursor2.forEach(item => console.dir(JSON.stringify(item)));
    }
    catch (err) {
        console.log(`--- err: ${err}`);
    }
    finally {
        await client.close();
    }
}

// --- --- Sort Order

// Индексы сохраняют порядок сортировки для каждого поля по возрастанию или 
//      убыванию. Для индексов с одним полем порядок сортировки ключей не имеет 
//      значения, поскольку MongoDB может перемещаться по индексу в любом 
//      направлении. Для составных индексов порядок сортировки важен для
//      определения поддерживаемы операций сортировки.

// запрос сортирует результаты сначала по возрастанию username, а затем 
//      по убыванию date:
//      db.events.find().sort( { username: 1, date: -1 } )

// запрос сортирует результаты сначала по убыванию username, а затем 
//      по возрастанию date:
//      db.events.find().sort( { username: -1, date: 1 } )

// запрос сортирует результаты сначала по возрастанию username, а затем 
//      по возрастанию date:
//      db.events.find().sort( { username: 1, date: 1 } )

// следующий индекс поддерживает первые две операции и не поддерживает 
//      последнюю:
//      db.events.createIndex( { "username" : 1, "date" : -1 } )

// --- --- Prefixes

// Префиксы индекса - это начальные подмножества индексированных полей.

// Для составного индекса MongoDB поддерживает запросы по префиксам индекса. 
//      Например, составной индекс `{"item":1,"location":1,"stock":1}` будет 
//      иметь следующие префиксы: 
//      `{item:1}`                    - запрос полей: item                                       
//      `{item:1,location:1}`         - запрос полей: item, location                                                   
//      `{item:1,location:1,stock:1}` - запрос полей: item, location, stock                                                           

// Поля индекса анализируются по порядку; если в запросе отсутствует конкретный 
//      префикс индекса, он не может использовать поля индекса, следующие 
//      за этим префиксом.

// Составной индекс не будет поддерживать следующие запросы, поскольку в них
//      отсутствует поле item, что не соответствует ни одному префиксу индекса:
//      `{location:1}`                - запрос полей: location
//      `{stock:1}`                   - запрос полей: stock
//      `{location:1,stock:1}`        - запрос полей: location, stock