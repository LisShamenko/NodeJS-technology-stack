import { Component } from "@angular/core";
import { ProductRepository } from "./../../models/Product/product.repository";
import { Product } from "./../../models/Product/product.model";

//      https://developer.mozilla.org/ru/docs/Web/API/Node/textContent

// Angular обрабатывает шаблон, обнаруживает привязки и вычисляет выражения в привязках
// логика и данные предоставляются шаблону через класс компонента, это класс TypeScript
//      к которому применили декоратор @Component
@Component({
    // selector задает HTML-элемент
    selector: "app-product",
    // задает контент для замены HTML-элемента в разметке
    templateUrl: "./product.template.html"
})
export class ProductComponent {

    // --------------- разновидности привязок

    // [цель]="выражение"       односторонняя привязка данных - данные передаются от выражения к цели
    // {{'выражение'}}          привязка со строковой интерполяцией
    // (цель)="выражение"       односторонняя привязка данных - данные передаются от цели к приемнику, где
    //                          цель это выражение или обработчик события
    // [(цель)]="выражение"     двусторонняя привязкя - данные передаются в обоих направлениях между 
    //                          целью и приемником (выражением)

    // --------------- привязки свойств

    // [свойство]       привязка для задания свойств объекта JavaScript, который представляет управляющий 
    //                  элемент модели DOM
    // [attr.имя]       привязка атрибута для задания значений атрибутов управляющих элементов HTML, 
    //                  для которых не существует свойств DOM
    // [class.имя]      привязка устанавливливающая класс управляющего элемента HTML
    // [style.имя]      привязка устанавливливающая стиль управляющего элемента HTML

    // --------------- привязки классов

    // [class]="выражение"          результат выражения используется для замены всех классов управляющего элемента
    // [class.myClass]="выражение"  результат выражения используется, чтобы задать значение конкретному классу
    // [ngClass]="map"              привязка назначает элементу несколько классов по данным из объекта Map

    // --------------- типы поддерживаемые директивой ngClass

    // Строка       управляющему элементу назначаются классы, заданные строкой и разделенные пробелами
    // Массив       каждый объект в массиве определяет имя класса, назначаемый управляющему элементу
    // Объект       каждое свойство объекта содержит строку с именами классов, разделенных пробелами,
    //              классы из строки назначаются элементу, если значение свойства является квазиистинным

    // --------------- привязки стилей

    // [style.myStyle]="выражение"          привязка для задания одному стилевому свойству результата выражения
    // [style.myStyle.units]="выражение"    привязка стилевого свойства, задает тип возвращаемого выражением значения
    // [ngStyle]="map"                      привязка задает несколько стилевых свойств по данным объекта (аналогично ngClass)

    // --------------- идемпотентность односторонних привязок

    // Односторонние привязки должны быть идемпотентными, т.е. их многократное вычисление не должно 
    //      изменять состояние приложения, так как выражения в привязках могут вычислятся несколько раз 
    //      перед отображением. Например, вызов getClassesByCount не должен добавлять или удалять данные 
    //      репозитория.

    // Код вызовет ошибку, переменная count изменилась:
    //      count: number = 1;
    //      <div class='bg-info p-a-1'>{{ count++ }}</div>

    // Код вызовет ошибку, свойство изменяет массив продуктов:
    //      get nextProduct(): Product {
    //          let products = this.model.getProducts();
    //          return products.shift();
    //      }
    //      <div class='bg-info p-a-1'>{{ nextProduct.name }}</div>
    
    // --------------- контекст выражения

    // Angular вычисляет выражения привязок в контексте класса компонента, что позволяет шаблону обращаться
    //      напрямую к классу компонента. Шаблон вызывает методы компонента и результат встраивает в HTML. 
    //      Компонент предоставляет контекст выражения шаблона. Это означает, что шаблон не может получить 
    //      доступ к объектам за пределами класса компонента, например, к объектам в глобальном пространстве 
    //      имен: console, math и другим.

