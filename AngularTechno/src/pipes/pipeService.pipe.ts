import { Pipe, Injectable } from "@angular/core";
import { SecondService } from "./../services/second.service";

// объявление зависимостей в каналах
@Pipe({
    name: "pipeService",
    // канал объявлен грязным 'pure: false', чтобы канал мог обновлять данные
    //      при изменении SecondService
    pure: false
})
export class PipeService {
    constructor(private secondService: SecondService) { }
    // для совместимости с каналом currency, transform должен возвращать numder, пример:
    //      {{ item.price | pipe-service | currency:"USD":true }}
    transform(value: number | undefined): string {
        if (value) {
            return "Канал = " + this.secondService.applyProperty(value);
        }
        return "undefined - значение";
    }
}