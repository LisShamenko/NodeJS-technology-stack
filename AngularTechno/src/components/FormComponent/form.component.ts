import { Component } from "@angular/core";
import { NgForm } from "@angular/forms";
import { ProductRepository } from "./../../models/Product/product.repository";
import { Product } from "./../../models/Product/product.model";
// 
import { ProductFormGroup, ProductFormControl } from "./../../models/Form/form.model";
import { FormControl, FormGroup, Validators } from "@angular/forms";

@Component({
    selector: 'app-form',
    templateUrl: './form.template.html'
})
export class FormComponent {

    // --------------- общие свойства событий

    // type         возвращает строку, определяет тип события
    // target       возвращает объект, является источником события (элемент HTML в DOM)
    // timeStamp    возвращает число, время возникновения события (в миллисекундах с 1 января 1970 года)

    // --------------- встроенные атрибуты проверки данных

    // required     обязательное значение
    // minlength    минимальное количество символов
    // maxlength    максимальное количество символов, конфликтует с одноименным атрибутом HTML5, поэтому
    //              не может применяться к элементам форм на прямую
    // pattern      регулярное выражение

    // --------------- классы проверки данных

    // классы назначаются элементам ввода браузером автоматически после каждого нажатия клавиши или передачи фокуса

    // ng-untouched / ng-touched    ng-untouched если элемент не посещался пользователем, иначе ng-touched
    // ng-pristine / ng-dirty       ng-pristine если содержимое элемента не изменялось пользователем, иначе ng-dirty
    // ng-valid / ng-invalid        ng-valid если содержимое элемента проходит проверку данных, иначе ng-invalid

    // --------------- свойства ngModel (объект проверки данных)

    // path         имя элемента
    // valid        true - содержимое элемента действительно
    // invalid      true - содержимое элемента недействительно
    // pristine     true - содержимое элемента не изменилось
    // dirty        true - содержимое элемента изменилось
    // touched      true - пользователь посетил элемент
    // untouched    true - пользователь не посетил элемент
    // errors       объект, свойства которого соответствуют не прошедшим проверку атрибутам
    // value        используется при определении нестандартных правил проверки данных

    // --------------- свойства объекта ошибки при проверки данных

    // required                     true - к элементу input был применен атрибут required
    //                                  о том же говорит само наличие свойства required
    // minlength.requiredLength     количество символов заданное в атрибуте minlength
    // minlength.actualLength       количество введенных пользователем символов
    // pattern.requiredPattern      регулярное выражение заданное в атрибуте pattern
    // pattern.actualValue          содержимое элемента

    // --------------- формы

    productRepository: ProductRepository = new ProductRepository();

    getProduct(key: number): Product | undefined {
        return this.productRepository.getProduct(key);
    }

    getProducts(): Product[] {
        return this.productRepository.getProducts();
    }

    // --------------- привязка событий

    // привязка события состоит из следующих частей: 
    // - управляющий элемент (источник события)
    // - круглые скобки определяют привязку события
    // - событие, передается от управляющего элемента HTML в класс компонента
    // - выражение, вычисляется при возникновении события

    // выражения в привязках событий могут вносить изменения в состояние приложения

    // ссылочные переменные - это переменные которые объявляются в шаблоне HTML: '#имя_переменной'
    //      Angular присваивает ссылочной переменной элемент HTML, в котором она объявлена. 
    //      Ссылочной переменной присваивается элемент input (объект HTMLInputElement в DOM):
    //      <input #product (input)="false" />, где 
    //      (input)="false" - передает выражение 'false' в привязку события 'input', чтобы Angular смог 
    //      выполнить обновление привязки данных когда пользователь редактирует содержимое элемента input.

    selectedProduct: string | undefined = "";

    isProductEqualSelected(product: Product): boolean {
        return (product?.name == this.selectedProduct);
    }

    setSelectedProduct(eventTarget: EventTarget | null) {
        // EventTarget <- Node <- Element <- HTMLElement <- HTMLInputElement
        let inputElement = (eventTarget as HTMLInputElement);
        if (inputElement) {
            this.selectedProduct = inputElement.value;
        }
    }

    // следующие варианты не работают:
    //      <input class="form-control" (input)="eventTargetValue=$event.target.value" />
    //          - $event.target.value - event.target это HTMLElement, который не гарантируется наличие свойства value
    //          - (event.target as HTMLInputElement).value - значение value может быть: string | null
    // 
    //      https://stackoverflow.com/questions/44321326/property-value-does-not-exist-on-type-eventtarget-in-typescript
    //      https://angular.io/guide/user-input#!#type-the--*event*
    consoleEventTarget(event: any) {
        console.log(event);
    }

    // --------------- двустороняя привязка

    // двустороняя привязка: 
    // - управляющий элемент
    // - комбинация из квадратных и круглых скобок (разработчики Angular называют это 'бананом в коробке',
    //      так как синтаксис '[()]' похож на бана в коробке)
    // - директива ngModel
    // - выражение

    // две односторонние привязки:
    //      <input (input)="setSelectedProduct($event.target)" [value]="selectedProduct"/>
    // эквивалентная двустороняя привязка:
    //      <input [(ngModel)]="selectedProduct" />

    // --------------- формы

    currentProduct: Product = new Product();

