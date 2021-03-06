// --------------- 2. Webpack.

// Всякое:
//      browserify, gulp, Grunt, Prepack
//      create-react-app, Gatsby, Code Sandbox

// Webpack - это сборщик модулей, который превращает все файлы проекта 
//      (JavaScript, LESS, CSS, JSX и другие) в один файл. 

// Преимущества объединения в один файл: 
// - модульность позволяет разбить код на модули, с которыми легко работать;
// - производительность улучшается за счет одного сетевого запроса на загрузку 
//      одного файла.

// Задачи webpack:
// - разбивает код на части, которые можно загружать по мере необходимости;
// - минифицирует код, то есть удаляет пробелы, разрывы строк, длинные имена 
//      переменных и ненужный код для уменьшения размера файла;
// - прогоняет код через тесты;
// - горячая замена модуля (HMR, hot module replacement) - это мгновенная замена 
//      обновленных модулей.

// Сборщик модулей webpack дает дополнительные преимущества:
// - модульность: делает код более доступным для совместной работы нескольких 
//      разработчиков;
// - компонентный подход: webpack позволяет делать сборку проекта из небольших 
//      компонентов, которые легче понимать, заменять, тестировать и использовать 
//      повторно;
// - скорость загрузки: упаковка в один файл и минификация сокращают время загрузки 
//      приложения, за счет того, что нужно выполнить один сетевой запрос;
// - согласованность: дает возможность использовать новейшие возможности
//      JavaScript (ESNext).

// --- 2.1 Файл конфигурации.

// Начиная с webpack 4 объединение проекта в пакет не требует файла конфигурации, 
//      в этом случае Webpack будет использовать значения по умолчанию. 
//      Файл конфигурации webpack.config.js позволяет настроить процесс сборки.
//      Процесс начинается с файла index.js, в котором выполняется рендеринг 
//      корневого компонента. Webpack находит модуль для каждого оператора 
//      import и включает его в пакет, проходя по всей иерархии компонентов. 
//      Таким образом формируется граф зависимостей, где зависимостями являются
//      файлы необходимые приложению.

// установить с помощью npm:
//      npm install --save-dev webpack webpack-cli

// Оператор import не поддерживается большинством браузеров, поэтому требуется Babel
//      для преобразования import в require.

// Файл webpack.config.js - это модуль, экспортирующий объектный литерал 
//      с описанием действий, которые должен выполнять пакет. 

// установка зависимостей для Babel, модули: babel-loader и @babel/core
//      npm install babel-loader @babel/core --save-dev

// Карта исходников (source map) - это файл, который сопоставляет пакет 
//      с оригинальными исходными файлами. 

// пример файла 'webpack.config.js'
var path = require("path");
module.exports = {
    // входной файл клиента './src/index.js', граф зависимостей строится начиная
    //      с этого файла на основе операторов import
    entry: "./src/index.js",
    output: {
        // каталог куда будет выполнен вывод
        path: path.join(__dirname, "dist", "assets"),
        // имя выходного файла
        filename: "bundle.js"
    },
    module: {
        // список загрузчиков, выполняющих запуск определенных модулей
        rules: [
            // загрузчик babel
            {
                // регулярное выражение, которое определяет путь к файлам с
                //      которыми должен работать загрузчик
                test: /\.js$/,
                // исключает папку node_modules
                exclude: /node_modules/,
                loader: "babel-loader"
            }
        ]
    },
    // подключает карту исходников для отладки приложения, в каталог вывода
    //      будет записан файл '*.js.map', во вкладке Sources инструмента
    //      разработчика будут находится все исходные файлы пакета
    devtool: "#source-map"
};

// Установка:
//      npm install @babel/preset-env @babel/preset-react --save-dev

// Файл '.babelrc' содержит настройки babel: 
//      {
//          "presets": ["@babel/preset-env", "@babel/preset-react"]
//      }

// Пакеты создаются перед развертыванием приложения на сервере.
//      npx webpack --mode development

// Через сценарий npm в файле package.json:
//      "scripts": {
//          "build": "webpack --mode production"
//      },
//      npm run build

// --- 2.2 Загрузка пакета.

// Основная страница выполняет один HTTP-запрос для загрузки файла bundle.js 
//      с приложением React. Папка вывода содержит все необходимые ресурсы для
//      работы приложения. Страница содержит целевой элемент div, в который
//      будет монтироваться корневой компонент React.

// Файл главной страницы приложения './dist/index.html'.
//
//      </html>
//      <!DOCTYPE html>
//      <html>
//          <head>
//              <meta charset="utf-8" />
//              <title>React Recipes App</title>
//          </head>
//          <body>
//              <div id="root"></div>
//              <script src="bundle.js"></script>
//          </body>
//      </html>

// --- 2.3 Другие способы запуска.

// CodeSandbox - IDE
//      https://codesandbox.io/

// Create React App
//      https://github.com/facebook/create-react-app

// Ember CLI
//      https://cli.emberjs.com/release/

// 'Create React App' позволяет автоматически генерировать проект React, что позволяет
//      начать работу с проектом React без ручной настройки webpack, Babel, ESLint и 
//      других инструментов.

// Установка пакета:
//      npm install -g create-react-app

// Создать приложение:
//      create-react-app my-project

// Использовать npx для запуска без глобальной установки пакета:
//      npx create-response-app my-project

// Получаем проект с тремя зависимостями: React, ReactDOM и react-scripts. 
//      Модуль react-scripts устанавливает Babel, ESLint, webpack и прочее.

// Запуск:
//      npm start
//      npm test
//      npm run build