// --------------- 43. Шаблоны конвейеров и распределения заданий.

// --- 43.1 Идентификатор корреляции

// Шаблон 'Идентификатор корреляции' - служит основой для построения абстракции 
//      запроса/ответа поверх однонаправленных каналов. Каждый запрос помечается
//      идентификатором, который затем получатель прикрепляет к ответу. Отправитель 
//      запроса может сопоставить два сообщения и вернуть ответ соответствующему 
//      обработчику.

//  ╔══════════════════════════════════╗
//  ║  ┌────┐   ┌──────┬──────┐   ┌─┐  ║
//  ║  | ╭┄┄○───┤ID:1  │запрос├ → ┤ |  ║
//  ║  | ┆  |   ├──────┼──────┤   | |  ║
//  ║  | ┆╭┄○───┤ID:2  │запрос├ → ┤ |  ║
//  ║  | ┆┆ |   ├──────┼──────┤   | |  ║
//  ║  | ┆╰┄● ← ┤ответ │ ID:2 ├───┤ |  ║
//  ║  | ┆  |   ├──────┼──────┤   | |  ║
//  ║  |╭┆┄┄○───┤ID:3  │запрос├ → ┤ |  ║
//  ║  |┆┆  |   ├──────┼──────┤   | |  ║
//  ║  |┆╰┄┄● ← ┤ответ │ ID:1 ├───┤ |  ║
//  ║  |┆   |   ├──────┼──────┤   | |  ║
//  ║  |╰┄┄┄● ← ┤ответ │ ID:3 ├───┤ |  ║
//  ║  └────┘   └──────┴──────┘   └─┘  ║
//  ║   ↑                          ↑   ║
//  ║  ╭┴────────────╮   ╭─────────┴╮  ║
//  ║  │запрашивающий├ → ┤отвечающий│  ║
//  ║  ╰─────────────╯   ╰──────────╯  ║
//  ║  ┄┄┄ корреляции                  ║
//  ║  ─── сообщения                   ║
//  ╠══════════════════════════════════╣
//  ║ Идентификация запросов и ответов ║
//  ╚══════════════════════════════════╝
// Использование идентификатора для сопоставления ответов и запросов в произвольном порядке.

// Простой однонаправленный канал типа точка­-точка (прямое соединение узлов) 
//      с полнодуплексной связью (сообщения перемещаются в обоих направлениях).

// К простым каналам относятся: 
// - веб­ сокеты, которые устанавливают соединение точка­-точка между сервером и браузером, 
//      и сообщения по ним могут перемещаться в любом направлении;
// - коммуникационный канал, создаваемый при запуске дочернего процесса с помощью 
//      child_process.fork, этот канал также является асинхронным, он связывает родительский 
//      процесс только с дочерним и позволяет передавать сообщения в любом направлении. 
//      Родительский процесс имеет доступ к каналу связи с дочерним процессом с помощью 
//      двух методов: child.send(message) и child.on('message',callback). Дочерний процесс 
//      имеет доступ к каналу связи с родительским процессом посредством: process.send(message) и 
//      process.on('message',callback).

// Запуск:
//      node requestor

function require_431() {
    require('./PatternsRequestResponse/07_correlation_id/requestor');
}

// --- 43.2 Обратный адрес

//  ╔═══════════════════════════════════════════════════════════════════════╗
//  ║                            ╭┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄╮            ║
//  ║                            ┆           брокер            ┆            ║
//  ║                            ┆    ┌───┬───┬───┬───┬───┐    ┆    ╭─────╮ ║
//  ║ ╭──────────────────────────┆────┤   │   │   │   │▒▒▒├ ← ─┆────┼┈┈╮  │ ║
//  ║ │     ╭───────────────╮    ┆    └───┴───┴───┴───┴───┘    ┆    │  ┊  │ ║
//  ║ ╰── → ┤запрашивающий А├──╮ ┆ ответы для запрашивающего А ┆    │  ┊  │ ║
//  ║       ╰───────────────╯  │ ┆    ┌───┬───┬───┬───┬───┐    ┆    │  ┊  │ ║
//  ║                          ├─┆─ → ┤   │   │   │   │▒▒▒├────┆─ → ┼┈┈┤  │ ║
//  ║       ╭───────────────╮  │ ┆    └───┴───┴───┴───┴───┘    ┆    │  ┊  │ ║
//  ║ ╭── → ┤запрашивающий Б├──╯ ┆      очередь запросов       ┆    │  ┊  │ ║
//  ║ │     ╰───────────────╯    ┆    ┌───┬───┬───┬───┬───┐    ┆    │  ┊  │ ║
//  ║ ╰──────────────────────────┆────┤   │   │   │   │▒▒▒├ ← ─┆────┼┈┈╯  │ ║
//  ║                            ┆    └───┴───┴───┴───┴───┘    ┆    ╰─────╯ ║
//  ╠═════════════════════════╗  ┆ ответы для запрашивающего Б ┆ отвечающий ║
//  ║ Шаблон 'Обратный адрес' ║  ╰┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄╯            ║
//  ╚═════════════════════════╩═════════════════════════════════════════════╝

// Идентификатор корреляции является основным шаблоном для создания связей вида 'Запрос/ответ', 
//      основанных на однонаправленных каналах, но его недостаточно, если архитектура обмена 
//      сообщениями содержит несколько каналов или очередей, или когда имеется нескольких 
//      запрашивающих сторон. В таких ситуациях, в дополнение к идентификатору корреляции, 
//      необходимо также знать обратный адрес, то есть сведения, которые позволят отвечающей 
//      стороне вернуть ответ исходному отправителю запроса.

// При использовании AMQP обратный адрес является очередью, из которой запрашивающая 
//      сторона ожидает поступления ответов. Так как ответ должна получить только одна
//      запросившая сторона, важно, чтобы для каждого потребителя имелась отдельная 
//      очередь. Из этого можно сделать вывод, что для связи с запрашивающей стороной 
//      необходимо использовать временные очереди и отвечающая сторона должна установить 
//      прямую связь с очередью возврата, чтобы иметь возможность возвращать ответы.

//      http://zguide.zeromq.org/page:all#advanced-request-reply

// Запуск:
//      node replier
//      node requestor
//      проверка: после запуска отвечающая стороны создаст надежную очередь, если остановить ее, 
//          а затем снова запустить запрашивающую сторону, запросы не будут потеряны, сообщения 
//          будут храниться в очереди, пока снова не запустится отвечающая сторона
//      проверка: запуск нескольких экземпляров отвечающей стороны приведет к распределению 
//          нагрузки между ними, поскольку каждый экземпляр подключается к одной и той же 
//          надежной очереди, что дает брокеру возможность распределять нагрузку между всеми 
//          потребителями (шаблон конкурирующих потребителей)

function require_432() {
    require('./PatternsRequestResponse/08_return_address/replier');
    require('./PatternsRequestResponse/08_return_address/requestor');
}

// --- Запуск.

module.exports = (example) => {
    if (example === 43.1) require_431();
    if (example === 43.2) require_432();
}