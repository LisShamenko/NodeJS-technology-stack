'use strict';

module.exports.dropCollection = async (collection) => {
    try {
        await collection.drop();
        return true;
    }
    catch {
        return false;
    }
}

module.exports.dropCollections = async (database, collections) => {

    //      
    let names = await database.listCollections().toArray();
    names = names.map(item => item.name);

    //      
    for (let i = 0; i < collections.length; i++) {
        if (names.indexOf(collections[i]) !== -1) {
            await database.dropCollection(collections[i]);
        }
    }
}