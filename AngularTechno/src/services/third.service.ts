import { Inject, Injectable } from "@angular/core";
import { PROVIDER_BASE_SERVICE, PROVIDER_BOTH_SERVICES, PROVIDER_SUB_SERVICE } from "src/Tokens/provider_tokens";
import { ProviderBaseService } from "./provider_base.service";
import { ProviderSubclassService } from "./provider_subclass.service";

@Injectable()
export class ThirdService {

    constructor(
        @Inject(PROVIDER_SUB_SERVICE) public subclassService: ProviderSubclassService,
        @Inject(PROVIDER_BASE_SERVICE) public baseService: ProviderBaseService,
        @Inject(PROVIDER_BOTH_SERVICES) public providerServices: ProviderBaseService[]) {

        providerServices.forEach(element => {
            element.sendMessage(`6. конструктор - разрешение 'multi: true'`)
        });
    }
}