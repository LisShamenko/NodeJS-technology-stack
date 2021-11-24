import { Component, Input, ViewChildren, QueryList } from "@angular/core";
import { ProductRepository } from "../../models/Product/product.repository";
import { Product } from "../../models/Product/product.model";
import { DirectiveChild } from "src/directives/directive.child";

@Component({
    selector: "table-component",
    templateUrl: "./product_table.template.html"
})
export class ProductTableComponent {

    // --------------- привязка данных и использование директив

    // шаблон компонента может содержать любые привязки и директивы, каждый компонент изолирован от других
    //      и предоставляет логику только для своего шаблона
    isSet: boolean = false;

    // --------------- входные свойства

    // дочерние компоненты могут определять входные свойства, выражения для которых будут вычисляться в контексте 
    //      родительского компонента, результаты при этом будут присваиваться дочерним свойствам, пример:
    //      
    //      <table-component [child-product-repository]="rootProductRepository">
    //          дочерний компонент 'table-component' получает доступ к свойству 'parent_property' родительского 
    //          компонента, входное свойство позволяет родительскому компоненту передать данные в дочерний компонент
    //      </table-component>

    @Input("child-product-repository")
    childProductRepository: ProductRepository | null = null;

    getProduct(id: number): Product | undefined {
        if (this.childProductRepository == null) {
            return undefined;
        }
        return this.childProductRepository.getProduct(id);
    }

    getProducts(): Product[] {
        if (this.childProductRepository == null) {
            return [];
        }
        return this.childProductRepository.getProducts();
    }

    deleteProduct(key: number) {
        if (this.childProductRepository != null) {
            this.childProductRepository.deleteProduct(key);
        }
    }

    // --------------- @ViewChildren

    // Дочерние элементы представления (view children) - это экземпляры директив и компонентов, 
    //      относящиеся к дочерним компонентам

    @ViewChildren(DirectiveChild)
    viewChildren: QueryList<DirectiveChild> | null = null;

    ngAfterViewInit() {
        // установить слушателя, который срабатывает при обнаружении изменений коллекции QueryList
        //      результаты запроса директивы @ViewChildren обновляются автоматически
        if (this.viewChildren != null) {
            this.viewChildren.changes.subscribe(() => {
                this.updateViewChildren();
            });
        }
        // первый вызов updateViewChildren
        this.updateViewChildren();
    }

    private updateViewChildren() {
        setTimeout(() => {
            if (this.viewChildren != null) {
                this.viewChildren.forEach((child, index) => child.setChildClass(this.isSet))
            }
        }, 0);
    }

    // --------------- декораторы для запроса дочерних элементов

    // @ViewChild(class)        делает запрос на поиск директивы или компонента заданного типа, результат поиска,
    //                          это первый найденный объект, который присваивается декорированному свойству, можно 
    //                          указать переменную шаблона или несколько значений через запятую
    // @ViewChildren(class)     запрос на поиск всех директив и компонентов заданного типа свойству, результат поиска,
    //                          это объект QueryList, можно указать переменную шаблона или несколько значений через запятую

    // --------------- методы жизненного цикла компонента

    // ngAfterViewInit      вызывается при инициализации представления компонента, запросы директив выполняются
    //                      до вызова этого метода
    // ngAfterViewChecked   вызывается после проверки представления компонента
}