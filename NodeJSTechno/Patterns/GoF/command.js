"use strict";

const http = require('http');
const serverDestroy = require('server-destroy');
const request = require('request');
const util = require('util');



// --------------- 24. Команда (command).

// Команда - это объект, инкапсулирующий информацию, необходимую для выполнения 
//      действия. Вместо вызова функции создается объект, представляющий намерение 
//      выполнить этот вызов. Реализацией этого намерения в реальное действие 
//      управляет другой объект. В шаблон входят следующие объекты:
//      - команда               объект, инкапсулирующий сведения для выполнения действия
//      - клиент                создает команду и передает ее инициатору
//      - инициатор             отвечает за выполнение команды целью
//      - получатель(цель)      субъект инициатора

// Шаблон имеет следующие преимущества:
// - выполнение команд можно запланировать на более позднее время;
// - команды могут пересылаться по сети;
// - команды упрощают хранение истории операций;
// - команду можно отменить или откатить приложение к некоторому состоянию;
// - команды можно группировать в транзакции;
// - к наборам команд можно применять различные алгоритмы: удаление дубликатов, 
//      соединение/разделение наборов команд, оперативное преобразование (Operational 
//      Transformation, OT).
//      understanding and applying operational transformation

// --- 24.1 Шаблон Задание.

// Шаблон Задание - это отдельная функция для управления выполнением одной операцией, 
//      что явдяется эквивалентом инициатора в шаблоне Команда. Простейшая реализация:
function task_template() {
    console.log(`
        --- --- --- task_template --- --- ---
    `);

    // 
    function createTask(target, args) {
        return () => {
            target.apply(null, args);
        }
    }

    // 
    const first = (x, y) => console.log(`--- x+y => ${x + y}`);
    const second = (x, y) => console.log(`--- x-y => ${x - y}`);
    const third = (x, y) => console.log(`--- x-y => ${x * y}`);
    const args = [10, 10];

    // 
    let task;
    task = createTask(first, args);
    task();
    task = createTask(second, args);
    task();
    task = createTask(third, args);
    task();
}

// --- 24.2 Шаблон Команда.

// Шаблон 'Команда' слеудет использовать когда это действительно необходимо, поскольку
//      реализация шаблона требует написания большого количества кода. Если необходимо 
//      запланировать выполнение задания или выполнить операцию асинхронно, то шаблон
//      'Задание' будет более оптимальным решением. Шаблон 'Команда' используется для
//      более сложных случаев.

// инициатор - хранит историю команд, выполняет команды
class Invoker {

    constructor() {
        this.history = [];
    }

    // реализация инициатора, метод отвечает за сохранение команды в переменной 
    //      экземпляра history с последующим ее выполнением
    run(cmd) {
        this.history.push(cmd);
        cmd();
        console.log(`--- command executed: ${cmd.toString()}`);
    }

    // задерживает выполнение команды
    delay(cmd, delay) {
        setTimeout(() => this.run(cmd), delay);
    }

    // отменяет последнюю команду
    undo() {
        const cmd = this.history.pop();
        cmd.undo();
        console.log(`--- command undo: ${cmd.toString()}`);
    }

    // сериализация объекта команды и передача по сети с помощью веб­службы
    async runRemotely(cmd) {
        return new Promise(async (resolve, reject) => {
            request.post(
                'http://localhost:3000/cmd',
                {
                    // запрос отправляет на сервер описание команды, по которому
                    //      сервер может восстановить команду и выполнить
                    json: cmd.serialize()
                },
                (err, httpResponse, body) => {
                    console.log(`
                        --- error: ${err}
                        --- body: ${body}
                        --- command executed remotely: ${cmd.toString()}`);
                    resolve();
                }
            );
        });
    }
}

// создатель команды - создает объект команды
function commandCreator_SendStatus(service, status) {
    let postId = null;

    // команда является функцией, которая запускает действие:
    //      отправляет новое сообщение, используя методы целевой 
    //      службы
    const command = () => {
        postId = service.sendUpdate(status);
    };

    // отменяет результат операции, вызывая метод destroyUpdate 
    //      целевой службы
    command.undo = () => {
        if (postId) {
            service.destroyUpdate(postId);
            postId = null;
        }
    };

    // создает объект JSON, содержащий всю информацию, необходимую 
    //      для воссоздания объекта команды
    command.serialize = () => {
        return { type: 'status', action: 'post', status: status };
    };
    command.toString = () => {
        return JSON.stringify(command.serialize());
    };

    return command;
}

// получатель - отвечает за отправку сведений в службу
function commandReceiver_localService() {

    let lastId = 0;
    let statusUpdates = {};

    return {
        sendUpdate: (status) => {
            let id = ++lastId;
            statusUpdates[id] = status;
            console.log(`--- send: status-${status} / id-${id}`);
            return id;
        },
        destroyUpdate: (id) => {
            let status = statusUpdates[id];
            console.log(`--- destroy: status-${status} / id-${id}`);
            delete statusUpdates[id];
        }
    };
}

// удаленный получатель - получает команды, как запросы по сети
async function commandReceiver_remoteService() {
    return new Promise(async (resolve, reject) => {

        // сервер
        const server = http.createServer((request, response) => {

            // отбраковка запросов
            if (request.url !== '/cmd') {
                response.writeHead(400);
                response.end();
            }

            // получение данных
            let data = '';
            request.on('data', chunk => {
                data += chunk;
            });

            // завершение ответа
            request.on('end', () => {
                let cmd = JSON.parse(data);
                console.log(`--- command: 
                    - action = ${cmd.action} 
                    - status = ${cmd.status} 
                    - type = ${cmd.type}
                `);

                // 
                response.writeHead(200, { 'Content-Type': 'application/json' });
                response.end(JSON.stringify({ ok: true }));
            });
        }).listen(
            3000,
            () => {
                console.log('--- server start');
                resolve(server);
            }
        );
    });
}

// 
async function command_template() {
    console.log(`
        --- --- --- command_template --- --- ---
    `);

    // 
    const server = await commandReceiver_remoteService();

    // клиент
    const invoker = new Invoker();
    // создается команда
    const commandReceiver = commandReceiver_localService();
    const command = commandCreator_SendStatus(commandReceiver, 'HI!');
    // отправка команды
    invoker.run(command);
    // отмена команды
    invoker.undo();
    // запланировать выполнение команды
    invoker.delay(command, 2000);

    // выполнить удаленную команду
    await invoker.runRemotely(command);

    server.close();
    serverDestroy(server);
    server.destroy();
}

// --- Запуск.

(async () => {
    task_template();
    command_template();
})();