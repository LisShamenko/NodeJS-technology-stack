## Swagger

[каталог проекта](https://github.com/LisShamenko/technology_NodeJS/tree/master/App/Swagger) / [стек технологий](https://github.com/LisShamenko/NodeJS-technology-stack/blob/master/README.md)
____ 

### Запуск проекта Swagger

```javascript

// приложение
const SwaggerApp = require('./App/Swagger/SwaggerApp');
console.log('--- SwaggerApp = ' + SwaggerApp);

```
____ 

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
____ 