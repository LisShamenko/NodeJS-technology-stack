"use strict";

const redis = require("redis");



// --------------- 7.6 Functions.

// --- 7.6.1 Команда Eval.

// Основной способ использования команды Eval - это эффективное и атомарное выполнение 
//      логики на сервере Redis.

// Каждый вызов команды EVAL отправляет сценарий на сервер, что приводит к накладным 
//      расходам сети и компиляции сценариев. Команды SCRIPT LOAD и EVALSHA позволяют
//      оптимизировать этот процесс. Сценарий загружается один раз в кеш сервера,
//      после чего сценарий можно вызывать используя хеш-сумму SHA1. Кеш может быть 
//      потерян в любое время, например, после вызова SCRIPT FLUSH, перезапуска сервера 
//      или при переключении на реплику. За перезагрузку сценариев отвечает само
//      приложение. 

// Данный подход имеет ряд недостатков:
// 1. Все экземпляры приложения должны поддерживать копии всех сценариев, что требует
//      наличия механизма, который применяет обновления сценариев ко всем экземплярам 
//      приложения.
// 2. Вызов кэшированных скриптов в контексте транзакции увеличивает вероятность сбоя 
//      транзакции из-за отсутствия скрипта.
// 3. Хеш-суммы SHA1 бессмысленны, что чрезвычайно усложняет отладку системы.
// 4. Неправильное использование EVAL приводит к анти-шаблону, когда создаются 
//      конкретные версии сценариев без использования KEYS и ARGV.
// 5. Сценарии не могут вызывать друг друга, что делает невозможным повторное 
//      использование кода, за исключением предварительной обработки на стороне 
//      клиента.

// --- 7.6.2 Functions.

// Functions обеспечивают ту же функциональность, что и сценарии Eval, но являются
//      частью базы данных Radis, то есть сервер управляет Functions и обеспечивает 
//      их доступность за счет сохранения и репликации данных. Functions объявляются 
//      перед использованием и приложению не требуется загружать их во время 
//      выполнения или рисковать прерыванием транзакций. Приложение, использующее 
//      Functions, зависит только от их API, а не от встроенной логики сценария 
//      в базе данных.

// Сценарии являются частью приложения, Functions расширяют сам сервер базы данных.
//      Functions похожих на модули, которые разрабатываются один раз, загружаются 
//      при запуске и многократно используются различными приложениями. Function 
//      имеет уникальное имя, что упрощает вызов и отслеживание ее выполнения.

// Functions отделяют язык программирования сценариев Lua от их запуска на сервере, 
//      что в перспективе позволит писать сценарии на других языках.

// Functions хранятся в библиотеках и не могут обновляться выборочно в рамках одной
//      библиотеки. Вместо этого обновляется вся библиотека со всеми Functions, 
//      которые в нее входят, что позволяет Functions вызывать друг друга. Таким 
//      образом библиотеки улучшают повторное использование кода.

// Functions выполняются атомарно и блокируют сервер во время выполнения. Блокировка
//      применяется ко всем подключенным клиентам. Рекомендуется использовать 
//      быстро выполняющиеся Functions. 

// --- 7.6.3 Загрузка.

// Команда FUNCTION LOAD загружает библиотеку в базу данных. Если в библиотеки 
//      отсутствуют Functions, то команда FUNCTION LOAD выдаст ошибку. Команда
//      принимает три аргумента:
//      - идентификатор движка, Lua; 
//      - имя библиотеки, mylib;
//      - исходный код библиотеки;

//      redis> FUNCTION LOAD Lua mylib ""
//          (error) ERR No functions registered

// Библиотека должна включать хотя бы одну зарегистрированную Function для успешной 
//      загрузки. Зарегистрированная Function имеет имя и действует как точка входа 
//      в библиотеку. Functions регистрируются при выполнении команды FUNCTION LOAD
//      с помощью функции redis.register_function, которая принимает два аргумента:
//      имя Function и функцию обратного вызова. Функция обратного вызова принимает 
//      два аргумента: имена ключей и обычные аргументы.

// Простая библиотека, регистрирующая Function с именем knock_knock:

//      redis.register_function(
//          'knock_knock',
//          function(keys, args) return 'Who\'s there?' end
//      )

// Команда FCALL позволяет вызвать зарегистрированную Function. Команда принимает
//      два аргумента: имя зарегистрированной Function и количество имен ключей, 
//      которые следуют за ним (аналогично EVAL и EVALSHA).

//      redis> FUNCTION LOAD Lua mylib "redis.register_function('knockknock', function() return 'Who\\'s there?' end)"
//          OK
//      redis> FCALL knockknock 0
//          "Who's there?"

// Чтобы обеспечить правильное выполнение Functions в автономном и кластерном 
//      развертывании, все имена ключей, к которым функция обращается, должны 
//      быть указаны в качестве аргументов при вызове FCALL. Аргументы, которые
//      не являются именами ключей считаются входными аргументами и следуют
//      сразу за аргументами ключей. Ключи помещаются в массив KEYS, а входные
//      аргументы в массив ARGS.

