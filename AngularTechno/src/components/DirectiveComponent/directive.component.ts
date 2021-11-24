import { Component } from "@angular/core";
import { ProductRepository } from "./../../models/Product/product.repository";
import { Product } from "./../../models/Product/product.model";

@Component({
    selector: "app-directive",
    templateUrl: "./directive.template.html"
})
export class DirectiveComponent {
    productRepository: ProductRepository;
    currentProduct: Product;
    constructor() {
        this.productRepository = new ProductRepository();
        this.currentProduct = new Product();
        this.currentProduct.name = '';
    }
    getProducts(): Product[] {
        return this.productRepository.getProducts();
    }
}