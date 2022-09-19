"use strict";

const redis = require("redis");



//      https://redis.io/docs/manual/programmability/eval-intro/
//      https://redis.io/docs/manual/programmability/functions-intro/
//      https://www.lua.org/manual/5.1/manual.html#2.4.7
//      https://www.lua.org/pil/8.1.html
//      https://redis.io/docs/manual/programmability/lua-api/

// --------------- 7.7 API.

async function redis_define_and_call(title, keyNums, keys, args, transformArguments, scriptCode) {

    // 
    const client = redis.createClient({
        scripts: {
            FUNCEXE: redis.defineScript({
                NUMBER_OF_KEYS: keyNums,
                SCRIPT: scriptCode,
                transformArguments,
                transformReply(reply) {
                    return reply;
                }
            })
        }
    });

    // 
    client.on('error', (err) => console.log(`--- err: ${err}`));
    await client.connect();
    try {
        console.log(`--- ${title} --- ${await client.FUNCEXE(...keys, ...args)}`);
    }
    catch (err) {
        console.log('--- ' + err);
    }
    client.quit();
}
const keys0args0 = () => [];
const keys1args1 = (key, toAdd) => [key, toAdd.toString()];
const keys2args1 = (key1, key2, toAdd) => [key1, key2, toAdd.toString()];
const keys2args3 = (key1, key2, arg1, arg2, arg3) => [key1, key2, arg1.toString(), arg2.toString(), arg3.toString()];

// --- 7.7.1 Sandbox context.

// Сценарии выполняются в изолированном контексте Sandbox и могут использовать только
//      определенные пакеты Lua. Контекст Sandbox Lua уменьшает потенциальные угрозы 
//      со стороны серверной среды. Сценарии не должны обращаться к базовым системам
//      системы сервера, таким как файловая система, сеть, системные вызовы и прочее.
//      Сценарии должны работать исключительно с данными, передаваемые в качестве 
//      аргументов и хранящимися в Redis.

// --- 7.7.2 Глобальные переменные и функции.

// Контекст Sandbox блокирует объявление глобальных переменных и функций. Это необходимо,
//      чтобы сценарии не пытались поддерживать какой-либо контекст времени выполнения, 
//      кроме данных, хранящихся в Redis. Использование глобальных переменных и функций 
//      может нарушить согласованность AOF и репликацию данных.

// При попытке определить глобальную переменную или функцию, а также при попытке доступа 
//      к глобальной переменной, которая не определена в контексте среды выполнения, 
//      произойдет ошибка "Script attempted to create global variable 'myglobalvariable":

//      my_global_variable = 'some value'
//      function my_global_funcion()
//          ...
//          return an_undefined_global_variable
//      end
//      

// Все определения переменных и функций должны быть объявлены как локальные. Для этого 
//      используется ключевое слово local.

//      local my_local_variable = 'some value'
//      local function my_local_function()
//          ...
//      end

// Использование импортированных модулей Lua не поддерживается в изолированном 
//    контексте выполнения. Функция require отключена. Доступные библиотеки, которые 
//    поставляются с Redis:
//    - String Manipulation (string) library
//    - Table Manipulation (table) library
//    - Mathematical Functions (math) library
//    - struct library
//    - cjson library
//    - cmsgpack library
//    - bitop library

async function redis_local_variable() {
    await redis_define_and_call(
        'local variable', 1, ['foo'], [3], keys1args1,
        `
            local my_local_variable = KEYS[1] .. " - " .. ARGV[1];
            local function my_local_function()
                return my_local_variable;
            end
            return my_local_function();
        `
    );
}

// --- 7.7.3 Runtime globals

// Контекст времени выполнения содержит несколько глобальных переменных:
//      - redis - это singleton-реализация для взаимодействия с Redis сервером;
//      - KEYS - список ключей, которые будут доступны в сценарии;
//      - ARGV - список аргументов, передаваемых в сценарий;

// Переменные KEYS и ARGV доступны в EVAL-сценариях и не доступны в Functions.

// EVAL-scripts: yes
//    Functions: no

// --- 7.7.4 Global: redis.

// EVAL-scripts: yes
//    Functions: yes

// Глобальная переменная redis позволяет сценарию взаимодействовать с сервером Redis, 
//    на котором он запущен. 

// --- --- redis.call(command [,arg...])

// EVAL-scripts: yes
//    Functions: yes

