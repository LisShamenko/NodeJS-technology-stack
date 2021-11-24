import { ModuleProduct } from "./module_product.model";
import { ModuleProductsSource } from "./module_product.datasource";
import { Injectable } from "@angular/core";

@Injectable()
export class ModuleProductRepository {

    private _dataSource: ModuleProductsSource;
    private _products: ModuleProduct[];

    constructor() {
        this._dataSource = new ModuleProductsSource();
        let products = this._dataSource.getData();
        this._products = [];
        products.forEach(element => this._products.push(element));
    }

    getModuleProducts(): ModuleProduct[] {
        return this._products;
    }

    getModuleProduct(id: number): ModuleProduct | undefined {
        return this._products.find(p => p.id === id);
    }

    addModuleProduct(product: ModuleProduct): void {
        let newProduct = this._dataSource.addProduct(product);
        this._products.push(newProduct);
    }

    deleteModuleProduct(id: number) {
        let index = this._products.findIndex(p => p.id === id);
        if (index > -1) {
            this._products.splice(index, 1);
        }
    }
}