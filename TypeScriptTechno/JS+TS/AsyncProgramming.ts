// --------------- Асинхронное программирование

namespace async_programming {

    // --- стандартный механизм обратного вызова

    function invokeAsync(callbackSuccess, callbackError) {
        setTimeout(() => {
            try {
                callbackSuccess();
            }
            catch (err) {
                callbackError();
            }
        }, 1000);
    }
    function standardCallback() {
        // Выполняем этот код
        function afterCallbackSuccess() { }
        // В случае ошибки
        function afterCallbackError() { }
        // Вызываем асинхронную функцию
        invokeAsync(afterCallbackSuccess, afterCallbackError);
    }
    standardCallback();

    // --- Promise

    interface IPromiseMessage {
        message: string;
        id: number;
    }

    // Promise создается путем передачи функции, которая принимает два обратных вызова: для указания успешного ответа и ошибки
    function promiseFunction(resolve: (result: IPromiseMessage) => void, reject: (error: string) => void) {
        // промисы могут возвращать только одно значение при вызове функций resolve и reject
        setTimeout(() => {
            try {
                resolve({ id: 0, message: '' });
            }
            catch (err) {
                reject('error');
            }
        }, 2000);
    }
    function returnPromise(): Promise<IPromiseMessage> {
        // синтаксис обобщений (new Promise<void>) используется, чтобы показать тип данных возвращаемых промисом
        return new Promise<IPromiseMessage>(promiseFunction);
    }
    // синтаксис для обработки resolve
    function callDelayedPromise() {
        // в then определяется анонимная функция, которая будет вызвана, когда промис будет выполнен
        returnPromise()
            .then((result: IPromiseMessage) => {
                console.log(`then() --- result = ${result}`)
            })
            .catch((error: string) => {
                console.log(`catch() --- error = ${error}`)
            });
    }
    callDelayedPromise();

    // --- async и await

    function awaitPromise(): Promise<string> {
        return new Promise<string>((resolve: (result: string) => void, reject: (error: string) => void) => {
            setTimeout(() => {
                try {
                    resolve('result');
                }
                catch (err) {
                    reject('error');
                }
            }, 1000);
        });
    }
    // асинхронная функция, помечается 'async'
    async function callAwaitDelayed() {
        console.log(`before promise`);
        try {
            // ключевое слово await ожидает завершение асинхронной функции
            let result = await awaitPromise();
            console.log(`after promise --- result = ${result}`);
        } catch (err) {
            // сообщение ошибки возвращаемое из промиса
            console.log(`after promise --- error = ${err}`);
        }
    }
    callAwaitDelayed();
}