// Функция redis.call вызывает заданную команду Redis и возвращает ответ. В качестве
//      аргументов принимает имя команды и аргументы, которые ей будут передаваться.

// Вызов команды ECHO из сценария:

//      return redis.call('ECHO', 'Echo, echo... eco... o...')

// При возникновении ошибки функция redis.call возвращает необработанное исключение 
//      пользователю. Для обработки ошибок времени выполнения можно использовать 
//      функцию redis.pcall.

// Вызов функции redis.call с ошибкой:

//      redis> EVAL "return redis.call('ECHO', 'Echo,', 'echo... ', 'eco... ', 'o...')" 0
//          (error) 
//          ERR Error running script (call to b0345693f4b77517a711221050e76d24ae60b7f7): @user_script:1: 
//          @user_script: 1: Wrong number of args calling Redis command from script

async function redis_call() {
    await redis_define_and_call(
        'redis.call', 0, [], [], keys0args0,
        `
            return redis.call('ECHO', 'Echo, echo... eco... o...')
        `
    );
}

// --- --- redis.pcall(command [,arg...])

// EVAL-scripts: yes
//    Functions: yes

// Функция redis.pcall позволяет обрабатывать ошибки времени выполнения, вызванные 
//      сервером Redis. Функция redis.pcall отличается от redis.call следующим:
//      - всегда возвращает ответ;
//      - никогда не выдает исключение, вместо этого возвращается redis.error_reply;

// Использование redis.pcall для перехвата и обработки исключений времени выполнения 
//      в контексте Ephemeral сценария:

//      local reply = redis.pcall('ECHO', unpack(ARGV))
//      if reply['err'] ~= nil then
//          -- регистрация ошибки для дальнейшей обработки
//          redis.log(redis.LOG_WARNING, reply['err'])
//          reply['err'] = 'Something is wrong, but no worries, everything is under control'
//      end
//      return reply

// Выполнение скрипта с более чем одним аргументом вернет ошибку:

//      redis> EVAL "..." 0 hello world
//          (error) Something is wrong, but no worries, everything is under control

async function redis_something_wrong() {
    await redis_define_and_call(
        'local variable',
        2,
        ['foo', 'bar'],
        [100, 200, 300],        // [100]
        keys2args3,             // keys2args1
        `
            local reply = redis.pcall('ECHO', unpack(ARGV))
            if reply['err'] ~= nil then
                redis.log(redis.LOG_WARNING, reply['err'])
                reply['err'] = 'Something is wrong, but no worries, everything is under control'
            else 
                redis.log(redis.LOG_WARNING,  "--- debug log --- " .. KEYS[1] .. " - "  .. KEYS[2])
            end
            return reply
        `
    ).catch((err) => console.log(`--- err: ${err}`));
}

// --- --- redis.error_reply(x)

// EVAL-scripts: yes
//    Functions: yes

// Функция redis.error_reply принимает текст ошибки и возвращает объект ошибки. 

// Объекты ошибок error1 и error2 идентичны:

//      local text = 'My very special error'
//      local reply1 = { err = text }
//      local reply2 = redis.error_reply(text)

// Обе формы допустимы для возврата ошибок из сценария:

//      redis> EVAL "return { err = 'My very special table error' }" 0
//          (error) My very special table error
//      redis> EVAL "return redis.error_reply('My very special reply error')" 0
//          (error) My very special reply error

async function redis_error_reply() {
    await redis_define_and_call(
        'error reply', 0, [], [], keys0args0,
        `
            local text = 'My very special error'
            local reply1 = { err = text }
            local reply2 = redis.error_reply(text)
            local reply3 = { r1 = reply1, r2 = reply2 }
            return cjson.encode(reply3)
        `
    );
}

// --- --- redis.status_reply(x)

// EVAL-scripts: yes
//    Functions: yes

// Функция redis.status_reply возвращает простой строковый ответ (RESP Simple Strings). 
//      Ответы о статусе представлены в виде объекта с полем ok.

// Пример стандартного ответа статуса, объекты ответов status1 и status2 идентичны:

//      local text = 'Frosty'
//      local status1 = { ok = text }
//      local status2 = redis.status_reply(text)

// Обе формы допустимы для возврата ответов о статусе из сценария:

//      redis> EVAL "return { ok = 'TICK' }" 0
//          TICK
//      redis> EVAL "return redis.status_reply('TOCK')" 0
//          TOCK

