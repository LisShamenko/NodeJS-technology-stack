import { Directive, SimpleChange, ViewContainerRef, TemplateRef, Input, Inject } from "@angular/core";
import { ModuleLoggingService } from "../services/module_logging.service";
import { MODULE_LOGGING } from "../tokens/module_tokens";

@Directive({
    selector: "[moduleIfDirective]"
})
export class ModuleIfDirective {

    @Input("moduleIfDirective")
    expressionResult: boolean = false;

    constructor(
        @Inject(MODULE_LOGGING) moduleLogging: ModuleLoggingService,
        private container: ViewContainerRef,
        private template: TemplateRef<any>) {

        moduleLogging.debug('--- model-if --- debug message');
        moduleLogging.error('--- model-if --- error message');
        moduleLogging.info('--- model-if --- info message');
        moduleLogging.warn('--- model-if --- warn message');
    }

    ngOnChanges(changes: { [property: string]: SimpleChange }) {
        let change = changes["expressionResult"];
        if (change) {
            if (!change.isFirstChange() && !change.currentValue) {
                this.container.clear();
            } else if (change.currentValue) {
                this.container.createEmbeddedView(this.template);
            }
        }
    }
}