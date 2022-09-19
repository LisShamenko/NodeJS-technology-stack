"use strict";

const redis = require("redis");



// --------------- 5. Streams.

//      https://redis.io/topics/streams-intro

// Streams - представляет собой абстрактный тип данных, потоки Redis в первую очередь 
//      представляют собой структуру данных только для добавления. Потоки Redis это 
//      наиболее сложный тип данных Redis. Потоки включают операции блокировки и 
//      понятие Consumer Groups. 

// Consumer Groups - группы потребителей, которые были представлены системой обмена 
//      сообщениями Kafka. Redis реализует аналогичную идею: позволить группе клиентов 
//      взаимодействовать, потребляя разные части одного и того же потока сообщений.

// --- 5.1 Основы.

// Базовая часть команд для потоков такая же, как для списков и множеств, отличие
//      между ними заключается в более сложных командах блокировки потоков. Потоки 
//      представляют собой структуру данных, предназначенную только для добавления.

// Команда XADD добавляет новую запись в указанный поток. Запись потока состоит 
//      из одной или нескольких пар поле-значение. Каждая запись потока структурирована, 
//      как файл только для добавления, написанный в формате CSV, где в каждой строке 
//      присутствует несколько разделенных полей.

// Вызов команды XADD добавляет запись 'sensor-id: 1234, temperature: 19.8' в поток, где
//      mystream - имя ключа; 
//      * - идентификатор записи, который идентифицирует каждую запись внутри потока, 
//      в данном случае сервер сам сгенерирует идентификатор при помощи инкремента; 
//      запись в поток, которая состоит из пар 'поле-значение'.

// Наличие идентификатора для каждой записи потока похоже на идентификацию строк в файле 
//      логирования, где для идентификации может использоваться номер строки или смещение 
//      в байтах внутри файла. 

//      > XADD mystream * sensor-id 1234 temperature 19.8
//          1518951480106-0                 идентификатор записи

// Идентификатор записи: '<millisecondsTime>-<sequenceNumber>', где
//      millisecondsTime - локальное время сервера Redis, при перематывании локального
//          времени назад берется последнее наибольшее время сервера;
//      sequenceNumber - используется для записей созданных за одну миллисекунду.

// Потоки реплицируются с помощью полностью определенных команд XADD, поэтому реплики 
//      будут иметь идентификаторы, идентичные мастеру.

// Время является частью идентификатора, потому что потоки Redis поддерживают запросы 
//      диапазона по идентификатору. Поскольку идентификатор связан со временем 
//      создания записи, это дает возможность запрашивать временные диапазоны 
//      практически бесплатно.

// Явный идентификатор потока:

//      > XADD somestream 0-1 field value
//          0-1
//      > XADD somestream 0-2 foo bar
//          0-2

// Следующая команда не примет идентификатор равный или меньший предыдущего:

//      > XADD somestream 0-1 foo bar
//          (error) ERR The ID specified in XADD is equal or smaller than the target stream top item

// Явный идентификатор, состоящий только номера записи:

//      > XADD somestream 0-* baz qux
//          0-3

// Команда XLEN позволяет получить количество элементов внутри потока.

//      > XLEN mystream
//          (integer) 1

async function redis_streams_base() {

    // 
    const client = redis.createClient({ url: process.env.REDIS_URL });
    client.on('error', (err) => {
        console.log(`--- redis client error: ${err}`);
    });

    // 
    await client.connect();
    console.log(`--- redis: connection`);

    // 
    console.log(`--- key: mystream
        --- DEL 1 = ${await client.DEL('stream_1')}
        --- DEL 2 = ${await client.DEL('stream_2')}
        --- DEL 3 = ${await client.DEL('stream_3')}
        --- DEL 4 = ${await client.DEL('stream_4')}
        --- DEL 5 = ${await client.DEL('stream_5')}
    `);

    // 
    console.log(`--- key: mystream
        --- XADD   = ${await client.XADD('stream_2', '0-1', { 'foo': 'bar' })}
        --- XLEN 2 = ${await client.XLEN('stream_2')}
    `);

    // 
    console.log(`--- key: mystream
        --- XADD   = ${await client.XADD('stream_3', '0-2', { 'first': 'second' })}
        --- XLEN 3 = ${await client.XLEN('stream_3')}
    `);

    // 
    console.log(`--- key: mystream
        --- XADD   = ${await client.XADD('stream_1', '*', { 'sensor-id': 1234, 'temperature': 19.8 })}
        --- XLEN 1 = ${await client.XLEN('stream_1')}
    `);

    // 
    try {
        console.log(`--- key: mystream
            --- XADD   = ${await client.XADD('stream_4', '0-*', { 'baz': 'qux' })}
            --- XLEN 4 = ${await client.XLEN('stream_4')}
        `);
    }
    catch (err) {
        console.log(`--- err: ${err}`);
    }

    // 
    try {
        console.log(`--- key: mystream
            --- XADD = ${await client.XADD('stream_5', '0-1', { 'foo': 'bar' })}
            --- XLEN 5 = ${await client.XLEN('stream_5')}
        `);
    }
    catch (err) {
        console.log(`--- err: ${err}`);
    }


    //
    client.quit();
}

// --- 5.2 Получение данных.

// Существуют разные режимы доступа к данным:
// - прослушка потока для перехвата новых сообщений в потоке (подобно 'Unix tail -f'),
//      что дает возможность рассылать сообщения нескольким клиентам;
// - поток можно рассматривать как хранилище временных рядов, а не как систему обмена 
//      сообщениями;
// - получение сообщений по диапазонам времени или итерация сообщений с использованием 
//      курсора для постепенной проверки всей истории;
// - Consumer Groups, поток сообщений можно разделить на несколько потребителей, каждый 
//      потребитель будет получать не все сообщения из потока, а только некоторую часть,
//      что похоже на то, как работает Kafka.

// --- 5.3 Получение данных: запрос диапозона.

// Команда XRANGE запрашивает поток по диапазону с указанием двух идентификаторов: 
//      start и end. Возвращаемый диапазон элементов, включает граничные значения.
//      Специальные идентификаторы '-'/'+' означают наименьший/наибольший возможный 
//      идентификатор.

// Записи представляет собой массив из двух элементов: идентификатора и списка пар 
//      поле-значение:

//      > XRANGE mystream - +
//          1)  1)  1518951480106-0
//              2)  1)  "sensor-id"
//                  2)  "1234"
//                  3)  "temperature"
//                  4)  "19.8"
//          2)  1)  1518951482479-0
//              2)  1)  "sensor-id"
//                  2)  "9999"
//                  3)  "temperature"
//                  4)  "18.2"

// Левая часть идентификатора - это время Unix в миллисекундах локального узла, создавшего 
//      запись. Если опустить порядковый номер идентификатора, то в начале диапозона
//      он будет считаться равным 0, а в конце максимальному значению. 

// Запрос всех записей за две секунды без учета порядкового номера:

//      > XRANGE mystream 1518951480106 1518951480107
//          1)  1)  1518951480106-0
//              2)  1)  "sensor-id"
//                  2)  "1234"
//                  3)  "temperature"
//                  4)  "19.8"

// Возвращаемый результат команды XRANGE может быть огромным. В этом случае следует 
//      использовать опцию COUNT с указанием количества первых элементов, которые будут 
//      возвращены. Для возврата следующей партии записей следует сделать запрос 
//      с увеличенным на 1 идентификатором последней записи предыдущего результата, 
//      поскольку минимальная единица времени равна 1 миллисекунде.

