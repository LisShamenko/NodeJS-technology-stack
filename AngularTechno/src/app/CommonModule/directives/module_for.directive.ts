import { Directive, ViewContainerRef, TemplateRef, Input, ViewRef, Inject } from "@angular/core";
import { ModuleLoggingService } from "../services/module_logging.service";
import { MODULE_LOGGING } from "../tokens/module_tokens";
import { ModuleIteratorContext } from "./module_iterator.context";

@Directive({
    selector: "[moduleForDirectiveOf]"
})
export class ModelForDirective {

    @Input("moduleForDirectiveOf")
    dataSource: any;

    constructor(
        @Inject(MODULE_LOGGING) moduleLogging: ModuleLoggingService,
        private container: ViewContainerRef,
        private template: TemplateRef<any>) {

        moduleLogging.debug('--- model-for --- debug message');
        moduleLogging.error('--- model-for --- error message');
        moduleLogging.info('--- model-for --- info message');
        moduleLogging.warn('--- model-for --- warn message');
    }

    ngOnInit() {
        this.updateContent();
    }

    ngDoCheck() {
        this.updateContent();
    }

    private updateContent() {
        this.container.clear();
        for (let i = 0; i < this.dataSource.length; i++) {
            this.container.createEmbeddedView(this.template,
                new ModuleIteratorContext(this.dataSource[i], i, this.dataSource.length)
            );
        }
    }
}