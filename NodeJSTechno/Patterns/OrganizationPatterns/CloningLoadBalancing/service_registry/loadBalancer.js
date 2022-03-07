"use strict";

//
const http = require('http');
const httpProxy = require('http-proxy');

// для получения доступа к реестру выполняется загрузка модуля consul
const consul = require('consul')();

// таблица соответствия URL­-путей и служб
const routing = [
    {
        // адрес конечной точки
        path: '/api',
        // service - каждый элемент массива содержит службу
        service: 'api-service',
        // index - используется циклическим алгоритмом для передачи запросов службам
        index: 0
    },
    {
        path: '/',
        service: 'webapp-service',
        index: 0
    }
];

// создается экземпляр объекта http-proxy
const proxy = httpProxy.createProxyServer({});

// запускается обычный веб­сервер
http.createServer((req, res) => {
    let route;

    // выполняется поиск URL ­адреса в таблице маршрутизации и извлекается 
    //      дескриптор, содержащий имя службы
    routing.some(entry => {
        route = entry;
        //Starts with the route path?
        return req.url.indexOf(route.path) === 0;
    });

    // - извлекается список серверов, реализующих требуемые службы
    // - если список пуст, то клиенту возвращается ошибка
    // - атрибут Tag используется для фильтрации всех доступных служб и 
    //      поиска адресов серверов, реализующих данный вид службы
    consul.agent.service.list((err, services) => {

        // 
        const servers = [];
        Object.keys(services).filter(id => {
            if (services[id].Tags.indexOf(route.service) > -1) {
                servers.push(`http://${services[id].Address}:${services[id].Port}`)
            }
        });

        // 
        if (!servers.length) {
            res.writeHead(502);
            return res.end('Bad gateway');
        }

        // - можно передать запрос по назначению 
        // - route.index изменяется, чтобы указывать на следующий сервер в списке,
        //      в соответствии с циклическим алгоритмом
        // - по индексу выбирается север из списка servers и передается в вызов proxy.web
        //      вместе с объектами запроса (req) и ответа (res), что обеспечивает отправку
        //      запроса выбранному серверу
        route.index = (route.index + 1) % servers.length;
        proxy.web(req, res, { target: servers[route.index] });
    });
}).listen(8080, () => console.log('Load balancer started on port 8080'));