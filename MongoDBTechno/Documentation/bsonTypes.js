// --------------- 5. BSON Types.

//      https://www.mongodb.com/docs/manual/reference/bson-types/

// BSON - это формат двоичной сериализации, используемый для хранения документов и 
//      выполнения RPC (remote procedure calls). Каждый тип BSON имеет целочисленные и 
//      строковые идентификаторы:

//  Type                      | Number | Alias                 | Notes
// ───────────────────────────┼────────┼───────────────────────┼───────────────────────────
// Double                     |   1    | "double"              |                   
// String                     |   2    | "string"              |                   
// Object                     |   3    | "object"              |                   
// Array                      |   4    | "array"               |                   
// Binary data                |   5    | "binData"             |                   
// Undefined                  |   6    | "undefined"           | Deprecated.                                       
// ObjectId                   |   7    | "objectId"            |                       
// Boolean                    |   8    | "bool"                |                   
// Date                       |   9    | "date"                |                   
// Null                       |   10   | "null"                |                   
// Regular Expression         |   11   | "regex"               |                   
// DBPointer                  |   12   | "dbPointer"           | Deprecated.                                       
// JavaScript                 |   13   | "javascript"          |                       
// Symbol                     |   14   | "symbol"              | Deprecated.                                       
// JavaScript code with scope |   15   | "javascriptWithScope" | Deprecated in MongoDB 4.4.                                        
// 32-bit integer             |   16   | "int"                 |               
// Timestamp                  |   17   | "timestamp"           |                       
// 64-bit integer             |   18   | "long"                |                   
// Decimal128                 |   19   | "decimal"             | New in version 3.4.                                       
// Min key                    |   -1   | "minKey"              |                   
// Max key                    |   127  | "maxKey"              |                   

// Оператор $type позволяет запрашивать поля по их строковому типу BSON и числовому
//      псевдониму для типов integer, decimal, double, long. 
// Оператор $type в конвейере возвращает тип BSON своего аргумента.
// Оператор $isNumber в конвейере возвращает значение true, если его аргумент имеет
//      тип: integer, decimal, double, long.

// --- --- ObjectId

// ObjectId - это идентификаторы: small, likely unique, fast to generate, ordered.
//      Имеет длину 12 байт:
//      4 байта: timestamp - время создания ObjectId в секундах Unix;
//      5 байта: случайное значение, уникальное для машины и процесса;
//      3 байта: инкрементный счетчик, инициализированный случайным значением.

// Формат BSON имеет прямой порядок следования байтов, но временная метка и счетчик 
//      имеют обратный порядок байтов.

// Если для создания ObjectId используется значение integer, то оно заменяет 
//      отметку времени.

// Для каждого документа в коллекции требуется уникальное поле _id, которое действует 
//      как первичный ключ. Если поле _id отсутствует, то MongoDB автоматически создает 
//      ObjectId для поля _id, в том числе для документов созданных при помощи 'upsert:true'.

// Использование ObjectId для поля _id дает дополнительные преимущества:
//      - можно будет в mongosh получить доступ ко времени создания файла ObjectId
//          через метод ObjectId.getTimestamp;
//      - сортировка по полю _id будет эквивалентна сортировке по времени создания.

// --- --- String

// Строки BSON имеют кодировку UTF-8. Строки автоматически преобразуются в формат UTF-8
//      при сериализации и десериализации BSON. Запросы $regex поддерживают UTF-8.

// --- --- Timestamps

// Timestamp - этот тип данных, предназначен для внутреннего использования MongoDB и 
//      не связан с обычным типом Date. Имеет длину 64 байт:
//      32 бита - time_t - время в секундах Unix;
//      32 бита - ordinal - инкремнтный номер операции.

// В пределах одного экземпляра mongod значения time_t всегда уникальны. 

// При создании документа пустые поля Timestamp всегда заменяются текущим значением 
//      времени. Исключением являются поля _id, которые содержат Timestamp и всегда
//      вставляются, как есть.

//      tests.insertMany([
//          { ts: new Timestamp() }
//      ]);

// --- --- Date

//  Date - это 64-битное целое число, представляющее количество миллисекунд, прошедших 
//      начиная с эпохи Unix (1 января 1970). Даты до эпохи Unix имеют отрицательные 
//      значения. Тип BSON Date - это UTC datetime.

// Создание даты:
//      var mydate1 = new Date()
//      var mydate2 = ISODate()

// Вернуть строчное представление даты:
//      mydate1.toString()
//      mydate1.getMonth()