import { Component, Input } from "@angular/core";
import { FirstService } from "./../../services/first.service";

// компонент через двойную привязку редактирует свойство экземпляра сервиса:
@Component({
    selector: "first-edit-component",
    template: `
        <div>
            <label>Свойство экземпляра сервиса: </label>
            <input [(ngModel)]="firstService.variableProperty" type="number" />
        </div>`
})
export class FirstEditComponent {
    @Input("first-service")
    firstService!: FirstService;
}