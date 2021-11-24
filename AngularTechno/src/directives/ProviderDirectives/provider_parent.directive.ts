import { Directive } from "@angular/core";
import { FourthService } from "src/services/fourth.service";

@Directive({
    selector: "table[local-provider-parent]",
    // директива содержит провайдер, который используется для создания еще одного экземпляра FourthService
    providers: [
        {
            provide: "fourth-value",
            useValue: 'еще один экземпляр в директиве'
        },
        {
            provide: FourthService,
            deps: ["fourth-value"],
            useFactory: (message: string) => {
                return new FourthService(message);
            }
        }
    ]
})
export class ProviderParentDirective {
    constructor() { }
}