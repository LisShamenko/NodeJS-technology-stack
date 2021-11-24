import { Injectable } from "@angular/core";

@Injectable()
export class ProviderBaseService {

    name: string = '';

    sendMessage(message: string) {
        console.log(`base --- ${this.name} --- ${message}`);
    }

    getMessage(): string {
        return 'base';
    }
}