    // get-метод возвращает свойство currentProduct в формате JSON
    get jsonProduct() {
        return JSON.stringify(this.currentProduct);
    }

    addProduct(product: Product) {
        console.log("Новый продукт: " + this.jsonProduct);
        this.productRepository.addProduct(product);
    }

    consoleErrors(errors: any) {
        for (const key in errors) {
            if (Object.prototype.hasOwnProperty.call(errors, key)) {
                console.log(key + " = " + errors[key]);
            }
        }
        console.log(errors);
    }

    // --------------- валидация

    // - элементы формы должны содержать атрибут name, который используется для идентификации 
    //      элемента в системе проверки

    // - атрибуты проверки (required, minlength, maxlength, pattern) совпадают с атрибутами из 
    //      спецификации HTML5, поэтому следует использовать атрибут novalidate в элемент form, 
    //      чтобы отключить встроенные средства проверки данных

    // - средства проверки данных Angular работают только при наличии элемента form, все элементы 
    //      ввода должны находится внутри form, иначе директива ngControl вызовет ошибку

    // - привязка события ngSubmit используется для обработки результатов ввода в форму

    // метод генерирует сообщения об ошибках валидации
    getValidationMessages(state: any, thingName?: string) {
        // в state передается 
        // thingName это дефолтное имя так как не все элементы имеют свойтсво path
        let thing: string = state.path || thingName;
        let messages: string[] = [];
        if (state.errors) {
            for (const errorName in state.errors) {
                switch (errorName) {
                    case "required":
                        messages.push(`2.1 - Введите: ${thing}`);
                        break;
                    case "pattern":
                        messages.push(`2.2 - поле ${thing} содержит не допустимые символы`);
                        break;
                    case "minlength":
                        messages.push(`2.3 -  минимальная длина поля ${thing}: ${state.errors['minlength'].requiredLength}`);
                        break;
                }
            }
        }
        return messages;
    }

    isFormSubmit: boolean = false;

    // NgForm яыляется объектом формы и содержит свойства проверки данных
    submitForm(form: NgForm) {
        console.log('--- submitForm --- form: NgForm = ');
        console.log(form);

        // refactoring - дублирование кода из за не совместимости ProductFormGroup и NgForm
        this.isFormSubmit = true;
        if (form.valid) {
            this.addProduct(this.currentProduct);
            this.currentProduct = new Product();
            // метод reset сбрасывает состояние проверки и возвращает форму к исходному состоянию
            form.reset();
            this.isFormSubmit = false;
        }
    }

    getFormValidationMessages(form: NgForm): string[] {
        let messages: string[] = [];
        // Object.keys создает массив свойств из объекта form.controls, который содержит элементы формы
        Object.keys(form.controls).forEach(k => {
            // объекты элементов в form.controls не содержат свойство path, поэтому вторым аргументом 
            //      передается имя свойства, которое соответствует элементу формы
            let validMesseges: string[] = this.getValidationMessages(form.controls[k], k);
            validMesseges.forEach(m => messages.push(m));
        });
        return messages;
    }

    // --------------- Форма на базе модели

    productForm: ProductFormGroup = new ProductFormGroup();

    test1(arr: any): string {
        console.log(arr);
        return "";
    }

    stringifyControl(control: ProductFormControl): string {
        return JSON.stringify(control);
    }

    getProductProperty(product: Product, control: ProductFormControl): string | number | undefined {
        //const getKeyValue = <U extends keyof T, T extends object>(key: U) => (obj: T) => obj[key];
        //const getUserName = getKeyValue<keyof Product, Product>("name")(product);
        //return getUserName;
        return product.name;
    }

    submitProductForm(form: ProductFormGroup): void {

        // инспектировать экземпляр FormGroup
        console.log('--- submitForm --- form: ProductFormGroup = ');
        console.log(form);

        // ошибка конвертирования ProductFormGroup в NgForm:
        //      Conversion of type 'ProductFormGroup' to type 'NgForm' may be a mistake because neither
        //      type sufficiently overlaps with the other. If this was intentional, convert the expression
        //      to 'unknown' first.
        //      Type 'ProductFormGroup' is missing the following properties from type 'NgForm': submitted, 
        //      _directives, form, ngSubmit, and 18 more.

        // NgForm является директивой, тогда как FormGroup просто класс
        //      https://angular.io/api/forms/FormGroup
        //      https://angular.io/api/forms/NgForm

        // инспектировать ProductFormGroup как экземпляр NgForm
        console.log('--- submitForm --- form: ProductFormGroup as NgForm = ');
        let ngForm: NgForm = (form as unknown) as NgForm;
        console.log(ngForm);

        // refactoring - дублирование кода из за не совместимости ProductFormGroup и NgForm
        this.isFormSubmit = true;
        if (form.valid) {
            this.addProduct(this.currentProduct);
            this.currentProduct = new Product();
            form.reset();
            this.isFormSubmit = false;
        }
    }

    getControlValidationMessages(formGroup: FormGroup, controlName: string): string[] {
        let messages: string[] = [];
        let productFormGroup: ProductFormGroup = formGroup as ProductFormGroup;
        let control: ProductFormControl = productFormGroup.controls[controlName] as ProductFormControl;
        if (control !== undefined) {
            return control.getValidationMessages();
        }
        return messages;
    }
}