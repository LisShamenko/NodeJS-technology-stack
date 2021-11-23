// --------------- Bigint

namespace bigint {

    // ограничения текущего типа number в JavaScript
    console.log(`Number.MAX_SAFE_INTEGER : ${Number.MAX_SAFE_INTEGER}`);
    let highest53bitNumber = 9_007_199_254_740_991;
    for (let i = 0; i < 10; i++) {
        console.log(`${i} : ${highest53bitNumber + i}`);
    }
    
    // Bigint. Тип bigint нельзя смешивать с базовыми типами string, number и boolean. 
    console.log(`using bigint :`);

    //      Error: BigInt literals are not available when targeting lower than ES2020.
    let bigIntNumber: bigint = 9_007_199_254_740_991n;
    for (let i = 0; i < 10; i++) {
        // BigInt(i) преобразует переменную i типа number в тип bigint
        console.log(`${i} : ${bigIntNumber + BigInt(i)}`);
    }

}