// Первая итерация получает 2 элемента:

//      > XRANGE mystream - + COUNT 2
//          1)  1)  1519073278252 - 0
//              2)  1)  "foo"
//                  2)  "value_1"
//          2)  1)  1519073279157 - 0
//              2)  1)  "foo"
//                  2)  "value_2"

// Чтобы не добавлять 1 миллисекунду можно использовать префикс '(', чтобы исключить
//      граничное значение. Выбрать следующие две записи:

//      > XRANGE mystream (1519073279157-0 + COUNT 2
//          1)  1) 1519073280281 - 0
//              2)  1) "foo"
//                  2) "value_3"
//          2)  1) 1519073281432 - 0
//              2)  1) "foo"
//                  2) "value_4"

// Сложность XRANGE составляет O(log(N)) для поиска и O(M) для возврата M элементов.
//      При небольшом количестве команда имеет логарифмическую временную сложность, 
//      это означает, что каждый шаг итерации выполняется быстро. Поэтому команда
//      XRANGE подходит для итерации потоков (вместо XSCAN).

// Команда XREVRANGE эквивалентна XRANGE, но возвращает элементы в обратном порядке, 
//      что удобно для проверки последнего элемента в потоке. Команда XREVRANGE 
//      принимает аргументы запуска и остановки в обратном порядке.

//      > XREVRANGE mystream + - COUNT 1
//          1)  1)  1519073287312-0
//              2)  1)  "foo"
//                  2)  "value_10"

