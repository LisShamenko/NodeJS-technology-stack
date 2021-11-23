// --------------- фабрика

let poolWrapper;

module.exports = (inPoolWrapper) => {
    poolWrapper = inPoolWrapper;

    return {
        // tables
        insertQuery: insertQuery,
        deleteQuery: deleteQuery,
        selectQuery: selectQuery,
        selectQueries: selectQueries,
        // links
        insertLink: insertLink,
        updateLink: updateLink,
        deleteLink: deleteLink,
        selectLink: selectLink,
        selectLinks: selectLinks,
        // tree links
        selectTreeLinks: selectTreeLinks,
        selectTreeLinksById: selectTreeLinksById,
    };
}

// --------------- 

// нумерация массива начинается с 1

// --- добавить массив json
// INSERT INTO metadata.new_table(field_array_json)
// VALUES (array['{"sender":"pablo","body":"they are on to us"}']::json[])
//      https://stackoverflow.com/questions/35081748/how-can-i-insert-into-a-postgresql-json-array
//      https://popsql.com/learn-sql/postgresql/how-to-insert-data-into-an-array-in-postgresql

// --- добавить в массив значение
// update metadata.new_table set field_array_json = array_append(field_array_json, '{ "a": "foo", "b": "bar", "c": "baz" }'::json);
// update metadata.new_table set field_array_json = array_append(field_array_json, '{ "a": { "b": { "c": "foo" } } }'::json);

// --- выбрать значение из массива по индексу (integer)
// SELECT field_1, field_array_json[field_1] FROM metadata.new_table
//      https://popsql.com/learn-sql/postgresql/how-to-query-arrays-in-postgresql

// --- выбрать значение json по ключу
// SELECT (field_array_json[2])::json->'a' FROM metadata.new_table

// --- выбрать значение по пути
// SELECT field_array_json[3], (field_array_json[3])::json#>'{a,b}' FROM metadata.new_table

// --------------- 

/*
{
    index: 0,               // порядок следования таблиц в запросе
    table_id: '0',          // id таблицы
    table_key_id: '0',      // id первичного ключа таблицы
    parent_id: '',          // id родительской таблицы
    parent_key_id: null,    // id первичного ключа родительской таблицы
    type: 'none',           // тип связи:
                            //      none - таблица не содержит информацию об иерархии
                            //      tree - таблица содержит информацию об иерархии, поле parent_key_id содержит id на родительскую колонку
                            //      links - таблица связана с другими таблицами links  
    groups:                 // настройка отображаемых колонок
        [
            {
                column_id: '0',     // id колонки
                agg_func: 'none',   // тип отображения:
                                    //      sum, count - агрегатные функции
                                    //      group - группировка по колонке
                                    //      select - выборка данных
            }
        ],
}
*/

// --------------- query: insert

async function insertQuery(query, links) {

    // transaction:
    // insert query_sql     -> query_sql_id
    // insert links         -> записи links будут связаны через query_sql_id
    let transactQueries = [
        (results) => {
            return {
                queryParams: [query.name],
                queryString: `INSERT INTO metadata.query_sql(name) VALUES ($1) returning *`,
            }
        },
        (results) => {
            if (results[0].rows.length === 0) {
                return { current: 'error', error: Error('Не была сделана запись метаданных: запрос SQL.') }
            }
            return {
                queryParams: [results[0].rows[0].id],
                queryString: getLinkInsertString(links),
            }
        },
    ];

    transactTreeTables(links, transactQueries, 2);

    let allResults = await poolWrapper.transactArray(transactQueries);

    return {
        query: allResults[0].rows[0],
        links: allResults[1].rows,
    };
}

// refactoring - удаление tree_link таблиц при удалении таблицы из метаданных

