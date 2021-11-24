import { Component, Inject } from "@angular/core";
import { NavigationCancel, NavigationEnd, Router, RouterEvent, Event as BaseEvent } from "@angular/router";
import { Message } from "src/app/ReactiveExtensionsModule/models/message.model";
import { MessageService } from "src/app/ReactiveExtensionsModule/services/message.service";
import { ROUTING_MESSAGE_SERVICE } from "../tokens/routing.tokens";
import { filter, map, distinctUntilChanged, skipWhile, takeWhile } from 'rxjs/operators';

// --------------- события навигации

// события router
//      https://angular.io/guide/router-reference#router-events
//      https://angular.io/api/router/RouterEvent#description
//      https://overcoder.net/q/2828231/angular-router-events-navigationend-как-отфильтровать-только-последнее-событие
// lifecycle:
//      https://angular.io/api/router/Event

@Component({
    selector: "routing-message-panel",
    templateUrl: "./routing_message_panel.component.html",
})
export class RoutingMessagePanelComponent {

    lastMessage: string = '';

    constructor(
        @Inject(ROUTING_MESSAGE_SERVICE) messageService: MessageService,
        router: Router) {

        // 
        let observable = messageService.getObservable();
        observable.subscribe((message: Message) => {
            this.lastMessage = message.message;
        });

        // - компонент не учавствует в навигации, но обращается к классу Router, чтобы получить 
        //      последнее событие навигации

        // - Router.events возвращает объект Observable<Event>, который содержит последовательность событий 
        //      в системе маршрутизации, классы типов событий:
        //      - NavigationStart       начало процесса навигации
        //      - RoutesRecognized      момент сопоставление URL-адрес с маршрутом
        //      - NavigationEnd         успешное завершении процесса навигации
        //      - NavigationError       ошибка в процессе навигации
        //      - NavigationCancel      отмена процесса навигации

        // - базовый класс RouterEvent содержит свойства общие для всех классов типов событий:
        //      - A unique ID that the router assigns to every router navigation.
        //              число увеличивающееся при каждой навигации
        //              id: number;
        //      - The URL that is the destination for this navigation.
        //              URL-адрес
        //              url: string;

        // - классы RoutesRecognized и NavigationEnd содержат свойство urlAfterRedirects: 
        //      URL, по которому была выполнена навигация

        router.events
            .pipe(
                filter((e: BaseEvent): e is RouterEvent => {
                    return e instanceof RouterEvent;
                })
            )
            // фильтр по типу события
            .pipe(
                filter((e: RouterEvent) => {
                    return e instanceof NavigationEnd || e instanceof NavigationCancel;
                })
            )
            // очистка поля сообщения
            .subscribe((e: RouterEvent) => {
                this.lastMessage = '';
            });
    }
}