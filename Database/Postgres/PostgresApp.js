"use strict"

const path = require('path');

// --------------- express

const express = require('express');
const app = express();
app.use(express.static(__dirname + '\\public'));
app.use(express.json({}));
app.use(express.urlencoded({ extended: true }));

// --------------- postgres

const pg = require('pg');
const PostgresWrapper = require("./PostgresWrapper");
const pgWrapper = PostgresWrapper(pg);
const poolWrapper = pgWrapper.getPoolWrapper({
    host: 'localhost',
    port: '5432',
    user: 'postgres',
    password: 'postgres',
    database: 'myClassDB',
});

// --------------- operations

let PostgresOperations = require("./PostgresOperations");
let pgOperations = PostgresOperations(poolWrapper);

// --------------- routers user

// curl --header "Content-Type: application/json" --request POST --data "{\"name\":\"new user\"}" http://localhost:3000/user
app.post('/user', async function (req, res) {
    promiseResultProcessing(pgOperations.insertUser(req.body.name), res);
});

// curl --request DELETE http://localhost:3000/user/00000000-0000-0000-0000-000000000000
app.delete('/user/:id', function (req, res) {
    promiseResultProcessing(pgOperations.deleteUser(req.params.id), res);
});

// curl --request GET http://localhost:3000/user/00000000-0000-0000-0000-000000000000
app.get('/user/:id', function (req, res) {
    promiseResultProcessing(pgOperations.selectUser(req.params.id), res);
});

// curl --request GET http://localhost:3000/users
app.get('/users', function (req, res) {
    promiseResultProcessing(pgOperations.selectUsers(), res);
});

// --------------- routers object

// curl --header "Content-Type: application/json" --request POST --data "{\"ownerId\":\"00000000-0000-0000-0000-000000000000\",\"name\":\"new catalog\"}" http://localhost:3000/catalog
app.post('/catalog', function (req, res) {
    promiseResultProcessing(pgOperations.insertCatalog(req.body.ownerId, req.body.name), res);
})

// curl --request DELETE http://localhost:3000/catalog/0
app.delete('/catalog/:id', function (req, res) {
    promiseResultProcessing(pgOperations.deleteCatalog(req.params.id), res);
})

// curl --request GET http://localhost:3000/catalog/0
app.get('/catalog/:id', function (req, res) {
    promiseResultProcessing(pgOperations.selectCatalog(req.params.id), res);
});

// curl --request GET http://localhost:3000/catalogs
app.get('/catalogs', function (req, res) {
    promiseResultProcessing(pgOperations.selectCatalogs(), res);
});

// --------------- objects

// curl --request GET http://localhost:3000/objects/00000000-0000-0000-0000-000000000000/1
app.get('/objects/:ownerId/:objectType', function (req, res) {
    let objectType = Number.parseInt(req.params.objectType);
    promiseResultProcessing(pgOperations.getAllObjects(req.params.ownerId, objectType), res);
})

// --------------- common

function promiseResultProcessing(promiseResult, res) {
    promiseResult
        .then(result => {
            res.status(200).json(result);
        })
        .catch(err => {
            res.status(400).json({
                message: err.message,
                stack: err.stack
            });
        });
}

// --------------- listen

const PORT = 3000;
const server = app.listen(PORT, () => {
    console.log(`http://localhost:${PORT}`);
});

// --------------- exports

module.exports = app;