async function redis_status_reply() {
    await redis_define_and_call(
        'error reply', 0, [], [], keys0args0,
        `
            local text = 'Frosty'
            local status1 = { ok = text }
            local status2 = redis.status_reply(text)
            local status3 = { s1 = status1, s2 = status2 }
            return cjson.encode(status3)
        `
    );
}

// --- --- redis.sha1hex(x)

// EVAL-scripts: yes
//    Functions: yes

// Функция redis.sha1hex возвращает шестнадцатеричную хеш-сумму SHA1.

// Хеш-сумма SHA1 пустой строки:

//      redis> EVAL "return redis.sha1hex('')" 0
//          "da39a3ee5e6b4b0d3255bfef95601890afd80709"

async function redis_sha() {
    await redis_define_and_call(
        'error reply', 0, [], [], keys0args0,
        `return redis.sha1hex('')`
    );
}

// --- --- redis.log(level, message)

// EVAL-scripts: yes
//    Functions: yes

// Функция redis.log записывает сообщение в журнал сервера Redis. Принимает аргументы:
//      сообщение и уровень журнала. Сообщение представляет собой строку для записи 
//      в файл журнала. Записываются только те сообщения, которые равны или превышают
//      уровень loglevel директивы конфигурации сервера. Допустимы следующие уровни:
//      - redis.LOG_DEBUG
//      - redis.LOG_VERBOSE
//      - redis.LOG_NOTICE
//      - redis.LOG_WARNING

//      redis.log(redis.LOG_WARNING, 'Something is terribly wrong')

// Фрагмент выдаст:

//      [32343] 22 Mar 15:21:39 # Something is terribly wrong

async function redis_log() {
    await redis_define_and_call(
        'error reply', 0, [], [], keys0args0,
        `
            redis.log(redis.LOG_DEBUG, '--- LOG_DEBUG')
            redis.log(redis.LOG_VERBOSE, '--- LOG_VERBOSE')
            redis.log(redis.LOG_NOTICE, '--- LOG_NOTICE')
            redis.log(redis.LOG_WARNING, '--- LOG_WARNING')
            return 'ok'
        `
    );
}

// --- --- redis.setresp(x)

// EVAL-scripts: yes
//    Functions: yes

// Функция redis.setresp позволяет сценарию переключаться между версиями протокола 
//      сериализации ответов (RESP), возвращаемых redis.call и redis.pcall. Принимает
//      числовой аргумент в качестве версии протокола: 
//      2 - по умолчанию;
//      3 - ответы RESP3;

//      redis.setresp(3)

// --- --- redis.set_repl(x)

// EVAL-scripts: yes
//    Functions: no

// Неправильное использование этой функции может привести к повреждению из-за нарушения 
//      контракта, который обязывает мастера, его реплики и AOF хранить одно и то же 
//      логическое содержимое.

// Функция redis.set_repl позволяет сценарию установить контроль над тем, как команды
//      записи (effects) распространяются на реплики и AOF. 'effects' - это команды 
//      записи Redis, которые вызывает сценарий.

// По умолчанию реплицируются все команды записи, выполняемые сценарием. Это поведение
//      может быть изменено для сохранения промежуточных значений только в мастере.

// Например, результат пересечения двух множеств сохраняется во временном ключе 
//      с расширением SUNIONSTORE, из промежуточного результата выбирается пять 
//      случайных элементов (SRANDMEMBER) и сохраняются в другом множестве (SADD).
//      Перед возвратом результата сценарий удаляет временный ключ с пересечением
//      двух исходных множеств. В этом сценарии использование команд SUNIONSTORE и DEL 
//      для временного ключа является ненужным и расточительным.

// Функция redis.set_repl указывает серверу, как обрабатывать команды записи с точки 
//      зрения репликации. В момент начала выполнения сценария используется настройка 
//      redis.REPL_ALL. Функция redis.set_repl вызывается в любом месте сценария 
//      для переключения между режимами репликации. Доступны следующие настройки:
//      - redis.REPL_ALL        реплицирует effects на AOF и реплики;
//      - redis.REPL_AOF        копирует effects только на AOF;
//      - redis.REPL_REPLICA    копирует effects только на реплики;
//      - redis.REPL_SLAVE      аналогично REPL_REPLICA, для обратной совместимости;
//      - redis.REPL_NONE       полностью отключает репликацию effects.