async function redis_xrange() {

    // 
    const client = redis.createClient({ url: process.env.REDIS_URL });
    client.on('error', (err) => {
        console.log(`--- redis client error: ${err}`);
    });

    // 
    await client.connect();
    console.log(`--- redis: connection`);

    // 
    console.log(`--- key: mystream
        --- DEL 1 = ${await client.DEL('stream_1')}
        --- DEL 2 = ${await client.DEL('stream_2')}
        --- DEL 3 = ${await client.DEL('stream_3')}
        --- DEL 4 = ${await client.DEL('stream_4')}
        --- DEL 5 = ${await client.DEL('stream_5')}
    `);

    //
    const getNum = (num) => {
        let pnum = parseInt(num);
        return pnum === 'NaN' ? 0 : pnum;
    }

    // 
    let mes_1 = await client.XADD('stream_1', '*', { 'sensor-id': 1234, 'temperature': 19.8 });
    let num_1 = getNum(mes_1.split('-')[0]);
    let mes_2 = await client.XADD('stream_1', '*', { 'sensor-id': 9999, 'temperature': 18.2 });
    let mes_3 = await client.XADD('stream_1', '*', { 'sensor-id': 5678, 'temperature': -0.5 });
    console.log(`--- key: mystream
        --- XADD         = ${mes_1}
        --- XADD         = ${mes_2}
        --- XADD         = ${mes_3}
        --- XRANGE -/+   = ${JSON.stringify(await client.XRANGE('stream_1', '-', '+'))}
        --- XRANGE       = ${JSON.stringify(await client.XRANGE('stream_1', num_1, num_1 + 1))}
        --- XRANGE count = ${JSON.stringify(await client.XRANGE('stream_1', '-', '+', { COUNT: 2 }))}
        --- XRANGE (     = ${JSON.stringify(await client.XRANGE('stream_1', `(${num_1}`, '+', { COUNT: 2 }))}
        --- XRANGE +/-   = ${JSON.stringify(await client.XREVRANGE('stream_1', '+', '-'))}
    `);

    //
    client.quit();
}

// --- 5.4 Получение данных: прослушивание потока.

// У потока может быть несколько клиентов (потребителей), которые ожидают данные.
//      Каждая новая запись по умолчанию будет доставлена каждому потребителю. 
//      Это поведение отличается от блокировки списка, где каждый потребитель получает 
//      отдельный элемент, но возможность разветвления для нескольких потребителей 
//      аналогична Pub/Sub.

// Сообщения в Pub/Sub отправляются и не сохраняются, а при использовании блокировки 
//      списка полученное сообщение извлекается из списка. В потоках все сообщения
//      добавляются на неопределенный срок и клиенты сами определяют какие сообщения
//      являются новыми, поскольку запоминают идентификатор последнего прочитанного
//      сообщения.

// Команда XREAD обеспечивает возможность прослушивания новых сообщений в потоке.
//      Параметр STREAMS обязателен и указывает список ключей вместе с максимальным 
//      идентификатором, то есть будут выведены записи идентификаторы, которых
//      больше указанного. Запись 'mystream 0' означает, что будут получены записи
//      из потока mystream с идентификаторами больше, чем '0-0'. Команду XREAD
//      можно использовать для вывода данных из нескольких потоков, например:
//      'STREAMS mystream otherstream 0 0'.

//      > XREAD COUNT 2 STREAMS mystream 0
//      1)  1) "mystream"                       команда вернула имя потока
//          2)  1)  1) 1519073278252-0
//                  2)  1) "foo"
//                      2) "value_1"
//              2)  1)  1519073279157-0
//                  2)  1) "foo"
//                      2) "value_2"

// Команду XREAD можно легко превратить в блокирующую, указав аргумент BLOCK и задержку 
//      в миллисекундах, 0 означает, что задержки не будет. Блокирующая форма XREAD 
//      может прослушивать несколько потоков. 

//      Указав специальный идентификатор '$' можно использовать максимальный идентификатор, 
//      чтобы получать только новые сообщения. Применять идентификатор '$' необязательно, 
//      но это удобно для получения последней записи. Для считывания новых записей следует 
//      начать с идентификатора $, после чего используется идентификатор последней 
//      полученной записи для выполнения следующего вызова и так далее.

// Новые записи в блокирующем потоке обрабатываются клиентами в стиле FIFO: первый клиент, 
//      который заблокировал поток, будет заблокирован первым при появлении новых элементов.

//      > XREAD BLOCK 0 STREAMS mystream $

async function redis_xread() {

    // 
    const client = redis.createClient({ url: process.env.REDIS_URL });
    client.on('error', (err) => {
        console.log(`--- redis client error: ${err}`);
    });

    // 
    await client.connect();
    console.log(`--- redis: connection`);

    // 
    console.log(`--- key: mystream
        --- DEL 1 = ${await client.DEL('stream_1')}
        --- DEL 2 = ${await client.DEL('stream_2')}
    `);

    //
    const waitKey = async (key, time) => new Promise((resolve, reject) => {
        setTimeout(async () => {
            console.log(`--- key: mystream_2
                --- XADD          = ${await client.XADD('stream_2', '*', { 'id': 1 })}
                --- XADD          = ${await client.XADD('stream_2', '*', { 'id': 2 })}
                --- XADD          = ${await client.XADD('stream_2', '*', { 'id': 3 })}
            `);
            resolve();
        }, time);
    });

    // 
    console.log(`--- key: mystream_1
        --- XADD          = ${await client.XADD('stream_1', '*', { 'id': 1 })}
        --- XADD          = ${await client.XADD('stream_1', '*', { 'id': 2 })}
        --- XRANGE before = ${JSON.stringify(await client.XRANGE('stream_1', '-', '+'))}
        --- XREAD         = ${JSON.stringify(await client.XREAD({ key: 'stream_1', id: 0 }, { COUNT: 1, BLOCK: 0 }))}
        --- XRANGE after  = ${JSON.stringify(await client.XRANGE('stream_1', '-', '+'))}
    `);

    // 
    waitKey('stream_2', 200);
    console.log(`--- key: mystream
        --- XADD          = ${await client.XADD('stream_2', '0-1', { 'id': 1 })}
        --- XDEL          = ${await client.XDEL('stream_2', '0-1')}
        --- XREAD         = ${JSON.stringify(await client.XREAD({ key: 'stream_2', id: 0 }, { COUNT: 3, BLOCK: 300 }))}
        --- XREAD         = ${JSON.stringify(await client.XREAD({ key: 'stream_2', id: 0 }, { COUNT: 3, BLOCK: 300 }))}
        --- XREAD         = ${JSON.stringify(await client.XREAD({ key: 'stream_2', id: 0 }, { COUNT: 3, BLOCK: 300 }))}
        --- XRANGE after  = ${JSON.stringify(await client.XRANGE('stream_2', '-', '+'))}
    `);

    //
    client.quit();
}

// --- 5.5 Consumer Groups (Группы Потребителей).

// Группы потребителей позволяют предоставить разным клиентам подмножество сообщений 
//      из одного и того же потока. Несколько рабочих процессов могут получать разные 
//      части потока, что дает возможность масштабировать обработку сообщений, направляя 
//      разные сообщения разным рабочим процессам, которые готовы к обработке. Данная
//      возможность полезна, если требуется длительная обработка каждого сообщения.

// Например, для трёх потребителей [C1,C2,C3] и потока с сообщениями [1,2,3,4,5,6,7] 
//      требуется следующая схема обработки:
//      1 -> C1
//      2 -> C2
//      3 -> C3
//      4 -> C1
//      5 -> C2
//      6 -> C3
//      7 -> C1

// Принципы работы группы потребителей:
// - каждое сообщение обслуживается отдельным потребителем, то есть невозможно, чтобы 
//      одно и то же сообщение было доставлено нескольким потребителям;
// - внутри группы потребители идентифицируются по имени, которое сохраняется в группе
//      для повторного подключения потребителя;
// - потребитель может получить только те сообщения, которые ранее не были доставлены;
// - потребитель должен подтвердить, что сообщение было правильно обработано, после 
//      чего оно удаляется из группы потребителей;
// - группа потребителей отслеживает все сообщения, которые были доставлены потребителю,
//      но не были подтверждены как обработанные, благодаря этому каждый потребитель
//      видит в истории те сообщения, которые были ему доставлены;
// - один поток может иметь несколько групп потребителей, которые имеют разный набор 
//      потребителей; в одном и том же потоке одни клиенты могут читать сообщения
//      через XREAD, а другие через XREADGROUP;

//      ┌────────────────────────────────────────┐
//      | consumer_group_name: mygroup           |
//      | consumer_group_stream: somekey         |
//      | last_delivered_id: 1292309234234-92    |
//      |                                        |
//      | consumers:                             |
//      |    "consumer-1" with pending messages  |
//      |       1292309234234-4                  |
//      |       1292309234232-8                  |
//      |    "consumer-42" with pending messages |
//      |       ... (and so forth)               |
//      └────────────────────────────────────────┘
//      группа потребителей, как состояние потока

// Основные команды Consumer Groups:
// - XGROUP используется для создания, уничтожения и управления группами потребителей;
// - XREADGROUP используется для чтения из потока через группу потребителей;
// - XACK позволяет потребителю пометить сообщение как обработанное;

// --- 5.6 Создание группы потребителей.

// Создание группы потребителей:

//      > XGROUP CREATE mystream mygroup $
//          OK                  ключ mystream является потоком

// Рассылка будет начинаться с сообщений идентификаторы которых выше указанного. Можно
//      указать идентификатор сообщения явно. Символ '$' означает, что потребителям 
//      будут передаваться только новые сообщения в потоке. Символ '0' означает, что 
//      потребители получат все сообщения из истории потока. 

// Команда XGROUP CREATE поддерживает автоматическое создание потока с помощью параметра
//      MKSTREAM, если он не существует.

//      > XGROUP CREATE newstream mygroup $ MKSTREAM
//          OK

// Отправить в поток несколько сообщений:

//      > XADD mystream * message apple
//          1526569495631-0
//      > XADD mystream * message orange
//          1526569498055-0
//      > XADD mystream * message strawberry
//          1526569506935-0
//      > XADD mystream * message apricot
//          1526569535168-0
//      > XADD mystream * message banana
//          1526569544280-0

// Команда XREADGROUP позволяет читать сообщения через группу потребителей. Команда 
//      поддерживает следующие опции: 
//      - обязательная опция GROUP <group-name> <consumer-name>, где
//          <group-name> - имя группы потребителей, <consumer-name> - имя потребителя;
//      - опция BLOCK;
//      - опция COUNT;

// Специальный идентификатор '>' работает только в контексте групп потребителей и включает
//      сообщения, которые не доставлялись другим потребителям.

// Применить группу потребителей, где mygroup - группа потребителей, Alice - потребитель:

//      > XREADGROUP GROUP mygroup Alice COUNT 1 STREAMS mystream >
//          1)  1) "mystream"
//              2)  1)  1) 1526569495631-0
//                  2)  1) "message"                имя поля
//                      2) "apple"                  значение

// Специальный идентификатор '>' работает только в контексте групп потребителей, поведение 
//      команды XREADGROUP:
//      - если используется идентификатор '>', то команда вернет только новые сообщения, 
//          которые не доставлялись другим потребителям и обновит последний идентификатор 
//          группы получателей;
//      - если используется любой другой допустимый идентификатор, то команда позволит 
//          получить доступ к истории ожидающих сообщений, то есть к сообщениям, которые
//          были доставлены указанному потребителю и не были подтверждены;

// Вызов XREADGROUP с идентификатором 0, будет возвращено единственное ожидающее 
//      сообщение:

//      > XREADGROUP GROUP mygroup Alice STREAMS mystream 0
//          1)  1) "mystream"
//              2)  1)  1) 1526569495631-0
//                      2)  1) "message"
//                          2) "apple"

// Если подтвердить сообщение как обработанное, то оно больше не будет частью истории 
//      ожидающих сообщений:

//      > XACK mystream mygroup 1526569495631-0
//          (integer) 1
//      > XREADGROUP GROUP mygroup Alice STREAMS mystream 0
//          1)  1) "mystream"
//              2) (empty list or set)

// Команда XACK подтверждает сообщение, как обработанное, после чего сообщение перестает
//      быть частью истории, к которой мы можем получить доступ.

//      > XREADGROUP GROUP mygroup Bob COUNT 2 STREAMS mystream >
//          1)  1)  "mystream"
//              2)  1)  1)  1526569498055-0
//                      2)  1)  "message"
//                          2)  "orange"
//                  2)  1)  1526569506935-0
//                      2)  1)  "message"
//                          2)  "strawberry"

// Запрос двух сообщений через группу mygroup, сообщение 'apple' не доставлено, так как 
//      оно уже было доставлено Alice. Потребители в группе могут читать сообщения 
//      из одного потока, свою историю не обработанных сообщений или помечать сообщения 
//      как обработанные. Это позволяет создавать различные топологии потребления 
//      сообщений из потока.

// Дополнительные замечания:
// - потребители создаются автоматически при первом их упоминании, нет необходимости 
//      в явном создании;
// - команда XREADGROUP позволяет читать несколько потоков, но для этого необходимо 
//      создать группу потребителей с одинаковым именем в каждом потоке;
// - команда XREADGROUP является командой записи, поскольку группа потребителей 
//      модифицируется при чтении потока, поэтому ее можно вызывать только на 
//      главных экземплярах;

// Реализация потребителя с использованием групп потребителей:
// - при перезапуске будут заново прочитаны сообщения, которые были доставлены, но 
//      не были подтверждены;
// - после обработки истории алгоритм переключается на использование специального 
//      идентификатора '>' для чтения новых сообщений.

//      require 'redis'
//      
//      if ARGV.length == 0
//          puts "Please specify a consumer name"
//          exit 1
//      end
//      
//      ConsumerName = ARGV[0]
//      GroupName = "mygroup"
//      r = Redis.new
//      
//      def process_message(id,msg)
//          puts "[#{ConsumerName}] #{id} = #{msg.inspect}"
//      end
//      
//      $lastid = '0-0'
//      
//      puts "Consumer #{ConsumerName} starting..."
//      check_backlog = true
//      while true
//          # Pick the ID based on the iteration: the first time we want to
//          # read our pending messages, in case we crashed and are recovering.
//          # Once we consumed our history, we can start getting new messages.
//          if check_backlog
//              myid = $lastid
//          else
//              myid = '>'
//          end
//      
//          items = r.xreadgroup('GROUP',GroupName,ConsumerName,'BLOCK','2000','COUNT','10','STREAMS',:my_stream_key,myid)
//      
//          if items == nil
//              puts "Timeout!"
//              next
//          end
//      
//          # If we receive an empty reply, it means we were consuming our history
//          # and that the history is now empty. Let's start to consume new messages.
//          check_backlog = false if items[0][1].length == 0
//      
//          items[0][1].each{|i|
//              id,fields = i
//      
//              # Process the message
//              process_message(id,fields)
//      
//              # Acknowledge the message as processed
//              r.xack(:my_stream_key,GroupName,id)
//      
//              $lastid = id
//          }
//      end

async function redis_xgroup() {

    // 
    const client = redis.createClient({ url: process.env.REDIS_URL });
    client.on('error', (err) => {
        console.log(`--- redis client error: ${err}`);
    });

    // 
    await client.connect();
    console.log(`--- redis: connection`);

    // 
    console.log(`--- key: mystream
        --- DEL 1 = ${await client.DEL('stream_1')}
        --- DEL 2 = ${await client.DEL('stream_2')}
    `);

    //
    const getNum = (num) => {
        let pnum = parseInt(num);
        return pnum === 'NaN' ? 0 : pnum;
    }

    // 
    console.log(`--- key: mystream_1
        --- XADD          = ${await client.XADD('stream_1', '*', 'apple')}
        --- XGROUP_CREATE = ${await client.XGROUP_CREATE('stream_1', 'mygroup_1', '$')}
        --- XGROUP_CREATE = ${await client.XGROUP_CREATE('stream_2', 'mygroup_2', '$', { MKSTREAM: true })}
    `);

    // 
    let mes_1 = await client.XADD('stream_2', '*', 'apple');
    let mes_2 = await client.XADD('stream_2', '*', 'orange');
    let mes_3 = await client.XADD('stream_2', '*', 'strawberry');
    let mes_4 = await client.XADD('stream_2', '*', 'apricot');
    let mes_5 = await client.XADD('stream_2', '*', 'banana');
    console.log(`--- key: mystream_2
        --- XADD apple      = ${mes_1}
        --- XADD orange     = ${mes_2}
        --- XADD strawberry = ${mes_3}
        --- XADD apricot    = ${mes_4}
        --- XADD banana     = ${mes_5}
    `);

    // 
    console.log(`--- key: mystream_2
        --- XREADGROUP Alice = ${JSON.stringify(await client.XREADGROUP('mygroup_2', 'Alice', { key: 'stream_2', id: '>' }, { COUNT: 2 }))}
        --- XREADGROUP Bob   = ${JSON.stringify(await client.XREADGROUP('mygroup_2', 'Bob', { key: 'stream_2', id: '>' }, { COUNT: 2 }))}
        export interface XReadGroupOptions {
            COUNT?: number;
            BLOCK?: number;
            NOACK?: true;
        }
    `);

    // 
    let nums = getNum(mes_1.split('-'));
    let numsStr = (nums.length) ? `${nums[0] - 1}-${nums[1]}` : `${nums - 1}-0`;
    console.log(`
        --- --- --- XACK
        --- message = ${numsStr}`
    );

    // 
    console.log(`--- key: mystream_3
        --- XGROUP_CREATE = ${await client.XGROUP_CREATE('stream_2', 'mygroup_3', '0')}

        --- --- прочитать 3 сообщения для пользователя 'Alice', NOACK не подтверждает сообщения 
        --- XREADGROUP ALICE  = ${JSON.stringify(await client.XREADGROUP('mygroup_3', 'Alice', { key: 'stream_2', id: '>' }, { COUNT: 3, NOACK: false }))}

        --- --- прочитать 2 сообщения для пользователя 'Bob'
        --- XREADGROUP BOB    = ${JSON.stringify(await client.XREADGROUP('mygroup_3', 'Bob', { key: 'stream_2', id: '>' }, { COUNT: 2 }))}

        --- --- прочитать все сообщения из истории пользователя 'Alice'
        --- XREADGROUP BEFORE = ${JSON.stringify(await client.XREADGROUP('mygroup_3', 'Alice', { key: 'stream_2', id: numsStr }, { COUNT: 1, NOACK: false }))}

        --- --- подтвердить первое сообщение в истории
        --- XACK              = ${await client.XACK('stream_2', 'mygroup_3', mes_1)}

        --- --- прочитать историю сообщений еще раз, первое сообщение отсутствует
        --- XREADGROUP AFTER  = ${JSON.stringify(await client.XREADGROUP('mygroup_3', 'Alice', { key: 'stream_2', id: numsStr }, { COUNT: 1, NOACK: false }))}
    `);

    //
    client.quit();
}

// --- 5.7 Восстановление после сбоев.

// Пример позволяет создавать потребителей в группе потребителей. Каждый потребитель
//      берет подмножество сообщений для обработки, а при восстановлении после сбоя
//      повторно считывает ожидающие сообщения. Если потребитель не восстанавливается
//      после сбоя, то не подтвержденные сообщения потребителя должны быть обработаны
//      специальной командой, которая позволяет изменить владельца этих сообщений.

//      Другой рабочий потребитель должен проверить список ожидающих сообщений и 
//      потребовать определенные сообщения с помощью специальной команды, 
//      в противном случае сервер навсегда оставит сообщения ожидающими и назначенными 
//      старому потребителю.

// Команда XPENDING обеспечивает возможность наблюдения за ожидающими записями в группе 
//      потребителей. Это команда только для чтения, которая не изменяет владельца 
//      сообщений и ее всегда безопасно вызывать. Команда принимает два аргумента:
//      имя потока и имя группы потребителей.

// Команда выводит следующую информацию: общее количество ожидающих сообщений в группе;
//      меньший и больший идентификаторы ожидающих сообщений; список получателей и 
//      количество ожидающих сообщений, которые они имеют. 

//      > XPENDING mystream mygroup
//          1)  (integer) 2
//          2)  1526569498055-0
//          3)  1526569506935-0
//          4)  1)  1) "Bob"
//                  2) "2"

// Полная сигнатура команды XPENDING:
//      XPENDING 
//          <key> <groupname> 
//          [[IDLE <min-idle-time>] <start-id> <end-id> <count> [<consumer-name>]]
//      , где 
//          <start-id> - начальный идентификатор,
//          <end-id> - конечный идентификатор,
//          <count> - количество выводимых записей,
//          <consumer-name> - имя потребителя, позволяет ограничить вывод сообщениями 
//              указанного потребителя.

// Подробный вывод команды XPENDING включает следующие данные: идентификатор, 
//      имя потребителя, время простоя в миллисекундах, количество доставок 
//      сообщения потребителю.

//      > XPENDING mystream mygroup - + 10
//          1)  1)  1526569498055-0                 идентификатор
//              2)  "Bob"                           имя потребителя
//              3)  (integer) 74170458              время простоя
//              4)  (integer) 1                     количество доставок
//          2)  1)  1526569506935-0
//              2)  "Bob"
//              3)  (integer) 74170458              бездействие около 20 часов
//              4)  (integer) 1

// Проверка содержимого первого сообщения, идентификатор которого повторяется два раза
//      в качестве аргументов:

//      > XRANGE mystream 1526569498055-0 1526569498055-0
//          1)  1)  1526569498055-0
//              2)  1) "message"
//                  2) "orange"

// Команда XCLAIM позволяет изъять не обработанные сообщения и возобновить обработку
//      на другом потребителе. Команда имеет много опций, так как используется 
//      для репликации изменений групп потребителей.

// Команда XCLAIM для сообщений с идентификаторами [<ID-1>, <ID-2>, ... , <ID-N>] 
//      был изменен потребитель на <consumer> с указаннием имени потока <key> и 
//      группы потребителей <group>. Имя простоя <min-idle-time> позволяет
//      фильтровать сообщения, которые превышают указанное время простоя.

//      XCLAIM 
//          <key> <group> <consumer> 
//          <min-idle-time> 
//          <ID-1> <ID-2> ... <ID-N>

// Время простоя полезно, когда два клиента одновременно пытаются запросить сообщение.
//      В этом случае один клиент обработает сообщение и сбросит время простоя вообщения, 
//      тогда второй клиент не сможет повторно обработать это же самое сообщение.

//      Client 1: XCLAIM mystream mygroup Alice 3600000 1526569498055-0
//      Client 2: XCLAIM mystream mygroup Lora 3600000 1526569498055-0

// Выполнение команды XCLAIM, потребитель Alice получила сообщение:

//      > XCLAIM mystream mygroup Alice 3600000 1526569498055-0
//          1)  1)  1526569498055-0
//              2)  1) "message"
//                  2) "orange"

// Опция JUSTID позволяет возвращать только идентификатор сообщения, что полезно 
//      для уменьшения трафика между клиентом и сервером, увеличения производительности 
//      команды или когда потребитель реализован таким образом, что он будет повторно 
//      сканировать историю ожидающих сообщений. Отдельный процесс может проверять список 
//      ожидающих сообщений и назначать их активным потребиталям, которых можно получить
//      с помощью функции Redis. 

async function redis_xpending() {

    // 
    const client = redis.createClient({ url: process.env.REDIS_URL });
    client.on('error', (err) => {
        console.log(`--- redis client error: ${err}`);
    });

    // 
    await client.connect();
    console.log(`--- redis: connection`);

    // 
    console.log(`--- key: mystream
        --- DEL 1 = ${await client.DEL('stream_1')}
        --- DEL 2 = ${await client.DEL('stream_2')}
    `);

    // 
    let mes_1 = await client.XADD('stream_2', '*', 'apple');
    let mes_2 = await client.XADD('stream_2', '*', 'orange');
    let mes_3 = await client.XADD('stream_2', '*', 'strawberry');
    let mes_4 = await client.XADD('stream_2', '*', 'apricot');
    let mes_5 = await client.XADD('stream_2', '*', 'banana');
    console.log(`--- key: mystream_2
        --- XADD apple      = ${mes_1}
        --- XADD orange     = ${mes_2}
        --- XADD strawberry = ${mes_3}
        --- XADD apricot    = ${mes_4}
        --- XADD banana     = ${mes_5}
    `);

    // 
    console.log(`--- key: mygroup_3
        --- XGROUP_CREATE       = ${await client.XGROUP_CREATE('stream_2', 'mygroup_3', '0')}
        --- XREADGROUP ALICE    = ${JSON.stringify(await client.XREADGROUP('mygroup_3', 'Alice', { key: 'stream_2', id: '>' }, { COUNT: 5 }))}
    `);

    // 
    console.log(`--- key: XPENDING_RANGE
        --- XPENDING            = ${JSON.stringify(await client.XPENDING_RANGE('stream_2', 'mygroup_3', '-', mes_3, 3))}
        --- XPENDING            = ${JSON.stringify(await client.XPENDING_RANGE('stream_2', 'mygroup_3', mes_2, '+', 3))}
    `);

    // 
    console.log(`--- key: 
        --- XPENDING            = ${JSON.stringify(await client.XPENDING('stream_2', 'mygroup_3'))}
        --- XACK                = ${await client.XACK('stream_2', 'mygroup_3', mes_1)}
        --- XACK                = ${await client.XACK('stream_2', 'mygroup_3', mes_2)}
        --- XACK                = ${await client.XACK('stream_2', 'mygroup_3', mes_3)}
        --- XPENDING            = ${JSON.stringify(await client.XPENDING('stream_2', 'mygroup_3'))}
    `);

    //
    const waitKey = async (time) => new Promise((resolve, reject) => {
        setTimeout(async () => resolve('ok'), time);
    });

    //      await client.XCLAIM 
    //      (
    //          key: RedisCommandArgument, 
    //          group: RedisCommandArgument, 
    //          consumer: RedisCommandArgument, 
    //          minIdleTime: number, 
    //          id: RedisCommandArgument | Array<RedisCommandArgument>,
    //          options?: XClaimOptions = 
    //          {
    //              IDLE?: number;
    //              TIME?: number | Date;
    //              RETRYCOUNT?: number;
    //              FORCE?: true;
    //          }
    //      )

    // 
    console.log(`--- key: xclaim
        --- ${await waitKey(1200)}
        --- XCLAIM   = ${JSON.stringify(await client.XCLAIM('stream_2', 'mygroup_3', 'Alice', 1000, mes_4))}
        --- ${await waitKey(1200)}
        --- XPENDING = ${JSON.stringify(await client.XPENDING('stream_2', 'mygroup_3'))}
    `);

    //
    client.quit();
}

// --- 5.8 Автоматический запрос.

// Команды XPENDING и XCLAIM предоставляют основные строительные блоки для различных 
//      типов механизмов восстановления.

// Команда XAUTOCLAIM оптимизирует процесс восстановления сообщений, позволяя Redis 
//      управлять им и предлагает простое решение для большинства потребностей 
//      восстановления. Команда XAUTOCLAIM идентифицирует ожидающие сообщения и 
//      устанавливает для них новых владельцев из числа активных потребителей.

//      XAUTOCLAIM 
//          <key> <group> <consumer> 
//          <min-idle-time> 
//          <start> [COUNT count] [JUSTID]

// Применение команды XAUTOCLAIM:

//      > XAUTOCLAIM mystream mygroup Alice 3600000 0-0 COUNT 1
//          1)  1526569498055-0
//          2)  1)  1526569498055-0
//              2)  1) "message"
//                  2) "orange"

// Команда XAUTOCLAIM возвращает массив сообщений и идентификатор потока, который 
//      позволяет повторять ожидающие записи. Идентификатор потока - это курсор,
//      который можно использовать в последующих вызовах, чтобы продолжить запрос 
//      ожидающих сообщений.

//      > XAUTOCLAIM mystream mygroup Lora 3600000 1526569498055-0 COUNT 1
//          1)  0-0                         идентификатор потока
//          2)  1)  1526569506935-0
//              2)  1) "message"
//                  2) "strawberry"

// Команда XAUTOCLAIM возвращает идентификатор потока '0-0' в качестве курсора, когда
//      достигает конца списка ожидающих сообщений группы потребителей. Это не означает, 
//      что отсутствуют новые ожидающие сообщения без владельцев, поэтому процесс 
//      продолжается вызовом XAUTOCLAIM с начала потока.

async function redis_xautoclaim() {

    // 
    const client = redis.createClient({ url: process.env.REDIS_URL });
    client.on('error', (err) => {
        console.log(`--- redis client error: ${err}`);
    });

    // 
    await client.connect();
    console.log(`--- redis: connection`);

    // 
    console.log(`--- key: mystream
        --- DEL 1 = ${await client.DEL('stream_1')}
        --- DEL 2 = ${await client.DEL('stream_2')}
    `);

    // 
    let mes_1 = await client.XADD('stream_2', '*', 'apple');
    let mes_2 = await client.XADD('stream_2', '*', 'orange');
    let mes_3 = await client.XADD('stream_2', '*', 'strawberry');
    let mes_4 = await client.XADD('stream_2', '*', 'apricot');
    let mes_5 = await client.XADD('stream_2', '*', 'banana');
    console.log(`--- key: mystream_2
        --- XADD apple      = ${mes_1}
        --- XADD orange     = ${mes_2}
        --- XADD strawberry = ${mes_3}
        --- XADD apricot    = ${mes_4}
        --- XADD banana     = ${mes_5}
    `);

    //
    const waitKey = async (time) => new Promise((resolve, reject) => {
        setTimeout(async () => resolve('ok'), time);
    });

    // 
    console.log(`--- key: XAUTOCLAIM
        --- XGROUP_CREATE       = ${await client.XGROUP_CREATE('stream_2', 'mygroup_3', '0')}
        --- XREADGROUP ALICE    = ${JSON.stringify(await client.XREADGROUP('mygroup_3', 'Alice', { key: 'stream_2', id: '>' }, { COUNT: 5 }))}
        --- XPENDING            = ${JSON.stringify(await client.XPENDING('stream_2', 'mygroup_3'))}
        --- ${await waitKey(1200)}
        --- XAUTOCLAIM          = ${JSON.stringify(await client.XAUTOCLAIM('stream_2', 'mygroup_3', 'Alice', 1000, mes_1, { COUNT: 1 }))}
        --- XREADGROUP ALICE    = ${JSON.stringify(await client.XREADGROUP('mygroup_3', 'Alice', { key: 'stream_2', id: '>' }, { COUNT: 5 }))}
        --- XPENDING            = ${JSON.stringify(await client.XPENDING('stream_2', 'mygroup_3'))}
    `);

    //
    client.quit();
}

// --- 5.9 Счетчик доставки.

// В выводе команды XPENDING присутствует счетчик доставок сообщения потребителям.
//      Счетчик увеличивается двумя способами: когда сообщение успешно заявлено 
//      через XCLAIM или когда используется вызов XREADGROUP для доступа к истории 
//      ожидающих сообщений.

// Сообщение может быть доставлено несколько раз, но в конечном итоге оно будет 
//      подтверждено. Проблема может происходить, если сообщение вызывает ошибку
//      при обработке потребителем, тогда оно не может быть обработано правильно
//      ни одним потребителем. В этом случае счетчик доставок может помочь найти 
//      сообщения, которые доставляются, но по какой то причине не могут быть
//      обработаны. Для этого счетчик сравнивается с выбранным максимальным 
//      количеством попыток доставки и если это значение превышено, то сообщение 
//      может быть помещено в другой поток и отправлено уведомление администратору.
//      Так Redis Streams реализует концепцию недоставленных писем.

// --- 5.10 Streams observability.

// Потоки и группы потребителей имеют разные способы наблюдения:
//      - XPENDING позволяет проверять список сообщений, находящихся в обработке,
//           их время простоя и количество доставок;
//      - XINFO использует подкоманды для получения информацию о потоках и 
//          группах потребителей;

// Команда XINFO выводит описание с указанием поля и его значения.

// Опция STREAM сообщает информацию о потоке, а также первое и последнее сообщение:

//      > XINFO STREAM mystream
//           1) "length"
//           2) (integer) 2
//           3) "radix-tree-keys"
//           4) (integer) 1
//           5) "radix-tree-nodes"
//           6) (integer) 2
//           7) "last-generated-id"
//           8) "1638125141232-0"
//           9) "max-deleted-entryid"
//          10) "0-0"
//          11) "entries-added"
//          12) (integer) 2
//          13) "groups"
//          14) (integer) 1
//          15) "first-entry"
//          16) 1) "1638125133432-0"
//              2)  1) "message"
//                  2) "apple"
//          17) "last-entry"
//          18) 1) "1638125141232-0"
//              2)  1) "message"
//                  2) "banana"

// Опция GROUPS показывает информацию о группах потребителей потока:

//      > XINFO GROUPS mystream
//          1)   1) "name"
//               2) "mygroup"
//               3) "consumers"
//               4) (integer) 2
//               5) "pending"
//               6) (integer) 2
//               7) "last-delivered-id"
//               8) "1638126030001-0"
//               9) "entries-read"
//              10) (integer) 2
//              11) "lag"
//              12) (integer) 0
//          2)   1) "name"
//               2) "some-other-group"
//               3) "consumers"
//               4) (integer) 1
//               5) "pending"
//               6) (integer) 0
//               7) "last-delivered-id"
//               8) "1638126028070-0"
//               9) "entries-read"
//              10) (integer) 1
//              11) "lag"
//              12) (integer) 1

// Опция CONSUMERS позволяет получить описание группы потребителей:

//      > XINFO CONSUMERS mystream mygroup
//          1)  1) name
//              2) "Alice"
//              3) pending
//              4) (integer) 1
//              5) idle
//              6) (integer) 9104628
//          2)  1) name
//              2) "Bob"
//              3) pending
//              4) (integer) 1
//              5) idle
//              6) (integer) 83841983

// Справка по команде XINFO:

//      > XINFO HELP
//          1) XINFO <subcommand> [<arg> [value] [opt] ...]. Subcommands are:
//          2) CONSUMERS <key> <groupname>
//          3)     Show consumers of <groupname>.
//          4) GROUPS <key>
//          5)     Show the stream consumer groups.
//          6) STREAM <key> [FULL [COUNT <count>]
//          7)     Show information about the stream.
//          8) HELP
//          9)     Prints this help.

async function redis_xinfo() {

    // 
    const client = redis.createClient({ url: process.env.REDIS_URL });
    client.on('error', (err) => {
        console.log(`--- redis client error: ${err}`);
    });

    // 
    await client.connect();
    console.log(`--- redis: connection`);

    // 
    console.log(`--- key: mystream
        --- DEL 1 = ${await client.DEL('stream_1')}
        --- DEL 2 = ${await client.DEL('stream_2')}
    `);

    // 
    console.log(`--- key: mystream_2
        --- XADD apple      = ${await client.XADD('stream_1', '*', 'apple')}
        --- XADD orange     = ${await client.XADD('stream_2', '*', 'orange')}
        --- XGROUP_CREATE   = ${await client.XGROUP_CREATE('stream_1', 'mygroup_1', '0')}
        --- XGROUP_CREATE   = ${await client.XGROUP_CREATE('stream_2', 'mygroup_2', '0')}
        --- XREADGROUP      = ${JSON.stringify(await client.XREADGROUP('mygroup_1', 'Alice', { key: 'stream_1', id: '>' }))}
        --- XREADGROUP      = ${JSON.stringify(await client.XREADGROUP('mygroup_2', 'Bob', { key: 'stream_2', id: '>' }))}
    `);

    // 
    console.log(`--- key: XAUTOCLAIM
        --- XINFO_STREAM       = ${JSON.stringify(await client.XINFO_STREAM('stream_1'))}
        --- XINFO_STREAM       = ${JSON.stringify(await client.XINFO_STREAM('stream_2'))}
        --- XINFO_GROUPS       = ${JSON.stringify(await client.XINFO_GROUPS('stream_1'))}
        --- XINFO_GROUPS       = ${JSON.stringify(await client.XINFO_GROUPS('stream_2'))}
        --- XINFO_CONSUMERS    = ${JSON.stringify(await client.XINFO_CONSUMERS('stream_1', 'mygroup_1'))}
        --- XINFO_CONSUMERS    = ${JSON.stringify(await client.XINFO_CONSUMERS('stream_2', 'mygroup_2'))}
    `);

    //
    client.quit();
}

// --- 5.11 Ограниченные потоки.

// Максимальное количество записей в потоке позволяет избежать переполнение памяти или 
//      переместить данные из Redis в хранилище, когда заданный размер достигнут.

// Опция MAXLEN команды XADD позволяет удалять старые записи, если при добавлении
//      нового сообщения будет превышен указанный размер, так что размер потока 
//      будет постоянным.

//      > XADD mystream MAXLEN 2 * value 1
//          1526654998691-0
//      > XADD mystream MAXLEN 2 * value 2
//          1526654999635-0
//      > XADD mystream MAXLEN 2 * value 3
//          1526655000369-0
//      > XLEN mystream
//          (integer) 2
//      > XRANGE mystream - +
//          1)  1)  1526654999635-0
//              2)  1) "value"
//                  2) "2"
//          2)  1)  1526655000369-0
//              2)  1) "value"
//                  2) "3"

// В настоящее время нет возможности указать потоку сохранять элементы, которые 
//      не старше заданного периода, поскольку такая команда может блокировать 
//      выполнение в течение длительного времени при удалении записей. Например,
//      две вставки записей с одинаковым максимальным временем с длительной паузой 
//      между ними. При такой ситуации данные станут старыми после паузы и вызовут
//      блокировку для их удаления. Таким образом, пользователь должен будет
//      планировать вставку записей в поток.

// Использование MAXLEN может быть дорогостоящим, поскольку потоки представлены 
//      макроузлами в radix-дереве, чтобы очень эффективно использовать память. 
//      Изменение одного макроузла, состоящего из нескольких десятков элементов, 
//      не является оптимальным. Макроузел (macro node).

// Можно использовать команду в следующей специальной форме:

// Аргумент '~' указывает параметру MAXLEN, что максимальное количество записей
//      не обязательно должно быть равно 1000, реальное количество элементов 
//      не должно быть меньше 1000, но может составлять 1010, 1020 и более. 
//      Таким образом удаление происходит, когда может быть удален целый макроузел,
//      что делает операцию намного эффективней.

//      XADD mystream MAXLEN ~ 1000 * ... entry fields here ...

// Команда XTRIM выполняет операцию похожую на MAXLEN, но ее можно запустить отдельно.

//      > XTRIM mystream MAXLEN 10
//      > XTRIM mystream MAXLEN ~ 10

// Команда MINID удаляет записи с идентификаторами ниже указанного.

async function redis_maxlen() {

    // 
    const client = redis.createClient({ url: process.env.REDIS_URL });
    client.on('error', (err) => {
        console.log(`--- redis client error: ${err}`);
    });

    // 
    await client.connect();
    console.log(`--- redis: connection`);

    // 
    console.log(`--- key: mystream
        --- DEL 1 = ${await client.DEL('stream_1')}
        --- DEL 2 = ${await client.DEL('stream_2')}
    `);

    //      interface XAddOptions {
    //          NOMKSTREAM?: true;
    //          TRIM?: {
    //              strategy?: 'MAXLEN' | 'MINID';
    //              strategyModifier?: '=' | '~';
    //              threshold: number;
    //              limit?: number;
    //          };
    //      }

    // 
    console.log(`--- key: mystream_1
        --- XADD apple      = ${await client.XADD('stream_1', '*', 'apple', { TRIM: { strategy: 'MAXLEN', threshold: 3 } })}
        --- XADD orange     = ${await client.XADD('stream_1', '*', 'orange', { TRIM: { strategy: 'MAXLEN', threshold: 3 } })}
        --- XADD strawberry = ${await client.XADD('stream_1', '*', 'strawberry', { TRIM: { strategy: 'MAXLEN', threshold: 3 } })}
        --- XLEN            = ${await client.XLEN('stream_1')}
    `);

    // 
    console.log(`--- key: mystream_1
        --- XADD apricot    = ${await client.XADD('stream_1', '*', 'apricot', { TRIM: { strategy: 'MAXLEN', threshold: 3 } })}
        --- XLEN            = ${await client.XLEN('stream_1')}
        --- XADD banana     = ${await client.XADD('stream_1', '*', 'banana', { TRIM: { strategy: 'MAXLEN', threshold: 3 } })}
        --- XLEN            = ${await client.XLEN('stream_1')}
        --- XRANGE          = ${JSON.stringify(await client.XRANGE('stream_1', '-', '+'))}
    `);

    //      interface XTrimOptions {
    //          strategyModifier?: '=' | '~';
    //          LIMIT?: number;
    //      }

    // 
    console.log(`--- key: mystream_2
        --- XADD apple      = ${await client.XADD('stream_2', '*', 'apple')}
        --- XADD orange     = ${await client.XADD('stream_2', '*', 'orange')}
        --- XADD strawberry = ${await client.XADD('stream_2', '*', 'strawberry')}
        --- XADD apricot    = ${await client.XADD('stream_2', '*', 'apricot')}
        --- XADD banana     = ${await client.XADD('stream_2', '*', 'banana')}
        --- XLEN            = ${await client.XLEN('stream_2')}
    `);

    // 
    console.log(`--- key: mystream_1
        --- XTRIM           = ${await client.XTRIM('stream_2', 'MAXLEN', '3', { TRIM: { strategyModifier: '~', LIMIT: 3 } })}
        --- XLEN            = ${await client.XLEN('stream_2')}
    `);

    //
    client.quit();
}

// --- 5.12 Специальные идентификаторы: -+$>*.

// Идентификаторы '-' / '+' используются в запросах диапазона с помощью команды 
//      XRANGE и означают соответственно наименьший возможный идентификатор (0-1) и 
//      наибольший возможный идентификатор (18446744073709551615-18446744073709551615).

// Идентификатор '$' означает наибольший идентификатор внутри потока. Например, чтобы
//      получать только новые записи с помощью команды XREADGROUP или при создании 
//      группы потребителей, чтобы доставлять только новые записи потребителям.

// Идентификатор '>' относится только к группам потребителей и только при использовании 
//      команды XREADGROUP. Этот идентификатор позволяет получать только те записи, 
//      которые не были доставлены потребителям.

// Идентификатор '*' используется только с командой XADD и означает автоматический выбор 
//      идентификатора для новой записи.

// --- 5.13 Репликация.

// Потоки асинхронно реплицируются в файлы AOF и RDB. Также реплицируюется состояния 
//      групп потребителей, то есть после перезапуска, AOF восстановит состояние 
//      групп потребителей.

// Потоки и группы потребителей Redis сохраняются и реплицируются с использованием 
//      репликации Redis по умолчанию, поэтому:
// - AOF следует использовать со строгой политикой fsync, если важна сохраняемость 
//      сообщений;
// - по умолчанию асинхронная репликация не гарантирует, что команды XADD или изменения 
//      состояния групп потребителей будут реплицированы: после отработки отказа что-то 
//      может отсутствовать в зависимости от способности реплик получать данные от мастера;
// - команда WAIT может использоваться для принудительного распространения изменений 
//      на реплики, хотя это делает потерю данных маловероятной, но не исключает полностью. 

// --- 5.14 Удаление записей из потока.

// Команда XDEL позволяет удалять записи из середины потока по идентификатору. Но после
//      удаления память не освобождается до тех пор, пока макроузел не станет полностью 
//      пустым, поэтому не следует злоупотреблять этой функцией.

//      > XRANGE mystream - + COUNT 2
//          1)  1)  1526654999635-0
//              2)  1) "value"
//                  2) "2"
//          2)  1)  1526655000369-0
//              2)  1) "value"
//                  2) "3"
//      > XDEL mystream 1526654999635-0
//          (integer) 1
//      > XRANGE mystream - + COUNT 2
//          1)  1)  1526655000369-0
//              2)  1) "value"
//                  2) "3"

async function redis_maxlen() {

    // 
    const client = redis.createClient({ url: process.env.REDIS_URL });
    client.on('error', (err) => {
        console.log(`--- redis client error: ${err}`);
    });

    // 
    await client.connect();
    console.log(`--- redis: connection`);

    // 
    console.log(`--- key: mystream
        --- DEL 1 = ${await client.DEL('stream_1')}
        --- DEL 2 = ${await client.DEL('stream_2')}
    `);

    // 
    let mes_1 = await client.XADD('stream_1', '*', 'apple');
    let mes_2 = await client.XADD('stream_1', '*', 'orange');
    let mes_3 = await client.XADD('stream_1', '*', 'strawberry');
    let mes_4 = await client.XADD('stream_1', '*', 'apricot');
    let mes_5 = await client.XADD('stream_1', '*', 'banana');
    console.log(`--- key: mystream_1
        --- XADD apple      = ${mes_1}
        --- XADD orange     = ${mes_2}
        --- XADD strawberry = ${mes_3}
        --- XADD apricot    = ${mes_4}
        --- XADD banana     = ${mes_5}
        --- XLEN            = ${await client.XLEN('stream_1')}
        --- XRANGE          = ${JSON.stringify(await client.XRANGE('stream_1', '-', '+', { COUNT: 5 }))}
    `);

    // 
    console.log(`--- key: mystream_1
        --- XDEL            = ${await client.XDEL('stream_1', mes_1)}
        --- XDEL            = ${await client.XDEL('stream_1', mes_2)}
        --- XLEN            = ${await client.XLEN('stream_1')}
        --- XRANGE          = ${JSON.stringify(await client.XRANGE('stream_1', '-', '+', { COUNT: 5 }))}
    `);

    //
    client.quit();
}

// --- 5.15 Потоки нулевой длины.

// Разница между потоками и другими структурами данных Redis заключается в том, что 
//      при удалении элементов в других структурах также удаляется и ключ, но потоки
//      могут продолжать существовать пустыми после вызова XDEL или вызова команд
//      XADD/XTRIM с опцией MAXLEN и нулевым счетчиком. Причина такого поведения
//      в том, что потоки могут иметь связанные группы потребителей и требуется
//      сохранять состояние этих групп даже при отсутствии записей в потоке. Поток
//      не удаляется даже, если у него нет связанных групп потребителей.

// --- 5.16 Общая задержка потребления сообщения.

// Потоковые команды, такие как XRANGE, XREAD и XREADGROUP без опции BLOCK выполняются
//      синхронно. 

// Потоковые команды при извлечении диапазона работают как минимум так же быстро, 
//      как и команды упорядоченных множеств. Команда XADD очень быстрая и может 
//      легко вставлять от полумиллиона до миллиона элементов в секунду на средней 
//      машине, если используется конвейерная обработка.

// Задержка выполнения операция является интересным параметром в контексте блокировки 
//      потребителей в группе потребителей.

// --- 5.17 Модель Redis для маршрутизации потоковых сообщений.

// Ключи потоков, для которых существует хотя бы один блокирующий потребитель, 
//      сопоставляются со списокм потребителей через хэш-таблицу, таким образом, 
//      когда поток получает данные можно определить всех его потребителей. 

// Когда происходит запись сообщения в поток (команда XADD) вызывается функция 
//      signalKeyAsReady. Эта функция помещает ключ в список обрабатываемых ключей, 
//      поскольку такие ключи могут иметь новые данные для заблокированных потребителей.

// Прежде чем вернуться в цикл событий, для каждого ключа сканируется список клиентов, 
//      ожидающих данные и по возможности клиентам передаются новые данные. В случае 
//      потоков данные представляют собой сообщения в диапазоне, запрошенном потребителем.

// То есть прежде чем вернуться в цикл событий, как клиент вызывающий XADD, так и клиенты 
//      заблокированные для приема сообщений, будут иметь свой ответ в выходных буферах, 
//      поэтому вызывающий XADD должен получить ответ от Redis примерно в то же самое 
//      время, когда потребители получат новые сообщения.

// Добавление данных в буферы потребителей выполняется непосредственно при помощи вызова 
//      XADD, поэтому задержка вполне предсказуема.

// --- 5.18 Тесты задержек.

// Сообщения создавались со скоростью 10000 в секунду, при этом десять потребителей 
//      одновременно потребляли и подтверждали сообщения из одного и того же потока 
//      Redis и группы потребителей.

//      Processed between 0 and 1 ms -> 74.11%
//      Processed between 1 and 2 ms -> 25.80%
//      Processed between 2 and 3 ms -> 0.06%
//      Processed between 3 and 4 ms -> 0.01%
//      Processed between 4 and 5 ms -> 0.02%

// Добавление в поток нескольких миллионов неподтвержденных сообщений не меняет сути 
//      теста, поскольку большинство запросов по-прежнему обрабатываются с очень 
//      короткой задержкой.

// --- Запуск.

(async () => {
    await redis_streams_base();
    await redis_xrange();
    await redis_xread();
    await redis_xgroup();
    await redis_xpending();
    await redis_xautoclaim();
    await redis_xinfo();
    await redis_maxlen();
})();