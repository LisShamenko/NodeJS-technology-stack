import { Directive, Inject, HostBinding, Host, Optional } from "@angular/core";
import { PROVIDER_VALUE } from "src/Tokens/provider_tokens";

@Directive({
    selector: "[local-provider-value]"
})
export class ProviderValueDirective {

    @HostBinding("textContent")
    textContent: string;

    constructor(@Inject(PROVIDER_VALUE) @Host() @Optional() providerValue: string) {
        this.textContent = providerValue;
    }
}