"use strict";

// --- 36.3 Взаимодействие с дочерним процессом.

// 
const EventEmitter = require('events').EventEmitter;

// - роль класса SubsetSumFork заключается во взаимодействии с рабочим процессом и 
//      передаче возвращаемых им результатов
// - класс SubsetSumFork воспроизводит программный интерфейс исходного класса SubsetSum
class SubsetSumFork extends EventEmitter {
    constructor(workers, sum, set) {
        super();
        this.workers = workers;
        this.sum = sum;
        this.set = set;
    }

    // 
    start() {

        // - попытка извлечь новый дочерний процесс из пула, где дескриптор worker
        //      используется для отправки сообщения с исходными данными
        // - функция send автоматически предоставляется платформой NodeJS всем процессам, 
        //      запущенным с помощью функции child_process.fork, это и есть канал связи
        this.workers.acquire((err, worker) => {

            // функция send дочернего процесса тоже может использоваться для передачи 
            //      дескриптора сокета из основного приложения в дочерний процесс
            //      https://nodejs.org/api/child_process.html#child_process_child_send_message_sendhandle
            worker.send({ sum: this.sum, set: this.set });

            // 
            const onMessage = msg => {

                // при получении события end задание SubsetSum завершается: обработчик onMessage 
                //      удаляется, а процесс worker освобождается и возвращается в пул
                if (msg.event === 'end') {
                    worker.removeListener('message', onMessage);
                    this.workers.release(worker);
                }

                // рабочий процесс генерирует сообщения в формате {event, data}, что позволяет 
                //      повторно возбуждать любые события дочернего процесса
                this.emit(msg.event, msg.data);
            };

            // - прием сообщений, возвращаемых рабочим процессом
            // - это часть возможностей коммуникационного канала, предоставляемого всем процессам, 
            //      запущенным с помощью функции child_process.fork
            worker.on('message', onMessage);
        });
    }
}

// 
module.exports = SubsetSumFork;