import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';
import { AppModule } from './app/app.module';

// приложения Angular можно запускать на разных платформах, каждая из которых 
//      предоставляет исполнительную среду для загрузки и запуска приложений
// класс platformBrowserDynamic предоставляет исполнительную среду для браузеров
const platform = platformBrowserDynamic();

// метод bootstrapModule передает Angular модуль, который описывает приложение
platform.bootstrapModule(AppModule);

// --------------- загрузка приложения

// - загрузчик модулей загружает файл main.js и все его зависимости, в том числе корневой модуль
// - после загрузки всех файлов зависимостей выполняется файл main.js, который загружает 
//      приложение Angular начиная с корневого модуля
// - корневой модуль содержит декоратор @NgModule, который перечисляет корневые компоненты 
//      приложения: ProductComponent ...
// - Angular анализирует декораторы @Component, содержимое шаблонов (templateUrl) вставляется в 
//      HTML документ, заменяя HTML-элементы компонентов (selector)
// - в ходе обработки шаблонов Angular разрешает привязки и вычисляет выражения в них
