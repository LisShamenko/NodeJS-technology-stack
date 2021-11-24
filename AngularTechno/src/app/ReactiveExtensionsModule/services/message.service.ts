import { Inject, Injectable } from "@angular/core";
import { Observable, Observer, Subject } from "rxjs";
import { Message } from "../models/message.model";
import { SUBJECT_INSTANCE } from "../tokens/re.tokens";

@Injectable()
export class MessageService {

    constructor(@Inject(SUBJECT_INSTANCE) private subject: Subject<Message>) { }

    getObservable(): Observable<Message> {
        return this.subject;
    }

    getObserver(): Observer<Message> {
        return this.subject;
    }

    sendMessage(message: Message) {
        this.subject.next(message);
    }
}