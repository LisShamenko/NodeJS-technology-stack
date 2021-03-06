// корневой компонент
import { Component } from "@angular/core";
import { Product } from "src/models/Product/product.model";
import { ProductRepository } from "src/models/Product/product.repository";
import { FirstService } from "./../../services/first.service";

@Component({
    selector: "service-component",
    templateUrl: "./service.template.html",
})
export class ServiceComponent {

    // --------------- Передача экземпляра сервиса через входные свойства

    // - корневому компоненту не нужен сервис FirstService, но он вынужден содержать ссылку, потому что 
    //      является первым родительским компонентом для FirstDisplayComponent и FirstEditComponent 

    // - данный метод усложняет корневой класс и тестирование, высокий риск рефакторинга: при 
    //      перемещении дочерних элементов или самого корневого компонента потребуется перенести
    //      код объявления сервиса, потребуется разместить ссылки на класс сервиса по всей иерархии 
    //      компонентов

    firstService: FirstService = new FirstService();

    // --------------- dependency injection

    // - внедрение зависимостей (dependency injection) в Angular реаллизуется через источник объектов называемый 
    //      провайдером (provider), любой класс предоставляемый провайдером называется службой (service),
    //      классы служб декорируются @Injectable, внедрение зависимостей выполняются через конструкторы,
    //      Angular разрешает зависимости используя имеющиеся определения служб.

    // - Angular по конструктору класса проверяет объявленные зависимости, зарегистрированные службы используются
    //      для разрешения этих зависимостей, сюда входят как встроенные службы Angular так и нестандартные

    // - регистрация сервисом (настройка механизма внедрения зависимостей) выполняется в модуле приложения:
    //      providers: [массив классов служб]

    // - в компонентах и каналах не нужно беспокоится об отслеживании изменений, для компонентов Angular 
    //      автоматически вычисялет выражения привязок, а для грязных каналов обновления инициируются 
    //      при любом изменении в приложении, в директивах реакция на изменения должна обрабатываться 
    //      вручную, через дифферы

    // --------------- Проблема изоляции тестов

    // - внедрение зависимостей позволяет разорвать связи между структурными блоками приложения, чтобы 
    //      изолировать классы и протестировать их отдельно друг от друга

    // - Angular автоматически разрешает зависимости в конструкторах по цепочке, объект без зависимостей 
    //      это конец цепочки и он создается сразу, после чего передается в другие конструкторы

    // не явное создание экземпляра класса приводит к неодназначности результатов тестирования,
    //      так как ошибка может находится в экземпляре ProductRepository
    hardDependence: ProductRepository = new ProductRepository();

    // передача объекта в конструкторе позволяет воспользоваться техникой замены 
    //      через фиктивный (mock) объект
    constructor(private softDependence: ProductRepository) { }

    getProducts(): Product[] {
        return this.softDependence.getProducts();
    }
}