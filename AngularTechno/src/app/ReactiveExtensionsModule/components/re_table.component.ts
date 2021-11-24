import { Component, Inject } from "@angular/core";
import { MODES, FormState } from "../models/sharedState.model";
import { Product } from "src/models/Product/product.model";
import { ProductRepository } from "src/models/Product/product.repository";
import { Observer } from "rxjs";
import { PRODUCT_REPOSITORY, SUBJECT_INSTANCE } from "../tokens/re.tokens";

// --------------- Observer

// Observer создает уведомления, методы Observer:
//      next(value)             создает новое событие
//      error(errorObject)      сообщает об ошибке
//      complete()              завершает последовательность событий

@Component({
    selector: "re-table",
    templateUrl: "./re_table.component.html"
})
export class RETableComponent {

    currentProduct: Product = new Product();

    // - служба с идентификатором SUBJECT_INSTANCE передается как объект Observer<FormState>, 
    //      который будет отправлять события типа FormState
    constructor(
        @Inject(PRODUCT_REPOSITORY) private productRepository: ProductRepository,
        @Inject(SUBJECT_INSTANCE) private observer: Observer<FormState>) { }

    getProduct(key: number): Product | undefined {
        return this.productRepository.getProduct(key);
    }
    getProducts(): Product[] {
        return this.productRepository.getProducts();
    }
    deleteProduct(key: number | undefined) {
        if (key != undefined) {
            this.productRepository.deleteProduct(key);
        }
    }

    // editProduct и createProduct отправляют уведомления о происходящих изменениях
    editProduct(key: number | undefined) {
        if (key != undefined) {
            console.log('--- RE --- event --- EDIT ---');
            this.observer.next(new FormState(MODES.EDIT, key));
        }
    }
    createProduct() {
        console.log(`--- RE --- event --- CREATE --- ${JSON.stringify(this.currentProduct)}`);
        this.observer.next(new FormState(MODES.CREATE, -1, this.currentProduct));
        this.currentProduct = new Product();
    }
}