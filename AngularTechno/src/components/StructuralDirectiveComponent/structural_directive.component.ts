import { Component } from "@angular/core";
import { NgForm } from "@angular/forms";
import { ProductRepository } from "./../../models/Product/product.repository";
import { Product } from "./../../models/Product/product.model";

@Component({
    selector: "app-structural-directive",
    templateUrl: "./structural_directive.template.html"
})
export class StructuralDirectiveComponent {

    // --------------- 

    productRepository: ProductRepository;
    currentProduct: Product;

    // true - сработает структурная директива
    isDirectiveWork_1: boolean;
    isDirectiveWork_2: boolean;
    isDirectiveWork_3: boolean;
    isDirectiveWork_4: boolean;
    isDirectiveWork_5: boolean;
    isDirectiveWork_6: boolean;
    isSetChildDirective: boolean;
    isSetChildrenDirective: boolean;

    constructor() {
        this.productRepository = new ProductRepository();
        this.isDirectiveWork_1 = false;
        this.isDirectiveWork_2 = false;
        this.isDirectiveWork_3 = false;
        this.isDirectiveWork_4 = false;
        this.isDirectiveWork_5 = false;
        this.isDirectiveWork_6 = false;
        this.isSetChildDirective = false;
        this.isSetChildrenDirective = false;
        this.currentProduct = new Product();
        this.currentProduct.name = '';
        this.isFormSubmit = false;
    }

    getProducts(): Product[] {
        return this.productRepository.getProducts();
    }

    // --------------- для формы

    isFormSubmit: boolean = false;

    submitForm(form: NgForm) {
        this.isFormSubmit = true;
        if (form.valid) {
            this.productRepository.addProduct(this.currentProduct);
            this.currentProduct = new Product();
            form.reset();
            this.isFormSubmit = false;
        }
    }

    deleteProduct(id: number) {
        this.productRepository.deleteProduct(id);
    }

}
