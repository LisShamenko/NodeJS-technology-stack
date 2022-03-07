"use strict";

// json-over-tcp - упрощающает отправку объектов в формате JSON через 
//      TCP ­подключение.
//      https://npmjs.org/package/json-over-tcp
const jot = require('json-over-tcp');
const port = 5000;



// --------------- 21. Состояние (state).

// Состояние - это вариант шаблона 'Стратегия', в котором стратегия меняется 
//      в зависимости от состояния контекста. Стратегии являются динамическими и 
//      могут изменяться в течение времени существования контекста, что позволяет 
//      адаптировать его поведение в зависимости от внутреннего состояния. Переход 
//      между состояниями может инициироваться объектом контекста, кодом клиента или 
//      объектами состояний.

// --- 21.1 Состояние сервера.

// TCP-­сокет, обрабатывающий потерю соединения с сервером, все данные сохраняются 
//      в очереди, после восстановления подключения предпринимается попытка отправки
//      сохраненных данных, данные будут регулярно постоянно от ряда машин

// 
class OfflineState {

    constructor(failsafeSocket) {
        this.failsafeSocket = failsafeSocket;
    }

    // помещает данные в очередь
    send(data) {
        this.failsafeSocket.queue.push(data);
    }

    // пытается установить соединение с сервером интервалом 500 миллисекунд,
    //      после восстановления соединения объект failsafeSocket перейдет 
    //      в состояние online
    activate() {
        const retry = () => {
            setTimeout(() => this.activate(), 500);
        };
        this.failsafeSocket.socket = jot.connect(
            this.failsafeSocket.options,
            () => {
                this.failsafeSocket.socket.removeListener('error', retry);
                this.failsafeSocket.changeState('online');
            }
        );
        this.failsafeSocket.socket.once('error', retry);
    }
};

// 
class OnlineState {
    constructor(failsafeSocket) {
        this.failsafeSocket = failsafeSocket;
    }

    // записывает данные в сокет, соединение установлено
    send(data) {
        this.failsafeSocket.socket.write(data);
    };

    // - отсылает данные, накопленные в автономном режиме и отслеживает все 
    //      события error, чтобы выполнить переход сокета в автономный режим
    activate() {
        this.failsafeSocket.queue.forEach(data => {
            this.failsafeSocket.socket.write(data);
        });
        this.failsafeSocket.queue = [];

        this.failsafeSocket.socket.once('error', () => {
            this.failsafeSocket.changeState('offline');
        });
    }
};

//
class FailsafeSocket {

    // в конструкторе создается набор из двух состояний: 
    //      для реализации поведения сокета в автономном режиме;
    //      для работы в режиме соединения.
    constructor(options) {
        this.options = options;
        // очередь будет содержать данные, пока сокет находится в автономном режиме
        this.queue = [];
        this.currentState = null;
        this.socket = null;
        this.states = {
            offline: new OfflineState(this),
            online: new OnlineState(this)
        };
        this.changeState('offline');
    }

    // отвечает за переход из одного состояния в другое, обновляет 
    //      currentState и вызывает activate
    changeState(state) {
        console.log(`--- activating state: ${state}`);
        this.currentState = this.states[state];
        this.currentState.activate();
    }

    // функциональность сокета, которая меняется в зависимости от состояния,
    //      операция делегируется активному состоянию
    send(data) {
        this.currentState.send(data);
    }
}

// 
async function createServer() {
    return new Promise(async (resolve, reject) => {

        // сервер выводит полученные сообщения в консоль
        const server = jot.createServer({ port: port });
        server.on('connection', socket => {
            socket.on('data', data => {
                console.log(`--- client data: ${data}`);
            });
        });
        server.listen(port, () => {
            console.log(`--- server start`);
            resolve(server);
        });
    });
}

// 
async function usingState(count, server) {
    return new Promise(async (resolve, reject) => {

        let i = 0;

        // клиент отправляют сведения об использованной памяти каждую секунду
        const failsafeSocket = new FailsafeSocket({ port: port });
        const timer = setInterval(
            () => {
                failsafeSocket.send(process.memoryUsage());
                i++;
                if (i >= count) {
                    clearInterval(timer);
                    resolve(failsafeSocket);
                }
            },
            1000
        );
    });
}

// 
async function state_pattern() {
    console.log(`
        --- --- --- state_pattern --- --- ---
    `);
    return new Promise(async (resolve, reject) => {

        // запуск:
        // - запустить сервер и клиент
        // - для проверки класса failsafeSocket остановить и запустить сервер

        // 
        const server = await createServer();
        const socket = await usingState(5, server);
        server._server.close();
        socket.socket.destroy();
        resolve();
    });
}

// --- Запуск.

// 
(async () => {
    await state_pattern();
})();
