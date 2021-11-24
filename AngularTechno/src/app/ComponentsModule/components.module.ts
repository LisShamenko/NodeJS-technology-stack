import { NgModule } from "@angular/core";
import { BrowserModule } from "@angular/platform-browser";
import { FormsModule, ReactiveFormsModule } from "@angular/forms"
import { ModuleFormComponent } from "./components/form/module_form.component";
import { ModuleTableComponent } from "./components/table/module_table.component";
import { CommonModule } from "../CommonModule/common.module";
import { ModuleRootComponent } from "./components/root/module_root.component";
import { ModuleIfComponent } from "./components/if/module_if.component";

// --------------- компонентный функциональный модуль

// - рефакторинг: 
//      после перемещения файлов компонентов свойство templateUrl будет содержать не правильный адрес шаблона,
//      что потребует выполнить одно из двух действий:
//      - вручную исправить адреса templateUrl у всех перемещенных компонентов
//      - использовать свойство moduleId для автоматической настройки адресов шаблонов:
//        @Component({
//            // module.id предоставляется на стадии выполнения
//            moduleId: module.id,
//            // Angular будет запрашивать templateUrl относительно местоположения модуля
//            // свойство templateUrl должно содержать только имя файла
//            templateUrl: "component.html",
//            ...
//        })
//      - need to change this if you want to use module.id property:
//        "compilerOptions": {
//            "module": "commonjs",
//            ...

@NgModule({
    imports: [BrowserModule, FormsModule, ReactiveFormsModule, CommonModule],
    declarations: [ModuleFormComponent, ModuleTableComponent, ModuleRootComponent, ModuleIfComponent],
    exports: [ModuleFormComponent, ModuleTableComponent, ModuleRootComponent, ModuleIfComponent]
})
export class ComponentsModule { }