import { Inject, Injectable } from "@angular/core";
import { ActivatedRouteSnapshot, RouterStateSnapshot, Router, CanActivate, CanActivateChild } from "@angular/router";
import { Observable, Subject } from "rxjs";
import { Message } from "src/app/ReactiveExtensionsModule/models/message.model";
import { MessageService } from "src/app/ReactiveExtensionsModule/services/message.service";
import { ROUTING_MESSAGE_SERVICE } from "../tokens/routing.tokens";

// --------------- защитник активации маршрута

// - защитник используется для блокировки маршрута и оповещения пользователя

// - защитник активации маршрута это класс с методом canActivate аналогичный методу 
//      resolve класса резолвера, canActivate может возвращать следующие типы:
// 
//      - boolean               синхронная проверка возможности активации маршрута
//                              true маршрут активируется, 
//                              false игнорирует навигационный запрос
//      - Observable<boolean>   асинхронная проверка возможности активации маршрута
//                              ожидает значения для выполнения проверки, следует 
//                              вызвать метод complete для завершения ожидания
//      - Promise<boolean>      асинхронная проверка возможности активации маршрута
//                              ожидает обработки объекта Promise

@Injectable()
export class ActivateGuard implements CanActivate, CanActivateChild {

    constructor(
        @Inject(ROUTING_MESSAGE_SERVICE) private messageService: MessageService,
        private router: Router) { }



    // 
    canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Promise<boolean> | boolean {

        // будут обрабатываться маршруты с параметром mode равным create
        if (route.params["mode"] == "edit") {

            // Promise ожидает ответа от пользователя, чтобы определить активировать
            //      маршрут или нет
            return new Promise<boolean>((resolve, reject) => {
                let responses: [string, (arg: string) => void][] = [
                    [
                        "Перейти",
                        (arg) => {
                            resolve(true);
                        }
                    ],
                    [
                        "Отменить",
                        (arg) => {
                            // - при отмене активации маршрута повторно активизировать маршрут 
                            //      не получится, обойти проблему можно перейдя на тот же самый 
                            //      URL-адрес
                            this.router.navigateByUrl(this.router.url);
                            resolve(false);
                        }
                    ]
                ];
                let message = new Message("защитник активации маршрута", responses)
                this.messageService.sendMessage(message);
            });

        }
        else {
            // немедленно реагировать на маршруты, которые не нужно защищать, 
            //      true активирует маршрут
            return true;
        }
    }

    // --------------- защитник дочерних маршрутов

    // - для защиты дочерних маршрутов следует использовать метод canActivateChild, 
    //      который вызывается, когда активируется дочерний маршрут

    // - защитники применяются только при изменении активного маршрута

    canActivateChild(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean> | boolean {

        if (route.url.length > 0) {
            console.log(`--- --- --- защитник активации дочернего маршрута --- ${route.url[route.url.length - 1].path == "categories"}`);

            // 
            let subject = new Subject<boolean>();
            let responses: [string, (arg: string) => void][] = [
                [
                    "Перейти",
                    (arg: string) => {
                        console.log(`--- --- --- защитник активации дочернего маршрута --- 4`);
                        subject.next(true);
                        subject.complete();
                    }
                ],
                [
                    "Отменить",
                    (arg: string) => {
                        console.log(`--- --- --- защитник активации дочернего маршрута --- 5 --- this.router.url = ${this.router.url}`);

                        // - стандартная схема аутентификации: пользователь перенаправляется 
                        //      на компонент выполнения аутентификации при попытке доступа к 
                        //      защищенному ресурсу

                        // переход на другой адрес
                        //      let url = state.url.replace("categories", "products");
                        //      this.router.navigateByUrl(url);

                        this.router.navigateByUrl(this.router.url);
                        subject.next(false);
                        subject.complete();
                    }
                ]
            ];
            let message = new Message("защитник активации дочернего маршрута", responses);
            this.messageService.sendMessage(message);
            return subject;

        } else {
            return true;
        }
    }
}