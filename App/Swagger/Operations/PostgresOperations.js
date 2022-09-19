// --------------- фабрика

const DataOperations = require('./DataOperations');

let path;
let pg;
let poolWrapper;

module.exports = (inPath, inPg) => {

    path = inPath;
    pg = inPg;

    //const PostgresWrapper = require(path.join(process.cwd(), 'Database/Postgres/PostgresWrapper'));
    const PostgresWrapper = require('./PostgresWrapper');
    const pgWrapper = PostgresWrapper(pg);
    poolWrapper = pgWrapper.getPoolWrapper({
        host: 'localhost',
        port: '5432',
        user: 'postgres',
        password: 'postgres',
        database: 'myClassDB',
    });

    const MetadataOperations = require('./MetadataOperations');
    const metadataOperations = MetadataOperations(poolWrapper);

    const QueriesOperations = require('./QueriesOperations');
    const queriesOperations = QueriesOperations(poolWrapper);

    const ExecutorOperations = require('./ExecutorOperations');
    const executorOperations = ExecutorOperations(poolWrapper);

    const DataOperations = require('./DataOperations');
    const dataOperations = DataOperations(poolWrapper);

    return {
        metadata: metadataOperations,
        queries: queriesOperations,
        executor: executorOperations,
        data: dataOperations,
        clearDatabase: clearDatabase,
        selectTreeTable: selectTreeTable,
    };
}

// --------------- clear

async function clearDatabase(treeLinkValues) {

    let treeLinks = await poolWrapper.query(`SELECT * FROM metadata."tree_links"`, []);
    treeLinks.rows.forEach(async (treeLink) => {
        try {
            await poolWrapper.query(`DROP TABLE IF EXISTS metadata."${treeLink.tree_table_name}"`, []);
        }
        catch (err) {
            console.log('--- error prepare ---');
        }
    });
    await poolWrapper.query(`DROP TABLE IF EXISTS metadata."test_child"`, []);
    await poolWrapper.query(`DROP TABLE IF EXISTS metadata."test_parent"`, []);
    await poolWrapper.query(`DROP TABLE IF EXISTS metadata."goods"`, []);

    await poolWrapper.query(`DELETE FROM metadata."tables"`, []);
    await poolWrapper.query(`DELETE FROM metadata."columns"`, []);
    await poolWrapper.query(`DELETE FROM metadata."query_sql"`, []);
    await poolWrapper.query(`DELETE FROM metadata."query_link"`, []);
    await poolWrapper.query(`DELETE FROM metadata."tree_links"`, []);
    await poolWrapper.query(`DELETE FROM metadata."query_executors"`, []);
}

async function selectTreeTable(fromTreeName, rowIds) {
    let whereString = '';
    let queryParams = [];
    if (rowIds) {
        whereString = `WHERE id = ANY($1)`;
        queryParams.push(rowIds);
    }
    return await poolWrapper.query(`SELECT * FROM metadata.${fromTreeName} ${whereString}`, queryParams);
}