// Описание Function: 
// - установка, обновление хешей и сохранение времени последней модификации 
//      в новом поле с именем _last_modified_; 
// - Function вызывает TIME, чтобы получить показания часов сервера и обновить 
//      хеш новыми значениями полей и отметкой времени модификации; 
// - Function принимает в качестве аргументов имя ключа хэша и массив 
//      для обновления;

//      local function my_hset(keys, args)
//          local hash = keys[1]
//          local time = redis.call('TIME')[1]
//          return redis.call('HSET', hash, '_last_modified_', time, unpack(args))
//      end
//      redis.register_function('my_hset', my_hset)

// Если Function записать в файл mylib.lua, то загрузить его можно будет следующим 
//      образом:

//      $ cat mylib.lua | redis-cli -x FUNCTION LOAD Lua mylib REPLACE

// Модификатор REPLACE указывает Redis, что следует перезаписать существующее 
//      определение библиотеки. Если не указать REPLACE, то Redis выдаст ошибку,
//      что библиотека уже существует.

// Вызов Function 'my_hset', передается один аргумент ключа и две пары ключ-значение:

//      redis> FCALL my_hset 1 myhash myfield "some value" another_field "another value"
//          (integer) 3
//      redis> HGETALL myhash
//          1) "_last_modified_"
//          2) "1640772721"
//          3) "myfield"
//          4) "some value"
//          5) "another_field"
//          6) "another value"

// --- 7.6.4 Расширение библиотеки.

// Описание Function:
// - my_hgetallRedis возвращает все поля и их значения по заданному хеш-ключу,
//      за исключением поля метаданных _last_modified_;
// - my_hlastmodifiedRedis возвращает отметку времени модификации по заданному
//      хеш-ключу;

//      local function my_hset(keys, args)
//          local hash = keys[1]
//          local time = redis.call('TIME')[1]
//          return redis.call('HSET', hash, '_last_modified_', time, unpack(args))
//      end
//
//      local function my_hgetall(keys, args)
//          redis.setresp(3)
//          local hash = keys[1]
//          local res = redis.call('HGETALL', hash)
//          res['map']['_last_modified_'] = nil
//          return res
//      end
//
//      local function my_hlastmodified(keys, args)
//          local hash = keys[1]
//          return redis.call('HGET', keys[1], '_last_modified_')
//      end
//
//      redis.register_function('my_hset', my_hset)
//      redis.register_function('my_hgetall', my_hgetall)
//      redis.register_function('my_hlastmodified', my_hlastmodified)

// Метод my_hgetall вызывает redis.setresp(3) из чего следует, что функция ожидает
//      ответов RESP3 после вызова redis.call. По умолчанию протокол RESP3 в отличие
//      от RESP2 предоставляет dictionary с ответами, что позволяет удалять
//      определенные поля из ответа, то есть поле _last_modified_поле.

// Регистрация и вызов Function:

//      $ cat mylib.lua | redis-cli -x FUNCTION LOAD Lua mylib REPLACE DESCRIPTION "My application's Hash data type enhancements"

//      redis> FCALL my_hgetall 1 myhash
//          1) "myfield"
//          2) "some value"
//          3) "another_field"
//          4) "another value"
//      redis> FCALL my_hlastmodified 1 myhash
//          "1640772721"

// Команда FUNCTION LIST позволяет получить информацию о библиотеке:

//      redis> FUNCTION LIST
//          1)  1) "library_name"
//              2) "mylib"
//              3) "engine"
//              4) "LUA"
//              5) "description"
//              6) "My application's Hash data type enhancements"
//              7) "functions"
//              8)  1)  1) "name"
//                      2) "my_hset"
//                      3) "description"
//                      4) (nil)
//                  2)  1) "name"
//                      2) "my_hgetall"
//                      3) "description"
//                      4) (nil)
//                  3)  1) "name"
//                      2) "my_hlastmodified"
//                      3) "description"
//                      4) (nil)

// --- 7.6.5 Повторное использование кода.

// Библиотеки облегчают совместное использование кода. В библиотеку можно добавить 
//      вспомогательную функцию обработки ошибок, которая будет вызываться 
//      из других Functions. 

// Описание Function:
// - вспомогательная функция check_keys проверяет, что KEYS содержит только один 
//      ключ, в случае успеха возвращается nil, иначе возвращается сообщение 
//      об ошибке;

