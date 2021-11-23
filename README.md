# Стек технологий NodeJS

- [Swagger](#Swagger)
    - [Запуск проекта](#Запуск-проекта-Swagger)
    - [Основные файлы проекта](#Основные-файлы-проекта-Swagger)
- [Express](#Express)
    - [Запуск проекта](#Запуск-проекта-Express)
    - [Основные файлы проекта](#Основные-файлы-проекта-Express)
- [Postgres](#Postgres)
    - [Запуск проекта](#Запуск-проекта-Postgres)
    - [Основные файлы проекта](#Основные-файлы-проекта-Postgres)
____



## Swagger

Каталог проекта: [~/App/Swagger/](https://github.com/LisShamenko/technology_NodeJS/tree/master/App/Swagger).
____

### Запуск проекта Swagger

```javascript

// приложение
const SwaggerApp = require('./App/Swagger/SwaggerApp');
console.log('--- SwaggerApp = ' + SwaggerApp);

```

### Основные файлы проекта Swagger

- **Operations**
    > Каталог, содержит файлы с операциями над данными (обращения к БД). 
- **Subsystems**
    > Каталог, содержит swagger-контроллеры и swagger-модели.<br/>
    > Swagger-модель содержит подготовку данных и комплексные операции, включающие несколько простых обращений к базе данных.<br/>
    > Swagger-контроллер занимается подготовкой swagger-схем. Таким образом, описание документации отделяется от реального кода.<br/>
    > Swagger-модель можно определить как контроллер приложения, но это вызовет путаницу со swagger-контроллерами и усложнит суффиксы в названии файлов. Вместо '~Controller.js' и '~Model.js' получим что-то похожее на '~SwaggerController.js' и '~ApplicationController.js'.<br/>
- **Subsystems/SubsystemsHelper.js**
    > Вспомогательный класс для swagger-контроллеров, содержит: перечисления, регулярные выражения, построение swagger-объектов. 
- **Errors.js**
    > Объект с описанием всех ошибок возникающих в приложении.
- **ResultProcessing.js**
    > Обработчик результата запроса, содержит стандартную обработку запроса и вызовы swagger конвейера: валидация запроса, выполнение функции swagger-модели, валидация ответа.
- **SwaggerApp.js**
    > Приложение SwaggerApp. Является 'корнем композиции' и соединяет вместе следующие компоненты: 
    > * swagger-модели и операции над данными (обращения к БД), которые используют модели;
    > * swagger-контроллеры и swagger-модели;
    > * помимо модели каждый swagger-контроллер включает зависимости с пакетами express, joi и joiToSwagger, а так же swagger-помощник (subsystemsHelper) и обработчик результата запроса (resultProcessing).

[Наверх](#Стек-технологий-NodeJS)
____ 



## Express

Каталог проекта: [~/App/Express/](https://github.com/LisShamenko/technology_NodeJS/tree/master/App/Express).
____

### Запуск проекта Express

```javascript

// приложение с тестовыми запросами
const ExpressApp = require('./App/Express/ExpressApp');
console.log('--- ExpressApp = ' + ExpressApp);

// анализ документации
const ExpressTechno = require('./App/Express/ExpressTechno');
console.log('--- ExpressTechno = ' + ExpressTechno);

```

### Основные файлы проекта Express

- **public**
    > Каталог, содержит статические файлы.
- **views**
    > Каталог, содержит файлы шаблонов.
- **ExpressApp.js**
    > Приложение NodeJS для тестирования.<br/>
    > <br/>
    > Запросы к статическим файлам:<br/>
    >   + _curl --request GET http://localhost:3000/folder_1/_<br/>
    >   + _curl --request GET http://localhost:3000/folder_2/_<br/>
    >   + _curl --request GET http://localhost:3000/1.png_<br/>
    >   + _curl --request GET http://localhost:3000/2.png_<br/>
    >   + _curl --request GET http://localhost:3000/3.png_<br/>
    >   + _curl --request GET http://localhost:3000/.test_dotfile_<br/>
    >   + _curl --request GET http://localhost:3000/test_ext_2_<br/>
    > <br/>
    > Запросы с разными заголовками 'Content-Type':
    > + _curl --header "Content-Type: application/json" --request POST --data "{\"username\":\"xyz\",\"password\":\"xyz\"}" http://localhost:3000/tests/json/_<br/>
    > + _curl --header "Content-Type: application/octet-stream" --request POST --data-binary "@C:\octetfFile.json" http://localhost:3000/tests/raw_or_text/_<br/>
    > + _curl --header "Content-Type: text/plain" --request POST --data-raw "{\"param1\":1,\"param2\":\"str\",\"param3\":true}" http://localhost:3000/tests/raw_or_text/_<br/>
    > + _curl --header "Content-Type: application/x-www-form-urlencoded" --request POST --data-urlencode "param1=1" --data-urlencode "param2=str" --data-urlencode "param3=true" http://localhost:3000/tests/urlencoded/_<br/>
    > <br/>
    > Запросы к дочернему (sub) приложению:
    > + _curl --request GET http://localhost:3000/admin/secret/_<br/>
    > + _curl --request GET http://localhost:3000/admin/_<br/>
    > + _curl --request GET http://localhost:3000/manager/_<br/>
    > <br/>
    > Запросы REST:
    > + _curl --request DELETE http://localhost:3000/pipeline/first_req/_<br/>
    > + _curl --request GET http://localhost:3000/pipeline/first_req/_<br/>
    > + _curl --request POST http://localhost:3000/pipeline/first_req/_<br/>
    > + _curl --request PUT http://localhost:3000/pipeline/first_req/_<br/>
    > <br/>
    > Запросы к дочернему роутеру:
    > + _curl --request GET http://localhost:3000/sub_router/1000/_<br/>
    > + _curl --request GET http://localhost:3000/sub_router/commits/71dbb9c..4c084f9_<br/>
    > + _curl --request GET http://localhost:3000/sub_router/1000/sub_sub_router/_<br/>
    > <br/>
    > Тест параметров запроса:
    > + _curl --request GET http://localhost:3000/user/1000/1/_<br/>
    > + _curl --request GET http://localhost:3000/user/1000/_<br/>
    > <br/>
    > Запрос ошибки:
    > + _curl --request GET http://localhost:3000/throw_error_<br/>
    > <br/>
    > Запросы к дочернему роутеру:
    > + _curl --request GET http://localhost:3000/sub_app_router/_<br/>
    > + _curl --request POST http://localhost:3000/sub_app_router/_<br/>
    > <br/>
    > Запросы шаблонизатора:
    > + _curl --header "Accept: text/plain" --request GET http://localhost:3000/users_<br/>
    > + _curl --header "Accept: text/html" --request GET http://localhost:3000/users_<br/>
    > + _curl --header "Accept: application/json" --request GET http://localhost:3000/users_<br/>
    > <br/>
    > Запросы для понимания объекта Request:
    > + _curl -g --request GET "http://localhost:3000/request/url_params?q=tobi+ferret&shoe[color]=blue&shoe[type]=converse&color[]=blue&color[]=black&color[]=red"_<br/>
    > + _curl --header "Accept: text/html" --request GET http://localhost:3000/request/accepts_<br/>
    > + _curl --header "Accept: text/*, application/json" --request GET http://localhost:3000/request/accepts_<br/>
    > + _curl --header "Accept: text/*;q=.5, application/json" --request GET http://localhost:3000/request/accepts_<br/>
    > + _curl --data "{\"data\":\"data\"}" --header "Content-Type: text/html; charset=utf-8" --request POST http://localhost:3000/request/is_<br/>
    > + _curl --data "{\"data\":\"data\"}" --header "Content-Type: application/json" --request POST http://localhost:3000/request/is_<br/>
    > <br/>
    > Запросы для понимания объекта Response:
    > + _curl --request GET http://localhost:3000/response/locals/1000/_<br/>
    > + _curl --request GET http://localhost:3000/response/attachment/_<br/>
    > + _curl --request GET http://localhost:3000/response/download/_<br/>
    > + _curl --request GET http://localhost:3000/response/cookie/_<br/>
    > + _curl --header "Accept: text/plain" --request GET http://localhost:3000/response/format_<br/>
    > + _curl --header "Accept: text/html" --request GET http://localhost:3000/response/format_<br/>
    > + _curl --header "Accept: application/json" --request GET http://localhost:3000/response/format_<br/>
    > + _curl --request GET http://localhost:3000/response/json/1_<br/>
    > + _curl --request GET http://localhost:3000/response/options/1/file_<br/>
    > + _curl --request GET http://localhost:3000/response/redirect/5_<br/>
    > + _curl --request GET http://localhost:3000/response/content-type/5_<br/>

- **ExpressTechno.js**
    > Анализ документации.<br/>
    > Пакеты:<br/>
    > + 'body-parser' - [анализ тела запроса](http://expressjs.com/en/resources/middleware/body-parser.html)
    > + 'etag' - [генерирует HTTP ETag](https://www.npmjs.com/package/etag)
    > + 'fresh' - [проверка актуальности кэша](https://www.npmjs.com/package/fresh)
    > + 'ms' - [преобразование различных форматов времени в миллисекунды](https://www.npmjs.com/package/ms)
    > + 'bytes' - [парсинг строк, содержащих значения в байтах](https://www.npmjs.com/package/bytes)
    > + 'typeis' - [позволяет определить content-type запроса](https://www.npmjs.com/package/type-is)
    > + 'querystring' - [разбор строки запроса (deprecated)](https://www.npmjs.com/package/querystring) - [для замены смотри пакет query-string](https://www.npmjs.com/package/query-string)
    > + 'ejs-locals' - [шаблонизатор ejs](https://www.npmjs.com/package/ejs-locals)

[Наверх](#Стек-технологий-NodeJS)

____



## Postgres

Каталог проекта: [~/Database/Postgres/](https://github.com/LisShamenko/technology_NodeJS/tree/master/Database/Postgres).
____

### Запуск проекта Postgres

```javascript

// анализ документации
const PostgresTechno = require('./Database/Postgres/PostgresTechno');
PostgresTechno(() => {
    console.log('--- PostgresTechno complete');
});

// приложение
const PostgresApp = require('./Database/Postgres/PostgresApp');
console.log('--- PostgresApp = ' + PostgresApp);

```

### Основные файлы проекта Postgres

- **myClassDB.dump**
    > Файл дампа базы данных.
- **PostgresApp.js**
    > Приложение NodeJS для тестирования. Допустимые типы запросов:<br/>
    > _curl --header "Content-Type: application/json" --request POST --data "{\"name\":\"new user\"}" http://localhost:3000/user_<br/>
    > _curl --request DELETE http://localhost:3000/user/00000000-0000-0000-0000-000000000000_<br/>
    > _curl --request GET http://localhost:3000/user/00000000-0000-0000-0000-000000000000_<br/>
    > _curl --request GET http://localhost:3000/users_<br/>
    > _curl --header "Content-Type: application/json" --request POST --data "{\"ownerId\":\"00000000-0000-0000-0000-000000000000\",\"name\":\"new catalog\"}" http://localhost:3000/catalog_<br/>
    > _curl --request DELETE http://localhost:3000/catalog/0_<br/>
    > _curl --request GET http://localhost:3000/catalog/0_<br/>
    > _curl --request GET http://localhost:3000/catalogs_<br/>
    > _curl --request GET http://localhost:3000/objects/00000000-0000-0000-0000-000000000000/1_<br/>
- **PostgresOperations.js**
    > Операции SQL. В качестве зависимости принимает объект PoolWrapper.
- **PostgresTechno.js**
    > Работа с пакетом 'pg', анализ документации.<br/>
    > Работа с пакетом 'pg-format', создание строк запросов.<br/>
- **PostgresWrapper.js**
    > Обертка для низкоуровневых операций postgres.

[Наверх](#Стек-технологий-NodeJS)

____