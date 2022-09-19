const { GraphQLScalarType } = require('graphql');

let autoID = 0;

let photos = [];

module.exports = {
    Query: {
        // аргумент даты: args.after
        allPhotos: (parent, args) => {
            console.log(args.after);
            return photos;
        }
    },
    Mutation: {
        postPhoto(parent, args) {
            let newPhoto = {
                id: autoID++,
                name: args.name,
                description: args.description,
                // добавление текущей временной метки к фотографии при отправке
                created: new Date()
            }
            photos.push(newPhoto);
            return newPhoto;
        }
    },
    // 
    Photo: {
        url: (parent) => `http://site.com/img/${parent.id}.jpg`,
    },
    // объект GraphQLScalarType используется для создания распознавателей
    //      пользовательских скаляров
    DateTime: new GraphQLScalarType({
        name: 'DateTime',
        description: 'A valid date time value.',
        // при создании скалярного типа необходимо определить функции [serialize,
        //      parseValue, parseLiteral], которые будут обрабатывать поля и
        //      аргументы, реализующие скаляр
        parseValue: (value) => {
            // Функция parseValue преобразует входящую строку в объект Date.
            return new Date(value);
        },
        serialize: (value) => {

            // Любая из строк может использоваться для создания объектов datetime.
            //      console.log((new Date("Tuesday March")).toString());
            //      console.log((new Date("4/18/2018")).toISOString());
            //      console.log((new Date("4/18/2018 1:30:00 PM")).toISOString());
            //      console.log((new Date("Sun Apr 15 2018 12:10:17 GMT-0700 (PDT)")).toISOString());
            //      console.log((new Date("2018-04-15T19:09:57.308Z")).toISOString());

            // Функция serialize сериализует входящую строку в дату фомата ISO.
            //      Если поле Photo.created содержит допустимую строку даты, то
            //      функция вернет строку в ISO формате.
            return new Date(value).toISOString();
        },
        parseLiteral: (ast) => {

            // Аргумент after добавляется непосредственно в документ запроса.
            //      Значение after следует получить из запроса после его
            //      преобразования в АСД.

            // Функция parseLiteral возвращает нужное значение из документа запроса.
            return ast.value;
        }
    })
}