const { MongoClient } = require("mongodb");



// --------------- 2. Authentication Mechanisms.

//      https://www.mongodb.com/docs/drivers/node/current/fundamentals/authentication/mechanisms/
//      https://www.mongodb.com/docs/manual/core/security-scram/

// Механизмы аутентификации, доступные в Community Edition: DEFAULT, SCRAM-SHA-256, 
//      SCRAM-SHA-1, MONGODB-CR, MONGODB-AWS, X.509.

// CR - challenge-response.
// SCRAM - salted challenge-response authentication mechanisms.

async function mongo_auth_mechanism(authMechanism) {

    // Следует вседа кодировать URI имени пользователя и пароля с помощью метода 
    //      encodeURIComponent, чтобы обеспечить их правильный анализ.
    const username = encodeURIComponent("lis");
    const password = encodeURIComponent("123");
    const cluster = "localhost:27017";

    // Механизм аутентификации можно указать в параметре authMechanism. 
    const uri = `mongodb://${username}:${password}@${cluster}/?authMechanism=${authMechanism}`;
    const client = new MongoClient(uri);

    try {
        await client.connect();
        let doc = await client.db("admin").command({ ping: 1 });
        console.log(`--- connected ping: ${JSON.stringify(doc)}`);
    }
    catch (err) {
        console.log(`--- err: ${err}`);
    }
    finally {
        await client.close();
    }
}

// --- DEFAULT

// Механизм DEFAULT - предлагает драйверу выбрать механизм проверки подлинности 
//      из следующего списка в порядке предпочтения: SCRAM-SHA-256, SCRAM-SHA-1, 
//      MONGODB-CR. 

//      await mongo_auth_mechanism('DEFAULT');

// --- SCRAM-SHA-256

// Механизм SCRAM-SHA-256 - это механизм 'salted challenge-response authentication'
//      (SCRAM), который использует имя пользователя и пароль, зашифрованные 
//      с помощью алгоритма SHA-256. Это механизм по умолчанию после версии 4.0.

//      await mongo_auth_mechanism('SCRAM-SHA-256');

// --- SCRAM-SHA-1

// Механизм SCRAM-SHA-1 - это механизм 'salted challenge-response authentication'
//      (SCRAM), который использует имя пользователя и пароль, зашифрованные 
//      с помощью алгоритма SHA-1. Это механизм по умолчанию для версий: 
//      3.0, 3.2, 3.4, 3.6.

//      await mongo_auth_mechanism('SCRAM-SHA-1');

// --- MONGODB-CR

// Механизм MONGODB-CR - это механизм аутентификации типа 'challenge-response', 
//      который использует имя пользователя и пароль. Этот механизм устарел начиная 
//      с версии 3.6 и не поддерживается начиная с версии 4.0.

// Механизм использует следующий uri:
//      `mongodb+srv://${username}:${password}@${cluster}/?authMechanism=MONGODB-CR&tls=true&tlsCertificateKeyFile=${clientPEMFile}`

// --- MONGODB-AWS

// Механизм MONGODB-AWS - это механизм, который для аутентификации использует учетные 
//      данные Amazon Web Services Identity and Access Management (AWS IAM). Этот 
//      механизм доступен начиная с версии 4.4.

// Установка библиотеки подписей AWS:
//      npm install aws4

// Драйвер проверяет учетные данные в следующих источниках по порядку:
// - cтрока подключения, в которой указываются учетные данные AWS_ACCESS_KEY_ID, 
//      AWS_SECRET_ACCESS_KEY и при необходимости токен сеанса AWS_SESSION_TOKEN;
// - переменные среды, которые должны содержать учетные данные AWS_ACCESS_KEY_ID, 
//      AWS_SECRET_ACCESS_KEY и при необходимости токен сеанса AWS_SESSION_TOKEN;
// - AWS ECS endpoint, указанная в AWS_CONTAINER_CREDENTIALS_RELATIVE_URI;
// - AWS EC2 endpoint.

async function mongo_mongodb_aws() {

    // Replace the following with values for your environment.
    const keyId = encodeURIComponent("<AWS_ACCESS_KEY_ID>");
    const secretKey = encodeURIComponent("<AWS_SECRET_ACCESS_KEY>");
    const cluster = "<MongoDB cluster url>";
    const authMechanism = "MONGODB-AWS";

    // 
    let uri = `mongodb+srv://${keyId}:${secretKey}@${cluster}/?authSource=%24external&authMechanism=${authMechanism}`;

    // Uncomment the following lines if your AWS authentication setup requires a session token.
    const sessionToken = encodeURIComponent("<AWS_SESSION_TOKEN>");

    // 
    uri = uri.concat(`&authMechanismProperties=AWS_SESSION_TOKEN:${sessionToken}`);

    // 
    const client = new MongoClient(uri);

    try {
        await client.connect();
        let doc = await client.db("admin").command({ ping: 1 });
        console.log(`--- connected ping: ${JSON.stringify(doc)}`);
    }
    catch (err) {
        console.log(`--- err: ${err}`);
    }
    finally {
        await client.close();
    }
}

// --- X.509

// Механизм X.509 - этот механизм использует TLS с сертификатами X.509. Пользователь
//      идентифицируется через DN - distinguished name клиентского сертификата. 
//      Этот механизм доступен начиная с версии 2.6.

// Параметры TLS/SSL в URI подключения:

// - tls: boolean(false)
//      true - указывает, что следует использовать соединения TLS/SSL;
// - tlsInsecure: boolean(false)
//      true - эквивалентно установке tlsAllowInvalidCertificates и 
//      tlsAllowInvalidHostnames в значение true;
// - tlsCAFile: string
//      путь к файлу сертификатов;
// - tlsCertificateKeyFile: string
//      путь к файлу сертификата или файлу приватного ключа, если требуются оба 
//      файла, то они должны быть объединены в один файл;
// - tlsCertificateKeyFilePassword: buffer or string
//      содержит пароль для расшифровки закрытого ключа клиента;
// - tlsAllowInvalidCertificates: boolean(false)
//      true - драйвер разрешает использовать недопустимый сертификат для подключения;
// - tlsAllowInvalidHostnames: boolean(false)
//      true - драйвер разрешает несоответствие между именем узла сервера и именем 
//      узла сертификата TLS.

async function mongo_x509() {

    //
    const username = encodeURIComponent("<client certificate distinguished name>");
    const clusterUrl = "<MongoDB cluster url>";
    const clientPEMFile = encodeURIComponent("<path to the client pem certificate file>");
    const authMechanism = "MONGODB-X509";

    // 
    const uri = `mongodb+srv://${username}@${clusterUrl}/?authMechanism=${authMechanism}&tls=true&tlsCertificateKeyFile=${clientPEMFile}`;

    // 
    const client = new MongoClient(uri);

    try {
        await client.connect();
        let doc = await client.db("admin").command({ ping: 1 });
        console.log(`--- connected ping: ${JSON.stringify(doc)}`);
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
    await mongo_auth_mechanism('DEFAULT');
    await mongo_auth_mechanism('SCRAM-SHA-256');
    await mongo_auth_mechanism('SCRAM-SHA-1');
    // AWS - Amazon Web Services
    //      await mongo_mongodb_aws();
    // требуется сертификат X509
    //      await mongo_x509();
})();