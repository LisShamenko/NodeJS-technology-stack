// --------------- 1. Webpack.

// --- 1.1 Терминология. 

// Webpack является сборщиком модулей и имеет широкое определение того, что такое 
//      модуль. Для webpack модули это:
//      - модули Common JS;
//      - модули AMD;
//      - модули ES;
//      - импорт файлов CSS;
//      - url-адреса изображений;

// Webpack объединяет различные источники и типы модулей так, чтобы можно было 
//      импортировать всё это в код JavaScript и получить готовый к отправке 
//      результат.

// --- --- entry point

// Entry point - это точка входа webpack, из которой собираются все зависимости 
//      проекта. Зависимости образуют граф зависимостей. Точкой входа является
//      файл JavaScript, значение по умолчанию 'src/index.js'. Webpack может 
//      иметь несколько точек входа.

// --- --- output

// Output - это точка вывода, где в процессе сборки собираются результирующие 
//      файлы JavaScript и статические файлы. Точкой выхода является папка,
//      значение по умолчанию 'dist/'. Файлы, полученные в процессе сборки,
//      собираются в пакет (bundle).

// --- --- loaders

// Loaders (загрузчики) - это сторонние расширения (third-party extensions), 
//      которые позволяют webpack работать с различными расширениями файлов. 
//      Загрузчики преобразуют файлы (кроме JavaScript) в модули, которые 
//      webpack может использовать как зависимости в проекте. Например, 
//      загрузчики для файлов: CSS, изображений или TXT.

// --- --- plugins

// Plugins (плагины) - это сторонние расширения (third-party extensions), 
//      которые могут изменить работу webpack. Например, плагины для настройки 
//      переменных среды или для извлечения: HTML, CSS.

// --- --- mode

// Mode - это режим работы webpack. Поддерживается два значения: development и 
//      production. Основное различие между этими режимами заключается в том, что 
//      production автоматически применяет минимизацию и другие оптимизации 
//      к коду JavaScript.

// --- --- lazy loading (code splitting)

// Lazy loading (отложенная загрузка) - это метод оптимизации, позволяющий разделять
//      большие пакеты на части и загружать их по отдельности. В этом случае блоки
//      JavaScript кода загружаются только в ответ на какое-либо взаимодействие 
//      с пользователем. Разделенные части кода становятся chunks (фрагментами).

// --- 1.2 Запуск по умолчанию.

// Создать новую папку и перейти в нее.
//      mkdir webpack-tutorial && cd $_

// Инициализировать проект NPM.
//      npm init -y

// Установить пакеты webpack.
//      npm i webpack webpack-cli webpack-dev-server --save-dev

// Добавить в файл package.json сценарий запуска в режиме разработки.
//      "scripts": {
//          "dev": "webpack --mode development"
//      }

// Создать папку src и файл JavaScript с кодом.
//      mkdir src
//      echo 'console.log("Hello webpack!")' > src/index.js

// Запуск webpack в режиме разработки с точкой входа по умолчанию 'src/index.js'. 
//      Результатом станет новая папка dist с файлом main.js.
//      npm run dev

// --- 1.3 Webpack Dev Server.

// Пакет webpack-dev-server используется для разработки и позволяет запускать 
//      локальный сервер для обслуживания файлов проекта.

// Следующий сценарий выполняет сборку, запускает локальный сервер webpack и 
//      открывает приложение в браузере Firefox.
//      "scripts": {
//          "start": "webpack serve --open 'Firefox'",
//      },

// --- 1.4 Настройка webpack.

const path = require('path');
const HtmlWebpackPlugin = require("html-webpack-plugin");

// Добавить файл конфигурации webpack.config.js в корневую папку проекта.
//      touch webpack.config.js

// Файл конфигурации позволяет изменить: entry point, output, loaders, plugins, 
//      code splitting.

