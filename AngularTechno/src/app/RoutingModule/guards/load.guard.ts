import { Inject, Injectable } from "@angular/core";
import { Route, Router } from "@angular/router";
import { Message } from "src/app/ReactiveExtensionsModule/models/message.model";
import { MessageService } from "src/app/ReactiveExtensionsModule/services/message.service";
import { ROUTING_MESSAGE_SERVICE } from "../tokens/routing.tokens";

// --------------- защитник динамической загрузки 

// - защитники динамической загрузки позволяют загружать модули только если выполняются 
//      некоторые условия, класс защитника должен содержать метод canLoad, этот метод
//      вызывается если Angular требуется активировать маршрут, методу передается
//      описание маршрута Route, защитник срабатывает при первой активации маршрута, 
//      который загружает модуль

@Injectable()
export class LoadGuard {

    // true - если модуль был загружен
    private isLoaded: boolean = false;

    constructor(
        @Inject(ROUTING_MESSAGE_SERVICE) private messageService: MessageService,
        private router: Router) { }



    canLoad(route: Route): Promise<boolean> | boolean {

        console.log(`--- защитник динамической загрузки`);

        // вернуть true если модуль был загружен
        if (!this.isLoaded) {

            // 
            return new Promise<boolean>((resolve, reject) => {
                let responses: [string, (arg: string) => void][] = [
                    [
                        "Перейти",
                        (arg: string) => {
                            this.isLoaded = true;
                            resolve(true);
                        }
                    ],
                    [
                        "Отменить",
                        (arg: string) => {
                            this.router.navigateByUrl(this.router.url);
                            resolve(false);
                        }
                    ]
                ];
                let message = new Message("защитник динамической загрузки", responses);
                this.messageService.sendMessage(message);
            });

        }
        else {
            return true;
        }
    }
}