import { Component, Input, ViewChildren, QueryList } from "@angular/core";
import { ModuleChildDirective } from "../../../CommonModule/directives/module_child.directive";
import { ModuleProduct } from "../../../ModelsModule/Product/module_product.model";
import { ModuleProductRepository } from "../../../ModelsModule/Product/module_product.repository";

@Component({
    selector: "module-table-component",
    templateUrl: "./module_table.template.html"
})
export class ModuleTableComponent {

    isSet: boolean = false;

    @Input("f-color")
    firstColor: string = "bg-info";

    @Input("s-color")
    secondColor: string = "bg-info";

    @Input("module-product-repository")
    moduleProductRepository: ModuleProductRepository | null = null;

    @Input("is-enable-parent")
    isEnableModuleParent: boolean = false;

    getModuleProducts(): ModuleProduct[] {
        if (this.moduleProductRepository == null) {
            return [];
        }
        return this.moduleProductRepository.getModuleProducts();
    }

    deleteModuleProduct(key: number) {
        if (this.moduleProductRepository != null) {
            this.moduleProductRepository.deleteModuleProduct(key);
        }
    }

    // 
    @ViewChildren(ModuleChildDirective)
    viewChildren: QueryList<ModuleChildDirective> | null = null;

    ngAfterViewInit() {
        if (this.viewChildren != null) {
            this.viewChildren.changes.subscribe(() => {
                this.updateViewChildren();
            });
        }
        this.updateViewChildren();
    }

    private updateViewChildren() {
        setTimeout(() => {
            if (!this.isEnableModuleParent && this.viewChildren != null) {
                this.viewChildren.forEach((child, index) => {
                    child.setModuleChildClass(this.isSet, this.firstColor, this.secondColor);
                    this.isSet = !this.isSet;
                })
            }
        }, 0);
    }
}