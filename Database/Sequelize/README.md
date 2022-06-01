## Sequelize

[каталог проекта](https://github.com/LisShamenko/NodeJS-technology-stack/tree/master/Database/Sequelize) / [стек технологий](https://github.com/LisShamenko/NodeJS-technology-stack/blob/master/README.md)
____

### Запуск проекта Sequelize

```javascript

// приложение
const SequelizeApp = require('./Database/Sequelize/SequelizeApp');
console.log('--- SequelizeApp = ' + SequelizeApp);

```
____

### Основные файлы проекта Sequelize

- **db/db_for_sequelize.db**
    > База данных sqlite. Для тестирования следует создать postgres базу 'db_for_sequelize'.
- **SequelizeTechno/SetupModels.js**
    > Анализ документации (не полный). [Sequelize Manual](https://sequelize.org/master/index.html)
- **SequelizeTechno/SetupSQLite.js**
    > Настройка sqlite базы, содержит DDL инструкции.
- **SequelizeApp.js**
    > Приложение Sequelize, запускает тестовые методы.
____ 