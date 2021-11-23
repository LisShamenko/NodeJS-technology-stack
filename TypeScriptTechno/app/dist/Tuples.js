"use strict";
// --------------- Кортежи
var tuples;
(function (tuples) {
    // Кортежи – это метод определения типа, у которого есть конечное число неназванных свойств.
    // У каждого свойства есть связанный тип. При использовании кортежа должно быть указано 
    // каждое из этих свойств. Кортежи обычно используются, когда нам нужно временно связать
    // два обычно не связанных свойства.
    let tupleType;
    tupleType = ["test", false];
    // деконструирование с помощью синтаксиса массива
    console.log(`tupleType[0] : ${tupleType[0]} --- tupleType[1] : ${tupleType[1]}`);
    // этот метод деконструкции кортежа предпочтителен, потому что нельзя определить массив, 
    //      который превышает количество свойств в кортеже
    let [t1, t2] = tupleType;
    console.log(`t1: ${t1} --- t2: ${t2}`);
    // необязательные элементы кортежа
    let optionalTuple;
    optionalTuple = ["test2", true];
    optionalTuple = ["test"];
    // Кортежи и синтаксис оператора остатка (rest и spread)
    function useTupleAsRest(...args) {
        // параметр args определяется как кортеж и при том используется синтаксис оператора остатка
        let [arg1, arg2, arg3] = args;
        console.log(`arg1: ${arg1} --- arg2: ${arg2} --- arg3: ${arg3}`);
    }
    useTupleAsRest(1, "stringValue", false);
    let restTuple = [1, "string1", "string2", "string3"];
})(tuples || (tuples = {}));
//# sourceMappingURL=Tuples.js.map