import { Component, Output, EventEmitter, ViewEncapsulation, Input, ViewChildren, QueryList } from "@angular/core";
import { Product } from "../../models/Product/product.model";
import { ProductFormGroup } from "src/models/Form/form.model";
import { ProductRepository } from "../../models/Product/product.repository";
import { DirectiveChild } from "src/directives/directive.child";

// --------------- Каналы

// Каналы (pipes) — классы к которым применяется декоратор @Pipe, каналы преобразуют
//      данные в привязках перед передачей их в директивы и компоненты

// Angular получает значение и передает его каналу, канал преобразует и возвращает данные, 
//      которые используются в выражении привязки, применение каналов:
// 
//      <td>{{ item.price | currency:"USD":true }}</td>
//      
//      item.price  - значение
//      currency    - имя канала
//      :"USD":true - аргументы канала (разделяются двоеточиями)

// --------------- встроенные каналы

// number       форматирует числовые значения с учетом локального контекста
// currency     форматирует денежные суммы с учетом локального контекста
// percent      форматирует проценты с учетом локального контекста
// date         форматирует дату с учетом локального контекста
// uppercase    преобразует строку к верхнему регистру
// lowercase    преобразует строку к нижнему регистру
// json         преобразует объект в JSON-строку
// slice        выбирает элементы из массива или символы из строки
// async        подписывается на Observable или Promise и выводит последнее полученное значений

// - каналы i18nPlural и i18nSelect используются для локализации контента

// --------------- форматирование чисел

// форматирует числа с учетом локали пользователя, формат:
//      "<minIntegerDigits>.<minFactionDigits>-<maxFractionDigits>"
//      minIntegerDigits    минимальное количество цифр в целой части (по умолчанию 1)
//      minFractionDigits   минимальное количество цифр в дробной части (по умолчанию 0)
//      maxFractionDigits   максимальное количество цифр в дробной части (по умолчанию 3)

// --------------- форматирование денежных единиц

// аргументы канала currency:
//      currencyCode    задает денежную единицу кодом ISO 4217, по умолчанию USD, список кодов:
//                      http://en.wikipedia.org/wiki/ISO_4217
//      symbolDisplay   true - будет выводится знак денежной единицы, по умолчанию false
//      digitInfo       форматирование числа аналогично каналу number

// --------------- форматирование процентов

// значения в диапазоне от 0 до 1 форматируются как числа от 0 до 100 процентов, принимает
//      один аргумент форматирует число аналогично каналу number

// --------------- форматирование дат

// форматирует данные с учетом пользовательской локали, даты могут быть заданы
//      объектом Date, числом в миллисекундах с 1970 года, строкой из симолов формата:
//          y, yy               Год
//          M, MMM, MMMM        Месяц
//          d, dd               День (в числовом представлении)
//          E, EE, EEEE         День (в текстовом виде)
//          j, jj               Час
//          h, hh, H, HH        Час в 12- и 24-часовом формате
//          m, mm               Минуты
//          s, ss               Секунды
//          Z                   Часовой пояс
// предопределенные форматы:
//      short           yMdjm
//      medium          yMMMdjms
//      shortDate       yMd
//      mediumDate      yMMMd
//      longDate        yMMMMd
//      fullDate        yMMMMEEEEd
//      shortTime       jm
//      mediumTime      jms

// --------------- регистр символов

// каналы применяют к значению стандартные методы toUpperCase и toLowerCase,
//      настройки локали не учитываются

// --------------- сериализация в JSON

// использует метод JSON.stringify, с массивами следуте использовать грязный канал 'pure:false'

// --------------- срезы

// возвращает подмножество элементов массива, требует нечистый канал, применение:
//      *ngFor="let item of getProducts() | slice:0:(itemCount || 1)"

// аргументы:
//      start   аргумент обязателен, если больше 0, отсчет идет с начала массива, если меньше 0, то с конца
//      end     необязательный аргумент, указывает количество элементов включаемых в результат

@Component({
    selector: "pipe-form-component",
    templateUrl: "./pipe_form.template.html",
})
export class PipeFormComponent {

    // --------------- каналы

    selectNumber: number = 0;
    categoryFilter: string = 'none';
    percentNumber: number = 0;
    sliceCount: number = 0;

    dateObject: Date = new Date(2021, 7, 13);
    dateString: string = "2021-07-13T16:40:51.000Z";
    dateNumber: number = 3525751400000;

    // selectNumber=$event.target.value
    setSelectNumber(event: any) {
        console.log(event.target.value);
        this.selectNumber = event.target.value;
    }

    // --------------- таблица

    isSet: boolean = false;
    productRepository: ProductRepository = new ProductRepository();

    getProducts(): Product[] {
        return this.productRepository.getProducts();
    }

    deleteProduct(key: number) {
        this.productRepository.deleteProduct(key);
    }

    @ViewChildren(DirectiveChild)
    viewChildren: QueryList<DirectiveChild> | null = null;

    ngAfterViewInit() {
        this.updateViewChildren();
        if (this.viewChildren != null) {
            this.viewChildren.changes.subscribe(() => {
                this.updateViewChildren();
            });
        }
    }

    private updateViewChildren() {
        setTimeout(() => {
            if (this.viewChildren != null) {
                this.viewChildren.forEach((child, index) => {
                    child.setChildClass((index % 2) > 0)
                });
            }
        }, 0);
    }

    // --------------- форма

    productForm: ProductFormGroup = new ProductFormGroup();
    currentProduct: Product = new Product(0, 'test', 'test', 100);
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