// Сценарий создаст на репликах и AOF только ключи A и C:

//      redis.replicate_commands()              -- Enable effects replication in versions lower than Redis v7.0
//      redis.call('SET', KEYS[1], ARGV[1])
//      redis.set_repl(redis.REPL_NONE)
//      redis.call('SET', KEYS[2], ARGV[2])
//      redis.set_repl(redis.REPL_ALL)
//      redis.call('SET', KEYS[3], ARGV[3])

// Запуск сценария:

//      EVAL "..." 3 A B C 1 2 3

// --- --- redis.replicate_commands()

// Version: 3.2.0 - 7.0.0
// EVAL-scripts: yes
//    Functions: no

// Функция redis.replicate_commands переключает режим репликации с Verbatim на Effects.
//      Начиная с Redis v7.0 репликация Verbatim не поддерживается. 

// --- --- redis.breakpoint()

// Version: 3.2.0
// EVAL-scripts: yes
//    Functions: no

// Функция redis.breakpoint запускает точку останова при использовании отладчика 
//      Redis Lua.

// --- --- redis.debug(x)

// Version: 3.2.0
// EVAL-scripts: yes
//    Functions: no

// Функция redis.debug выводит аргумент в консоль отладчика Redis Lua.

// --- --- redis.acl_check_cmd(command [,arg...])

// Version: 7.0.0
// EVAL-scripts: yes
//    Functions: yes

// Функция redis.acl_check_cmd используется для проверки наличия у пользователя, 
//      запускающего сценарий, разрешений ACL для выполнения указанной команды 
//      с заданными аргументами. Команда возвращает true, если у пользователя 
//      есть разрешение на выполнение команды через вызов redis.call/redis.pcall.
//      Функция выдаст ошибку, если указанная команда или ее аргументы недействительны.

// --- --- redis.register_function

// Version: 7.0.0
// EVAL-scripts: no
//    Functions: yes

// Функция redis.register_function доступна только из контекста команды FUNCTION LOAD и
//      регистрирует Function в библиотеке. Функция может быть вызвана с positional или
//      named аргументами.

//      redis> FUNCTION LOAD Lua mylib "redis.register_function('myfunc', function(keys, args) return args[1] end)"
//          OK
//      redis> FCALL myfunc 0 hello
//          "hello"

// Пример:

//      lis@lis-vb:~/redis/redis-7.0-rc2$ redis-cli
//      127.0.0.1:6379> FUNCTION LOAD Lua mylib "redis.register_function('myfunc', function(keys, args) return args[1] end)"
//          OK
//      127.0.0.1:6379> FCALL myfunc 0 hello
//          "hello"
//      127.0.0.1:6379> FUNCTION LIST
//          1)  1)  "library_name"           → ╮
//              2)  "mylib"                ← ──╯
//              3)  "engine"                 → ╮
//              4)  "LUA"                  ← ──╯
//              5)  "description"            → ╮
//              6)  (nil)                  ← ──╯
//              7)  "functions"              → ╮
//              8)  1)  1)  "name"         ← ──┤
//                      2)  "myfunc"       ← ──┤
//                      3)  "description"  ← ──┤
//                      4)  (nil)          ← ──┤
//                      5)  "flags"        ← ──╯
//                      6)  (empty array)

// --- --- --- redis.register_function(name, callback)

// Версия с positional-аргументами принимает следующие аргументы:
//      - имя Function;
//      - код Function.

// Пример использования:

//      redis> FUNCTION LOAD Lua mylib "redis.register_function('noop', function() end)"

// --- --- --- redis.register_function{function_name=name, callback=callback, flags={flag1, flag2, ..}, description=description}

// Версия с named-аргументами принимает следующие аргументы:
//      - function_name - имя функции;
//      - callback - обратный вызов функции;
//      - flags - флаги (необязательно);
//      - description - описание функции (необязательно);

// Пример использования:

//      redis> FUNCTION LOAD Lua mylib "redis.register_function{function_name='noop', callback=function() end, flags={ 'no-writes' }, description='Does nothing'}"

// --- --- --- flags

// Значения flags по умолчанию для сценариев Eval и Functions отличаются.

