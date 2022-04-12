const { MongoClient, ServerApiVersion, MongoError, ObjectId } = require("mongodb");



// --------------- 6. Indexes.

//      https://www.mongodb.com/docs/drivers/node/current/fundamentals/indexes/
//      https://www.mongodb.com/docs/manual/indexes/

// Индексы - это специальные структуры данных, которые сохраняют часть данных 
//      коллекции в удобной для просмотра форме. Индекс содержит упорядоченные 
//      значения одного или нескольких полей коллекции. Порядок записей индекса 
//      поддерживает эффективное сопоставление на равенство и операции запросов 
//      на основе диапазона. MongoDB может возвращать отсортированные результаты, 
//      используя порядок в индексе.

// Без использования индексов, MongoDB сканирует все документы в коллекции, чтобы
//      обработать запрос. Такие запросы выполняются медленно и сильно влияют 
//      на производительность приложения. Использование индексов позволяет
//      ограничить количество сканируемых документов, что делает запросы более 
//      эффективными.

//        Collection          Query Criteria             Sort order
//            ↓                     ↓                         ↓
//      db.users.find( { score: { "$lt": 30 } } ).sort( { score: -1 } )
//                     │                      │
//      ╭──────────────╯            ╭─────────╯
//      ↓                           ↓
//      │▒▒▒▒▒▒▒▒▒│▒▒▒▒▒▒│▒▒▒▒▒▒│▒▒▒▒│▒▒▒▒▒▒▒▒▒▒▒▒▒▒│▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒│
//      min       11     18     25   30             45              max
//                │      │      ┃
//        ┏━━━━━━━┿━━━━━━┿━━━━━━┛
//        ┃       │      ╰──────────────╮
//        ┃       ╰───────────╮         │
//        ↓                   ↓         ↓
//      ┌─┴──┬────┬────┬────┬─┴──┬────┬─┴──┬────┬────┬────┬────┬────┐
//      │ 25 │ 56 │ 45 │ 75 │ 11 │ 40 │ 18 │....│....│ 30 │....│....│
//      └────┴────┴────┴────┴────┴────┴────┴────┴────┴────┴────┴────┘
//      scores

// --- --- Default _id Index

// MongoDB создает уникальный индекс в поле _id во время создания коллекции. 
//      Индекс _id не позволяет клиентам вставлять два документа с одинаковым 
//      значением поля _id. Этот индекс нельзя удалить.

// В сегментированных кластерах, если поле _id не используется в качестве ключа 
//      сегмента, то необходимо обеспечить уникальность значений этого поля, 
//      иначе возможно возникновение ошибки. Это можно сделать с помощью ObjectId.

// --- --- Index Names

// По умолчанию имя индекса строится, как строка из ключей и порядка сортировки:
//      { item: 1, quantity: -1 }   =>   item_1_quantity_-1

// Индекс может иметь произвольное имя. 

// метод createIndex создает индекс с именем "query for inventory"
//      db.products.createIndex(
//          { item: 1, quantity: -1 } ,
//          { name: "query for inventory" }
//      )

// Метод db.collection.getIndexes позволяет просмотреть имена индексов. Созданный 
//      индекс нельзя переименовать. Вместо этого следует удалить индекс и создать
//      заново с новым именем.

// --- --- Query Coverage and Performance

// Запрос MongoDB может состоять из трех частей:
// - параметры запроса, которые определяют искомые поля и значения;
// - параметры, влияющие на выполнение запроса;
// - параметры проекции для указания возвращаемых полей.

// Если поля указанные в параметрах запроса и проекции проиндексированы, то результаты
//      запроса будут возвращены непосредственно из индекса без сканирования документов 
//      коллекции или загрузки их в память.

// --- --- Index Intersection

// MongoDB может использовать пересечение индексов для выполнения запросов.
//      В сложных запросах несколько индексов могут выполнять разные части 
//      условия запроса. MongoDB в таких случаях может использовать пересечение 
//      индексов для выполнения запроса. 

// --- --- Operational Considerations

// Чтобы повысить производительность запросов следует создавать индексы для полей, 
//      которые часто появляются в запросах. Активные индексы потребляют место 
//      на диске и память, поэтому следует отслеживать индексы для планирования 
//      используемой памяти. При обновлении индексированного поля, также обновляется 
//      соответствующий индекс.

// --- 6.1 Indexes and Collation

// Collation позволяет пользователям задавать специфичные для языка правила 
//      сравнения строк, например, правила для регистра букв и знаков ударения.

