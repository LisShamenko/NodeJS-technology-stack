"use strict";

const redis = require("redis");



// --------------- 1. Data types.

//      https://redis.io/topics/data-types-intro

// Redis — это не просто хранилище 'ключ/значение', а фактически сервер структур 
//      данных, поддерживающий различные виды значений, то есть в Redis значение 
//      не ограничивается простой строкой и может содержать более сложные структуры 
//      данных. 

// Список всех структур данных, поддерживаемых Redis:
// - Binary-safe (бинарно-безопасные строки);
// - List (список) - коллекция строк в порядке их вставки. В основном это связанные 
//      списки;
// - Set (множество) - массив уникальных несортированных строк;
// - Sorted set (отсортированное множество) - множество, в котором каждому элементу
//      соответсвует значение с плавающей точкой (score). Элементы сортируются 
//      по значению score, можно получить диапазон элементов;
// - Hashe (хэши) - коллекции состоящие из полей, связанных со значениями. 
// - Bit array (битовые массивы) - так же называются растровыми изображениями, 
//      позволяют обрабатывать строки, как массив битов: установка значений 
//      отдельных битов, подсчет битов, поиск битов и прочее.
// - HyperLogLog - вероятностная структура данных, которая используется для оценки 
//      мощности множества. 
// - Stream (потоки) - read-only коллекция для добавления map-like записей, которые 
//      предоставляют абстрактный тип данных журнала.

// --- 1.1 Ключи.

// Допустимым ключом может быть любая двоичная последовательность в качестве ключа:
//      от строки, в том числе пустая строка, до содержимого файла JPEG. 

// Общие рекомендации:
// - Следует использовать короткие ключи, поскольку поиск ключей требует дорогостоящих 
//      сравнений ключей. Для поиска длинных ключей, с точки зрения используемой 
//      памяти и пропускной способности, эффективнее использовать хеширование.
// - Слишком короткие ключи могут оказаться не удобными для чтения, рекомендуется 
//      использовать ключи следующего вида: 'user:1000:followers', 'comment:1234:reply.to', 
//      'comment:1234:reply-to'.
// - Максимально допустимый размер ключа составляет 512 МБ.

// --- 1.2 Строки.

// Строки - это самый простой тип значения в Redis, который можно использовать в качестве 
//      ключа. Строки полезны для кэширования фрагментов HTML.

// Команда SET/GET устанавливает/получает строку. SET заменит любое значение, сохраненное 
//      в ключе, даже если ключ связан с другим типом данных. Значения могут иметь любой 
//      тип, например, изображение в формате jpeg, но не может превышать 512 МБ.

//      > set mykey somevalue
//          OK
//      > get mykey
//          "somevalue"

// Параметр newval приводит к завершению SET с ошибкой, если ключ уже существует или нет.

//      > set mykey newval nx
//          (nil)
//      > set mykey newval xx
//          OK

// Команда INCR анализирует строку как целое число и увеличивает его на единицу. Другие 
//      атомарные операции: INCRBY, DECR и DECRBY. Атомарные операции позволяют клиентам
//      избежать ситауции состояния гонки: два клиента одновременно считывают значение 10 и 
//      одновременно устанавливают новое значение 11, то есть финальное значение всегда 
//      будет 12.

//      > set counter 100
//          OK
//      > incr counter
//          (integer) 101
//      > incr counter
//          (integer) 102
//      > incrby counter 50
//          (integer) 152

// Команды MSET/MGET позволяют установить/получить значения нескольких ключей за раз.
//
//      > mset a 10 b 20 c 30
//          OK
//      > mget a b c
//          1) "10"             MGET возвращает массив значений
//          2) "20"
//          3) "30"

async function redis_strings() {

    // 
    const client = redis.createClient({ url: process.env.REDIS_URL });
    client.on('error', (err) => {
        console.log(`--- redis client error: ${err}`);
    });

    // 
    await client.connect();
    console.log(`--- redis: connection`);

    // 
    console.log(`--- key: setget
        --- SET = ${await client.SET('setget', `current date: ${(new Date()).toTimeString()}`)}
        --- GET = ${await client.GET('setget')} 
    `);

    //
    console.log(`--- key: setnx 
        --- SET NX = ${await client.SET('setnx', 'FIRST', { NX: true })}
        --- GET = ${await client.GET('setnx')}
    `);

    //
    console.log(`--- key: setxx 
        --- SET = ${await client.SET('setxx', 'FIRST')}
        --- SET XX = ${await client.SET('setxx', 'SECOND', { XX: true })}
        --- GET = ${await client.GET('setxx')}
    `);

    //
    console.log(`--- key: setincr 
        --- SET = ${await client.SET('setincr', '100')}
        --- INCR = ${await client.INCR('setincr')}
        --- INCR = ${await client.INCR('setincr')}
        --- INCR = ${await client.INCR('setincr')}
    `);

    //
    console.log(`--- key: mset_1 mget_2
        --- MSET = ${await client.MSET({ mset_1: '100', mget_2: '200' })}
        --- MGET = ${await client.MGET(['mset_1', 'mget_2'])}
    `);

    //
    client.quit();
}

// --- 1.3 Key space.

// Команда EXISTS позволяет определить существование ключа, возвращает 1 или 0. Команда DEL 
//      удаляет ключ и связанное с ним значение, возвращает 1 или 0.

//      > set mykey hello
//          OK
//      > exists mykey
//          (integer) 1
//      > del mykey
//          (integer) 1
//      > exists mykey
//          (integer) 0

// Команда TYPE возвращает тип значения, хранящегося в указанном ключе.

//      > set mykey x
//          OK
//      > type mykey
//          string
//      > del mykey
//          (integer) 1
//      > type mykey
//          none

async function redis_key_space() {

    // 
    const client = redis.createClient({ url: process.env.REDIS_URL });
    client.on('error', (err) => {
        console.log(`--- redis client error: ${err}`);
    });

    // 
    await client.connect();
    console.log(`--- redis: connection`);

    // 
    console.log(`--- key: existskey
        --- SET = ${await client.SET('existskey', `hello`)}
        --- EXISTS = ${await client.EXISTS('existskey')}
        --- DEL = ${await client.DEL('existskey')} 
        --- EXISTS = ${await client.EXISTS('existskey')}
    `);

    // 
    console.log(`--- key: typekey
        --- SET = ${await client.SET('typekey', `FIO`)}
        --- TYPE = ${await client.TYPE('typekey')}
        --- DEL = ${await client.DEL('typekey')} 
        --- TYPE = ${await client.TYPE('typekey')}
    `);

    //
    client.quit();
}

