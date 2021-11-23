// --------------- фабрика

let poolWrapper;

module.exports = (inPoolWrapper) => {
    poolWrapper = inPoolWrapper;

    return {
        // tables
        insertTable: insertTable,
        deleteTable: deleteTable,
        selectTable: selectTable,
        selectTables: selectTables,
        // columns
        insertColumn: insertColumn,
        deleteColumn: deleteColumn,
        selectColumn: selectColumn,
        selectColumns: selectColumns,
    };
}

// --------------- queries

function getColumnQuery(column) {
    return `${column.name} ${column.type} ${(column.is_not_null) ? 'NOT NULL' : ''}`
}

function getQueryInsertColumn(columns) {
    if (columns.length !== 0) {
        cols = columns.map(item => `('${item.name}', '${item.type}', ${(item.is_not_null) ? true : false}, $1)`);
        return `
            INSERT INTO metadata.columns(name, type, is_not_null, table_id) 
            VALUES ${cols.join(', ')}
            returning *
        `;
    }
    return '';
}

// --------------- tables: insert table

async function insertTable(table, columns) {

    // transaction:
    // - create table
    // - insert table metadata
    // - insert columns metadata

    // 
    let cols = columns.map(item => getColumnQuery(item));
    cols.push(`id integer NOT NULL GENERATED ALWAYS AS IDENTITY ( INCREMENT 1 START 1 MINVALUE 1 MAXVALUE 2147483647 CACHE 1 )`);
    cols.push(`CONSTRAINT ${table.name}_pkey PRIMARY KEY (id)`);
    let queryCreateTable = `CREATE TABLE ${table.schema}.${table.name} ( \n\t${cols.join(', \n\t')} \n )`;

    // 
    let queryInsertColumns = getQueryInsertColumn(columns);

    // 
    let allResults = await poolWrapper.transactArray([
        (results) => {
            return {
                queryParams: [],
                queryString: queryCreateTable,
            }
        },
        (results) => {
            return {
                queryParams: [table.name, table.schema],
                queryString: `INSERT INTO metadata.tables(name, schema) VALUES ($1, $2) returning *`,
            }
        },
        (results) => {
            if (queryInsertColumns === '') {
                return { current: 'break' };
            }
            if (results[1].rows.length === 0) {
                return { current: 'error', error: Error('Не была сделана запись метаданных: таблица.') }
            }
            return {
                queryParams: [results[1].rows[0].id],
                queryString: queryInsertColumns,
            }
        },
    ]);

    return {
        table: allResults[1].rows[0],
        columns: allResults[2].rows,
    };
}

// --------------- tables: delete table

async function deleteTable(table) {

    // transaction:
    // - delete table
    // - delete table metadata
    // - delete columns metadata
    let allResults = await poolWrapper.transactArray([
        (results) => {
            return {
                queryParams: [],
                queryString: `DROP TABLE ${table.schema}.${table.name}`,
            }
        },
        (results) => {
            return {
                queryParams: [table.id],
                queryString: `DELETE FROM metadata.tables WHERE id = $1`,
            }
        },
        (results) => {
            return {
                queryParams: [table.id],
                queryString: `DELETE FROM metadata.columns WHERE table_id = $1`,
            }
        },
    ]);

    return {
        rowCountTable: allResults[1].rowCount,
        rowCountColumns: allResults[2].rowCount,
    };
}

// --------------- tables: select table

async function selectTable(table_id) {
    let result = await poolWrapper.query(`SELECT * FROM metadata.tables WHERE id = $1`, [table_id]);
    return (result.rows.length === 0) ? null : result.rows[0];
}

// --------------- tables: select tables

async function selectTables(table_ids) {

    let queryString;
    let queryParams;
    if (Array.isArray(table_ids)) {
        queryParams = [table_ids];
        queryString = 'SELECT * FROM metadata.tables WHERE id = ANY ($1)';
    }
    else {
        queryParams = [];
        queryString = 'SELECT * FROM metadata.tables';
    }

    let result = await poolWrapper.query(queryString, queryParams);
    return result.rows;
}

// --------------- columns: insert column

async function insertColumn(table, column) {

    // transaction:
    // add column
    // insert columns metadata
    let allResults = await poolWrapper.transactArray([
        (results) => {
            return {
                queryParams: [],
                queryString: `
                    ALTER TABLE ${table.schema}.${table.name} 
                    ADD COLUMN ${getColumnQuery(column)}
                `,
            }
        },
        (results) => {
            return {
                queryParams: [table.id],
                queryString: getQueryInsertColumn([column]),
            }
        },
    ]);

    return allResults[1].rows[0];
}

// --------------- columns: delete column

async function deleteColumn(table, column) {

    // transaction:
    // delete column
    // delete column metadata
    let allResults = await poolWrapper.transactArray([
        (results) => {
            return {
                queryParams: [],
                queryString: `
                    ALTER TABLE ${table.schema}.${table.name} 
                    DROP COLUMN ${column.name}
                `,
            }
        },
        (results) => {
            return {
                queryParams: [table.id, column.id],
                queryString: `
                    DELETE FROM metadata.columns 
                    WHERE table_id = $1 AND id = $2
                `,
            }
        },
    ]);

    return {
        rowCount: allResults[1].rowCount,
    };
}

// --------------- columns: select column

async function selectColumn(table_id, column_id) {
    let query = `SELECT * FROM metadata.columns WHERE table_id = $1 AND id = $2`;
    let result = await poolWrapper.query(query, [table_id, column_id]);
    return (result.rows.length === 0) ? null : result.rows[0];
}

// --------------- columns: select columns

async function selectColumns(table_ids) {

    let queryString;
    if (Array.isArray(table_ids)) {
        queryString = `SELECT * FROM metadata.columns WHERE table_id = ANY ($1)`;
    }
    else {
        queryString = `SELECT * FROM metadata.columns WHERE table_id = $1`;
    }

    let result = await poolWrapper.query(queryString, [table_ids]);
    return result.rows;
}

// --------------- 

async function clearDatabase() {
    let tables = await selectTables();
    for (let i = 0; i < tables.length; i++) {
        const table = tables[i];
        let deleteResult = await deleteTable(table);
    }
    let tableStrings = tables.map(item => item.name);
}




