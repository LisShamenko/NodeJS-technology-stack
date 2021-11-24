import { Injectable } from "@angular/core";
import { ProviderBaseService } from "./provider_base.service";

@Injectable()
export class ProviderSubclassService extends ProviderBaseService {

    constructor() {
        super();
    }

    sendMessage(message: string) {
        console.log(`subclass --- ${this.name} --- ${message}`);
    }

    getMessage(): string {
        return 'subclass';
    }
}