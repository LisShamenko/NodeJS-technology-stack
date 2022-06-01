## Chai

[каталог проекта](https://github.com/LisShamenko/technology_NodeJS/tree/master/test) / [стек технологий](https://github.com/LisShamenko/NodeJS-technology-stack/blob/master/README.md)
____

### Запуск проекта Chai

```javascript

// приложение
const ChaiExpectTechno = require('./test/ChaiExpectTechno');
console.log('--- ChaiExpectTechno = ' + ChaiExpectTechno);

```
____

### Основные файлы проекта Chai

- **ChaiExpectTechno.js**
    > Анализ документации, [BDD](https://www.chaijs.com/api/bdd/).
- **test_swagger.js**
    > Файл с тестами для проекта Swagger. Содержит последовательность операций для понимания работы проекта Swagger. 
____

### Запуск и отладка тестов через chrome

- сделать запись в scripts файла package.json: 
    > "only-test-swagger": "mocha --inspect-brk test/test_swagger.js"
- запустить тесты:
    > npm run only-test-swagger
- запустить в хроме и выбрать Remote Target:
    > chrome://inspect
- остановка в коде:
    > debugger
____ 