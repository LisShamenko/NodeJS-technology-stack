"use strict";

const request = require('request');
const seaport = require('seaport');

// 
const ports = seaport.connect('localhost', 9090);
let queue = [];
let i = 0;

// 
ports.on('synced', () => {
    queue.forEach(args => {
        apiRequest.apply(null, args);
    });
});

// 
function apiRequest(path, cb) {

    // 
    let servers = ports.query('api-service');
    if (!servers.length) {
        return queue.push([path, cb]);
    }

    // 
    i = (i + 1) % servers.length;
    let url = 'http://' + servers[i].host + ':' + servers[i].port + path;

    // 
    request(url, cb);
};

// 
module.exports.apiRequest = apiRequest;