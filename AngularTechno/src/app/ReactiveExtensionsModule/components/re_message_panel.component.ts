import { Component, Inject } from "@angular/core";
import { Message } from "../models/message.model";
import { MessageService } from "../services/message.service";
import { MESSAGE_SERVICE } from "../tokens/re.tokens";

@Component({
    selector: "re-message-panel",
    templateUrl: "./re_message_panel.component.html",
})
export class MessagePanelComponent {

    lastMessage: Message | undefined;

    constructor(@Inject(MESSAGE_SERVICE) messageService: MessageService) {
        let observable = messageService.getObservable();
        observable.subscribe((message: Message) => {
            console.log('--- RE --- subscribe --- message ---');
            this.lastMessage = message;
        });
    }
}