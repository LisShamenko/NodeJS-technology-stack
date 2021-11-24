import { Component, Input } from "@angular/core";
import { SecondService } from "./../../services/second.service";

// компонент через двойную привязку редактирует свойство экземпляра сервиса:
@Component({
    selector: "second-edit-component",
    template: `
        <div>
            <label>Свойство экземпляра сервиса: </label>
            <input [(ngModel)]="variableProperty" type="number" />
        </div>`
})
export class SecondEditComponent {
    // внедрение зависимости от сервиса SecondService позволяет избежать применения входных свойств
    //      и использования корневого элемента
    constructor(private secondService: SecondService) { }

    get variableProperty(): number {
        return this.secondService.variableProperty;
    }
    set variableProperty(newValue: number) {
        this.secondService.variableProperty = newValue;
    }
}