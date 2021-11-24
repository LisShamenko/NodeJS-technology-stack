import { Inject, Pipe } from "@angular/core";
import { FourthService } from "src/services/fourth.service";
import { PROVIDER_INSTANCE } from "src/Tokens/provider_tokens";

@Pipe({
    name: "localProviderPipe"
})
export class ProviderPipe {

    constructor(@Inject(PROVIDER_INSTANCE) private fourthService: FourthService) { }

    transform(value: string): string {
        return `pipe --- ${value} --- ${this.fourthService.message}`;
    }
}