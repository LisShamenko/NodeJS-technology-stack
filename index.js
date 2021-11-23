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

//console.log(`\n\n\n--- SequelizeApp ---\n\n\n`);
//const SequelizeApp = require('./Database/Sequelize/SequelizeApp');

// --------------- typescript app

console.log(`\n\n\n--- TypescriptApp ---\n\n\n`);
const TypescriptApp = require('./TypeScriptTechno/app/dist/app');