// Чтобы использовать индекс для сравнения строк, запрос должен содержать те же
//      настройки collation, что и настройки индекса.

// Создание индекса для строкового поля category с локалью fr:
//      db.myColl.createIndex({ category: 1 }, { collation: { locale: "fr" } })

// Запрос задает то же значение collation и может использовать индекс:
//      db.myColl.find({ category: "cafe" }).collation({ locale: "fr" })

// Запрос не использует индекс:
//      db.myColl.find({ category: "cafe" })

// Коллекция myColl имеет составной индекс с локалью "fr" для двух числовых полей 
//      score и price, а также строкового поля category:
//      db.myColl.createIndex(
//          { score: 1, price: 1, category: 1 },
//          { collation: { locale: "fr" } }
//      );

// Операции выполняют сортировку по числовым полям и используют индекс:
//      db.myColl.find({ score: 5 }).sort({ price: 1 })
//      db.myColl.find({ score: 5, price: { $gt: NumberDecimal("10") } }).sort({ price: 1 })

// Операции выполняют поиск по двоичному и строковому полям, также используют индекс:
//      db.myColl.find({ score: 5, category: "cafe" })

// --- 6.2 Single Field and Compound Indexes

// Индексы отдельных полей - это индексы, повышающие производительность запросов, 
//      в которых указывается порядок сортировки ascending/descending для одного 
//      поля документа. 

// Для индекса с одним полем и операций сортировки порядок сортировки ключей индекса 
//      не имеет значения, поскольку MongoDB может перемещаться по индексу в любом 
//      направлении.

//      │▒▒▒▒▒▒▒▒▒│▒▒▒▒▒▒│▒▒▒▒▒▒│▒▒▒▒│▒▒▒▒▒▒▒▒▒▒▒▒▒▒│▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒│
//      min       11     18     25   30             45              max
//      { score: 1 } Index

// Составные индексы - это индексы, повышающие производительность запросов, которые 
//      определяют порядок сортировки по возрастанию/убыванию для нескольких полей
//      документа. Порядок сортировки следует указать для каждого поля в индексе.

// Для составных индексов и операций сортировки порядок сортировки ключей индекса 
//      определяет, может ли индекс поддерживать операцию сортировки.

// Порядок полей в составном индексе имеет значение. Например, составной индекс 
//      { userid: 1, score: -1 } сначала сортируется по полю userid, а затем внутри 
//      каждого значения userid по полю score.

//      │▒▒▒▒▒▒▒▒▒│▒▒▒▒▒▒│▒▒▒▒▒▒│▒▒▒▒│▒▒▒▒▒▒▒▒▒▒│▒▒▒▒▒▒▒▒▒▒▒│▒▒▒▒▒▒▒▒▒│
//      min       aa1    ca2    ca2  ca2        nb1         xyz       max                              
//                45     75     55   30         30          90         
//      { userid: 1, score: -1 } Index

async function indexes_singleAndCompound() {

    const client = new MongoClient("mongodb://localhost:27017");

    try {
        await client.connect();
        const database = client.db("sample_mflix");
        const movies = database.collection("movies");

        // 
        await movies.insertMany([
            { title: "Batman 1", imdb: { rated: 50 }, rnd: 0, type: "movie", genre: "Drama" },
            { title: "Batman 2", imdb: { rated: 70 }, rnd: 0, type: "movie", genre: "Horror" },
            { title: "Batman 3", imdb: { rated: 40 }, rnd: 0, type: "cartoon", genre: "Comedy" },
        ]);

        // --- --- single field indexes

        // метод createIndex используется для создания индекса в возрастающем 
        //      порядке для поля title в коллекции movies
        const result1 = await movies.createIndex({ title: 1 });
        console.log(`--- Single Index created: ${result1}`);

        // запрос будет использовать созданный выше индекс
        const singleCursor = movies
            .find({ title: { $regex: "Batman" } })
            .sort({ "imdb.rated": 1 })
            .project({ title: 1 });
        await singleCursor.forEach(item => console.dir(JSON.stringify(item)));

        // --- --- compound indexes

        // метод createIndex используется для создания составного индекса 
        //      для поля type в коллекции movies 
        const result2 = await movies.createIndex({ type: 1, genre: 1 });
        console.log(`--- Multi Index created: ${result2}`);

        // запрос будет использовать созданный выше индекс
        const multiCursor = movies
            .find({ type: "movie", genre: "Drama" })
            .sort({ type: 1, genre: 1 })
            .project({ type: 1, genre: 1 });
        await multiCursor.forEach(item => console.dir(JSON.stringify(item)));
    }
    catch (err) {
        console.log(`--- err: ${err}`);
    }
    finally {
        await client.close();
    }
}

