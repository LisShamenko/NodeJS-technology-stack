// --------------- 7. Variables in Aggregation Expressions.

// --- 7.4 Aggregation Stages.

//      https://www.mongodb.com/docs/manual/reference/aggregation-variables/

// Aggregation-выражения могут использовать пользовательские и системные переменные.
//      Переменные могут содержать любые данные типа BSON. Для доступа к значению 
//      переменной используется синтаксис: "$$<variable>". Для доступа к полю объекта
//      сохраненного в переменной используется синтаксис: "$$<variable>.<field>".

// --- --- User Variables.

// Имена пользовательских переменных должны начинаться со строчной буквы ascii [a-z],
//      могут содержать символы ascii [_a-zA-Z0-9] и любые другие символы.

// --- --- System Variables.

// Используются в $let, $redact и $map.

//  Command             |   mongosh Methods
//  ────────────────────┼────────────────────
//  NOW                 | возвращает текущее значение даты и времени, возвращает
//                      | одно и то же значение для всех стадий конвейера
//  ────────────────────┼────────────────────
//  CLUSTER_TIME        | возвращает текущее значение timestamp, переменная 
//                      | CLUSTER_TIME доступна только для реплик и кластеров,
//                      | возвращает одно и то же значение для всех стадий конвейера 
//  ────────────────────┼────────────────────
//  ROOT                | ссылается на корневой документ (документ верхнего уровня), 
//                      | который в данный момент обрабатывается в конвейере
//  ────────────────────┼────────────────────
//  CURRENT             | ссылается на начало пути к полю документа в конвейере, 
//                      | на первой стадии конвейера CURRENT совпадает с ROOT
//  ────────────────────┼────────────────────
//  REMOVE              | возвращает missing значение для удаления полей из документов 
//                      | при обработке конвейера, например, на стадии $project
//  ────────────────────┼────────────────────
//  DESCEND             | один из допустимых результатов $redact
//  ────────────────────┼────────────────────
//  PRUNE               | один из допустимых результатов $redact
//  ────────────────────┼────────────────────
//  KEEP                | один из допустимых результатов $redact