// Flags позволяют менять допустимое поведение EVAL-сценариев или Functions. 
//      По умолчанию Redis предполагает, что все сценарии читают и записывают 
//      данные. Это приводит к следующему поведению:
//      1. Сценарии могут читать и записывать данные.
//      2. Сценарии могут работать в кластерном режиме.
//      3. Для устаревшей реплики выполнение сценария запрещено, чтобы 
//          избежать несогласованных операций чтения.
//      4. При нехватке памяти выполнение сценария запрещено, чтобы 
//          избежать превышения допустимого порога.

// По умолчанию Redis запрещает выполнение сценариев для реплик только для чтения, 
//      поскольку они могут попытаться выполнить запись. Также сервер не позволяет 
//      вызывать команды FCALL_RO/EVAL_RO. Выполнение блокируется, когда сохранение 
//      данных находится под угрозой из-за ошибки диска.

// Флаг no-writes указывает, что сценарий только читает данные и никогда не записывает.
//      Этот флаг изменяет блокировку выполнения следующим образом:
//      - допускается использовать команды FCALL_RO и EVAL_RO независимо от того 
//          является мастер или его реплики экземплярами только для чтения;
//      - независит от ошибок чтения диска;
//      - сервер вернет ошибку, если сценарий попытается вызвать команду записи;

// Флаг allow-oom разрешает выполнение сценария, когда серверу не хватает памяти (OOM).
//      Без этого флага выполнение сценариев будет блокироваться независимо от флага
//      no-write и вызываемых команд. Кроме того, этот флаг позволяет сценариям 
//      вызывать любые команды Redis, включая те, которые обычно не разрешены 
//      в состоянии OOM.

// Флаг allow-stale разрешает запуск сценария на устаревшей реплике. По умолчанию 
//      Redis предотвращает проблемы согласованности данных из-за использования 
//      старых данных, заставляя устаревшие реплики возвращать ошибку времени 
//      выполнения. Этот флаг позволяет запускать сценарий на устаревших репликах 
//      Redis, когда согласованность не имеет большого значения.

// Флаг no-cluster заставляет сценарий возвращать ошибку в режиме кластера Redis.
//      Redis позволяет выполнять сценарии в автономном и кластерном режимах. 
//      Этот флаг предотвращает выполнение сценария на узлах в кластере.

// --- --- redis.REDIS_VERSION

// Version: 7.0.0
// EVAL-scripts: yes
//    Functions: yes

// Функция redis.REDIS_VERSION возвращает текущую версию сервера Redis в виде 
//      строки Lua. Формат ответа MM.mm.PP, где:
//      - ММ: основная версия;
//      - мм: младшая версия;
//      - PP: уровень исправления;

// --- --- redis.REDIS_VERSION_NUM

// Version: 7.0.0
// EVAL-scripts: yes
//    Functions: yes

// Функция redis.REDIS_VERSION_NUM возвращает текущую версию сервера Redis в виде 
//      числа. Ответ представляет собой шестнадцатеричное значение, структурированное 
//      как 0x00MMmmPP, где:
//      - ММ: основная версия;
//      - мм: младшая версия;
//      - PP: уровень исправления;

// --- 7.7.5 Преобразование типов данных.

// Функции redis.call и redis.pcall выполняют команды Redis и возвращают ответ 
//      в сценарий Lua. Ответы автоматически преобразуются в собственные типы 
//      данных Lua. Если сценарий Lua возвращает ответ с помощью return, то этот 
//      ответ автоматически преобразуется по протоколу Redis. То есть существует 
//      соответствие между типами данных Lua и типами данных протокола Redis. 

// Преобразование типа данных ответа redis.call или redis.pcall в типы данных Lua 
//      зависит от версии протокола сериализации Redis, который используется 
//      в сценарии. По умолчанию используется протокол RESP2. Сценарий может 
//      переключать версию протокола через функцию redis.setresp.

// Преобразование типа данных результата, возвращаемого сценарием Lua, зависит 
//      от выбора протокола с помощью команды HELLO.

// --- --- RESP2 -> Lua

// Следующие правила применяются по умолчанию и после вызова redis.setresp(2):

// - RESP2 integer reply        -> Lua number
// - RESP2 bulk string reply    -> Lua string
// - RESP2 array reply          -> Lua table (may have other Redis data types nested)
// - RESP2 status reply         -> Lua table: a single ok field containing the status string
// - RESP2 error reply          -> Lua table: a single err field containing the error string
// - RESP2 null bulk reply, 
//      null multi bulk reply   -> Lua false boolean type