//      local function check_keys(keys)
//          local error = nil
//          local nkeys = table.getn(keys)
//          if nkeys == 0 then
//              error = 'Hash key name not provided'
//          elseif nkeys > 1 then
//              error = 'Only one key name is allowed'
//          end
//          if error ~= nil then
//              redis.log(redis.LOG_WARNING, error);
//              return redis.error_reply(error)
//          end
//          return nil
//      end
//
//      local function my_hset(keys, args)
//          local error = check_keys(keys)
//          if error ~= nil then
//              return error
//          end
//          local hash = keys[1]
//          local time = redis.call('TIME')[1]
//          return redis.call('HSET', hash, '_last_modified_', time, unpack(args))
//      end
//
//      local function my_hgetall(keys, args)
//          local error = check_keys(keys)
//          if error ~= nil then
//              return error
//          end
//          redis.setresp(3)
//          local hash = keys[1]
//          local res = redis.call('HGETALL', hash)
//          res['map']['_last_modified_'] = nil
//          return res
//      end
//
//      local function my_hlastmodified(keys, args)
//          local error = check_keys(keys)
//          if error ~= nil then
//              return error
//          end
//          local hash = keys[1]
//          return redis.call('HGET', keys[1], '_last_modified_')
//      end
//
//      redis.register_function('my_hset', my_hset)
//      redis.register_function('my_hgetall', my_hgetall)
//      redis.register_function('my_hlastmodified', my_hlastmodified)

// Новый механизм обработки ошибок:

//      127.0.0.1:6379> FCALL my_hset 0 myhash nope nope
//          (error) Hash key name not provided
//      127.0.0.1:6379> FCALL my_hgetall 2 myhash anotherone
//          (error) Only one key name is allowed

// Результат в файле журнала Redis:

//      20075:M 1 Jan 2022 16:53:57.688 # Hash key name not provided
//      20075:M 1 Jan 2022 16:54:01.309 # Only one key name is allowed

// --- 7.6.6 Functions в кластере.

// Redis автоматически распространяет загруженные библиотеки Functions по репликам.
//      Это необходимо для загрузки Functions на все узлы кластера. Настройка кластера
//      и загрузка модулей должна выполняться вручную администратором.

// Загрузка библиотек не является обязанностью клиентов. Выполнение команды 
//      FUNCTION LOAD на всех master узлах:
//      redis-cli --cluster-only-masters --cluster call host:port FUNCTION LOAD ... 

// Следующая команда автоматически распространяет загруженные Functions с одного 
//      из существующих узлов кластера на новый узел:
//      redis-cli --cluster add-node 

// --- 7.6.7 Functions и Ephemeral.

// Ephemeral - это экземпляр сервера Redis, предназначенный только для кеша.

// В некоторых случаях может возникнуть необходимость в запуске нового сервера Redis 
//      с предварительно загруженными Functions. Причинами этого может быть:
//      - запуск Redis в новой среде;
//      - перезапуск Ephemeral, который использует Functions;

// В таких случаях следует убедиться, что предварительно загруженные Functions 
//      доступны, прежде чем Redis начнет принимать запросы от клиентов.

// Следующая команда извлекает Functions из существующего сервера и создает файл RDB, 
//      который Redis может загрузить при запуске:
//      redis-cli --functions-rdb

// --- 7.6.8 Functions Flags.

// Redis необходимо иметь информацию о том, как Function ведет себя при выполнении, 
//      чтобы применять политики использования ресурсов и поддерживать согласованность 
//      данных. Например, Function должна быть доступной только для чтения, чтобы 
//      её можно было выполнять с помощью команды FCALL_RO на реплике только для чтения.

// По умолчанию все Functions могут выполнять операции чтения или записи. Functions 
//      Flags позволяют объявить поведение Function во время регистрации. 

// Например, my_hgetall только считывает данные, но выполнение команды FCALL_RO вызовет
//      ошибку, поскольку Redis по умолчанию предполагает, что Function выполняет, как  
//      операции чтения, так и операции записи в базе данных. Эта ошибка может возникать 
//      в следующих случаях:
//      - выполнение Function командой FCALL для реплики только для чтения;
//      - использование FCALL_RO для выполнения Function;
//      - ошибка диска, если Redis не может сохраниться;

//      redis > FCALL_RO my_hgetall 1 myhash
//          (error) ERR Can not execute a function with write flag using fcall_ro.

// Чтобы избежать ошибки следует добавить флаг no-writes в регистрацию Function:

//      redis.register_function('my_hset', my_hset)
//      redis.register_function{
//          function_name='my_hgetall',
//          callback=my_hgetall,
//          flags={ 'no-writes' }
//      }
//      redis.register_function{
//          function_name='my_hlastmodified',
//          callback=my_hlastmodified,
//          flags={ 'no-writes' }
//      }

// После замены библиотеки можно запускать my_hgetall и my_hlastmodified с репликой
//      FCALL_RO, доступной только для чтения:

//      redis> FCALL_RO my_hgetall 1 myhash
//          1) "myfield"
//          2) "some value"
//          3) "another_field"
//          4) "another value"
//      redis> FCALL_RO my_hlastmodified 1 myhash
//          "1640772721"

// --- Запуск.

module.exports = async () => { };