// --- 6.3 Multikey Indexes (Indexes on Array Fields)

// Индексы с несколькими ключами - это индексы, повышающие производительность 
//      запросов, в которых указаны ascending/descending индексы для полей 
//      с массивами.

// MongoDB использует многоключевые индексы для индексации содержимого, 
//      хранящегося в массивах, при этом создается отдельная запись индекса 
//      для каждого элемента массива. 

// MongoDB автоматически определяет, когда следует создавать индекс с несколькими 
//      ключами, то есть не нужно специально указывать тип ключа.

//      │▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒│▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒│▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒│▒▒▒▒▒▒▒▒▒▒│
//      min               "10036"                  "78610"          "94301"    max                              
//      { userid: 1, score: -1 } Index

async function indexes_multikey() {

    const client = new MongoClient("mongodb://localhost:27017");

    try {
        await client.connect();
        const database = client.db("sample_mflix");
        const movies = database.collection("movies");

        // 
        await movies.insertMany([
            { title: "Batman 1", imdb: { rated: 50 }, rnd: 0, cast: "Burt Reynolds", type: "movie", genre: "Drama" },
            { title: "Batman 2", imdb: { rated: 70 }, rnd: 0, cast: "Burt Reynolds", type: "movie", genre: "Horror" },
            { title: "Batman 3", imdb: { rated: 40 }, rnd: 0, cast: "Burt Reynolds", type: "cartoon", genre: "Comedy" },
        ]);

        // метод createIndex используется для создания индекса в возрастающем 
        //      порядке для поля cast (массива имен) в коллекции movies
        const result = await movies.createIndex({ cast: 1 });
        console.log(`--- Index created: ${result}`);

        // 
        const cursor = movies
            .find({ cast: "Burt Reynolds" })
            .sort({ cast: 1, genre: 1 })
            .project({ cast: 1, title: 1 });
        await cursor.forEach(item => console.dir(JSON.stringify(item)));
    }
    catch (err) {
        console.log(`--- err: ${err}`);
    }
    finally {
        await client.close();
    }
}

// --- 6.4 Hashed Indexes

// Для поддержки 'hash based sharding' предоставляется хешированный индекс, 
//      который индексирует хэш значения поля. Эти индексы имеют более случайное 
//      распределение значений по диапазону и поддерживают только совпадения 
//      на равенство, исключая запросы на основе диапазона.

// --- 6.5 Text Indexes

// Текстовые индексы поддерживают запросы текстового поиска. Текстовый индекс 
//      включает поля, значения которых являются строками или массивами строк. 
//      MongoDB поддерживает текстовый поиск для разных языков. Язык можно указать 
//      при создании индекса. 

async function indexes_text() {

    const client = new MongoClient("mongodb://localhost:27017");

    try {
        await client.connect();
        const database = client.db("sample_mflix");
        const movies = database.collection("movies");

        // метод createIndex используется для создания текстового индекса 
        //      для поля fullplot в коллекции movies, в качестве языка 
        //      по умолчанию указывается english
        const result = await movies.createIndex(
            { title: "text" },
            //      { fullplot: "text" },
            { default_language: "english" }
        );
        console.log(`--- Index created: ${result}`);

        // текстовые индексы не содержат порядок сортировки, поэтому sort 
        //      не используется
        const cursor = movies
            .find({ $text: { $search: "Batman Random" } })
            //      .find({ $text: { $search: "java coffee shop" } })
            .project({ title: 1 });
        await cursor.forEach(item => console.dir(JSON.stringify(item)));
    }
    catch (err) {
        console.log(`--- err: ${err}`);
    }
    finally {
        await client.close();
    }
}

// --- 6.6 Geospatial Indexes

// Индексы 2dsphere поддерживают запросы данных о геопространственных координатах,
//      включая данные для inclusion, intersection, proximity. Чтобы создать индекс 
//      2dsphere следует указать поле, содержащее объекты GeoJSON.

// MongoDB предоставляет два специальных индекса: 2d-индексы, которые используют 
//      плоскую геометрию и индексы 2dsphere, которые используют сферическую
//      геометрию для определения координат.