// Webpack написан на JavaScript и работает поверх NodeJS. Объект module.exports
//      используется для экспорта модуля Common JS.
module.exports = {

    // --- --- режим работы

    // Webpack поддерживает два режима работы: development и production. В режиме 
    //      разработки webpack берет код JavaScript в исходном виде и загружает 
    //      в браузер. Минификация не применяется, что ускоряет перезагрузку 
    //      приложения в процессе разработки.

    // В режиме production webpack применяет ряд оптимизаций:
    //      - минификацию с помощью TerserWebpackPlugin для уменьшения размера 
    //          пакета;
    //      - подъем области с помощью ModuleConcatenationPlugin;

    // В режиме production переменной среды process.env.NODE_ENV присваивается 
    //      значение 'production'. Переменная используется для добавления условной 
    //      логики.

    // Сценарий сборки в режиме production.
    //      "scripts": {
    //          "build": "webpack --mode production"
    //      },

    mode: 'development',

    // --- --- точка входа и папка вывода

    // изменить путь к точке входа на './source/index.js'
    entry: {
        index: path.resolve(__dirname, "source", "index.js")
    },

    // изменить папку вывода пакета на './build'
    output: {
        path: path.resolve(__dirname, "build"),
        // генерирует разные имена для фрагментов при code splitting
        filename: '[name].js',
        chunkFilename: '[id].[chunkhash].js'
    },

    // плагины
    plugins: [

        // --- --- плагин 'html-webpack-plugin'

        // Плагин 'html-webpack-plugin' загружает файлы HTML и внедряет 
        //      в них bundles.
        //      npm i html-webpack-plugin --save-dev
        new HtmlWebpackPlugin({
            // загрузить HTML из файла './source/index.html'
            template: path.resolve(__dirname, "source", "index.html")
        })
    ],

    // загрузчики
    module: {

        // группа загрузчиков или отдельный загрузчик настраивается внутри rules
        rules: [

            // каждый файл рассматривается как модуль
            {
                // поле test определяет регулярное выражение для выборки файлов
                test: /\.filename$/,
                // поле use определяет загрузчики, которые применяются к файлам
                use: ["loader-b", "loader-a"]
            },

            // --- --- CSS

            // Для работы с CSS необходимо установить как минимум два загрузчика:
            //      npm i css-loader style-loader --save-dev
            {
                test: /\.css$/,
                // Порядок появления загрузчиков в конфигурации имеет большое 
                //      значение. Загрузка выполняется справа налево. То есть 
                //      сначала должен быть загружен файл CSS с помощью плагина 
                //      css-loader, а затем стили внедряются на страницу с помощью 
                //      плагина style-loader. 
                use: [
                    // style-loader для загрузки таблицы стилей в DOM
                    "style-loader",
                    // css-loader для загрузки файлов CSS с помощью import
                    "css-loader"
                ]
            },

            // --- --- SASS

            // Для работы с SASS необходимо установить следующие загрузчики:
            //      npm i css-loader style-loader sass-loader sass --save-dev
            {
                test: /\.scss$/,
                use: [
                    // style-loader для загрузки таблицы стилей в DOM
                    "style-loader",
                    // css-loader для загрузки файлов CSS в виде модулей
                    "css-loader",
                    // sass-loader для загрузки файлов SASS с помощью import
                    "sass-loader"
                ]
            },

            // После установки загрузчиков SASS и CSS извлекать файлы CSS можно 
            //      с помощью плагина MiniCssExtractPlugin.

            // --- --- загрузчик babel-loader

            // Babel - это транспилятор кода JavaScript. Babel позволяет 
            //      преобразовать современный код JavaScript в более старый код, 
            //      который может работать почти в любом браузере.

            // Для транспиляции кода нужны следующие библиотеки babel:
            //      @babel/core - ядро Babel;
            //      babel-loader - загрузчик babel для webpack;
            //      @babel/preset-env - предустановленная среда babel 
            //          для компиляции современного Javascript до ES5;
            //      npm i @babel/core babel-loader @babel/preset-env --save-dev

            // Для использования preset-env необходим файл конфигурации 
            //      babel.config.json.
            //      {
            //          "presets": [
            //              "@babel/preset-env"
            //          ]
            //      }

            // использование загрузчика babel-loader
            {
                test: /\.js$/,
                exclude: /node_modules/,
                use: ["babel-loader"]
            }
        ]
    },

    // оптимизация
    optimization: {

        // --- 1.5 Code splitting: splitChunks.

        // Разделение кода - это метод оптимизации, который позволяет избегать 
        //      больших пакетов и дублирования зависимостей. В webpack имеется 
        //      три способа активировать разделение кода в webpack:
        //      - множественные точки входа (entry points);
        //      - сoptimization.splitChunks;
        //      - динамический импорт (import);

        // Подход на множественных точках входа хорошо работает для небольших 
        //      проектов, но в долгосрочной перспективе он не масштабируется. 

        // С помощью optimization.splitChunks библиотеку moment можно вынести 
        //      из основного пакета. В этром случае при сборке проекта будет
        //      создано два файла:
        //      - index.js
        //      - vendors-node_modules_css-loader_dist_runtime_api_js-node_modules_css-loader_dist_runtime_noSo-656df6.js
        splitChunks: {
            chunks: "all"
        }
    },
};