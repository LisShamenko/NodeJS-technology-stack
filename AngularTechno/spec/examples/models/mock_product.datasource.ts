import { Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { Product } from "../../../src/models/Product/product.model";

@Injectable()
export class MockProductSource {
    public data = [
        new Product(1, "product 1", "category 1", 1),
        new Product(2, "product 2", "category 2", 10),
        new Product(3, "product 3", "category 2", 100),
    ];
    getData(): Observable<Product[]> {
        return new Observable<Product[]>(obs => {
            setTimeout(() => obs.next(this.data), 1000);
        })
    }
    getDataAsync(): Observable<Product[]> {
        return new Observable<Product[]>(obs => {
            setTimeout(() => obs.next(this.data), 1000);
        })
    }
}