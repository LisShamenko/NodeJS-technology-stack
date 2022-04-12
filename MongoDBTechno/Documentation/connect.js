const { MongoClient, ServerApiVersion } = require("mongodb");



// --------------- 1. Connection Guide.

//      https://www.mongodb.com/docs/drivers/node/current/fundamentals/connection/

// --- 1.1 Standard Connection String Format.

// Схема стандартного URI подключения:
//      mongodb://[username:password@]host1[:port1][,...hostN[:portN]][/[defaultauthdb][?options]]

// Параметры:
//      `mongodb://`            префикс, определяет стандартный формат подключения
//      `username:password@`    данные аутентификации
//      `host[:port]`           хост/порт, на котором работает экземпляр mongodb/mongos
//      `/defaultauthdb`        база данных для аутентификации пользователя
//      [/] + `?<options>`      дополнительные параметры подключения

// Примеры:
//      mongodb://myDBReader:D1fficultP%40ssw0rd@mongodb0.example.com:27017/?authSource=admin

// Символы :/?#[]@ в имени пользователя и пароле следует заменять с помощью
//      процентного кодирования:
//      :   /   ?   #   [   ]   @   
//      %3A %2F %3F %23 %5B %5D %40 

// Порядок аутентификации:
//      - если указано `username:password`, то пользователь аутентифицируется через 
//          базу данных, указанную в authSource;
//      - если authSource не указано, то пользователь аутентифицируется через базу, 
//          указаную в `/defaultauthdb`;
//      - если `authSource` и `defaultauthdb` не указаны, то клиент попытается 
//          аутентифицировать указанного пользователя в базе данных admin.

// --- 1.2 Stable API.

// При создании клиента можно указать используемую версию API, которая будет определять 
//      ожидаемое поведение выполняемых операций и формат ответов сервера. Версию API
//      можно указать в опциях MongoClientOptions при создании клиента MongoClient.

// Можно указать дополнительные опции, связанные со стабильным API:
//      - version (null) - указывает версию стабильного API;
//      - strict (false) - если указать true, то будет генерироваться ошибка при вызове 
//          команды, которая не поддерживается указанной версией API;
//      - deprecationErrors (false) - если указать true, то будет генерироваться ошибка
//          при вызове команды, которая является устаревшей в указанной версией API;

async function mongo_connect() {

    // Connection URI
    //      mongodb+srv://sample-hostname:27017/?maxPoolSize=20&w=majority
    const uri = "mongodb://localhost:27017/?maxPoolSize=20&w=majority";

    // Create a new MongoClient
    const client = new MongoClient(uri,
        {
            serverApi: {
                version: ServerApiVersion.v1,
                strict: true,
                deprecationErrors: true,
            }
        }
    );

    try {

        // Connect the client to the server
        await client.connect();

        // Establish and verify connection
        let doc = await client.db("admin").command({ ping: 1 });
        console.log(`--- connected successfully: ${JSON.stringify(doc)}`);
    }
    catch (err) {
        console.log(`--- err: ${err}`);
    }
    finally {

        // Ensures that the client will close when you finish/error
        await client.close();
    }
}

// --- Запуск.

(async () => {
    await mongo_connect();
})();