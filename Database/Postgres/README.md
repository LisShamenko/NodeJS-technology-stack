## Postgres

[каталог проекта](https://github.com/LisShamenko/NodeJS-technology-stack/tree/master/Database/Postgres) / [стек технологий](https://github.com/LisShamenko/NodeJS-technology-stack/blob/master/README.md)
____

### Утилиты

Получение дампа памяти Postgres:

1. cd C:\Program Files\PostgreSQL\13\bin
    > возможный путь к файлу:<br/>
    > 'C:\Program Files\PostgreSQL\13\pgAdmin 4\runtime\pg_dump.exe'
2. pg_dump --help
3. pg_dump -d myClassDB -U postgres -W > C:/myClassDB.dump
    > параметры:
    > - '-d' идентификатор базы данных
    > - '-U' пользователь
    > - '-W' запросить пароль при выполнении команды
    > - после символа '>' указать имя файла дампа
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
____

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
____