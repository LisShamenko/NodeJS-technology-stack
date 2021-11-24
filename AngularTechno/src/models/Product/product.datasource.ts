import { Product } from "./product.model";
import { Injectable } from "@angular/core";
import { Observable } from "rxjs";

// класс источника данных предоставляет данные приложению
@Injectable()
export class ProductsSource {

    private _data: Product[];

    constructor() {
        this._data = new Array<Product>(
            new Product(1, "тестовый_продукт", "category_1", 135),
            new Product(2, "switch_продукт", "category_1", 45.20),
            new Product(3, "продукт 3", "category_2", 15.50),
            new Product(4, "продукт 4", "category_2", 120.99),
            new Product(5, "продукт 5", "category_3", 100)
        );
    }

    getData(): Product[] {
        return this._data;
    }

    getDataAsync(): Observable<Product[]> {
        return new Observable<Product[]>(obs => {
            setTimeout(() => obs.next(this._data), 1000);
        })
    }
}