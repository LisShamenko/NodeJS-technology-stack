import { Pipe } from "@angular/core";
import { ModuleProduct } from "src/app/ModelsModule/Product/module_product.model";

@Pipe({
    name: "moduleFilterPipe",
    pure: false
})
export class ModuleFilterPipe {
    transform(products: ModuleProduct[], category: string): ModuleProduct[] {
        if (category == undefined) {
            return products;
        }
        return products.filter(p => p.category == category);
    }
}