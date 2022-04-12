const { MongoClient, Decimal128, Int32 } = require("mongodb");
const { dropCollection } = require("./../helpers");



// --- --- sortByCount 

//      https://www.mongodb.com/docs/manual/reference/operator/aggregation/sortByCount/

// Стадия sortByCount группирует документы на основе выражения, а затем вычисляет 
//      количество документов в каждой отдельной группе. Документы на выходе будут
//      иметь поля: _id - значение группировки; count - количество документов в группе.
//      Документы будут отсортированы по полю count в порядке убывания.

// Сигнатура:
//      { $sortByCount:  <expression> }
//          <expression> - любое выражение группировки, кроме литерала документа.
//              Путь к полю: '$employee'. Литерал документа указать нельзя, но 
//              можно указать поле или выражение, результатом которого является 
//              документ. Например, в следующем выражении оператор mergeObjects 
//              создает документ из полей employee и business:
//              { $sortByCount: { $mergeObjects: [ "$employee", "$business" ] } }

// 
module.exports = async () => {

    const client = new MongoClient("mongodb://localhost:27017");

    try {
        await client.connect();
        const database = client.db("aggregation");

        // 
        const exhibits = database.collection("exhibits");

        await dropCollection(exhibits);
        await exhibits.insertMany([
            { "_id": 1, "title": "The Pillars of Society", "artist": "Grosz", "year": 1926, "tags": ["painting", "satire", "Expressionism", "caricature"] },
            { "_id": 2, "title": "Melancholy III", "artist": "Munch", "year": 1902, "tags": ["woodcut", "Expressionism"] },
            { "_id": 3, "title": "Dancer", "artist": "Miro", "year": 1925, "tags": ["oil", "Surrealism", "painting"] },
            { "_id": 4, "title": "The Great Wave off Kanagawa", "artist": "Hokusai", "tags": ["woodblock", "ukiyo-e"] },
            { "_id": 5, "title": "The Persistence of Memory", "artist": "Dali", "year": 1931, "tags": ["Surrealism", "painting", "oil"] },
            { "_id": 6, "title": "Composition VII", "artist": "Kandinsky", "year": 1913, "tags": ["oil", "painting", "abstract"] },
            { "_id": 7, "title": "The Scream", "artist": "Munch", "year": 1893, "tags": ["Expressionism", "painting", "oil"] },
            { "_id": 8, "title": "Blue Flower", "artist": "O'Keefe", "year": 1918, "tags": ["abstract", "painting"] },
        ]);

        // применение $sortByCount эквивалентно следующей конструкции:
        const cursor1 = await exhibits.aggregate([
            { $group: { _id: null, count: { $sum: 1 } } },
            { $sort: { count: -1 } }
        ])
        await cursor1.forEach(item => console.dir(JSON.stringify(item)));

        // $unwinds использует массив tags и $sortByCount для подсчета 
        //      количества документов, связанных с каждым тегом
        const cursor2 = await exhibits.aggregate([
            { $unwind: "$tags" },
            { $sortByCount: "$tags" },
        ])
        await cursor2.forEach(item => console.dir(JSON.stringify(item)));
    }
    catch (err) {
        console.log(`--- err: ${err}`);
    }
    finally {
        await client.close();
    }
}