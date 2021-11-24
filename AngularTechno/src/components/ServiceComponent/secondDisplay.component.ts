import { Component, Input } from "@angular/core";
import { SecondService } from "./../../services/second.service";

// компонент отображает свойство экземпляра сервиса:
@Component({
    selector: "second-display-component",
    template: `<div>Свойство экземпляра сервиса: {{ variableProperty }}</div>`
})
export class SecondDisplayComponent {
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