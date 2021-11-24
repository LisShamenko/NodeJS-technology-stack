import { Component } from "@angular/core";

// --------------- именованные элементы router-outlet

// - элементы router-outlet можно именовать через атрибут name и выводить в них 
//      контент соответствующий разным маршрутам, но шаблон может содержать
//      не более одного элемента router-outlet без атрибута name, который
//      называется первичным и значение атрибута name для этого элемента 
//      устанавливается как 'primary', значения атрибутов name должны быть 
//      уникальными

// - если маршрут соответствующий элементу router-outlet не будет найден, то
//      контент просто не будет отображен

@Component({
    selector: "lazy-loading-component",
    templateUrl: "./lazy_loading.component.html"
})
export class LazyLoadingComponent { }