import { Directive, HostBinding, Inject } from "@angular/core";
import { FourthService } from "src/services/fourth.service";
import { PROVIDER_VALUE } from "src/Tokens/provider_tokens";

@Directive({
    selector: "td[local-provider-child]"
})
export class ProviderChildDirective {

    @HostBinding("textContent")
    textContent: string;

    constructor(@Inject(PROVIDER_VALUE) providerValue: string, fourthService: FourthService) {
        this.textContent = providerValue;
        fourthService.sendMessage('directive child');
    }
}