import { Component } from "@angular/core";
import { Product } from "src/models/Product/product.model";
import { ProductRepository } from "src/models/Product/product.repository";

@Component({
    selector: "app-components",
    templateUrl: "./root.template.html",
    //styles: ["/deep/ div { border: 2px black solid; font-style:italic }"]
})
export class RootComponent {
    rootProductRepository: ProductRepository = new ProductRepository();

    addProduct(product: Product) {
        this.rootProductRepository.addProduct(product);
    }
}