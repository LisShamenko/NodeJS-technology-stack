import { Component } from "@angular/core";
import { Product } from "../../../src/models/Product/product.model";
import { ProductRepository } from "../../../src/models/Product/product.repository";

@Component({
    selector: "fifth-component",
    template: `
        <div class="bg-primary p-a-1">
            <h4>Пятый.</h4>
            <span>Количество продуктов: {{ getCountProducts() }}</span>
        </div>`
})
export class FifthComponent {
    category: string = "category 1";
    constructor(private productRepository: ProductRepository) { }
    getCountProducts(): number {
        let products = this.productRepository.getProducts()
            .filter(product => product.category == this.category);
        return products.length;
    }
}