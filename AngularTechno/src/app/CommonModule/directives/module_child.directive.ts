import { Directive, ElementRef, HostBinding, Inject } from "@angular/core";
import { ModuleLoggingService } from "../services/module_logging.service";
import { MODULE_LOGGING } from "../tokens/module_tokens";

@Directive({
    selector: "td[module_child]"
})
export class ModuleChildDirective {

    @HostBinding("class")
    classProperty: string = "";

    constructor(
        @Inject(MODULE_LOGGING) moduleLogging: ModuleLoggingService,
        private element: ElementRef) {

        //moduleLogging.debug('--- model-child --- debug message');
        //moduleLogging.error('--- model-child --- error message');
        //moduleLogging.info('--- model-child --- info message');
        //moduleLogging.warn('--- model-child --- warn message');
    }

    setModuleChildClass(isSet: Boolean, firstColor: string, secondColor: string) {
        this.classProperty = isSet ? firstColor : secondColor;
        let classList = this.element.nativeElement.classList;
        if (isSet) {
            classList.remove(secondColor);
            classList.add(firstColor);
        }
        else {
            classList.remove(firstColor);
            classList.add(secondColor);
        }
    }
}