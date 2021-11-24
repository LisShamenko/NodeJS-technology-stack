import { Component, Output, EventEmitter, ViewEncapsulation } from "@angular/core";
import { Product } from "../../models/Product/product.model";
import { ProductFormGroup } from "src/models/Form/form.model";

// --------------- Компонент

// - компоненты это классы typescript с примененным к ним декоратором @Component, который содержит настройки компонента

// - компоненты обладают собственными шаблонами, им доступна вся функциональность директив, но в отличие от директив 
//      компоненты тесно привязаны к своим шаблонам, они имеют управляющий HTML-элемент, могут определять входные/выходные 
//      свойства, компоненты содержат методы и данные, которые используются привязками в шаблонах, а так же предоставляют 
//      контекст для вычисления выражений привязок

// - требуется как минимум один компонент, называемый корневым, этот компонент определяет точку входа приложения, которая 
//      задается в файле модуля Angular

// - компоненты позволяют разделить логику на структурные блоки для повторного использования

// --------------- @Component

// animations       настройки анимаций
// encapsulation    настройки инкапсуляции представления (изоляция стилей компонента)
// moduleId         модуль, в котором определяется компонент (используется совместно с templateUrl)
// selector         селектор CSS для выбора управляющих элементов 
// styles           стили CSS (применяются только к шаблону компонента)
// styleUrls        путь к файлу со стилями CSS (применяются только к шаблону компонента)
// template         встроенный шаблон
// templateUrl      путь к файлу внешнего шаблона
// providers        локальные провайдеры служб
// viewProviders    локальные провайдеры служб для дочерних представлений 

@Component({
    selector: "form-component",

    // --------------- template / templateUrl

    // template для встроенных шаблонов: лучшая согласованность между шаблоном и компонентом,  
    //      но легко могут выйти из под контроля
    template: `
        <form novalidate [formGroup]="productForm" (ngSubmit)="submitForm(productForm)">
            <div class="form-group">
                <label>Name</label>
                <input class="form-control" name="name" [(ngModel)]="currentProduct.name" formControlName="name" />
            </div>
            <div class="form-group">
                <label>Category</label>
                <input class="form-control" name="category" [(ngModel)]="currentProduct.category" formControlName="category" />
            </div>
            <div class="form-group">
                <label>Price</label>
                <input class="form-control" name="price" [(ngModel)]="currentProduct.price" formControlName="price" />
            </div>
            <button class="btn btn-primary" type="submit" [disabled]="isFormSubmit && productForm.invalid"
                [class.btn-secondary]="isFormSubmit && productForm.invalid">
                Create
            </button>
        </form>
    `,

    // templateUrl для внешних шаблонов: код не смешивается с разметкой, но требуется управлять большим количеством файлов
    templateUrl: "./product_form.template.html",

    // --------------- стили

    // - компоненты определяют изолированные стили, которые не влияют на родительский и дочерние компоненты
    // - стили определенные в документе HTML влияют на все компоненты

    // встроенные стили, задаются как массив из селекторов CSS и свойств
    styles: ["div { background-color: lightgreen }"],

    // внешние стили определяются как массив строк определяющих файлы CSS
    styleUrls: ["./product_form.style.css"],

    // --------------- теневая модель DOM / инкапсуляции представления компонента / 'ViewEncapsulation: Emulated'

    // инкапсуляции представления компонента - это механизм позволяющий имитировать функциональность теневой модели DOM, 
    //      которая позволяет изолировать секции DOM в границах их собственной области видимости, то есть JavaScript, стили и 
    //      шаблоны применяются  к отдельным частям документа HTML, Angular эмулирует это поведение, потому что оно 
    //      реализовано не во всех браузерах

    // режимы инкапсуляции задаются опцией encapsulation из перечисления ViewEncapsulation
    //      http://developer.mozilla.org/en-US/docs/Web/Web_Components/Shadow_DOM
    //      http://caniuse.com/#feat=shadowdom

    // ViewEncapsulation: 
    //      Emulated     (рекомендуется) Angular эмулирует теневую модель DOM, значение по умолчанию
    //      Native       Angular использует поддержку теневой модели DOM и полифилы (http://github.com/webcomponents/webcomponentsjs)
    //                   существующие бибилиотеки полифилов плохо поддерживают эмуляцию теневой модели
    //      None         Angular просто добавляет стили CSS в секцию head документа HTML

    // --------------- селекторы CSS теневой модели DOM

    // - в отличие от обычных селекторов CSS, селекторы CSS теневой модели DOM могут работать 
    //      за пределами компонента в котором они объявлены

    // :host                            идентифицирует управляющий элемент компонента
    // :host-context(classSelector)     идентифицирует предков управляющего элемента с заданным классом
    // /deep/ или >>>                   родительский компонент определяет стили элементов в шаблоне дочернего компонента 
    //                                  требует настройку: 'encapsulation: emulated'

    // - стиль будет действовать на управляющий элемент, который находится за пределами шаблонами, 
    //      а не только на внутренний контент управляющего элемента:
    //      :host:hover {
    //          font-size: 25px;
    //      }

    // - стиль будет действовать на родителей управляющего элемента, поддерживается только селектор класса:
    //      :host-context(.angularApp) input {
    //          background-color: lightgray;
    //      }

    // - селекторы /deep/ или >>> позволяют применять стили на дочерние компоненты, стиль font-style 
    //      наследуется автоматически: 
    //      /deep/ div { 
    //          border: 2px black solid; 
    //          font-style:italic 
    //      }
})
export class ProductFormComponent {

    // --------------- выходные свойства дочерних компонентов

    // выходные свойства определяют нестандартные события на которые может реагировать родительский компонент

    productForm: ProductFormGroup = new ProductFormGroup();
    currentProduct: Product = new Product();
    isFormSubmit: boolean = false;

    @Output("create-product")
    createProduct = new EventEmitter<Product>();

    submitForm(form: ProductFormGroup) {
        this.isFormSubmit = true;
        if (form.valid) {
            this.createProduct.emit(this.currentProduct);
            this.currentProduct = new Product();
            this.productForm.reset();
            this.isFormSubmit = false;
        }
    }
}