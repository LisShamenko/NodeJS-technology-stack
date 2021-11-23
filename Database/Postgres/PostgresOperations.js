// --------------- фабрика

let poolWrapper;

module.exports = (inPoolWrapper) => {
    poolWrapper = inPoolWrapper;

    return {
        objectTypes: objectTypes,
        // user
        insertUser: insertUser,
        deleteUser: deleteUser,
        selectUser: selectUser,
        selectUsers: selectUsers,
        // catalog
        insertCatalog: insertCatalog,
        deleteCatalog: deleteCatalog,
        selectCatalog: selectCatalog,
        selectCatalogs: selectCatalogs,
        // 
        getAllObjects: getAllObjects,
    };
}

// --------------- table types

const objectTypes = {
    catalogs: 1,
};

// вернуть название таблицы по типу объекта
function getTableByType(objectType) {
    if (objectType === objectTypes.catalogs) {
        return 'catalogs';
    }
    else {
        return null;
    }
}

// --------------- user

async function insertUser(name) {
    let result = await poolWrapper.query(
        'INSERT INTO public.users(id, name) VALUES (gen_random_uuid(), $1) returning id',
        [name]);

    return {
        id: result.rows[0].id,
        name: name,
    };
}

async function deleteUser(id) {
    let result = await poolWrapper.query(
        'DELETE FROM public.users WHERE id = $1',
        [id]);

    if (result.rowCount === 0) {
        throw Error('Пользователь с указанным id отсутствует.');
    }

    return {
        isSuccess: true, // (result.rowCount >= 1) ? true : false, // 
    };
}

async function selectUser(id) {
    let result = await poolWrapper.query(
        'SELECT * FROM public.users WHERE id = $1',
        [id]);

    if (result.rows.length === 0) {
        throw Error('Пользователь с указанным id отсутствует.');
    }
    return result.rows[0];
}

async function selectUsers() {
    let result = await poolWrapper.query('SELECT * FROM public.users');
    return result.rows;
}

// --------------- catalog

async function insertCatalog(ownerId, name) {

    let user = await selectUser(ownerId);

    // 
    let allResults = await poolWrapper.transactArray([
        (results) => {
            return {
                queryParams: [name],
                queryString: `INSERT INTO public.catalogs(name) VALUES ($1) returning id`,
            }
        },
        (results) => {
            if (results[0].rowCount === 0) {
                return { current: 'error', error: Error('Каталог не был создан.') }
            }

            return {
                queryParams: [name, user.id, results[0].rows[0].id],
                queryString: `
                    INSERT INTO public.objects(parent_id, name, type, owner_id, object_id)
                    VALUES (null, $1, 'catalog', $2, $3) returning id`,
            }
        },
    ]);

    return {
        catalogId: allResults[0].rows[0].id,
        objectId: allResults[1].rows[0].id,
    };
}

async function deleteCatalog(catalogId) {

    let allResults = await poolWrapper.transactArray([
        (results) => {
            return {
                queryParams: [catalogId],
                queryString: `DELETE FROM public.catalogs WHERE id = $1`,
            }
        },
        (results) => {
            return {
                queryParams: [catalogId],
                queryString: `DELETE FROM public.objects WHERE object_id = $1`,
            }
        },
    ]);

    return {
        catalogId: allResults[0].rowCount,
        objectId: allResults[1].rowCount,
    };
}

async function selectCatalog(id) {
    let result = await poolWrapper.query(
        'SELECT * FROM public.catalogs WHERE id = $1',
        [id]);

    if (result.rows.length === 0) {
        throw Error('Каталог с указанным id отсутствует.');
    }
    return result.rows[0];
}

async function selectCatalogs() {
    let result = await poolWrapper.query('SELECT * FROM public.catalogs');
    return result.rows;
}

// --------------- objects

async function getAllObjects(ownerId, objectType) {

    // проверка типа объекта
    let objectTable = getTableByType(objectType);
    if (objectTable === null) {
        return new Promise((resolve, reject) => {
            reject(Error('Не правильный тип объекта.'));
        });
    }

    // 
    let allResults = await poolWrapper.transactArray([
        (results) => {
            return {
                queryParams: [ownerId],
                queryString: `SELECT * FROM public.users WHERE id = $1`,
            }
        },
        (results) => {
            if (results[0].rows.length > 0) {
                return {
                    queryParams: [ownerId],
                    queryString: `SELECT * FROM public.objects WHERE owner_id = $1`,
                }
            }
            else {
                return { current: 'error', error: Error('Пользователь не найден.') }
            }
        },
        (results) => {
            if (results[1].rows.length > 0) {
                let objectIds = results[1].rows.map((row) => row.object_id);
                //let ownerObject = results[1].rows.find((element, index, array) => {
                //    return (element.type === objectType) ? true : false;
                //});
                if (objectIds.length > 0) {
                    return {
                        queryParams: [objectIds],
                        queryString: `SELECT * FROM public.${objectTable} WHERE id = ANY ($1)`,
                    }
                }
            }
            return { current: 'error', error: Error('Объекты не найдены.') }
        },
    ]);

    return {
        user: allResults[0].rows[0],
        objects: allResults[1].rows,
        catalogs: allResults[2].rows,
    };
}
