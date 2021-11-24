import { Component, Input } from "@angular/core";
import { NgForm } from "@angular/forms";
import { RestProduct } from "../models/rest.model";
import { RestProductRepository } from "../models/rest.repository";

@Component({
    selector: "async-http-component",
    templateUrl: "./async_http.component.html",
})
export class AsyncHTTPComponent {

    getProductId: number = -1;
    selectProductId: number | undefined = undefined;
    currentProduct: RestProduct = new RestProduct();
    editing: boolean = false;



    constructor(private _repository: RestProductRepository) { }



    // --------------- 

    clearProducts() {
        this._repository.clearProducts();
    }

    selectProduct(id: number | undefined) {
        if (id != undefined) {
            let product = this._repository.getProduct(id);
            if (product) {
                this.selectProductId = id;
                this.currentProduct = product;
                this.editing = true;
            }
        }
    }

    refreshProducts() {
        this._repository.refreshProducts();
    }

    submitForm(form: NgForm) {
        if (this.editing) {
            this.editing = false;
            this._repository.updateProduct(this.currentProduct);
        }
        else {
            this._repository.addProduct(this.currentProduct);
        }
        this.currentProduct = new RestProduct();
        form.reset();
    }

    resetForm() {
        this.currentProduct = new RestProduct();
        this.editing = false;
    }

    // --------------- синхронные запросы

    // вернет кэшированную коллекцию
    getProducts(): RestProduct[] {
        return this._repository.getProducts();
    }

    // вернет объект из кэшированной коллекции
    getProduct(): RestProduct | undefined {
        let product: RestProduct | undefined = this._repository.getProduct(this.getProductId);
        if (product) {
            return product;
        }
        return undefined;
    }

    // --------------- асинхронные запросы

    addProduct(product: RestProduct): void {
        this._repository.addProduct(product);
    }

    saveProduct(product: RestProduct | undefined): void {
        if (product) {
            this._repository.updateProduct(product);
        }
    }

    deleteProduct(id: number | undefined): void {
        if (id != undefined) {
            this._repository.deleteProduct(id);
        }
    }
}