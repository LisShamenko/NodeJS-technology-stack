import { Inject, Injectable } from "@angular/core";
import { ActivatedRouteSnapshot, Router, RouterStateSnapshot } from "@angular/router";
import { Observable, Subject } from "rxjs";
import { Message } from "src/app/ReactiveExtensionsModule/models/message.model";
import { MessageService } from "src/app/ReactiveExtensionsModule/services/message.service";
import { RoutingFormComponent } from "../components/routing_form.component";
import { ROUTING_MESSAGE_SERVICE } from "../tokens/routing.tokens";

// --------------- защитник деактивизации маршрутов

// - деактивизация маршрута происходит при уходе пользователя с маршрута, защитник
//      деактивации это класс с методом canDeactivate, одно из применений это 
//      предотвращение выхода из компонента формы при наличии не сохраненных изменений

@Injectable()
export class DeactivateGuard {

    constructor(
        @Inject(ROUTING_MESSAGE_SERVICE) private messageService: MessageService,
        private router: Router) { }



    canDeactivate(
        component: RoutingFormComponent,
        route: ActivatedRouteSnapshot,
        state: RouterStateSnapshot): Observable<boolean> | boolean {

        // если в компоненте есть изменения, то выдать сообщение
        if (component.isEditing && component.isChangesExist()) {

            // 
            let subject = new Subject<boolean>();
            let responses: [string, (arg: string) => void][] = [
                [
                    "Перейти",
                    (arg: string) => {
                        console.log(`--- защитник деактивизации маршрута --- перейти`);
                        // complete вызывается после next, иначе Angular будет бесконечно 
                        //      ожидать вызова complete, что приведет к зависанию
                        subject.next(true);
                        subject.complete();
                    }
                ],
                [
                    "Отменить",
                    (arg: string) => {
                        console.log(`--- защитник деактивизации маршрута --- отменить`);
                        this.router.navigateByUrl(this.router.url);
                        subject.next(false);
                        subject.complete();
                    }
                ]
            ];
            let message = new Message("защитник деактивизации маршрута", responses);
            this.messageService.sendMessage(message);
            return subject;

        }
        else {
            return true;
        }
    }
}