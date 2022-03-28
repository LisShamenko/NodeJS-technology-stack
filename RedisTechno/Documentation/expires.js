"use strict";

const redis = require("redis");



// --------------- 4. EXPIRE key seconds [NX|XX|GT|LT].

//      EXPIRE
//      PEXPIRE
//      EXPIREAT
//      PEXPIREAT

// --- 4.1 Timeout.

// Для ключа может быть установлен Timeout (временная задержка) по истечении которого 
//      ключ будет автоматически удален, такой ключ будет называться volatile-ключом.
//      Timeout можно сбросить, превратив ключ в постоянный с помощью команды PERSIST.

// Timeout сбрасывается командами, которые удаляют или перезаписывают содержимое ключа:
//      DEL, SET, GETSET, все команды с префиксом *STORE. Команды которые изменяют 
//      значение, хранящееся в ключе, не влияют на Timeout: INCR, LPUSH, HSET и т.д.

// Команда переименования ключа RENAME переносит Timeout на ключ с новым именем. Если 
//      ключ с новым именем уже существует то он будет перезаписан и получит все 
//      характеристики исходного ключа.

//      SET Key_A '1'
//      SET Key_B '2'
//      RENAME Key_B Key_A
//          Key_A наследует характеристики Key_B

// Вызов EXPIRE/PEXPIRE с неположительным Timeout или вызов EXPIREAT/PEXPIREAT со значением
//      времени из прошлого приведёт к удалению ключа, а не истечению его срока действия,
//      то есть будет сгенерировано событие del, а не expired.

// Вызов EXPIRE для ключа, который уже имеет Timeout, приведет к обновлению Timeout 
//      до нового значения. До версии Redis 2.1.3 изменение ключа с Timeout приводило
//      к удалению ключа. EXPIRE вернет 0 и не изменит Timeout для ключа с установленным 
//      Timeout.

// Параметры:
// NX - установить Timeout, если у ключа его нет;
// XX - установить Timeout, если у ключа уже есть срок действия;
// GT - установить Timeout, когда новый Timeout больше текущего;
// LT - установить Timeout, когда новый Timeout меньше текущего;

// Возвращаемое значение:
// 1 - Timeout установлен.
// 0 - Timeout не был установлен. 

// --- 4.2 Примеры.

//      redis> SET mykey "Hello"
//          "OK"                                    создать ключ
//      redis> EXPIRE mykey 10
//          (integer) 1                             установить Timeout                  
//      redis> TTL mykey
//          (integer) 10                            вывести Timeout                     
//      redis> SET mykey "Hello World"
//          "OK"                                    сброс Timeout                       
//      redis> TTL mykey
//          (integer) -1                            проверка
//      redis> EXPIRE mykey 10 XX
//          (integer) 0                             задать не верный параметр
//      redis> TTL mykey
//          (integer) -1                            проверка
//      redis> EXPIRE mykey 10 NX
//          (integer) 1                             установить Timeout с параметром
//      redis> TTL mykey
//          (integer) 10                            проверка

//      redis> SET place "none"
//          "OK"                                    
//      redis> RENAME place mykey
//          "OK"
//      redis> GET mykey
//      redis> TTL mykey

