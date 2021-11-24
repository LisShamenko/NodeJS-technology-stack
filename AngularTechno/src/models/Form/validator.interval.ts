// --------------- кастомный класс проверки данных

import { AbstractControl, FormControl } from "@angular/forms";

export class IntervalValidator {

    // статический метод-фабрика возвращает функцию проверки
    static Interval(left: number, right: number) {
        // FormControl представляет элемент формы
        return (control: AbstractControl): { [key: string]: any } | null => {
            // свойство value это значение введенное пользователем
            let value = Number(control.value);
            if (value != NaN && (value < left || value > right)) {
                // возвращает объект с информацией об ошибке для не действительных значений
                return {
                    "limit_validator": {
                        "left": left,
                        "right": right,
                        "actualValue": value
                    }
                };
            } else {
                // возвращают null для действительных значений
                return null;
            }
        }
    }
}

// --------------- ошибка: 

// No overload matches this call.
// Overload 1 of 2, '(validators: null): null', gave the following error.
// Argument of type '((control: FormControl) => { [key: string]: any; } | null)[]' is not assignable to parameter of type 'null'.
// Overload 2 of 2, '(validators: (ValidatorFn | null | undefined)[]): ValidatorFn | null', gave the following error.
// Type '(control: FormControl) => { [key: string]: any; } | null' is not assignable to type 'ValidatorFn'.
// Types of parameters 'control' and 'control' are incompatible.
// Type 'AbstractControl' is missing the following properties from type 'FormControl': registerOnChange, registerOnDisabledChange, _applyFormStatets(2769)

// --------------- решение:

// ошибка была в объявлении функции, не правильный вариант:
//      (control: FormControl): { [key: string]: any } | null
// FormControl следует исправить на AbstractControl, правильный вариант:
//      (control: FormControl): { [key: string]: any } | null

// --------------- описание функции Validators.compose

//      static compose(validators: (ValidatorFn | null | undefined)[]): ValidatorFn | null;
// 
//      export declare interface ValidatorFn {
//          (control: AbstractControl): ValidationErrors | null;
//      }
// 
//      export declare type ValidationErrors = {
//          [key: string]: any;
//      };

// --------------- валидация

//      https://angular.io/guide/form-validation

// export function forbiddenNameValidator(nameRe: RegExp): ValidatorFn {
//     return (control: AbstractControl): { [key: string]: any } | null => {
//         const forbidden = nameRe.test(control.value);
//         return forbidden ? { forbiddenName: { value: control.value } } : null;
//     };
// }