function transactTreeTables(links, transactQueries, index) {

    transactQueries.push((results) => {
        let whereStrings = [];
        links.forEach(item => {
            if (item.type === 'tree') {
                whereStrings.push(`table_id = ${item.table_id} AND table_key_id = ${item.table_key_id} AND parent_key_id = ${item.parent_key_id}`);
            }
        });
        if (whereStrings.length === 0) {
            return { current: 'break' }
        } else {
            return {
                queryParams: [],
                queryString: `
                    SELECT id, table_id, table_key_id, parent_key_id, tree_table_name
                    FROM metadata.tree_links 
                    WHERE ${whereStrings.join(' AND ')}
                `,
            }
        }
    });

    transactQueries.push((results, between) => {
        let valueStrings = [];
        between.treeTableNames = [];
        let treeLinks = links.filter(item => item.type === 'tree');
        for (let i = 0; i < treeLinks.length; i++) {
            const link = treeLinks[i];

            let findLink = null;
            for (let j = 0; j < results[index].rows.length; j++) {
                const row = results[index].rows[j];

                if (row.table_id === link.table_id &&
                    row.table_key_id === link.table_key_id &&
                    row.parent_key_id === link.parent_key_id) {
                    findLink = row;
                    break;
                }
            }

            if (findLink === null) {
                let treeName = `tree_${link.table_id}_${link.table_key_id}_${link.parent_key_id}`;
                between.treeTableNames.push(treeName);
                valueStrings.push(`(${link.table_id}, ${link.table_key_id}, ${link.parent_key_id}, '${treeName}')`);
            }
        }
        if (valueStrings.length === 0) {
            return { current: 'break' }
        } else {
            return {
                queryParams: [],
                queryString: `
                    INSERT INTO metadata.tree_links(table_id, table_key_id, parent_key_id, tree_table_name)
                    VALUES ${valueStrings.join(' ')}
                `,
            }
        }
    });

    transactQueries.push((results, between) => {
        between.treeTableNames.forEach(name => {
            transactQueries.push(
                (results) => {
                    return {
                        queryParams: [],
                        queryString: `
                            CREATE TABLE metadata.${name} 
                            (
                                id integer,
                                parent integer,
                                layer integer,
                                path text
                            )
                        `,
                    }
                },
            );
        });
        return { current: 'continue' }
    });
}

// --------------- query: delete

async function deleteQuery(query) {

    // transaction:
    // delete query_sql
    // delete links
    let allResults = await poolWrapper.transactArray([
        (results) => {
            return {
                queryParams: [query.id],
                queryString: `DELETE FROM metadata.query_sql WHERE id = $1`,
            }
        },
        (results) => {
            return {
                queryParams: [query.id],
                queryString: `DELETE FROM metadata.query_link WHERE query_id = $1`,
            }
        },
    ]);

    return {
        rowCountQueries: allResults[0].rowCount,
        rowCountLinks: allResults[1].rowCount,
    };
}

// --------------- query: select query

async function selectQuery(query_id) {
    let result = await poolWrapper.query(`SELECT * FROM metadata.query_sql WHERE id = $1`, [query_id]);
    return (result.rows.length === 0) ? null : result.rows[0];
}

// --------------- query: select queries

async function selectQueries() {
    let result = await poolWrapper.query('SELECT id, name FROM metadata.query_sql');
    return result.rows;
}

// --------------- link: insert

function getLinkGroups(groups) {
    let groupsJson = groups.map(item => `'${JSON.stringify(item)}'`);
    return `array[${groupsJson.join(', ')}]::json[]`;
}

function getLinkValueSrting(link) {
    return `('${link.index}', '${link.table_id}', '${link.table_key_id}', '${link.parent_id}', '${link.parent_key_id}', '${link.type}', ${getLinkGroups(link.groups)}, $1)`;
}

function getLinkInsertString(links) {
    let cols = links.map(item => getLinkValueSrting(item));
    return `
        INSERT INTO metadata.query_link(index, table_id, table_key_id, parent_id, parent_key_id, type, groups, query_id) 
        VALUES ${cols.join(', ')}
        returning *
    `;
}

async function insertLink(query_id, link) {

    let links = [link];
    let transactQueries = [
        (results) => {
            return {
                queryParams: [query_id],
                queryString: getLinkInsertString(links),
            }
        },
    ];
    transactTreeTables(links, transactQueries, 1);

    let allResults = await poolWrapper.transactArray(transactQueries);
    return allResults[0].rows[0];
}

// --------------- link: update

