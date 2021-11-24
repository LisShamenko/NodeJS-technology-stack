import { Directive, ViewContainerRef, TemplateRef, Input, IterableDiffer, IterableDiffers, Inject } from "@angular/core";
import { IterableChanges, IterableChangeRecord, IterableDifferFactory, EmbeddedViewRef } from "@angular/core";
import { ModuleProduct } from "src/app/ModelsModule/Product/module_product.model";
import { ModuleLoggingService } from "../services/module_logging.service";
import { MODULE_LOGGING } from "../tokens/module_tokens";
import { ModuleIteratorContext } from "./module_iterator.context";

@Directive({
    selector: "[moduleDifferForOf]"
})
export class ModuleDifferDirective {

    private differ: IterableDiffer<ModuleProduct> | null = null;

    private views: Map<any, ModuleIteratorContext> = new Map<any, ModuleIteratorContext>();

    @Input("moduleDifferForOf")
    dataSource: ModuleProduct[] = [];

    constructor(
        @Inject(MODULE_LOGGING) moduleLogging: ModuleLoggingService,
        private container: ViewContainerRef,
        private template: TemplateRef<any>,
        private differs: IterableDiffers) {

        moduleLogging.debug('--- model-differ-for --- debug message');
        moduleLogging.error('--- model-differ-for --- error message');
        moduleLogging.info('--- model-differ-for --- info message');
        moduleLogging.warn('--- model-differ-for --- warn message');
    }

    ngOnInit() {

        let differFactory: IterableDifferFactory = this.differs.find(this.dataSource);
        this.differ = differFactory.create((index: number, item: ModuleProduct) => {
            return item.getModuleString();
        });
    }

    ngDoCheck() {

        if (this.differ != null) {

            let changes: IterableChanges<ModuleProduct> | null = this.differ.diff(this.dataSource);
            if (changes != null) {

                // 
                changes.forEachAddedItem((addition: IterableChangeRecord<ModuleProduct>) => {

                    let index = (addition.currentIndex) ? addition.currentIndex : -1;
                    let newIteratorContext = new ModuleIteratorContext(
                        addition.item, index, this.dataSource.length);

                    let view: EmbeddedViewRef<Object> = this.container.createEmbeddedView(
                        this.template, newIteratorContext);

                    newIteratorContext.view = view;
                    this.views.set(addition.trackById, newIteratorContext);
                });

                // 
                let removals = false;
                changes.forEachRemovedItem(removedItem => {
                    removals = true;

                    let iteratorContext: ModuleIteratorContext | undefined = this.views.get(removedItem.trackById);
                    if (iteratorContext != null && iteratorContext.view != null) {
                        this.container.remove(this.container.indexOf(iteratorContext.view));
                        this.views.delete(removedItem.trackById);
                    }
                });
                if (removals) {
                    let index = 0;
                    this.views.forEach(iteratorContext => iteratorContext.setData(index++, this.views.size));
                }
            }
        }
    }
}