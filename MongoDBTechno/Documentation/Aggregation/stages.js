const { MongoClient } = require("mongodb");



// --------------- 7. Aggregation.

// --- 7.2 Aggregation Stages.

//      https://www.mongodb.com/docs/manual/reference/operator/aggregation-pipeline/

// Методы db.collection.aggregate и db.aggregate принимает массив стадий конвейера.
//      Стадии конвейера выполняются последовательно.
//      
//      db.collection.aggregate( [ { <stage> }, ... ] )

// --- --- Стадии db.collection.aggregate.

// Все стадии могут использоваться в конвейре несколько раз, кроме стадий:
//       $out, $merge, $geoNear.

// Стадия $addFields - добавляет новые поля в документы, изменяет форму каждого 
//      документа в потоке. Операция $set является псевдонимом для $addFields.
const addFieldsExamples = require('./stages/addFields');

// Стадия $bucket - распределяет документы по группам, называемым buckets, на основе 
//      заданного выражения и границ корзин.

// Стадия $bucketAuto - распределяет документы по группам, называемым buckets, на основе 
//      заданного выражения и границ корзин. Границы корзины определяются автоматически 
//      при попытке равномерно распределить документы по заданному количеству корзин.

// Стадия $collStats - возвращает статистику по коллекции (collection) или 
//      представлению (view).

// Стадия $count - возвращает количество документов на данной стадии конвейера.
const countExamples = require('./stages/count');

// Стадия $facet - обрабтывает одни и те же входные документы на нескольких конвейерах.

// Стадия $geoNear - возвращает документы на основе близости к геопространственной 
//      точке. Включает функции [$match, $sort, $limit] для геопространственных данных. 
//      Выходные документы будут содержать поле distance и идентификатор местоположения.

// Стадия $graphLookup - выполняет рекурсивный поиск в коллекции. Выходные документы 
//      будут содержать поле с результатами рекурсивного поиска.

// Стадия $group - группирует входные документы на основе специального выражения 
//      (identifier expression) и применяет выражение (accumulator expression) 
//      к каждой группе. Выводит по одному документу для каждой отдельной группы. 
//      Выходные документы будут содержать идентификаторы и поля, полученные 
//      на основе специальных выражений.
const groupExamples = require('./stages/group');

// Стадия $indexStats - возвращает статистику использования индексов коллекций.

// Стадия $limit - передает первые n документов без изменений в конвейер.
const limitExamples = require('./stages/limit');

// Стадия $listSessions - список сеансов, доступнх в коллекции system.sessions.

// Стадия $lookup - выполняет 'left outer join' с другой коллекцией в той же базе 
//      данных для фильтрации документов из этой коллекции.
const lookupExamples = require('./stages/lookup');

// Стадия $match - фильтрует документы без изменений. 
const matchExamples = require('./stages/match');

// Стадия $merge - записывает документы конвейера в результирующую коллекцию. 
//      На этой стадии можно вставлять новые документы, объединять документы, 
//      заменять документы, сохранять существующие документы, завершать операцию 
//      с ошибкой, обрабатывать документы с помощью пользовательского конвейера. 
//      Эта стадия должна следовать последней в конвейере. 

// Стадия $out - записывает документы конвейера в результирующую коллекцию. 
//      Эта стадия должна следовать последней в конвейере. 

// Стадия $planCacheStats - возвращает информацию о 'plan cache' для коллекции.

// Стадия $project - изменяет форму каждого документа в потоке. Для каждого входного 
//      документа выводит один документ.
const projectExamples = require('./stages/project');

// Стадия $redact - изменяет форму документов в потоке. Включает в функциональность 
//      $project и $match. Может использоваться для редактирования полей. 
const redactExamples = require('./stages/redact');

// Стадия $replaceRoot - заменяет документ указанным. Заменяет все поля во входном 
//      документе, включая _id. 
const replaceRootExamples = require('./stages/replaceRoot');

// Стадия $replaceWith - является псевдонимом стадии $replaceRoot.
const replaceWithExamples = require('./stages/replaceWith');

// Стадия $sample - случайным образом выбирает указанное количество документов.
const sampleExamples = require('./stages/sample');

// Стадия $search - выполняет полнотекстовый поиск полей в коллекции Atlas. Доступен 
//      только для кластеров MongoDB Atlas.

// Стадия $set - добавляет новые поля в документы. Подобно $project, изменяет форму 
//      каждого документа в потоке. Стадия $set является псевдонимом для $addFields.
const setExamples = require('./stages/set');

// Стадия $setWindowFields - группирует документы в windows и применяет один или 
//      несколько операторов к документам в каждом windows. 

// Стадия $skip - пропускает первые n документов и передает остальные документы 
//      без изменений в конвейер. 
const skipExamples = require('./stages/skip');

// Стадия $sort - упорядочивает документы по указанному ключу сортировки. 
const sortExamples = require('./stages/sort');

// Стадия $sortByCount - группирует документы на основе указанного выражения и
//      вычисляет количество документов в каждой группе.
const sortByCountExamples = require('./stages/sortByCount');

// Стадия $unionWith - объединяет две коллекции, объединяет результаты конвейера 
//      на основе двух коллекций в одну.

// Стадия $unset - удаляет поля из документов, является псевдонимом для $project.
const unsetExamples = require('./stages/unset');

// Стадия $unwind - деконструирует поле с массивом входного документа, чтобы вывести
//      документ для каждого элемента массива. Для каждого входного документа выводит 
//      n документов, где n — количество элементов массива и может быть равно нулю 
//      для пустого массива.
const unwindExamples = require('./stages/unwind');

// Для обновления документов конвейер может содержать следующие стадии:
//      - $addFields или псевдоним $set;
//      - $project или псевдоним $unset;
//      - $replaceRoot или псевдоним $replaceWith.

// --- --- Стадии db.aggregate.

// Метод db.aggregate: 
//      db.aggregate( [ { <stage> }, ... ] )

// Стадия $currentOp - возвращает информацию об active и/или dormant операциях 
//      для развертывания MongoDB.

// Стадия $listLocalSessions - список всех активных сеансов на текущем mongos/mongod
//      экземпляре. Эти сеансы могут отсутствовать в коллекции system.sessions.

// --- Запуск.

(async () => {
    await addFieldsExamples();
    await countExamples();
    await groupExamples();
    await limitExamples();
    await lookupExamples();
    await matchExamples();
    await projectExamples();
    await redactExamples();
    await replaceRootExamples();
    await replaceWithExamples();
    await sampleExamples();
    await setExamples();
    await skipExamples();
    await sortExamples();
    await sortByCountExamples();
    await unsetExamples();
    await unwindExamples();
})();