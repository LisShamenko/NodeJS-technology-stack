import { Component } from "@angular/core";
import { ModuleProduct } from "../../../ModelsModule/Product/module_product.model";
import { ModuleProductRepository } from "../../../ModelsModule/Product/module_product.repository";

@Component({
    selector: "module-root-component",
    templateUrl: "./module_root.template.html",
})
export class ModuleRootComponent {

    moduleFilterCategory: string = "";
    isShowTable: boolean = true;
    moduleProductRepository: ModuleProductRepository = new ModuleProductRepository();

    getModuleProducts(): ModuleProduct[] {
        if (this.moduleProductRepository == null) {
            return [];
        }
        return this.moduleProductRepository.getModuleProducts();
    }

    addModuleProduct(product: ModuleProduct) {
        this.moduleProductRepository.addModuleProduct(product);
    }
}