    // Следующий код вызовет ошибку, вызов Math.floor():
    //      <div class='bg-info p-a-1'>{{ Math.floor(15.95) }}</div>

    // Доступ к глобальным объектам можно получить через методы компонента:
    //      mathFloor(value: number): number {
    //          return Math.floor(value);
    //      }
    //      <div class='bg-info p-a-1'>{{ mathFloor(15.95) }}</div>

    // --------------- привязки

    productRepository: ProductRepository = new ProductRepository();

    // Привязка данных состоит из четырех частей:
    // - управляющий элемент — элемент HTML, к которому будет применена привязка 
    // - квадратные скобки сообщают Angular, что привязка данных является односторонней, для такой привязки:
    //      Angular вычисляет выражение, передает результат цели привязки, которая изменяет управляющий элемент
    // - цель определяет, что должна делать привязка, выделяют два типа целей: директивы и привязки свойств
    // - выражение это код JavaScript, который вычисляется в контексте класса компонента (@Component)

    // ngClass, ngStyle, ngIf, ngFor, ngSwitch, ngSwitchCase, ngSwitchDefault, ngTemplateOutlet

    // --------------- привязка вида: [ngClass]="'p-a-1 ' + getClasses()"
    // --------------- привязка вида: [class]="getClasses(1)"

    getClasses(key: number = -1): string {
        let product = this.productRepository.getProduct(key);
        // 'product?.price' вместо проверки 'product === undefined'
        return "p-a-1 " + (product?.price && product.price < 50 ? "bg-info" : "bg-warning");
    }

    getClassesByCount(): string {
        return (this.productRepository.getCountProducts() == 5) ? "bg-success" : "bg-warning";
    }

    // --------------- привязка вида: {{productRepository.getProductName(1, '')}}

    getProductName(id: number, defaultName: string): string {
        let product = this.productRepository.getProduct(id);
        if (product === undefined || product.name === undefined) {
            return defaultName;
        }
        else {
            return product.name;
        }
    }

    // --------------- привязка вида: [class.bg-success]="checkPrice(2, 50) === 1"

    checkPrice(id: number, price: number): number {
        let product = this.productRepository.getProduct(id);
        if (product === undefined || product.price === undefined) {
            return 0;
        }
        else if (product?.price < price) {      // productRepository.getProduct(2)?.price < 50
            return 1;
        }
        else if (product?.price === price) {    // productRepository.getProduct(2)?.price >= 50
            return 2;
        }
        else {                                  // productRepository.getProduct(2)?.price >= 50
            return 3;
        }
    }

    // --------------- привязка вида: [ngClass]="getClassMap(1)"

    // возвращает объект свойства которого являются строками с перечислением классов
    getClassMap(key: number): Object {
        let product = this.productRepository.getProduct(key);
        if (product?.price) {
            return {
                "text-xs-center bg-danger": product?.name === "тестовый_продукт",
                "bg-info": product?.price < 50
            };
        }
        else {
            return {
                "text-xs-center bg-danger": false,
                "bg-info": false
            };
        }
        //return {
        //    "text-xs-center bg-danger": product?.name === "тестовый_продукт",
        //    "bg-info": product?.price && product?.price < 50
        //};
    }

    // --------------- привязка вида: [style.fontSize]="fontSizeWithPx"

    fontSizeWithPx: string = "30px";

    // --------------- привязка вида: [style.fontSize.px]="fontSizeWithoutPx"

    fontSizeWithoutPx: string = "30";

    // --------------- привязка вида: [ngStyle]="getStyles(2)"

    getStyles(key: number) {

        let product = this.productRepository.getProduct(key);
        let color = (product?.price && product.price <= 50) ? "green" : "red";

        // 
        return {
            fontSize: "30px",
            "margin.px": 100,
            color: color
        };
    }
}