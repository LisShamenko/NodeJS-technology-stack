import { ErrorHandler, Inject, Injectable } from "@angular/core";
import { Message } from "../../ReactiveExtensionsModule/models/message.model";
import { MessageService } from "../../ReactiveExtensionsModule/services/message.service";
import { MESSAGE_SERVICE } from "../tokens";

// --------------- обработка ошибок

// два способа обработки ошибок: 
//      - обработать ошибку в методе subscribe, что позволит локализовать ошибку и дать возможность повторить операцию
//      - замена ErrorHandler обработчика ошибок по умолчанию, который выводит необработанные ошибки на консоль

@Injectable()
export class MessageErrorHandler implements ErrorHandler {

    constructor(@Inject(MESSAGE_SERVICE) private messageService: MessageService) { }

    // ErrorHandler реагирует на ошибки через метод handleError
    handleError(error: any): void {
        let message = error instanceof Error ? error.message : error.toString();
        // setTimeout гарантирует, что сообщение будет обработано (странность обработки обновлений Angular)
        setTimeout(() => this.messageService.sendMessage(new Message(message)), 0);
    }
}