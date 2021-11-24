import { NgModule } from "@angular/core";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { BrowserModule } from "@angular/platform-browser";

// пользовательские модули
import { ModelsModule } from "./ModelsModule/models.module";
import { CommonModule } from "./CommonModule/common.module";
import { ComponentsModule } from "./ComponentsModule/components.module";
import { ModuleRootComponent } from "./ComponentsModule/components/root/module_root.component";

// --------------- декоратор @NgModule для корневого модуля

// imports          модули необходимые приложению Angular, в том числе пользовательские модули
//      BrowserModule - содержит функциональность для запуска приложений Angular в браузерах
//      FormsModule - предоставляют поддержку для работы с формами HTML
//      ReactiveFormsModule - поддержка форм на базе моделей

// declarations     список директив, компонентов и каналов, необходимых приложению, которые
//                  называются общим термином: 'объявляемые классы' (declarable classed)
// - все пользовательские объявляемые классы должны быть включены в это свойство
// - встроенные объявляемые классы не включаются так как содержатся в модулях,
//      подключаемых в свойстве imports

// providers        провайдеры служб, которые будут использваться во всем приложении, при
//                  отсутствии подходящих локальных провайдеров

// bootstrap        корневые компоненты приложения

// --------------- корневой модуль

// - приложение Angular всегда содержит корневой модуль, который традиционно определяется 
//      в файле app.module.ts в папке app и используется в файле начальной загрузки main.ts

// - основной документ HTML традиционно называется index.html

// - папки модулей размещаются в папке app

@NgModule({
    imports: [
        BrowserModule, FormsModule, ReactiveFormsModule, 
        // корневой модуль загружает модуль модели
        ModelsModule,
        // корневой модуль загружает вспомогательный модуль, все классы в свойстве exports 
        //      будут добавлены в declarations корневого модуля
        CommonModule,
        // модуль с компонентами
        ComponentsModule],
    declarations: [],
    providers: [],
    exports: [ModuleRootComponent],
    bootstrap: []
})
export class ModulesModule { }