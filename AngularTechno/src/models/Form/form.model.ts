import { FormControl, FormGroup, Validators } from "@angular/forms";
import { IntervalValidator } from "./validator.interval";

// Класс FormControl представляет элемент формы (элемент input)
// Класс FormGroup используется для управления элементами формы и их содержимым

// --------------- свойства объекта Validator

// - объект Validator содержит свойства для всех встроенных проверок данных

// Validators.required      соответствует required      проверяет, что пользователь ввел обязательное значение
// Validators.minLength     соответствует minlength     проверяет на минимальное количество символов
// Validators.maxLength     соответствует maxlength     проверяет на максимальное количество символов
// Validators.pattern       соответствует pattern       проверяет на совпадение регулярному выражению

// --------------- FormControl

// Класс ProductFormControl расширяет класс FormControl, FormControl - это класс элемента формы
export class ProductFormControl extends FormControl {

    // элемент label связанный с элементом input
    label: string;
    // имя продукта
    modelProperty: string;

    constructor(label: string, property: string, value: any, validator: any) {
        super(value, validator);
        this.label = label;
        this.modelProperty = property;
    }

    // сообщения об ошибках были перенесены из компонента
    getValidationMessages() {
        let messages: string[] = [];
        if (this.errors) {
            for (let errorName in this.errors) {
                switch (errorName) {
                    case "required":
                        messages.push(`Введите поле: ${this.label}`);
                        break;
                    case "minlength":
                        messages.push(`Длина поля ${this.label} должно быть меньше ${this.errors['minlength'].requiredLength} characters`);
                        break;
                    case "maxlength":
                        messages.push(`Длина поля ${this.label} должно быть больше ${this.errors['maxlength'].requiredLength} characters`);
                        break;
                    case "pattern":
                        messages.push(`Поле ${this.label} не соответствует шаблону`);
                        break;
                    case "limit_validator":
                        let str = `[${this.errors['limit_validator'].left}, ${this.errors['limit_validator'].right}]`;
                        messages.push(`Кастомный валидатор: поле ${this.label} должно быть в интервале ${str}`);
                        break;
                }
            }
        }
        return messages;
    }
}

// --------------- FormGroup

// Класс ProductControlGroup расширяет FormGroup, добавляет массив объектов ProductFormControl
export class ProductFormGroup extends FormGroup {

    constructor() {
        // Конструктор класса FormGroup получает объект, свойства которого соответствуют именам элементов input
        //      в форме, для каждого элемента создается ProductFormControl, который содержит необходимые 
        //      проверки данных
        super({
            name: new ProductFormControl(
                "Name",
                "name",         // formControlName
                "",
                Validators.required),

            category: new ProductFormControl(
                "Category",
                "category",     // formControlName
                "",
                // объекты Validators могут объединяться методом Validators.compose 
                //      для выполнения нескольких проверок с одним элементом
                Validators.compose(
                    [
                        Validators.required,
                        Validators.pattern("^[a-z]+$"),
                        Validators.minLength(5),
                        Validators.maxLength(10)
                    ])),

            price: new ProductFormControl(
                "Price",
                "price",        // formControlName
                "",
                Validators.compose([
                    Validators.required,
                    IntervalValidator.Interval(100, 1000),
                    Validators.pattern("^[0-9\.]+$")
                ]))
        });
    }

    get productControls(): ProductFormControl[] {
        let controlProps = Object.keys(this.controls);
        return controlProps.map(prop => this.controls[prop] as ProductFormControl);
    }

    getFormValidationMessages(): string[] {

        // получить массив ProductFormControl из this.controls
        let controlProps = Object.keys(this.controls);
        let letProductControls: ProductFormControl[] = controlProps.map(
            prop => this.controls[prop] as ProductFormControl
        );

        // записать все сообщения об ошибках в один массив
        let messages: string[] = [];
        letProductControls.forEach(control => {
            let validationMessages = control.getValidationMessages();
            validationMessages.forEach(message => messages.push(message))
        });
        return messages;
    }
}