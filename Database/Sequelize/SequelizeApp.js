// --------------- установка

// установка последней версии
//      npm install --save sequelize

// драйвера для соответствующих баз
//      npm install --save pg pg-hstore # Postgres
//      npm install --save mysql2
//      npm install --save mariadb
//      npm install --save sqlite3
//      npm install --save tedious # Microsoft SQL Server

// --------------- sqlite

const sqlite3 = require('sqlite3').verbose();
const SetupSQLite = require('./SequelizeTechno/SetupSQLite');
const setupSQLite = SetupSQLite(sqlite3);

// --------------- 

const path = require('path');
const SetupModels = require('./SequelizeTechno/SetupModels');
const setupModels = SetupModels(setupSQLite);

// --------------- execute

; (async () => {

    let dbPathName = path.join(__dirname, '/db/db_for_sequelize.db');

    await setupModels.init(dbPathName);
    await setupModels.technoConnections(dbPathName);
    await setupModels.technoModels();
    await setupModels.technoSyncModel();
    await setupModels.technoCreateUpdateDelete();
    await setupModels.technoModelQuerying();
    await setupModels.technoGettersSettersVirtuals();
    await setupModels.technoValidationsConstraints();
    await setupModels.technoRawQueries('postgres');
    await setupModels.technoRawQueries('mysql');
    await setupModels.technoAssociations();
    await setupModels.technoAssociationsQuerying();
    await setupModels.technoMixins();
    await setupModels.technoAssociationKeys();
    await setupModels.technoParanoid();
    await setupModels.technoEagerLoadingMtoM();
    await setupModels.technoAssociationCreating();
    await setupModels.technoAssociationAdvancedMtoM();
    await setupModels.technoSuperManyToMany();

})().catch(e => console.error(e.stack))
