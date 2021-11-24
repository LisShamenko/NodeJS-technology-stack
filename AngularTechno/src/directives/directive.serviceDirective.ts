
import { Directive, Input, SimpleChange, KeyValueDiffer, KeyValueDiffers } from "@angular/core";
import { SecondService } from "./../services/second.service";

// - привязка к свойству textContent для задания контента управляющего элемента
//      не позволила бы использовать канал currency

// объявление зависимостей в директивах
@Directive({
    selector: "td[service-directive]",
    exportAs: "serviceDirective"
})
export class ServiceDirective {

    private differ: KeyValueDiffer<string, any> | null;

    @Input("service-directive")
    oldValue: number | undefined;

    newValue: number;

    // у директив нет механизмов для автоматической реакции на изменения происходящих в службах,
    //      поэтому вся отвественность лежит на директиве
    constructor(
        private keyValueDiffers: KeyValueDiffers,
        private secondService: SecondService) {

        this.differ = null;
        this.oldValue = 0;
        this.newValue = 0;
    }

    ngOnInit() {
        // KeyValueDiffers работает с Map и обычными объектами
        this.differ = this.keyValueDiffers.find(this.secondService).create();
    }

    // реакция на изменения в значении входного свойства
    ngOnChanges(changes: { [property: string]: SimpleChange }) {
        if (changes["originalPrice"] != null) {
            this.updateValue();
        }
    }

    ngDoCheck() {
        // проверить изменения и инициировать обновления
        if (this.differ && this.differ.diff(this.secondService) != null) {
            this.updateValue();
        }
    }

    private updateValue() {
        if (this.oldValue) {
            this.newValue = this.secondService.applyProperty(this.oldValue);
        }
    }
}
