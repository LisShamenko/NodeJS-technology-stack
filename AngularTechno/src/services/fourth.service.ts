import { Inject, Injectable } from "@angular/core";

@Injectable()
export class FourthService {

    constructor(@Inject('fourth-default-message') public message: string) {
        console.log(`fourth service constructor - ${message}`);
    }

    sendMessage(message?: string) {
        console.log(`fourth service - ${this.message} - ${message}`);
    }
}