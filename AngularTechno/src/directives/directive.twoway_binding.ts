import { Input, Output, EventEmitter, Directive, HostBinding, HostListener, SimpleChange } from "@angular/core";

@Directive({
    // директива будет применятся к элементам input с атрибутом twoway
    selector: "input[twoway]",
    // exportAs задает имя по которому можно создать ссылочную переменную на директиву, через 
    //      которую шаблон получает доступ ко всем данным и методам директивы:
    //      #twoway="DirectiveTwowayBinding"
    exportAs: "DirectiveTwowayBinding"
})
export class DirectiveTwowayBinding {

    // --------------- двусторонняя привязка

    // двусторонняя привязка директивы основана на соглашении об именовании входного и выходного свойств:
    //      входное свойство:       @Input("twoway")
    //      выходное свойство:      @Output("twowayChange")
    //      <input class="bg-primary" [(twoway)]="currentProduct.name" />

    // привязка '[twoway]' обновляется при изменении свойства name и передает данные из кода в директиву
    // нестандартное событие '(twowayChange)' срабатывает при изменении input и передает данные из директивы в код
    //      <input [twoway]="currentProduct.name" (twowayChange)="currentProduct.name=$event" />

    @Input("twoway")
    propertyName: string | undefined = undefined;

    @HostBinding("value")
    propertyValue: string = "";

    direction: string = "None";

    ngOnChanges(changes: { [property: string]: SimpleChange }) {
        let change = changes["propertyName"];
        if (change.currentValue != this.propertyValue) {
            this.propertyValue = change.currentValue;
            this.direction = "изменения идут от currentProduct в input";
        }
        // refactoring - ошибка:
        //      ERROR Error: NG0100: ExpessionChangedAfterItHasBeenCheckedError: 
        //      Expression has changed after it was checked. Previous value: 'None'. 
        //      Current value: 'изменения идут от currentProduct в input'.. 
        //      Find more at https://angular.io/errors/NG0100
    }

    // выходное свойство, которое передает новое значение в выражение: currentProduct.name=$event
    @Output("twowayChange")
    update = new EventEmitter<string>();

    // декоратор @HostListener принимает два аргумента: имя события и массив передаваемых аргументов
    //      аргумент newValue принимает значение свойства Event.target.value
    @HostListener("input", ["$event.target.value"])
    updateValue(newValue: string) {
        this.propertyValue = newValue;
        this.update.emit(newValue);
        this.direction = "изменения идут от input в currentProduct";
    }
}