// --- --- Lua -> RESP2

// Следующие правила применяются по умолчанию и после вызова 'HELLO 2':

// - Lua number                     -> RESP2 integer reply (the number is converted into an integer)
// - Lua string                     -> RESP bulk string reply
// - Lua table (indexed, 
//      non-associative array)      -> RESP2 array reply (truncated at the first Lua nil value encountered in the table, if any)
// - Lua table: a single ok field   -> RESP2 status reply
// - Lua table: a single err field  -> RESP2 error reply
// - Lua boolean false              -> RESP2 null bulk reply
// - Lua Boolean true               -> RESP2 integer reply with value of 1.

// Дополнительные правила преобразования Lua->Redis:

// - Lua имеет единственный числовой тип: number. Нет разницы между целыми числами и 
//      числами с плавающей запятой. Поэтому числа Lua всегда преобразуются в целые
//      числа Redis. Если требуется преобразовать число с плавающей запятой Lua, то 
//      оно должно быть возвращено в виде строки. Смотри команду ZSCORE.
// - Нет простого способа иметь nil внутри массивов Lua из-за семантики таблиц Lua. 
//      Поэтому, когда Redis преобразует массив Lua в RESP, преобразование 
//      останавливается, когда встречается nil значение Lua.
// - Когда таблица Lua представляет собой ассоциативный массив, содержащий ключи и 
//      соответствующие им значения, то преобразованный ответ Redis не будет их 
//      включать.

// Примеры преобразования Lua -> RESP2:

//      redis> EVAL "return 10" 0
//          (integer) 10
//      
//      redis> EVAL "return { 1, 2, { 3, 'Hello World!' } }" 0
//          1)  (integer) 1s
//          2)  (integer) 2
//          3)  1)  (integer) 3
//              1)  "Hello World!"
//      
//      redis> EVAL "return redis.call('get','foo')" 0
//          "bar"

// В следующем примере число с плавающей точкой преобразуется к целому, игнорируется
//      элемент ключ-значение и на значении nil обработка заканчивается:

//      redis> EVAL "return { 1, 2, 3.3333, somekey = 'somevalue', 'foo', nil, 'bar' }" 0
//          1) (integer) 1
//          2) (integer) 2
//          3) (integer) 3
//          4) "foo"

async function redis_lua_to_resp2() {

    // 
    const client = redis.createClient({ url: process.env.REDIS_URL });
    client.on('error', (err) => {
        console.log(`--- redis client error: ${err}`);
    });

    // 
    await client.connect();
    console.log(`--- redis: connection`);

    // 
    console.log(`--- Lua -> RESP2
        --- ${await client.EVAL(`return 10;`)}
        --- ${await client.EVAL(`return { 1, 2, { 3, 'Hello World!' } };`)}
        --- ${await client.EVAL(`return redis.call('get','foo')`)}
        --- ${await client.EVAL(`return { 1, 2, 3.3333, somekey = 'somevalue', 'foo', nil, 'bar' };`)}
    `);

    //
    client.quit();
}

// --- --- RESP3 -> Lua

// RESP3 - это более новая версия протокола сериализации Redis, доступная с Redis 6.0.
//      Смотри команду redis.setresp для переключения протокола. Типы данных 'big number'
//      и 'verbatim strings' поддерживаются в версии Redis 7.0 и выше. Типы данных 
//      'streamed strings' и 'streamed aggregate' в настоящее время не поддерживаются 
//      API Redis Lua.

// Правила преобразования:

// - RESP3 map reply                -> Lua table with a single map field containing a Lua table representing the fields and values of the map.
// - RESP set reply                 -> Lua table with a single set field containing a Lua table representing the elements of the set as fields, each with the Lua Boolean value of true.
// - RESP3 null                     -> Lua nil.
// - RESP3 true reply               -> Lua true boolean value.
// - RESP3 false reply              -> Lua false boolean value.
// - RESP3 double reply             -> Lua table with a single score field containing a Lua number representing the double value.
// - RESP3 big number reply         -> Lua table with a single big_number field containing a Lua string representing the big number value.
// - Redis verbatim string reply    -> Lua table with a single verbatim_string field containing a Lua table with two fields, string and format, representing the verbatim string and its format, respectively.

// --- --- Lua -> RESP3

