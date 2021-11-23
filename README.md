# Стек технологий NodeJS

- [Postgres](#Postgres)
    - [Запуск проекта](#Запуск-проекта-Postgres)
    - [Основные файлы проекта](#Основные-файлы-проекта-Postgres)
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