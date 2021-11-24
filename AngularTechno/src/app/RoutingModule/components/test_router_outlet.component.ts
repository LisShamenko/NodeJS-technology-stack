import { Component, Inject, Input } from "@angular/core";
import { Router } from "@angular/router";
import { Message } from "src/app/ReactiveExtensionsModule/models/message.model";
import { MessageService } from "src/app/ReactiveExtensionsModule/services/message.service";
import { ROUTING_MESSAGE_SERVICE } from "../tokens/routing.tokens";

@Component({
    selector: "test-router-outlet",
    templateUrl: "./test_router_outlet.component.html",
})
export class TestRouterOutletComponent {

    constructor(
        private router: Router,
        @Inject(ROUTING_MESSAGE_SERVICE) private messageService: MessageService) { }

    sendMessage() {
        console.log(`--- --- --- send message --- router.url = ${this.router.url}`);
        let responses: [string, (arg: string) => void][] = [
            [
                "./form/create",
                (arg: string) => {
                    console.log(`--- --- --- send message --- Перейти: ${this.router.url + "form/create"}`);
                    this.router.navigateByUrl(this.router.url + "form/create");
                }
            ],
            [
                "./table",
                (arg: string) => {
                    console.log(`--- --- --- send message --- Перейти: ${this.router.url + "table"}`);
                    this.router.navigateByUrl(this.router.url + "table");
                }
            ]
        ];
        this.messageService.sendMessage(new Message("test", responses));
    }
}