async function indexes_geo() {

    const client = new MongoClient("mongodb://localhost:27017");

    try {
        await client.connect();
        const database = client.db("sample_mflix");

        // 
        const theaters = database.collection("theaters");
        await theaters.insertMany([
            {
                "_id": ObjectId("59a47286cfa9a3a73e51e75c"),
                "theaterId": 104,
                "location": {
                    "address": {
                        "street1": "5000 W 147th St",
                        "city": "Hawthorne",
                        "state": "CA",
                        "zipcode": "90250"
                    },
                    // поле geo представляет собой объект GeoJSON Point, 
                    //      описывающий координаты театра
                    "geo": {
                        "type": "Point",
                        "coordinates": [-118.36559, 33.897167]
                    }
                }
            }
        ]);

        // метод createIndex создает 2dsphere индекс для поля location.geo 
        //      в коллекции theaters
        const result = await theaters.createIndex({ "location.geo": "2dsphere" });
        console.log(`--- Index created: ${result}`);
    }
    catch (err) {
        console.log(`--- err: ${err}`);
    }
    finally {
        await client.close();
    }
}

// --- 6.7 Unique Indexes / Partial Indexes / Sparse Indexes

// Уникальные индексы (Unique Indexes) гарантируют, что в полях с индексами 
//      не будут храниться повторяющиеся значения. По умолчанию MongoDB 
//      создает уникальный индекс для поля _id во время создания коллекции. 
//      Чтобы создать уникальный индекс следует указать поле или комбинацию 
//      полей с параметром 'unique:true'.

// Попытка записи повторяющегося значения в поле с уникальным индексом приведет
//      к ошибке: E11000 duplicate key error index.

// Частичные индексы (Partial Indexes) применяются только к тем документам 
//      в коллекции, которые соответствуют указанному выражению фильтра. 
//      Частичные индексы требуют меньше места для хранения и снижают затраты 
//      на создание и обслуживание индексов.

// Разреженные индексы (Sparse Indexes). Свойство sparse можно указать 
//      при создании индекса. Это свойство гарантирует, что индекс содержит 
//      только записи для документов, которые имеют индексированное поле. 
//      Индекс игнорирует документы, которые не имеют проиндексированного поля.

// Параметры sparse и unique можно комбинировать вместе, чтобы предотвратить 
//      вставку документов с повторяющимися значениями для индексированных 
//      полей и отбросить документы, в которых отсутствуют индексированные поля.

// Частичные индексы предлагают больше функций, чем индексы sparse, поэтому
//      следует отдавать предпочтение частичным индексам.

async function indexes_uniquePartialSparse() {

    const client = new MongoClient("mongodb://localhost:27017");

    try {
        await client.connect();
        const database = client.db("sample_mflix");

        // 
        const theaters = database.collection("theaters");
        await theaters.insertMany([
            {
                "_id": ObjectId("59a47286cfa9a3a73e51e75c"),
                "theaterId": 104,
                "location": {
                    "address": {
                        "street1": "5000 W 147th St",
                        "city": "Hawthorne",
                        "state": "CA",
                        "zipcode": "90250"
                    },
                    // поле geo представляет собой объект GeoJSON Point, 
                    //      описывающий координаты театра
                    "geo": {
                        "type": "Point",
                        "coordinates": [-118.36559, 33.897167]
                    }
                }
            }
        ]);

        // метод createIndex используется для создания уникального индекса 
        //      поля theaterId в коллекции theaters
        const result = await theaters.createIndex(
            { theaterId: 1 },
            { unique: true }
        );
        console.log(`Index created: ${result}`);
    }
    catch (err) {
        console.log(`--- err: ${err}`);
    }
    finally {
        await client.close();
    }
}

// --- 6.8 TTL Indexes

// Индексы TTL - это специальные индексы, которые MongoDB может использовать 
//      для автоматического удаления документов из коллекции через определенное 
//      время. Это идеально подходит для определенных типов информации, таких 
//      как данные о событиях, журналы и информация о сеансах, которые должны 
//      сохраняться в базе данных только в течение конечного периода времени.

// --- 6.9 Hidden Indexes

// Скрытые индексы (Hidden Indexes) не видны планировщику запросов и не могут 
//      использоваться для поддержки запроса. Скрывая индекс от планировщика, 
//      можно оценить потенциальное влияние удаления индекса, не удаляя сам 
//      индекс. Если влияние отрицательное, то можно раскрыть индекс вместо 
//      повторного создания. Индексы становятся доступными для использования
//      сразу же после раскрытия.

// --- Запуск.

(async () => {
    await indexes_singleAndCompound();
    await indexes_multikey();
    await indexes_text();
    await indexes_geo();
    await indexes_uniquePartialSparse();
})();