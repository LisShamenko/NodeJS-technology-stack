## Express

[каталог проекта](https://github.com/LisShamenko/NodeJS-technology-stack/tree/master/App/Express) / [стек технологий](https://github.com/LisShamenko/NodeJS-technology-stack/blob/master/README.md)
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
____

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
____

- **ExpressTechno.js**
    > Анализ документации.<br/>
    > <br/>
    > Пакеты:<br/>
    > + 'body-parser' - [анализ тела запроса](http://expressjs.com/en/resources/middleware/body-parser.html)
    > + 'etag' - [генерирует HTTP ETag](https://www.npmjs.com/package/etag)
    > + 'fresh' - [проверка актуальности кэша](https://www.npmjs.com/package/fresh)
    > + 'ms' - [преобразование различных форматов времени в миллисекунды](https://www.npmjs.com/package/ms)
    > + 'bytes' - [парсинг строк, содержащих значения в байтах](https://www.npmjs.com/package/bytes)
    > + 'typeis' - [позволяет определить content-type запроса](https://www.npmjs.com/package/type-is)
    > + 'querystring' - [разбор строки запроса (deprecated)](https://www.npmjs.com/package/querystring) - [для замены смотри пакет query-string](https://www.npmjs.com/package/query-string)
    > + 'ejs-locals' - [шаблонизатор ejs](https://www.npmjs.com/package/ejs-locals)
____