// --- 1.4 Expires - ключи с ограниченным сроком жизни.

// Expires позволяет установить Timeout для ключа, который является ограничивает время
//      жизни ключа. Когда время жизни истекает, ключ автоматически уничтожается, что
//      аналогично использования команды DEL с ключом.

// Timeout можно установить с точностью до секунды или миллисекунды. Разрешение Timeout
//      составляет одну миллисекунду. Redis сохраняет дату истечения срока действия ключа
//      на диске, то есть Timeout истекает даже, если сервер Redis остановлен.

//      > set key some-value
//          OK
//      > expire key 5
//          (integer) 1         устанавливаем срок действия
//      > get key (immediately)
//          "some-value"
//      > get key 
//          (nil)               после 5 секунд ожидания

// Команда PERSIST удаляет срок действия ключа. Команда SET может использоваться 
//      для установки срока действия ключа. Команды PEXPIRE/PTTL позволяют устанавливать
//      и проверять срок действия в миллисекундах.

//      > set key 100 ex 10
//          OK                  установить срок действия ключа
//      > ttl key
//          (integer) 9         проверка оставшегося времени жизни ключа

async function redis_key_space() {

    // 
    const client = redis.createClient({ url: process.env.REDIS_URL });
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
        --- SET = ${await client.SET('expirekey', `hi-hi`)}
        --- EXISTS = ${await client.EXPIRE('expirekey', 1)}
        --- GET = ${await client.GET('expirekey')} 
        --- ${await waitKey('expirekey', 200)}
        --- ${await waitKey('expirekey', 1001)}
    `);

    // 
    console.log(`--- key: setexkey
        --- SET = ${await client.SET('setexkey', `hi-hi`)}
        --- EXISTS = ${await client.EXPIRE('setexkey', 1)}
        --- GET = ${await client.GET('setexkey')} 
        --- ${await waitKey('setexkey', 200)}
        --- ${await waitKey('setexkey', 1001)}
    `);

    //
    client.quit();
}

// --- 1.5 Списки.

// Список - это последовательность упорядоченных элементов: 10, 20, 1, 2, 3. Списки Redis 
//      реализованы через связанные списки, поскольку для системы баз данных важно иметь 
//      возможность очень быстро добавлять элементы в очень длинный список. Добавление 
//      нового элемента в начало или конец списка выполняется за константное время и 
//      не зависит от размера списка. 

// Свойства списка, реализованного с помощью массива, сильно отличаются от свойств списка, 
//      реализованного с помощью связанного списка. Доступ к элементу по индексу выполняется 
//      очень быстро в списках, реализованных с помощью массива, но для связанных списков 
//      эта операция требует объема работы, пропорционального индексу элемента, к которому 
//      осуществляется доступ. Для быстрого доступа к середине большой коллекции элементов 
//      следует использовать сортируемое множество. 

// Команда LPUSH позволяет добавлять элементы в начало списка. Команда RPUSH добавляет 
//      новый элемент в конец список. 

// Команда LRANGE извлекает диапазон элементов из списков. Принимает два индекса: первый и 
//      последний возвращаемый элемент диапазона. Отрицательные индексы отсчитываются с конца
//      списка, так индекс последнего элемента равен -1. Команда LRANGE технически является 
//      командой O(N), но доступ к небольшим диапазонам в начале или конце списка является 
//      операцией с постоянным временем работы O(1).

//      > rpush mylist A
//          (integer) 1
//      > rpush mylist B
//          (integer) 2
//      > lpush mylist first
//          (integer) 3
//      > lrange mylist 0 -1
//          1) "first"              
//          2) "A"
//          3) "B"

// Команды LPUSH и RPUSH являются вариативными (variadic commands), то есть позволяет поместить 
//      несколько элементов в список за один вызов.

//      > rpush mylist 1 2 3 4 5 "foo bar"
//          (integer) 9
//      > lrange mylist 0 -1
//          1) "first"
//          2) "A"
//          3) "B"
//          4) "1"
//          5) "2"
//          6) "3"
//          7) "4"
//          8) "5"
//          9) "foo bar"

// Команда RPOP позволяет извлечь и удалить элемент из списка. 

//      > rpush mylist a b c
//          (integer) 3         добавить три элемента
//      > rpop mylist
//          "c"
//      > rpop mylist
//          "b"
//      > rpop mylist
//          "a"                 и последовательно их извлечь 
//      > rpop mylist
//          (nil)               nil сигнализирует об отсутствии элементов в списке

// Список используется при реализация шаблона 'потребитель-производитель', в котором 
//      производитель помещает элементы в список, а потребитель изымает и выполняет 
//      работу. Например, для ускорения отображения последней фотографии, опубликованной 
//      в сети: идентификатор добавляется в список с помощью LPUSH, когда пользователь 
//      публикует фотографию и изымается из списка с фотографией при помощи команды 
//      LRANGE, когда пользователь просматривает страницу.

async function redis_list() {

    // 
    const client = redis.createClient({ url: process.env.REDIS_URL });
    client.on('error', (err) => {
        console.log(`--- redis client error: ${err}`);
    });

    // 
    await client.connect();
    console.log(`--- redis: connection`);

    // 
    console.log(`--- key: multi_list_key
        --- DEL = ${await client.DEL('multi_list_key')}
        --- RPUSH = ${await client.RPUSH('multi_list_key', 'A')}
        --- RPUSH = ${await client.RPUSH('multi_list_key', 'B')}
        --- LPUSH = ${await client.LPUSH('multi_list_key', 'first')}
        --- LRANGE = ${await client.LRANGE('multi_list_key', 0, -1)}
    `);

    // 
    console.log(`--- key: multi_list_key
        --- DEL = ${await client.DEL('multi_list_key')}
        --- RPUSH = ${await client.RPUSH('multi_list_key', ['1', '2', '3', '4', '5', 'foo bar'])}
        --- LRANGE = ${await client.LRANGE('multi_list_key', 0, -1)}
    `);

    // 
    console.log(`--- key: rpop_list_key
        --- DEL = ${await client.DEL('rpop_list_key')}
        --- RPUSH = ${await client.RPUSH('rpop_list_key', ['a', 'b', 'c'])}
        --- RPOP = ${await client.RPOP('rpop_list_key')}
        --- RPOP = ${await client.RPOP('rpop_list_key')}
        --- RPOP = ${await client.RPOP('rpop_list_key')}
        --- RPOP = ${await client.RPOP('rpop_list_key')}
    `);

    //
    client.quit();
}

// --- 1.6 Ограниченные списки.

// Redis позволяет нам использовать списки как ограниченную коллекцию, запоминая только 
//      последние N элементов и отбрасывая все самые старые элементы с помощью команды 
//      LTRIM. Команда LTRIM устанавливает диапазон в качестве нового значения списка, 
//      все элементы вне заданного диапазона удаляются.

//      > rpush mylist 1 2 3 4 5
//          (integer) 5
//      > ltrim mylist 0 2
//          OK                      выбираются элементы с индексом от 0 до 2
//      > lrange mylist 0 -1
//          1) "1"                  LRANGE позволяет получить доступ к элементам 
//          2) "2"                  без необходимости запоминать старые данные
//          3) "3"

// Полезным шаблоном является совместное использование операций LPUSH и LTRIM. Эта 
//      комбинация добавляет новые элементы в список и отбросывает элементы, 
//      превышающие лимит:

//      LPUSH mylist <some element>
//      LTRIM mylist 0 999

async function redis_limited_list() {

    // 
    const client = redis.createClient({ url: process.env.REDIS_URL });
    client.on('error', (err) => {
        console.log(`--- redis client error: ${err}`);
    });

    // 
    await client.connect();
    console.log(`--- redis: connection`);

    // 
    console.log(`--- key: ltrim_list_key
        --- DEL = ${await client.DEL('ltrim_list_key')}
        --- RPUSH = ${await client.RPUSH('ltrim_list_key', [1, 2, 3, 4, 5])}
        --- LTRIM = ${await client.LTRIM('ltrim_list_key', 0, 2)}
        --- LRANGE = ${await client.LRANGE('ltrim_list_key', 0, -1)}
    `);

    // 
    console.log(`--- key: ltrim_list_key
        --- LPUSH = ${await client.LPUSH('ltrim_list_key', [0, -1, -2, -3, -4])}
        --- LTRIM = ${await client.LTRIM('ltrim_list_key', 0, 5)}
        --- LRANGE = ${await client.LRANGE('ltrim_list_key', 0, -1)}
        --- LPUSH = ${await client.LPUSH('ltrim_list_key', [-5, -6, -7, -8, -9])}
        --- LTRIM = ${await client.LTRIM('ltrim_list_key', 0, 5)}
        --- LRANGE = ${await client.LRANGE('ltrim_list_key', 0, -1)}
    `);

    //
    client.quit();
}

// --- 1.7 Блокировка операций со списками.

// Шаблон 'производитель/потребитель': элементы помещаются в список в одном процессе и 
//      используются в другом процессе, который выполняет полезную работу над этими 
//      элементами.
//      - производители вызывают LPUSH, чтобы поместить элементы в список;
//      - потребители вызывают RPOP, чтобы извлечь элементы из списка и обработать;

// Команда RPOP будет возвращать NULL, если в списке не окажется элементов. В этом случае
//      потребитель повторит попытку через некоторое время, что является алгоритмом
//      опроса с рядом недостатков:
//      - сервер Redis и клиенты будут обрабатывать бесполезные команды, команда RPOP 
//          будет возвращать NULL;
//      - задержка при обработке элементов списка, при получении NULL рабочий процесс 
//          будет делать паузу перед следующей попыткой вызова команды RPOP;

// Команды BRPOP/BLPOP являются блокирующими версиями команд RPOP/LPOP, которые
//      возвращают управление, когда в список добавляется новый элемент или когда 
//      истекает указанная временная задержка. Для вечного ожидания новых элементов 
//      следует передать 0 в качестве временной задержки. Можно указать несколько 
//      списков для ожидания.

//      > brpop tasks 5
//          1) "tasks"              ожидает новые элементы в списке tasks, 
//          2) "do_something"

// Замечания о BRPOP:
//      - клиенты обслуживаются в порядке блокировки: первый клиент, блокирующий список,
//          обслуживается первым, когда в список добавляется элемент;
//      - команды BRPOP/BLPOP возвращают массив из двух элементов: имя ключа и значение
//          извлеченного элемента;
//      - если время ожидания достигнуто, возвращается NULL;

// Команда LMOVE может создавать более безопасные очереди или чередующиеся очереди. 
//      Команда BLMOVE является блокирующей версией LMOVE.

// клиент_1: 
//      > lrange ltrim_list_key 0 -1
//          (empty array)                   список пуст
// клиент_2: 
//      > brpop ltrim_list_key 10
//                                          клиент_2 ожидает новое сообщение
// клиент_1: 
//      > lpush ltrim_list_key 1
//          (integer) 1                     клиент_1 добавляет сообщение в список
// клиент_2: 
//      > brpop ltrim_list_key 10
//          1) "ltrim_list_key"             клиент_2 извлекает сообщение после ожидания
//          2) "1"
//          (5.51s)
// клиент_1: 
//      > lrange ltrim_list_key 0 -1
//          (empty array)                   список снова пуст

async function redis_blocking_list() {

    //
    const waitKey = async (key, time) => new Promise((resolve, reject) => {
        setTimeout(async () => {

            // 
            const client_1 = redis.createClient({ url: process.env.REDIS_URL });
            client_1.on('error', (err) => {
                console.log(`--- redis client_1 error: ${err}`);
            });

            // 
            await client_1.connect();
            console.log(`--- redis client_1: connection`);

            //
            console.log(`--- key client_1: ${key}
                --- клиент_1 --- RPUSH = ${await client_1.RPUSH(key, 1)}
            `);

            // 
            client_1.quit();
            resolve();

        }, time);
    });

    // 
    const client_2 = redis.createClient({ url: process.env.REDIS_URL });
    client_2.on('error', (err) => {
        console.log(`--- redis client_2 error: ${err}`);
    });

    // 
    await client_2.connect();
    console.log(`--- redis client_2: connection`);

    // 
    console.log(`--- key client_2: brpop_list_key
        --- DEL = ${await client_2.DEL('brpop_list_key')}
    `);

    //
    waitKey('brpop_list_key', 200);

    // 
    console.log(`--- key client_2: brpop_list_key
        --- клиент_2 --- BRPOP = ${JSON.stringify(await client_2.BRPOP('brpop_list_key', 100))}
    `);

    //
    client_2.quit();
}

// --- 1.8 Автоматическое создание и удаление ключей.

// Redis удаляет ключ, когда список становится пустым и создает пустой список, если ключ 
//      не существует и делается попытка добавления нового элемента. Эти правила относяться
//      ко всем составным типам данных: потокам, множествам и хэшам. 

// Существует три правила:
// 1. При добавлении элемента к составному типу данных, если целевой ключ не существует, 
//      перед добавлением элемента создается пустой тип данных. 
// 2. При удалении элементов из составного типа данных, если значение остается пустым, 
//      ключ автоматически уничтожается, но Stream является исключением из этого правила.
// 3. Команды read-only (LLEN) или команды изымающие элементы (LPOP), выполняющиеся 
//      над отсутствующим ключом дают результат, как если бы ключ содержал пустой 
//      составной тип данных.

// Правило 1:

//      > del mylist
//          (integer) 1
//      > lpush mylist 1 2 3
//          (integer) 3

// Однако нельзя выполнять операции с неправильным типом, если ключ существует:

//      > set foo bar
//          OK
//      > lpush foo 1 2 3
//          (error) WRONGTYPE Operation against a key holding the wrong kind of value
//      > type foo
//          string

// Правило 2:

//      > lpush mylist 1 2 3
//          (integer) 3
//      > exists mylist
//          (integer) 1
//      > lpop mylist
//          "3"
//      > lpop mylist
//          "2"
//      > lpop mylist
//          "1"
//      > exists mylist
//          (integer) 0             ключ не существует после извлечения всех элементов

// Правило 3:

//      > del mylist
//          (integer) 0
//      > llen mylist
//          (integer) 0
//      > lpop mylist
//          (nil)

async function redis_keys() {

    // 
    const client = redis.createClient({ url: process.env.REDIS_URL });
    client.on('error', (err) => {
        console.log(`--- redis client error: ${err}`);
    });

    // 
    await client.connect();
    console.log(`--- redis: connection`);

    // Правило 1

    // 
    console.log(`--- key: rule_1_list_key
        --- DEL = ${await client.DEL('rule_1_list_key')}
        --- RPUSH = ${await client.RPUSH('rule_1_list_key', [1, 2, 3, 4, 5])}
        --- LRANGE = ${await client.LRANGE('rule_1_list_key', 0, -1)}
    `);

    // 
    try {
        console.log(`--- key: rule_1_foo
            --- SET = ${await client.SET('rule_1_foo', 'bar')}
            --- LPUSH = ${await client.LPUSH('rule_1_foo', [1, 2, 3, 4, 5])}
            --- TYPE = ${await client.TYPE('rule_1_foo')}
        `);
    }
    catch (err) {
        console.log(`--- err: ${err}`);
    }

    // Правило 2

    // 
    console.log(`--- key: rule_2_list_key
        --- DEL = ${await client.DEL('rule_2_list_key')}
        --- LPUSH = ${await client.LPUSH('rule_2_list_key', [1, 2, 3])}
        --- EXISTS = ${await client.EXISTS('rule_2_list_key', 0, -1)}
        --- LPOP = ${await client.LPOP('rule_2_list_key')}
        --- LPOP = ${await client.LPOP('rule_2_list_key')}
        --- LPOP = ${await client.LPOP('rule_2_list_key')}
        --- EXISTS = ${await client.EXISTS('rule_2_list_key', 0, -1)}
    `);

    // Правило 3:

    // 
    console.log(`--- key: rule_3_list_key
        --- DEL = ${await client.DEL('rule_3_list_key')}
        --- LLEN = ${await client.LLEN('rule_3_list_key')}
        --- LPOP = ${await client.LPOP('rule_3_list_key')}
    `);

    //
    client.quit();
}

// --- 1.9 Хэши.

// Хэши являются парами 'поле-значение'. Небольшие хэши особым образом кодируются 
//      в памяти, что делает их очень эффективными с точки зрения памяти.

//      > hmset user:1000 username antirez birthyear 1977 verified 1
//          OK
//      > hget user:1000 username
//          "antirez"
//      > hget user:1000 birthyear
//          "1977"
//      > hgetall user:1000
//          1) "username"
//          2) "antirez"
//          3) "birthyear"
//          4) "1977"
//          5) "verified"
//          6) "1"

// Хэши удобны для представления объектов, количество полей в хэше не имеет ограничения
//      кроме доступной памяти. Команда HMSET устанавливает несколько полей хеша.
//      Команда HGET извлекает одно поле. HMGET возвращает массив значений.

//      > hmget user:1000 username birthyear no-such-field
//          1) "antirez"
//          2) "1977"
//          3) (nil)

// Операции можно выполнять над отдельными полями, например HINCRBY:

//      > hincrby user:1000 birthyear 10
//          (integer) 1987
//      > hincrby user:1000 birthyear 10
//          (integer) 1997

async function redis_hashes() {

    // 
    const client = redis.createClient({ url: process.env.REDIS_URL });
    client.on('error', (err) => {
        console.log(`--- redis client error: ${err}`);
    });

    // 
    await client.connect();
    console.log(`--- redis: connection`);

    // 
    console.log(`--- key: user:1000
        --- DEL = ${await client.DEL('user:1000')}
        --- HSET = ${await client.HSET('user:1000', { username: "antirez", birthyear: "1977", verified: "1" })}
        --- HGET = ${await client.HGET('user:1000', 'username')}
        --- HGET = ${await client.HGET('user:1000', 'birthyear')}
        --- HGETALL = ${JSON.stringify(await client.HGETALL('user:1000'))}
    `);

    // 
    console.log(`--- key: user:1000
        --- HMGET = ${await client.HMGET('user:1000', 'birthyear', 'no-such-field')}
    `);

    // 
    console.log(`--- key: user:1000
        --- HINCRBY = ${await client.HINCRBY('user:1000', 'birthyear', 10)}
    `);

    //
    client.quit();
}

// --- 1.10 Множества.

// Множества - это неупорядоченные массивы уникальных строк. Команда SADD добавляет 
//      во множество новые элементы. Над множествами можно выполнять стандартные 
//      операции множеств: пересечение, объединение и прочее. 

// Redis может возвращать элементы множества в любом порядке при каждом вызове:

//      > sadd myset 1 2 3
//          (integer) 3
//      > smembers myset
//          1. 3                    элементы не отсортированы
//          2. 1
//          3. 2

// Проверка существования элемента:

//      > sismember myset 3
//          (integer) 1             3 входит в множество
//      > sismember myset 30
//          (integer) 0             30 не входит в множество

// Множества хороши для реализации системы тегов. Каждый объект должен иметь множество
//      тегов, которые с ним связаны. Теги могут определять отношения между объектами.
//      Например, пометка новостных статей. Статья с идентификатором 1000 помечена тегами 
//      [1, 2, 5, 77], которые связывают ее с новостями. 

//      > sadd news:1000:tags 1 2 5 77
//          (integer) 4

// Ообратное отношение: список всех новостей, помеченных данным тегом. Предполагается
//      наличие структуры для сопоставления идентификаторов тегов с именами тегов:
//      [1, 2, 5, 77] => [tag:1:news, tag:2:news, tag:5:news, tag:77:news].

//      > sadd tag:1:news 1000
//          (integer) 1
//      > sadd tag:2:news 1000
//          (integer) 1
//      > sadd tag:5:news 1000
//          (integer) 1
//      > sadd tag:77:news 1000
//          (integer) 1

// Получить все теги для данного объекта:

//      > smembers news:1000:tags
//          1. 5
//          2. 1
//          3. 77
//          4. 2

// Список всех объектов с тегами [1, 2, 5, 77]. Команда SINTER выполняет пересечение 
//      между различными множествами.

//      > sinter tag:1:news tag:2:news tag:10:news tag:27:news
//          ... results here ...

// Модель колоды карт, где C - lubes, D - ромбов, H - earts, S - pades:

//      > sadd deck C1 C2 C3 C4 C5 C6 C7 C8 C9 C10 CJ CQ CK
//        D1 D2 D3 D4 D5 D6 D7 D8 D9 D10 DJ DQ DK H1 H2 H3
//        H4 H5 H6 H7 H8 H9 H10 HJ HQ HK S1 S2 S3 S4 S5 S6
//        S7 S8 S9 S10 SJ SQ SK
//          (integer) 52

// Команда SUNIONSTORE выполняет объединение нескольких множеств или копирует одно
//      множество по новому ключу. Сделать копию колоды карт:

//      > sunionstore game:1:deck deck
//          (integer) 52

// Команда SPOP извлекает элемент из множества. Команда SPOP удаляет случайный элемент, 
//      возвращая его клиенту. Раздача пяти карт:

//      > spop game:1:deck
//          "C6"                     
//      > spop game:1:deck
//          "CQ"
//      > spop game:1:deck
//          "D1"
//      > spop game:1:deck
//          "CJ"
//      > spop game:1:deck
//          "SJ"

// Команда SCARD показывает количество элементов внутри множества. В теории множеств
//      это называется кардинальностью множества, поэтому команда Redis называется SCARD.
//      Команда SRANDMEMBER позволяет получить случайные элементы, не удаляя их 
//      из множества, то есть элементы могут возвращаться повторно.

//      > scard game:1:deck
//          (integer) 47                52 - 5 = 47

async function redis_sets() {

    // 
    const client = redis.createClient({ url: process.env.REDIS_URL });
    client.on('error', (err) => {
        console.log(`--- redis client error: ${err}`);
    });

    // 
    await client.connect();
    console.log(`--- redis: connection`);

    // 
    console.log(`--- key: sets_key
        --- SADD = ${await client.SADD('sets_key', [1, 2, 3])}
        --- SMEMBERS = ${await client.SMEMBERS('sets_key')}
    `);

    // 
    console.log(`--- key: sets_key
        --- SISMEMBER = ${await client.SISMEMBER('sets_key', 3)}
        --- SISMEMBER = ${await client.SISMEMBER('sets_key', 30)}
    `);

    // 
    console.log(`--- key: news:1000:tags
        --- SADD = ${await client.SADD('news:1000:tags', [1, 2, 5, 77])}
        --- SADD = ${await client.SADD('tag:1:news', 1000)}
        --- SADD = ${await client.SADD('tag:2:news', 1000)}
        --- SADD = ${await client.SADD('tag:5:news', 1000)}
        --- SADD = ${await client.SADD('tag:77:news', 1000)}
        --- SINTER = ${await client.SINTER('news:1000:tags')}
    `);

    // 
    const cards = [
        'C1', 'C2', 'C3', 'C4', 'C5', 'C6', 'C7', 'C8', 'C9', 'C10', 'CJ', 'CQ', 'CK',
        'D1', 'D2', 'D3', 'D4', 'D5', 'D6', 'D7', 'D8', 'D9', 'D10', 'DJ', 'DQ', 'DK',
        'H1', 'H2', 'H3', 'H4', 'H5', 'H6', 'H7', 'H8', 'H9', 'H10', 'HJ', 'HQ', 'HK',
        'S1', 'S2', 'S3', 'S4', 'S5', 'S6', 'S7', 'S8', 'S9', 'S10', 'SJ', 'SQ', 'SK',
    ];
    console.log(`--- key: deck -> game:1:deck
        --- SADD = ${await client.SADD('deck', cards)}
        --- SUNIONSTORE = ${await client.SUNIONSTORE('game:1:deck', 'deck')}
        --- SPOP = ${await client.SPOP('game:1:deck')}
        --- SPOP = ${await client.SPOP('game:1:deck')}
        --- SPOP = ${await client.SPOP('game:1:deck')}
        --- SPOP = ${await client.SPOP('game:1:deck')}
        --- SPOP = ${await client.SPOP('game:1:deck')}
        --- SCARD = ${await client.SCARD('game:1:deck')}
    `);

    //
    client.quit();
}

// --- 1.11 Упорядоченные множества.

// Упорядоченные множества - это массивы уникальных отсортированных строковых элементов. 
//      Каждый элемент в отсортированном множестве связан со значением с плавающей 
//      запятой score. Элементы сортируются не при запросе, сортировка является 
//      свойством упорядоченного множества. 

// Правила сортировки:
//      - если A и B имеют разные score, то A > B, если A.score > B.score;
//      - если A и B имеют одинаковую score, то A > B, если строка A лексикографически 
//          больше, чем строка B; 
//      - строки A и B не могут быть равными, поскольку отсортированные множества
//          содержат только уникальные элементы;

// Добавить имена с годами в качестве значений score:

//      > zadd hackers 1940 "Alan Kay"
//          (integer) 1
//      > zadd hackers 1957 "Sophie Wilson"
//          (integer) 1
//      > zadd hackers 1953 "Richard Stallman"
//          (integer) 1
//      > zadd hackers 1949 "Anita Borg"
//          (integer) 1
//      > zadd hackers 1965 "Yukihiro Matsumoto"
//          (integer) 1
//      > zadd hackers 1914 "Hedy Lamarr"
//          (integer) 1
//      > zadd hackers 1916 "Claude Shannon"
//          (integer) 1
//      > zadd hackers 1969 "Linus Torvalds"
//          (integer) 1
//      > zadd hackers 1912 "Alan Turing"
//          (integer) 1

// Команда ZADD добавляет элементы в упорядоченное множество, принимает аргумент 
//      со значением score. ZADD также является вариативным, поэтому можно указать 
//      несколько пар 'score-value'. Операция добавления элемента в множество имеет 
//      сложность O(log(N)). При запросе отсортированных элементов, Redis не выполняет 
//      никакой работы.

// Вызов ZADD для элемента, уже включенного в упорядоченное множество, обновит его 
//      score и позицию. Временная сложность этой операции составит O(log(N)), что
//      подходит для множественных обновлений. Примером применения этой функции
//      является список лидеров сортируемых по очкам лидерства.

// Вернуть список отсортированный по году, где 0 - индекс первого элемента, 
//      -1 - индекс последнего элемента:

//  > zrange hackers 0 -1
//      1) "Alan Turing"
//      2) "Hedy Lamarr"
//      3) "Claude Shannon"
//      4) "Alan Kay"
//      5) "Anita Borg"
//      6) "Richard Stallman"
//      7) "Sophie Wilson"
//      8) "Yukihiro Matsumoto"
//      9) "Linus Torvalds"

// Команда ZREVRANGE позволяет получить элементы множества в обратном порядке.

//      > zrevrange hackers 0 -1
//          1) "Linus Torvalds"
//          2) "Yukihiro Matsumoto"
//          3) "Sophie Wilson"
//          4) "Richard Stallman"
//          5) "Anita Borg"
//          6) "Alan Kay"
//          7) "Claude Shannon"
//          8) "Hedy Lamarr"
//          9) "Alan Turing"

// Параметр WITHSCORES позволяет вернуть значения score:

//      > zrange hackers 0 -1 withscores
//          1) "Alan Turing"
//          2) "1912"
//          3) "Hedy Lamarr"
//          4) "1914"
//          5) "Claude Shannon"
//          6) "1916"
//          7) "Alan Kay"
//          8) "1940"
//          9) "Anita Borg"
//          10) "1949"
//          11) "Richard Stallman"
//          12) "1953"
//          13) "Sophie Wilson"
//          14) "1957"
//          15) "Yukihiro Matsumoto"
//          16) "1965"
//          17) "Linus Torvalds"
//          18) "1969"

async function redis_sorted_sets() {

    // 
    const client = redis.createClient({ url: process.env.REDIS_URL });
    client.on('error', (err) => {
        console.log(`--- redis client error: ${err}`);
    });

    // 
    await client.connect();
    console.log(`--- redis: connection`);

    // 
    console.log(`--- key: hackers
        --- ZADD = ${await client.ZADD('hackers', { 'score': 1940, 'value': "Alan Kay" })}
        --- ZADD = ${await client.ZADD('hackers', { 'score': 1957, 'value': "Sophie Wilson" })}
        --- ZADD = ${await client.ZADD('hackers', { 'score': 1953, 'value': "Richard Stallman" })}
        --- ZADD = ${await client.ZADD('hackers', { 'score': 1949, 'value': "Anita Borg" })}
        --- ZADD = ${await client.ZADD('hackers', { 'score': 1965, 'value': "Yukihiro Matsumoto" })}
        --- ZADD = ${await client.ZADD('hackers', { 'score': 1914, 'value': "Hedy Lamarr" })}
        --- ZADD = ${await client.ZADD('hackers', { 'score': 1916, 'value': "Claude Shannon" })}
        --- ZADD = ${await client.ZADD('hackers', { 'score': 1969, 'value': "Linus Torvalds" })}
        --- ZADD = ${await client.ZADD('hackers', { 'score': 1912, 'value': "Alan Turing" })}
        --- ZRANGE = ${await client.ZRANGE('hackers', 0, -1)}
        --- ZRANGE = ${(await client.ZRANGE_WITHSCORES('hackers', 0, -1))
            .map(item => JSON.stringify(item)).join(' - ')
        }
    `);

    //
    client.quit();
}

// --- 1.12 Диапозоны.

// Команда ZRANGEBYSCORE позволяет вернуть диапозон значений из множества. 

// Выбрать диапозон от минус бесконечности до 1950 года включительно:

//      > zrangebyscore hackers -inf 1950
//          1) "Alan Turing"
//          2) "Hedy Lamarr"
//          3) "Claude Shannon"
//          4) "Alan Kay"
//          5) "Anita Borg"

// Удалить диапозон элементов из множества:

//      > zremrangebyscore hackers 1940 1960
//          (integer) 4                 возвращает количество удаленных элементов

// Команда ZRANK операция получения ранга, то есть позицию элемента во множестве 
//      упорядоченных элементов. Аналогично команда ZREVRANK получения ранга 
//      по убыванию.

//      > zrank hackers "Anita Borg"
//          (integer) 4

async function redis_ranges() {

    // 
    const client = redis.createClient({ url: process.env.REDIS_URL });
    client.on('error', (err) => {
        console.log(`--- redis client error: ${err}`);
    });

    // 
    await client.connect();
    console.log(`--- redis: connection`);

    // 
    console.log(`--- key: hackers
        --- DEL = ${await client.DEL('hackers')}
        --- ZADD = ${await client.ZADD('hackers', { 'score': 1940, 'value': "Alan Kay" })}
        --- ZADD = ${await client.ZADD('hackers', { 'score': 1957, 'value': "Sophie Wilson" })}
        --- ZADD = ${await client.ZADD('hackers', { 'score': 1953, 'value': "Richard Stallman" })}
        --- ZADD = ${await client.ZADD('hackers', { 'score': 1949, 'value': "Anita Borg" })}
        --- ZADD = ${await client.ZADD('hackers', { 'score': 1965, 'value': "Yukihiro Matsumoto" })}
        --- ZADD = ${await client.ZADD('hackers', { 'score': 1914, 'value': "Hedy Lamarr" })}
        --- ZADD = ${await client.ZADD('hackers', { 'score': 1916, 'value': "Claude Shannon" })}
        --- ZADD = ${await client.ZADD('hackers', { 'score': 1969, 'value': "Linus Torvalds" })}
        --- ZADD = ${await client.ZADD('hackers', { 'score': 1912, 'value': "Alan Turing" })}
        --- ZRANGEBYSCORE = ${await client.ZRANGEBYSCORE('hackers', '-inf', 1950)}
        --- ZREMRANGEBYSCORE = ${await client.ZREMRANGEBYSCORE('hackers', 1940, 1960)}
        --- ZRANK = ${await client.ZRANK('hackers', "Yukihiro Matsumoto")}
    `);

    //
    client.quit();
}

// --- 1.13 Lexicographical scores.

// Для работы с lexicographical-диапазонами используются команды: ZRANGEBYLEX, 
//      ZREVRANGEBYLEX, ZREMRANGEBYLEX и ZLEXCOUNT. Эти команды позволяют получать 
//      диапозоны лексиграфически, если все элементы имеют одинаковое значение scope.

// Добавить в множество элементы с одинаковым значением scope:

//      > zadd hackers 0 "Alan Kay" 0 "Sophie Wilson" 0 "Richard Stallman" 
//          0 "Anita Borg" 0 "Yukihiro Matsumoto" 0 "Hedy Lamarr" 0 "Claude Shannon"
//          0 "Linus Torvalds" 0 "Alan Turing"

// Элементы отсортированны лексикографически:

//      > zrange hackers 0 -1
//          1) "Alan Kay"
//          2) "Alan Turing"
//          3) "Anita Borg"
//          4) "Claude Shannon"
//          5) "Hedy Lamarr"
//          6) "Linus Torvalds"
//          7) "Richard Stallman"
//          8) "Sophie Wilson"
//          9) "Yukihiro Matsumoto"

// Команда ZRANGEBYLEX позволяет получить лексикографический диапазон:

//      > zrangebylex hackers [B [P
//          1) "Claude Shannon"
//          2) "Hedy Lamarr"
//          3) "Linus Torvalds"

// Диапазоны могут включать или не включать крайние точки, а также отрицательный
//      бесконечный предел и положительный бесконечный предел.

// Данная возможность позволяет создавать упорядоченные множества из значений 
//      в формате UUID.

async function redis_ranges() {

    // 
    const client = redis.createClient({ url: process.env.REDIS_URL });
    client.on('error', (err) => {
        console.log(`--- redis client error: ${err}`);
    });

    // 
    await client.connect();
    console.log(`--- redis: connection`);

    // 
    const hacks = [
        { 'score': 0, 'value': "Alan Kay" },
        { 'score': 0, 'value': "Sophie Wilson" },
        { 'score': 0, 'value': "Richard Stallman" },
        { 'score': 0, 'value': "Anita Borg" },
        { 'score': 0, 'value': "Yukihiro Matsumoto" },
        { 'score': 0, 'value': "Hedy Lamarr" },
        { 'score': 0, 'value': "Claude Shannon" },
        { 'score': 0, 'value': "Linus Torvalds" },
        { 'score': 0, 'value': "Alan Turing" },
    ];
    console.log(`--- key: hackers
        --- DEL = ${await client.DEL('hackers')}
        --- ZADD = ${await client.ZADD('hackers', hacks)}
        --- ZRANGE = ${await client.ZRANGE('hackers', 0, -1)}
        --- ZRANGEBYSCORE = ${await client.ZRANGEBYSCORE('hackers', '-inf', 2000)}
        --- ZRANGEBYLEX = ${await client.ZRANGEBYLEX('hackers', '[B', '[P')}
    `);

    //
    client.quit();
}

// --- 1.14 Bitmaps.

// Bitmaps - это строковый тип данных на котором определен набор битовых операций. 
//      Строки являются binary-safe объектами с максимальной длиной в 512 МБ и 
//      с возможностью устанавливать до 232 различных битов. Bitmaps часто 
//      обеспечивают значительную экономию места при хранении информации. 

// Битовые операции делятся на две группы: 
//      - однобитовые операции с постоянным временем работы, такие как установка бита 
//          в 1/0 или получение его значения;
//      - операции с группами битов, такие как подсчет количества установленных битов 
//          в заданном диапазоне битов;

// Команды SETBIT/GETBIT позволяют устанавливать/извлекать биты. 

// Команда SETBIT принимает в качестве первого аргумента номер бита, а в качестве второго 
//      аргумента значение для установки бита, равное 1 или 0. Команда автоматически 
//      увеличивает строку, если адресуемый бит выходит за пределы текущей длины строки.

// Команда GETBIT возвращает значение бита по указанному индексу. Биты вне допустимого 
//      диапазона всегда считаются равными нулю.

//      > setbit key 10 1
//          (integer) 1
//      > getbit key 10
//          (integer) 1
//      > getbit key 11
//          (integer) 0

// Команды работающие с группой битов:
//      BITOP выполняет побитовые операции между разными строками: И, ИЛИ, исключающее ИЛИ и НЕ.
//      BITCOUNT выполняет подсчет битов, установленных в 1. 
//      BITPOS находит первый бит, имеющий указанное значение 0/1.
//          Команды BITPOS и BITCOUNT работают с диапозоном байтов строки.

//      > setbit key 0 1
//          (integer) 0
//      > setbit key 100 1
//          (integer) 0
//      > bitcount key
//          (integer) 2

// Варианты использования:
// - аналитика в реальном времени;
// - хранение компактной логической информации, связанной с идентификаторами объектов.

// Чтобы узнать самую длинную полосу ежедневных посещений: начиная с даты создания 
//      до текущей даты выполняется подсчет дней, при помощи команды SETBIT для каждого
//      дня устанавливается бит 0/1 в зависимости от посещения, в качестве битового 
//      индекса берется порядковый номер дня, к полученной строке можно применить
//      команду BITCOUNT для подсчета количества дней посещения, несколько вызовов 
//      команды BITPOS можно определить самую длинную полосу.

// Bitmaps можно разбить на несколько ключей для сегментирования набора данных, чтобы 
//      избежать работы с огромными ключами. Тривиальная стратегия: 
//      сохранять m бит на ключ, имя ключа 'bit-number/M', адресации внутри ключа 
//      'bit-number MOD M'.

async function redis_bitmaps() {

    // 
    const client = redis.createClient({ url: process.env.REDIS_URL });
    client.on('error', (err) => {
        console.log(`--- redis client error: ${err}`);
    });

    // 
    await client.connect();
    console.log(`--- redis: connection`);

    //
    const createArray = () => [...Array(5)].map((n, i) => '0000000000').join('');
    console.log(`--- key: bitmaps
        --- SET = ${await client.SET('bitmaps', createArray())}
        --- SETBIT = ${await client.SETBIT('bitmaps', 0, 1)}
        --- SETBIT = ${await client.SETBIT('bitmaps', 10, 1)}
        --- SETBIT = ${await client.SETBIT('bitmaps', 100, 1)}
        --- GETBIT = ${await client.GETBIT('bitmaps', 10)}
        --- GETBIT = ${await client.GETBIT('bitmaps', 11)}
        --- BITCOUNT (     )      = ${await client.BITCOUNT('bitmaps')}
        --- BITCOUNT (0,  0)      = ${await client.BITCOUNT('bitmaps', 0, 0)}
        --- BITCOUNT (1,  1)      = ${await client.BITCOUNT('bitmaps', { start: 1, end: 1 })}
        --- BITCOUNT (1,  1) BYTE = ${await client.BITCOUNT('bitmaps', { start: 1, end: 1 }, 'BYTE')}
        --- BITCOUNT (5, 30) BIT  = ${await client.BITCOUNT('bitmaps', { start: 5, end: 30 }, 'BIT')}
    `);

    //
    client.quit();
}

// --- 1.15 HyperLogLogs.

//      https://redis.io/commands#hyperloglog

// HyperLogLog - это вероятностная структура данных, используемая для подсчета уникальных 
//      вещей (оценка кардинальности множества). Обычно для подсчета уникальных элементов 
//      требуется использование объема памяти, пропорционального количеству элементов, 
//      которые требуется подсчитать, чтобы избежать их многократного подсчета. Существуют 
//      алгоритмы способные снизить используемый объем памяти за счет точности. Они дают 
//      оценочную меру со стандартной ошибкой, которая в Redis составляет менее 1%. 
//      Используемый объем памяти составит 12 КБ в худшем случае или намного меньше, 
//      если HyperLogLog собрал очень мало элементов.

// HLL кодируются как строка Redis, поэтому можно использовать команды GET и SET 
//      для получения/установки значений. HLL похож на использование множеств 
//      для выполнения той же задачи: SADD не будет добавлять одинаковые элементы, SCARD 
//      выполняет подсчет уникальных элементов. Команда PFADD добавляет новый элемент в HLL, 
//      но сам элемент не добавляется, поскольку HLL сохраняет только состояние. Чтобы 
//      получить приблизительное количества уникальных элементов используется команда PFCOUNT.

//      > pfadd hll a b c d
//          (integer) 1
//      > pfcount hll
//          (integer) 4

// Пример использования: подсчет уникальных запросов, выполняемых пользователями каждый день.

//      > PFADD hll1 foo bar zap a
//          (integer) 1
//      > PFADD hll2 a b c foo
//          (integer) 1
//      > PFMERGE hll3 hll1 hll2
//          "OK"
//      > PFCOUNT hll3
//          (integer) 6

async function redis_hll() {

    // 
    const client = redis.createClient({ url: process.env.REDIS_URL });
    client.on('error', (err) => {
        console.log(`--- redis client error: ${err}`);
    });

    // 
    await client.connect();
    console.log(`--- redis: connection`);

    //
    console.log(`--- key: hll_1 hll_2
        --- DEL = ${await client.DEL('hll_1')}
        --- DEL = ${await client.DEL('hll_2')}
        --- PFADD = ${await client.PFADD('hll_1', 'foo', 'bar', 'baz')}
        --- PFADD = ${await client.PFADD('hll_2', 'a', 'b', 'c')}
        --- PFMERGE = ${await client.PFMERGE('hll_3', 'hll_1', 'hll_2')}
        --- PFCOUNT = ${await client.PFCOUNT('hll_1')}
        --- PFCOUNT = ${await client.PFCOUNT('hll_2')}
        --- PFCOUNT = ${await client.PFCOUNT('hll_3')}
        --- GET = ${await client.GET('hll_1')}
        --- GET = ${await client.GET('hll_2')}
        --- GET = ${await client.GET('hll_3')}
    `);

    //
    client.quit();
}

// --- Запуск.

(async () => {
    await redis_strings();
    await redis_key_space();
    await redis_list();
    await redis_limited_list();
    await redis_blocking_list();
    await redis_keys();
    await redis_hashes();
    await redis_sets();
    await redis_sorted_sets();
    await redis_ranges();
    await redis_bitmaps();
    await redis_hll();
})();