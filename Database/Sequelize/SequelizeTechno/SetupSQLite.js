// --------------- фабрика

let sqlite3;

module.exports = (inSqlite3) => {
    sqlite3 = inSqlite3;
    return {
        createDatabase: createDatabase,
    };
}

// --------------- DDL

async function createDatabase(dbPathName) {
    return new Promise((resolve, reject) => {
        let result = {};
        result.db = new sqlite3.Database(dbPathName, (sqlite3.OPEN_READWRITE | sqlite3.OPEN_CREATE), (err) => {
            if (err) {
                reject(err);
            }
            else {
                resolve(result);
            }
        });
    });
}




