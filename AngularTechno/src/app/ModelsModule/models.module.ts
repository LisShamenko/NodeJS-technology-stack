import { NgModule } from "@angular/core";
import { ModuleProductsSource } from "./Product/module_product.datasource";
import { ModuleProductRepository } from "./Product/module_product.repository";

// --------------- модуль модели

// - чаще всего все структурные блоки приложения зависят от моделей, поэтому такие модули
//      являются хорошей отправной точкой для рефакторинга приложения на функциональные модули

// - рефакторинг: 
//      1. создать папку модуля в app
//      2. переместить файлы моделей в папку, исправить ошибки в файлах
//      3. создать файл определения модуля
//      4. обновление путей в файлах объявляемых классов, которые использовали модели
//      5. обновить корневой модуль

@NgModule({
    providers: [ModuleProductsSource, ModuleProductRepository],
    // ModuleFormControl и ModuleFormGroup должны быть доступны
})
export class ModelsModule { }