// Независимо от того, какая версия протокола выбрана сценарием с помощью функции 
//      redis.setresp, можно использовать RESP3 с помощью команды 'HELLO 3', чтобы
//      настроить протокол соединения. Если соединение настроено на использование 
//      протокола RESP2, а сценарий отвечает по протоколу RESP3, то Redis 
//      автоматически выполнит преобразование ответа RESP3 в RESP2.

// Следующие правила дополняют преобразование Lua -> RESP2:

// - Lua Boolean                            -> RESP3 Boolean reply (note that this is a change compared to the RESP2, in which returning a Boolean Lua true returned the number 1 to the Redis client, and returning a false used to return a null.
// - Lua table a single map field           
//      set to an associative Lua table     -> RESP3 map reply.
// - Lua table a single _set field 
//      set to an associative Lua table     -> RESP3 set reply. Values can be set to anything and are discarded anyway.
// - Lua table a single double field 
//      to an associative Lua table         -> RESP3 double reply.
// - Lua nil                                -> RESP3 null.

// --- 7.7.6 Library: struct.

// Version: 2.6.0
// EVAL-scripts: yes
//    Functions: yes

// Библиотека Struct используется для упаковки/распаковки C-подобных структур в Lua. 
//      Все функции этой библиотеки принимают в качестве аргумента строку форматирования.

// Допустимые символы форматирования:

//      >           big endian
//      <           little endian
//      ![num]      alignment
//      x           padding
//      b/B         signed/unsigned byte
//      h/H         signed/unsigned short
//      l/L         signed/unsigned long
//      T           size_t
//      i/In        signed/unsigned integer with size n (defaults to the size of int)
//      cn          sequence of n chars (from/to a string); when packing, n == 0 means 
//                  the whole string; when unpacking, n == 0 means use the previously 
//                  read number as the string’s length.
//      s           zero-terminated string
//      f           float
//      d           double
//      (space)     ignored

// --- --- struct.pack(x)

// Функция struct.pack возвращает закодированную строку. В качестве аргументов 
//      принимает: строку форматирования, далее значения, которые следует
//      закодировать.

//      redis> EVAL "return struct.pack('HH', 1, 2)" 0
//          "\x01\x00\x02\x00"

// --- --- struct.unpack(x)

// Функция struct.unpack возвращает декодированные значения. В качестве аргументов
//      принимает: строку форматирования и закодированное значение.

//      redis> EVAL "return { struct.unpack('HH', ARGV[1]) }" 0 "\x01\x00\x02\x00"
//          1) (integer) 1
//          2) (integer) 2
//          3) (integer) 5

// --- --- struct.size(x)

// Функция struct.size возвращает размер структуры в байтах. В качестве аргумента
//      принимает строку форматирования.

//      redis> EVAL "return struct.size('HH')" 0
//          (integer) 4

// --- 7.7.7 Library: cjson.

// Version: 2.6.0
// EVAL-scripts: yes
//    Functions: yes

// Библиотека cjson обеспечивает быстрое кодирование и декодирование JSON из Lua. 

// --- --- cjson.encode(x)

// Функция cjson.encode возвращает строку в кодировке JSON для типа данных Lua, 
//      переданного в качестве аргумента.

//      redis> EVAL "return cjson.encode({ ['foo'] = 'bar' })" 0
//          "{\"foo\":\"bar\"}"

// --- --- cjson.decode(x)

// Функция cjson.decode возвращает тип данных Lua из строки в кодировке JSON, 
//      переданной в качестве аргумента.

//      redis> EVAL "return cjson.decode(ARGV[1])['foo']" 0 '{"foo":"bar"}'
//          "bar"

async function redis_cjson() {

    // 
    const client = redis.createClient({ url: process.env.REDIS_URL });
    client.on('error', (err) => {
        console.log(`--- redis client error: ${err}`);
    });

    // 
    await client.connect();
    console.log(`--- redis: connection`);

    // 
    console.log(`--- cjson
        --- cjson.encode = ${await client.EVAL(`return cjson.encode({ ['foo'] = 'bar' })`)}
        --- cjson.decode = ${await client.EVAL(`return cjson.decode(ARGV[1])['foo'];`, { keys: [], arguments: ['{"foo":"bar"}'] })}
    `);

    //
    client.quit();
}

// --- 7.7.8 Library: cmsgpack.

//      https://msgpack.org/index.html

