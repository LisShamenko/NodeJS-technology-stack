// --------------- express

//      const ExpressApp = require('./App/Express/ExpressApp');
//      console.log('--- ExpressApp = ' + ExpressApp);

// --------------- postgres

//      const PostgresTechno = require('./Database/Postgres/PostgresTechno');
//      PostgresTechno(() => {
//          console.log('--- PostgresTechno complete');
//      });

//      const PostgresApp = require('./Database/Postgres/PostgresApp');
//      console.log('--- PostgresApp = ' + PostgresApp);

// --------------- swagger

//      const SwaggerApp = require('./App/Swagger/SwaggerApp');
//      console.log('--- SwaggerApp = ' + SwaggerApp);

//      const SwaggerApp = require('./test/ChaiExpectTechno');

// --------------- sequelize

//      const SequelizeApp = require('./Database/Sequelize/SequelizeApp');
//      console.log('--- SequelizeApp = ' + SequelizeApp);

// --------------- typescript app

//      const TypescriptApp = require('./TypeScriptTechno/app/dist/app');
//      console.log('--- TypescriptApp = ' + TypescriptApp);

// --------------- react

// запуск только сервиса баз данных
//      http://localhost:3500/

//      const server = require('./ReactTechno/server/server');
//      console.log('--- server = ' + server);

// --------------- nodejs app

//      const NodeJSApp = require('./NodeJSTechno/NodeJSApp');
//      console.log('--- NodeJSApp');
//      NodeJSApp([]);

// --------------- redis

//      const RedisApp = require('./RedisTechno/RedisApp');
//      console.log('--- RedisApp');
//      RedisApp([], []);

// --------------- mongodb

//      const MongoDBApp = require('./MongoDBTechno/MongoDBApp');
//      console.log('--- MongoDBApp');
//      MongoDBApp([], []);

// --------------- rabbitmq

//      const RabbitMQApp = require('./RabbitMQTechno/RabbitMQApp');
//      console.log('--- RabbitMQApp');
//      RabbitMQApp([], []);

// --------------- graphql

const GraphQLApp = require('./GraphQLTechno/GraphQLApp');
console.log('--- GraphQLApp');
GraphQLApp([6], [2]);