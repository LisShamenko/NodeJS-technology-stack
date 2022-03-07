"use strict";

const zmq = require('zmq');
const reply = zmq.socket('rep');
const request = zmq.socket('req');

const koa_app = require('koa');


// --------------- 23. Промежуточное программное обеспечение (middleware).

// --- 23.1 ZMQ.

// ØMQ (ZMQ, ZeroMQ) - библиотека предоставляет простой интерфейс для обмена 
//      атомарными сообщениями по сети с использованием различных протоколов
//      http://zeromq.org
//      https://zeromq.org/get-started/?language=nodejs#

// ØMQ сокеты req/rep
//      https://www.oreilly.com/library/view/zeromq/9781449334437/ch01s04.html

// Шаблон 'промежуточное программное обеспечение' - представляет набор служб, 
//      которые обычно являются функциями, собранными в конвейер и отвечающими 
//      за обработку входящих запросов и создание ответов. Этот шаблон похож 
//      на шаблоны: 'Перехватывающий фильтр' (Intercepting Filter) и 
//      'Цепочка обязанностей' (Chain of Responsibility).

// Шаблон 'перехватывающий фильтр'
//      https://www.oracle.com/java/technologies/intercepting-filter.html

// Шаблон 'цепочка обязанностей' 
//      https://www.dofactory.com/javascript/design-patterns/chain-of-responsibility

// Пример сигнатуры:
//      function(req, res, next) { ... }
// где: 
//      req - входящий ­запрос, 
//      res – ответ, 
//      next – функция обратного вызова, вызов которой инициирует переход к следующему
//          этапу обработки, каждое промежуточное программное обеспечение вызывает эту 
//          функцию после завершения своих операций

// За организацию конвейера отвечает диспетчер промежуточного программного обеспечения: 
//      - новое промежуточное программное обеспечение регистрируется вызовом функции 
//          use и обычно помещается в конец конвейера.    
//      - для обработки данных конвейером запускается асинхронный поток, который 
//          последовательно выполняет зарегистрированные задания, каждый блок конвейера
//          передает свой результат на вход следующего блока
//      - любое задание может остановить конвейер, не вызывая следующий блок или передав
//          ему ошибку, ошибки могут обрабатываться другой последовательностью заданий
//      - передача данных по конвейеру может происходить разными способами: расширение
//          объекта данных новыми свойствами, замена данных, возврат копий данных

// 
class ZmqMiddlewareManager {

    // конструктор принимает аргумент с сокетом ØMQ
    constructor(socket) {
        this.socket = socket;

        // два списка будут содержать функции промежуточного программного 
        //      обеспечения, для обработки входящих и исходящих сообщений
        this.inboundMiddleware = [];
        this.outboundMiddleware = [];

        // прием поступающих из сокета сообщений через событие 'message'
        //      сообщения передаются в конвейер inboundMiddleware
        socket.on('message', message => {
            this.executeMiddleware(this.inboundMiddleware, {
                data: message
            });
        });
    }

    // отвечает за выполнение ПО из списка outboundMiddleware при отправке 
    //      сообщения через сокет
    send(data) {
        const message = {
            data: data
        };

        this.executeMiddleware(
            this.outboundMiddleware,
            message,
            () => this.socket.send(message.data));
    }

    // добавляет новые функции в конвейер, каждое ПО включает две функции
    //      inbound и outbound, которые добавляются в списки: 
    //      - inbound добавляется в конец списка inboundMiddleware
    //      - outbound вставляется в начало списка outboundMiddleware
    //      inbound вызываются в прямом порядке, а outbound в обратном
    use(middleware) {
        if (middleware.inbound) {
            this.inboundMiddleware.push(middleware.inbound);
        }
        if (middleware.outbound) {
            this.outboundMiddleware.unshift(middleware.outbound);
        }
    }

    // поочередно выполняет функции из массива middleware, каждой передается 
    //      объект arg, что позволяет передавать данные из одной функции в другую,
    //      в конце вызывается finish
    executeMiddleware(middleware, arg, finish) {

        // 
        function iterator(index) {

            // 
            if (index === middleware.length) {
                return finish && finish();
            }

            // 
            middleware[index].call(this, arg, err => {
                if (err) {
                    return console.log('There was an error: ' + err.message);
                }

                // 
                iterator.call(this, ++index);
            });
        }

        // 
        iterator.call(this, 0);
    }
};

// 
function middleware_zmq() {

    // Запуск:
    //      node server
    //      node client

    // --- --- Сервер.

    // инициализируем ПО, подключает сокет rep(ответ) к локальному порту
    reply.bind('tcp://127.0.0.1:5000');
    const zmqm = new ZmqMiddlewareManager(reply);
    zmqm.use(jsonMiddleware.json());
    
    // inbound и outbound определены с помощью function, для стрелочной функции
    //      область видимости ограничивается ее лексической областью, функция call 
    //      используется для вызова функций, не влияет на внутреннюю область видимости 
    //      стрелочных функций, ПО не распознает экземпляр zmqMiddlewareManager и 
    //      возникнет ошибка "TypeError: this.send is not a function".    
    zmqm.use({
        inbound: function (message, next) {
            console.log('Received: ', message.data);
            if (message.data.action === 'ping') {
                this.send({ action: 'pong', echo: message.data.echo });
            }
            next();
        }
    });

    // --- --- Клиент.

    // настроить фреймворк ПО
    request.connect('tcp://127.0.0.1:5000');
    const zmqm = new ZmqMiddlewareManager(request);
    zmqm.use(jsonMiddleware.json());
    zmqm.use({
        inbound: function (message, next) {
            console.log('Echoed back: ', message.data);
            next();
        }
    });
    setInterval(() => zmqm.send({ action: 'ping', echo: Date.now() }), 1000);

    // ØMQ позволяет использовать в сообщениях только строки и двоичные буферы,
    //      сериализует и десериализует сообщения в формате JSON
    jsonMiddleware = () => {
        return {
            // десериализует входящее сообщение в message.data
            inbound: function (message, next) {
                message.data = JSON.parse(message.data.toString());
                next();
            },
            // сериализует данные из message.data
            outbound: function (message, next) {
                message.data = new Buffer(JSON.stringify(message.data));
                next();
            }
        }
    };
}

// --- Запуск.

middleware_zmq();