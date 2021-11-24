import { Pipe } from "@angular/core";

@Pipe({

    name: "addNumberPipe"

    // --------------- свойства декоратора @Pipe

    // name     задает имя канала, которое будет использоваться в шаблоне
    // pure     true (по умолчанию) - канал повторно обрабатывается только при изменении 
    //          входных значений transform
})
export class AddNumberPipe {

    defaultNumber: number = 10;

    // --------------- transform

    // через аргумент value предоставляются данные с которыми работает канал, это обязательный 
    //      аргумент, дополнительный аргумент используется для настройки канала
    transform(value: any, addValue?: any): number {

        // типы передаваемых значений не проверяются на стадии выполнения
        let valueNumber = Number.parseFloat(value);
        if (valueNumber == NaN) {
            valueNumber = 0;
        }

        let addNumber = (addValue == undefined) ? this.defaultNumber : Number.parseInt(addValue);
        if (addNumber == NaN) {
            addNumber = this.defaultNumber;
        }

        return valueNumber + addNumber;
    }
}