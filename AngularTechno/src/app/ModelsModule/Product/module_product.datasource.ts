import { ModuleProduct } from "./module_product.model";
import { Injectable } from "@angular/core";

@Injectable()
export class ModuleProductsSource {

    private _data: ModuleProduct[] = new Array<ModuleProduct>();

    constructor() {
        this.addProduct(new ModuleProduct(1, "product 1", "category 1", 1));
        this.addProduct(new ModuleProduct(1, "product 2", "category 2", 2));
        this.addProduct(new ModuleProduct(1, "product 3", "category 3", 3));
    }

    getData(): ModuleProduct[] {
        return this._data;
    }

    addProduct(product: ModuleProduct): ModuleProduct {
        product.id = this._data.length;
        this._data.push(product);
        return product;
    }
}