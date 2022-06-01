## TypeScript

[каталог проекта](https://github.com/LisShamenko/technology_NodeJS/tree/master/TypeScriptTechno) / [стек технологий](https://github.com/LisShamenko/NodeJS-technology-stack/blob/master/README.md)
____

### Запуск проекта TypeScript

```javascript

// перед запуском следует выполнить компиляцию проекта:
//      npm run tsc-project

// приложение
const TypescriptApp = require('./TypeScriptTechno/app/dist/app');
console.log('--- TypescriptApp = ' + TypescriptApp);

```
____

### Основные файлы проекта TypeScript

- **JS+TS**
    > Каталог, содержит сравнение различных JS и TS подходов программирования.
- **app/dist**
    > Каталог, содержит скомпилированное приложение TS. Оно запускается, как обычное NodeJS приложение.
- **app/tsconfig.project.json**
    > Файл настроек проекта.
- **app/src**
    > Каталог, содержит компилируемый проект TypeScript.
____

### Файлы в корневом каталоге TypeScript

- **GruntFile.js**
    > Менеджер задач grunt.
- **.vscode/tasks.json**
    > Файл настройки VS Code. Настройка задачи выполняемой по умолчанию.
- **.vscode/launch.json**
    > Файл настройки VS Code. Настройка отладки.
- **package.json**
    > Содержит команды проекта:
    > - _"tsc": "tsc"_
    > - _"tsc-src": "tsc ./TypeScriptTechno/app/src/compilertest.ts --target esnext --outfile ./TypeScriptTechno/app/dist/compilertest.js --module System"_
    > - _"tsc-project": "tsc --project ./TypeScriptTechno/app/tsconfig.project.json"_
    > - _"tsc-project-create-views": "mkdir .\\TypeScriptTechno\\app\\dist\\views"_
    > - _"tsc-project-copy-views": "copy .\\TypeScriptTechno\\app\\src\\views\\ .\\TypeScriptTechno\\app\\dist\\views\\"_
    > - _"tsc-project-delete": "del /q /s .\\TypeScriptTechno\\app\\dist\\*.*"_
- **tslint.json**
    > Анализатор кода (deprecated). [tslint](https://palantir.github.io/tslint/)
- **tsconfig.json**
    > Файл настройки компилятора TS.
____ 