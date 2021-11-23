"use strict"

//
const express = require('express');
const app = express();
app.use(express.static(__dirname + '\\public'));
app.use(express.json({}));
app.use(express.urlencoded({ extended: true }));

// --------------- postgres

/*
const path = require('path');
const pg = require('pg');
const PostgresWrapper = require(path.join(process.cwd(), 'Database/Postgres/PostgresWrapper'));
const pgWrapper = PostgresWrapper(pg);
const poolWrapper = pgWrapper.getPoolWrapper({
    host: 'localhost',
    port: '5432',
    user: 'postgres',
    password: 'postgres',
    database: 'myClassDB',
});

// --------------- operations

const MetadataOperations = require('./Operations/MetadataOperations');
const metadataOperations = MetadataOperations(poolWrapper);

const QueriesOperations = require('./Operations/QueriesOperations');
const queriesOperations = QueriesOperations(poolWrapper);
*/

const path = require('path');
const pg = require('pg');
const PostgresOperations = require('./Operations/PostgresOperations');
const operations = PostgresOperations(path, pg);

// --------------- swagger

const joi = require('joi');
const joiToSwagger = require('joi-to-swagger');

// процесс обработки ошибок
const Errors = require('./Errors');
const ResultProcessing = require('./ResultProcessing');
const resultProcessing = ResultProcessing(Errors);

// 
const SubsystemsHelper = require('./Subsystems/SubsystemsHelper');
const subsystemsHelper = SubsystemsHelper(joiToSwagger);

// tables
const TablesModel = require('./Subsystems/Tables/TablesModel');
const tablesModel = TablesModel(operations.metadata, Errors, resultProcessing);
const TablesController = require('./Subsystems/Tables/TablesController');
const tablesController = TablesController(tablesModel, express, joi, joiToSwagger, subsystemsHelper, resultProcessing);
let tablesResult = tablesController.initController();

// columns
const ColumnsModel = require('./Subsystems/Columns/ColumnsModel');
const columnsModel = ColumnsModel(operations.metadata, Errors, resultProcessing);
const ColumnsController = require('./Subsystems/Columns/ColumnsController');
const columnsController = ColumnsController(columnsModel, express, joi, joiToSwagger, subsystemsHelper, resultProcessing);
let columnsResult = columnsController.initController();

// queries
const QueriesModel = require('./Subsystems/Queries/QueriesModel');
const queriesModel = QueriesModel(operations.queries, Errors, resultProcessing);
const QueriesController = require('./Subsystems/Queries/QueriesController');
const queriesController = QueriesController(queriesModel, express, joi, joiToSwagger, subsystemsHelper, resultProcessing);
let queriesResult = queriesController.initController();

// links
const LinksModel = require('./Subsystems/Links/LinksModel');
const linksModel = LinksModel(operations.queries, Errors, resultProcessing);
const LinksController = require('./Subsystems/Links/LinksController');
const linksController = LinksController(linksModel, express, joi, joiToSwagger, subsystemsHelper, resultProcessing);
let linksResult = linksController.initController();

// executors
const ExecutorsModel = require('./Subsystems/Executors/ExecutorsModel');
const executorsModel = ExecutorsModel(operations.metadata, operations.queries, operations.executor, Errors, resultProcessing);
const ExecutorsController = require('./Subsystems/Executors/ExecutorsController');
const executorsController = ExecutorsController(executorsModel, express, joi, joiToSwagger, subsystemsHelper, resultProcessing);
let executorsResult = executorsController.initController();

// data
const DataModel = require('./Subsystems/Data/DataModel');
const dataModel = DataModel(operations.data, operations.metadata, operations.queries, operations.executor, Errors, resultProcessing);
const DataController = require('./Subsystems/Data/DataController');
const dataController = DataController(dataModel, express, joi, joiToSwagger, subsystemsHelper, resultProcessing);
let dataResult = dataController.initController();

// add routers
app.use(tablesResult.router);
app.use(columnsResult.router);
app.use(queriesResult.router);
app.use(linksResult.router);
app.use(executorsResult.router);
app.use(dataResult.router);

// 
process.env.NODE_HOST = 'localhost';
process.env.PORT = 3000;

// swagger declaration
const swaggerDeclaration = {
    openapi: '3.0.0',
    info: {
        title: 'Express/Swagger API',
        version: '1.0.0',
        description: 'API по изучению swagger.'
    },
    servers: [
        {
            url: `http://${process.env.NODE_HOST}:${process.env.PORT}`,
            description: 'API по изучению swagger.'
        }
    ],
    tags: [
        { name: "Metadata / Tables", description: "Операции с таблицами.", },
        { name: "Metadata / Columns", description: "Операции с колонками таблиц.", },
        { name: "Metadata / Query SQL", description: "Операции с запросами.", },
        { name: "Metadata / Links", description: "Операции со связями в запросах.", },
        { name: "Metadata / Executor", description: "Операции с исполнителями запросов.", },
        { name: "Database / Data", description: "Операции с данными таблиц.", },
    ],
    paths: {
        ...tablesResult.paths,
        ...columnsResult.paths,
        ...queriesResult.paths,
        ...linksResult.paths,
        ...executorsResult.paths,
        ...dataResult.paths,
    }
};

// swagger router
let swaggerUI = require('swagger-ui-express');
app.use('/api-docs', swaggerUI.serve, swaggerUI.setup(swaggerDeclaration));

// --------------- common

// --------------- listen

const PORT = 3000;
const server = app.listen(PORT, () => {
    console.log(`http://localhost:${PORT}`);
    console.log(`http://localhost:${PORT}/api-docs`);
});

// --------------- exports

module.exports = app;