// Version: 2.6.0
// EVAL-scripts: yes
//    Functions: yes

// Библиотека cmsgpack обеспечивает кодирование/декодирование Lua в/из MessagePack.

// --- --- cmsgpack.pack(x)

// Функция cmsgpack.pack кодирует значение Lua в MessagePack, переданного 
//      в качестве аргумента.

//      redis> EVAL "return cmsgpack.pack({'foo', 'bar', 'baz'})" 0
//          "\x93\xa3foo\xa3bar\xa3baz"

// --- --- cmsgpack.unpack(x)

// Функция cmsgpack.unpack декодирует MessagePack в значение Lua, переданного 
//      в качестве аргумента.

//      redis> EVAL "return cmsgpack.unpack(ARGV[1])" 0 "\x93\xa3foo\xa3bar\xa3baz"
//          1) "foo"
//          2) "bar"
//          3) "baz"

async function redis_cmsgpack() {

    // 
    const client = redis.createClient({ url: process.env.REDIS_URL });
    client.on('error', (err) => {
        console.log(`--- redis client error: ${err}`);
    });

    // 
    await client.connect();
    console.log(`--- redis: connection`);

    // 
    console.log(`--- cmsgpack
        --- cmsgpack.pack = ${await client.EVAL(`return cmsgpack.pack({'foo', 'bar', 'baz'})`)}
        --- cmsgpack.unpack = ${await client.EVAL(`return cmsgpack.unpack(ARGV[1]);`, { keys: [], arguments: ['\x93\xa3foo\xa3bar\xa3baz'] })}
    `);

    //
    client.quit();
}

// --- 7.7.9 Library: bit.

//      http://bitop.luajit.org/api.html

// Version: 2.8.18
// EVAL-scripts: yes
//    Functions: yes

// Библиотека bit обеспечивает побитовые операции над числами. 

// --- --- bit.tobit(x)

// Функция bit.tobit приводит число к числовому диапазону для битовых 
//      операций и возвращает его.

//      redis> EVAL 'return bit.tobit(1)' 0
//          (integer) 1

// --- --- bit.tohex(x [,n])

// Функция bit.tohex преобразует свой первый аргумент в шестнадцатеричную строку. 
//      Количество шестнадцатеричных цифр определяется абсолютным значением 
//      необязательного второго аргумента.

//      redis> EVAL 'return bit.tohex(422342)' 0
//          "000671c6"

// --- --- bit.bnot(x), bit.bor(x1 [,x2...]), bit.band(x1 [,x2...]), bit.bxor(x1 [,x2...])

// Функции выполняют следующие побитовые операции: not, or, and, xor.

//      redis> EVAL 'return bit.bor(1,2,4,8,16,32,64,128)' 0
//          (integer) 255

// --- --- bit.lshift(x, n), bit.rshift(x, n), bit.arshift(x, n)

// Функции выполняют побитовые операции: logical left-shift, logical right-shift, 
//      arithmetic right-shift

// --- --- bit.rol(x, n), bit.ror(x, n)

// Функции выполняют побитовое смещение на количество бит указанное во втором 
//      аргументе: left rotation, right rotation.

// --- --- bit.bswap(x)

// Функция bit.bswap меняет местами байты аргумента, что позволяет преобразовывать
//      'little-endian 32-bit numbers' в 'big-endian 32-bit numbers' и обратно.

async function redis_bit() {

    // 
    const client = redis.createClient({ url: process.env.REDIS_URL });
    client.on('error', (err) => {
        console.log(`--- redis client error: ${err}`);
    });

    // 
    await client.connect();
    console.log(`--- redis: connection`);

    // 
    console.log(`--- bit
        --- bit.tobit  = ${await client.EVAL(`return bit.tobit(1)`)}
        --- bit.tohex  = ${await client.EVAL(`return bit.tohex(422342)`)}
        --- bit.bnot   = ${await client.EVAL(`return bit.bor(1,2,4,8,16,32,64,128)`)}
    `);

    //
    client.quit();
}

// --- Запуск.

module.exports = async () => {
    await redis_local_variable();
    await redis_call();
    await redis_something_wrong();
    await redis_error_reply();
    await redis_status_reply();
    await redis_sha();
    await redis_log();
    await redis_lua_to_resp2();
    await redis_cjson();
    await redis_cmsgpack();
    await redis_bit();
};