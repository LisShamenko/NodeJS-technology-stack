// --------------- express

//const ExpressApp = require('./App/Express/ExpressApp');
//console.log('--- ExpressApp = ' + ExpressApp);

// --------------- postgres

//// техно: postgres
//const PostgresTechno = require('./Database/Postgres/PostgresTechno');
//PostgresTechno(() => {
//    console.log('--- PostgresTechno complete');
//});

//const PostgresApp = require('./Database/Postgres/PostgresApp');
//console.log('--- PostgresApp = ' + PostgresApp);

// --------------- swagger

//const SwaggerApp = require('./App/Swagger/SwaggerApp');
//console.log('--- SwaggerApp = ' + SwaggerApp);

//const SwaggerApp = require('./test/ChaiExpectTechno');

// --------------- sequelize

//const SequelizeApp = require('./Database/Sequelize/SequelizeApp');
//console.log('--- SequelizeApp = ' + SequelizeApp);

// --------------- typescript app

//const TypescriptApp = require('./TypeScriptTechno/app/dist/app');
//console.log('--- TypescriptApp = ' + TypescriptApp);

// --------------- react

// запуск только сервиса баз данных
//      http://localhost:3500/
//
const server = require('./ReactTechno/server/server');
console.log('--- server = ' + server);