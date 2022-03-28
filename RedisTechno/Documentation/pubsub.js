"use strict";

// --------------- 3. Pub/Sub.

//      https://redis.io/topics/pubsub

//      https://redis.io/topics/protocol#array-reply

//      https://redis.io/commands/psubscribe
//      https://redis.io/commands/publish
//      https://redis.io/commands/pubsub-channels
//      https://redis.io/commands/pubsub-numpat
//      https://redis.io/commands/pubsub-numsub
//      https://redis.io/commands/pubsub-shardchannels
//      https://redis.io/commands/pubsub-shardnumsub
//      https://redis.io/commands/punsubscribe
//      https://redis.io/commands/spublish
//      https://redis.io/commands/ssubscribe
//      https://redis.io/commands/subscribe
//      https://redis.io/commands/sunsubscribe
//      https://redis.io/commands/unsubscribe

//      https://gist.github.com/pietern/348262
//      https://ridwanfajar.medium.com/using-redis-pub-sub-with-node-js-its-quite-easy-c9c8b4dae79f
//      https://dev.to/franciscomendes10866/using-redis-pub-sub-with-node-js-13k3

// --- 3.1 Related commands.

//      PSUBSCRIBE
//      PUBLISH
//      PUBSUB CHANNELS
//      PUBSUB NUMPAT
//      PUBSUB NUMSUB
//      PUBSUB SHARDCHANNELS
//      PUBSUB SHARDNUMSUB
//      PUNSUBSCRIBE
//      SPUBLISH
//      SSUBSCRIBE
//      SUBSCRIBE
//      SUNSUBSCRIBE
//      UNSUBSCRIBE

// --- 3.2 Паттерн Publish/Subscribe.

// Функции SUBSCRIBE, UNSUBSCRIBE и PUBLISH реализуют паттерн обмена сообщениями 
//      Publish/Subscribe, где сообщения публикуются издателями в разных каналах,
//      а подписчики прослушывают эти каналы. Паттерн обеспечивает большую 
//      масштабируемость и более динамичную топологию сети.

// Подписка на каналы foo и bar, сообщения отправленные в эти каналы будут отправлены
//      всем подписавшимся клиентам:
//      SUBSCRIBE foo bar

// В контексте клиента, который подписан на канал разрешены следующие команды: 
//      SUBSCRIBE, SSUBSCRIBE, SUNSUBSCRIBE, PSUBSCRIBE, UNSUBSCRIBE, PUNSUBSCRIBE, 
//      PING, RESET, QUIT. То есть клиент с подпиской не может выполнять другие 
//      запросы кроме подписки/отписки на каналы.

// В redis-cli в режиме подписки не будут приниматься никакие команды, возможен
//      только выход с помощью Ctrl-C.

// --- 3.3 Формат сообщений.

// Сообщения в Redis состоят из трех элементов. Первый элемент определяет тип 
//      сообщения: subscribe, unsubscribe, message. Второй и третий зависят
//      от первого.

// subscribe - успешная подписка на канал, во втором элементе указывается канал
//      подписки, в третьем элементе количество каналов к которым подписан клиент. 
// unsubscribe - успешная отписка от канала, во втором элементе указывается
//      канал отписки, в третьем элементе количество каналов к которым подписан 
//      клиент. Если третий элемент равен 0, то клиент может выполнять любые
//      запросы, поскольку состояние 'Pub/Sub' быдет сброшено.
// message - сообщение, полученное в результате выполнения команды PUBLISH 
//      другим клиентом. Во втором элементе находится имя канала, а в третьем
//      данные сообщения.

// --- 3.4 Database & Scoping.

// 'Pub/Sub' не имеет отношения к 'key space'. Публикация сообщения в базе 'db 10'
//      будет считана подписчиком в базе 'db 1'. Для орагнизации области видимости
//      можно добавить префикс к имени канала.

// Пример:
//      SUBSCRIBE second
//          подписка первого клиента к каналу second
//      PUBLISH second Hello
//          публикация сообщения 'Hello', первый клиент получит следующее:
//          *3
//          $7
//          message
//          $6
//          second
//          $5
//          Hello
//      UNSUBSCRIBE
//          отписка первого клиента от всех каналов
//          *3
//          $11
//          unsubscribe
//          $6
//          second
//          :0

// --- 3.5 Подписка на шаблон.

// Реализация 'Pub/Sub' позволяет подписываться на каналы удовлетворяющие заданному 
//      шаблону.

//      PSUBSCRIBE news.*
//          получать все сообщения отправляемые на каналы начинающиеся с префикса
//          'news.', например, news.art или news.music
//      PUNSUBSCRIBE news.*
//          отписка от канала-шаблона, другие подписки затронуты не будут

// Меняется формат получаемых сообщений.
//
//      psubscribe - аналогичен subscribe, формат остается тот же.
//      punsubscribe - аналогичен unsubscribe, формат остается тот же.
//      message - сообщение, полученное в результате выполнения команды PUBLISH 
//          другим клиентом. 2 - шаблон для сопоставления, 3 - имя канала, 
//          4 - данные сообщения.

// Клиент может получить одно сообщение несколько раз, если он подписан на несколько 
//      шаблонов или каналов, соответствующих этому сообщению.
//
//      SUBSCRIBE foo
//      PSUBSCRIBE f*
//          при отправке сообщения на канал foo, клиент получит два сообщения: 
//          одно типа message и одно типа pmessage

// --- 3.6 Счётчик подписок.

// Счётчик подписок содержит общее количество подписок на каналы и шаблоны. Клиент
//      выйдет из состояния 'Pub/Sub', когда этот счетчик упадет до нуля, с учетом 
//      отписки от каналов и шаблонов. Счетчик указывается последним аргументом 
//      для команд: subscribe/unsubscribe и psubscribe/punsubscribe.

// --- 3.7 Sharded pubsub.

// Связано с кластерами!
//      https://redis.io/topics/pubsub#sharded-pubsub

// Кластер обеспечивает пересылку опубликованных сообщений сегмента на все узлы 
//      в сегменте, поэтому клиенты могут подписаться на канал сегмента, подключившись 
//      либо к мастеру, ответственному за слот, либо к любой из его реплик. Sharded 
//      pubsub помогает масштабировать использование pubsub в кластерном режиме. 

// Используются следующие команды:
//      SSUBSCRIBE / SUNSUBSCRIBE / SPUBLISH

// --- Запуск.

const { createServer } = require('./pubsub/Server');
const { createApp } = require('./pubsub/App');

//
(async () => {
    await createServer(8001, () => process.exit());
    await createApp('index.ejs', 8001, 8002);
    await createApp('index.ejs', 8001, 8003);
    await createApp('index.ejs', 8001, 8004);
})();