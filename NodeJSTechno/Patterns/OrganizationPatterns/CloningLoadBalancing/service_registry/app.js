"use strict";

// 
const http = require('http');
const consul = require('consul')();
const portfinder = require('portfinder');

//
const pid = process.pid;
const serviceType = process.argv[2];

// метод portfinder.getPort позволяет получить свободный порт, начиная с 8000
portfinder.getPort((err, port) => {

    // 
    const serviceId = serviceType + port;

    // выполняется регистрация новой службы в реестре:
    //      id              уникальное имя службы, 
    //      name            общее имя, идентифицирующее службу, 
    //      address/port    для доступа к службе, 
    //      tags            массив тегов для фильтрации и группировки служб. 
    consul.agent.service.register(
        {
            // name и tags определяются с помощью serviceType из командной строки, что
            //      позволит идентифицировать все службы одного типа, доступные в кластере
            id: serviceId,
            name: serviceType,
            address: 'localhost',
            // servers.push(`http://${services[id].Address}:${services[id].Port}`) 
            port: port,
            tags: [serviceType]
        },
        () => {

            // позволяет удалить службу, зарегистрированнyю в реестре Consul
            const unregisterService = (err) => {
                consul.agent.service.deregister(serviceId, () => {
                    process.exit(err ? 1 : 0);
                });
            };

            // функция unregisterService вызывается в момент завершения программы
            //      для отмены регистрации в реестре Consul
            process.on('exit', unregisterService);
            process.on('SIGINT', unregisterService);
            process.on('uncaughtException', unregisterService);

            // выполняется запуск HTTP ­сервера, прослушивающего порт, обнаруженный 
            //      с помощью portfinder
            http.createServer(
                (req, res) => {
                    for (let i = 1e7; i > 0; i--) { }
                    console.log(`Handling request from ${pid}`);
                    res.end(`${serviceType} response from ${pid}\n`);
                }
            ).listen(port, () => {
                console.log(`Started ${serviceType} (${pid}) on port ${port}`);
            });
        });
});