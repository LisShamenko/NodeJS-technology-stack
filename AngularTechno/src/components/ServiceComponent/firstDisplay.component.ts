import { Component, Input } from "@angular/core";
import { FirstService } from "./../../services/first.service";

// компонент отображает свойство экземпляра сервиса:
@Component({
    selector: "first-display-component",
    template: `<div>Свойство экземпляра сервиса: {{ firstService.variableProperty }}</div>`
})
export class FirstDisplayComponent {
    @Input("first-service")
    firstService!: FirstService;
}