async function updateLink(oldLink, newLink) {

    let queryParams = [
        oldLink.id,
        (newLink["index"] === undefined) ? oldLink["index"] : newLink["index"],
        (newLink["table_id"] === undefined) ? oldLink["table_id"] : newLink["table_id"],
        (newLink["table_key_id"] === undefined) ? oldLink["table_key_id"] : newLink["table_key_id"],
        (newLink["parent_id"] === undefined) ? oldLink["parent_id"] : newLink["parent_id"],
        (newLink["parent_key_id"] === undefined) ? oldLink["parent_key_id"] : newLink["parent_key_id"],
        (newLink["type"] === undefined) ? oldLink["type"] : newLink["type"],
    ];

    // refactoring - удаление записей tree_links и соответствующих таблиц 

    let links = [];
    if (oldLink["type"] !== 'tree' && newLink["type"] === 'tree') {
        links.push({
            "index": queryParams[1],
            "table_id": queryParams[2],
            "table_key_id": queryParams[3],
            "parent_id": queryParams[4],
            "parent_key_id": queryParams[5],
            "type": "tree",
            "groups": []
        });
    }

    let groups = (newLink["groups"] === undefined) ? oldLink["groups"] : getLinkGroups(newLink["groups"]);

    // 
    let transactQueries = [
        (results) => {
            return {
                queryParams: queryParams,
                queryString: `
                    UPDATE metadata.query_link 
                    SET index = $2, table_id = $3, table_key_id = $4, parent_id = $5, parent_key_id = $6, type = $7, groups = ${groups}
                    WHERE id = $1 
                    returning *
                `,
            }
        },
    ];
    transactTreeTables(links, transactQueries, 1);

    let allResults = await poolWrapper.transactArray(transactQueries);
    return allResults[0].rows[0];

    //  let result = await poolWrapper.query(`
    //          UPDATE metadata.query_link 
    //          SET index = $2, table_id = $3, table_key_id = $4, parent_id = $5, parent_key_id = $6, type = $7, groups = ${groups}
    //          WHERE id = $1 
    //          returning *
    //      `,
    //      queryParams);
    //  return result.rows[0];
}

// --------------- link: delete

async function deleteLink(query_id, link_id) {

    let result = await poolWrapper.query(
        `DELETE FROM metadata.query_link WHERE query_id = $1 AND id = $2`,
        [query_id, link_id]);

    return {
        rowCount: result.rowCount,
    };
}

// --------------- link: select link 

async function selectLink(query_id, link_id) {

    let result = await poolWrapper.query(
        `SELECT * FROM metadata.query_link WHERE query_id = $1 AND id = $2`,
        [query_id, link_id]);

    return (result.rows.length === 0) ? null : result.rows[0];
}

// --------------- link: select links

async function selectLinks(query_id) {

    let result = await poolWrapper.query(
        `SELECT * FROM metadata.query_link WHERE query_id = $1`,
        [query_id]);

    return result.rows;
}

// --------------- tree_link: select

async function selectTreeLinks(treeLinkValues) {

    let i = 1;
    let whereStrings = [];
    let whereParams = [];
    treeLinkValues.forEach(item => {
        whereStrings.push(`
            (table_id = $${i} AND table_key_id = $${i + 1} AND parent_key_id = $${i + 2})
        `);
        whereParams.push(item.table_id);
        whereParams.push(item.table_key_id);
        whereParams.push(item.parent_key_id);
        i += 3;
    });

    let result = await poolWrapper.query(
        `SELECT * FROM metadata.tree_links WHERE ${whereStrings.join(' OR ')}`,
        whereParams);

    return result.rows;
}

async function selectTreeLinksById(tableId, tableKeyId, parentKeyId) {

    let i = 1;
    let whereParams = [];
    let whereStrings = [];
    if (tableId) {
        whereParams.push(tableId);
        whereStrings.push(`table_id = $${i}`);
        i++;
    }
    if (tableKeyId) {
        whereParams.push(tableKeyId);
        whereStrings.push(`table_key_id = $${i}`);
        i++;
    }
    if (parentKeyId) {
        whereParams.push(parentKeyId);
        whereStrings.push(`parent_key_id = $${i}`);
    }

    let whereString = '';
    if (whereStrings.length > 0) {
        whereString = `WHERE ${whereStrings.join(' AND ')}`;
    }

    let result = await poolWrapper.query(`SELECT * FROM metadata.tree_links ${whereString}`, whereParams);
    return result.rows;
}