async function redis_expire() {

    // 
    const client = redis.createClient();
    client.on('error', (err) => {
        console.log(`--- redis client error: ${err}`);
    });

    // 
    await client.connect();
    console.log(`--- redis: connection`);

    //
    const waitKey = async (key, time) => new Promise((resolve, reject) => {
        setTimeout(async () => {
            resolve(await client.GET(key));
        }, time);
    });

    // 
    console.log(`--- key: expirekey
        --- SET         = ${await client.SET('expirekey', 'Hello')}
        --- EXISTS      = ${await client.EXPIRE('expirekey', 1)}
        --- TTL         = ${await client.TTL('expirekey')}
        --- SET         = ${await client.SET('expirekey', 'Hello World')}
        --- TTL         = ${await client.TTL('expirekey')}
        --- GET  200    = ${await waitKey('expirekey', 200)}
        --- GET 1000    = ${await waitKey('expirekey', 1000)}
    `);

    // XX - установить срок действия только в том случае, если у ключа уже есть срок действия.
    console.log(`--- key: expirekey
        --- EXISTS      = ${await client.EXPIRE('expirekey', 5)}
        --- EXISTS XX   = ${await client.EXPIRE('expirekey', 1, { XX: true })}
        --- TTL         = ${await client.TTL('expirekey')}
        --- GET  200    = ${await waitKey('expirekey', 200)}
        --- GET 1000    = ${await waitKey('expirekey', 1000)}
    `);

    // NX - установить срок действия, только если у ключа нет срока действия.
    console.log(`--- key: expirekey
        --- SET         = ${await client.SET('expirekey', 'Hello World')}
        --- EXISTS NX   = ${await client.EXPIRE('expirekey', 1, { NX: true })}
        --- TTL         = ${await client.TTL('expirekey')}
        --- GET  200    = ${await waitKey('expirekey', 200)}
        --- GET 1000    = ${await waitKey('expirekey', 1000)}
    `);

    //
    client.quit();
}

// --- 4.3 Паттерн 'navigation session'.

// Задача: вернуть N последних страниц посещенных пользователем не позже 60 секунд 
//      назад.
// Решение: просмотры страниц можно рассматривать как сеанс навигации пользователя,
//      который содержит информацию о поиске пользователя.

//      MULTI
//      RPUSH pagewviews.user:<userid> http://.....
//          можно использовать счетчики (INCR) вместо списков (RPUSH) 
//      EXPIRE pagewviews.user:<userid> 60
//          ключ будет сохраняться 60 секунд, поэтому можно будет вернуть
//          страницы, которые были прсмотрены менее 60 секунд назад
//      EXEC

// --- 4.4 Appendix: Redis expires

// Ключ, который создается без Timeout существует до тех пор, пока не будет удален
//      явным образом, например, с помощью команды DEL. Команда EXPIRE связывает
//      Timeout с ключом за счет дополнительной памяти, используемой ключом.
//      По истечении срока действия ключа Redis обязательно удалит ключ. Время жизни 
//      ключа можно обновить или полностью удалить с помощью команд EXPIRE и PERSIST.

// В Redis 2.4 срок действия может быть неточным и может составлять от 0 до 1s.
//      Начиная с Redis 2.6 ошибка истечения срока действия составляет от 0 до 1ms.

// Timeout ключей хранится в виде абсолютных временных меток Unix, то есть время будет 
//      отсчитываться даже когда Redis не активен. При перемещении файла RDB между
//      двумя компьютерами с большой рассинхронизацией во времени сроки действия 
//      загруженных ключей могут истечь во время загрузки. Запущенные экземпляры Redis
//      проверяют часы компьютера, поэтому при изменении текущего времени сроки действия 
//      ключей также могут истечь.

// Срок действия ключей Redis истекает двумя способами: пассивным и активным.

// - пассивным - срок действия ключа истекает, когда какой-либо клиент пытается получить
//      к нему доступ, и время ожидания ключа истекло. Периодически Redis тестирует 
//      несколько случайных ключей с установленным сроком действия и удаляет те ключи, 
//      у которых истек срок действия. Redis выполняет 10 раз в секунду следующий алгоритм:
//      - тест 20 случайных ключей со сроком действия;
//      - удаляет ключи с истекшим сроком действия;
//      - если срок действия более чем 25% ключей истек, то алгоритм повторяется с шага 1.
//      Последнее условие означает, что максимальное количество ключей с истекшим сроком 
//      действия, использующих память, равно максимальному количеству операций записи 
//      в секунду, деленному на 4.

//How expires are handled in the replication link and AOF file
//In order to obtain a correct behavior without sacrificing consistency, when a key expires, a DEL operation is synthesized in both the AOF file and gains all the attached replicas nodes. This way the expiration process is centralized in the master instance, and there is no chance of consistency errors.
//However while the replicas connected to a master will not expire keys independently (but will wait for the DEL coming from the master), they'll still take the full state of the expires existing in the dataset, so when a replica is elected to master it will be able to expire the keys independently, fully acting as a master.

// --- Запуск.

(async () => {
    await redis_expire();
})();