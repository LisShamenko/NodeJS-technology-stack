import { Component, KeyValueDiffer, KeyValueDiffers } from "@angular/core";
import { RestProductRepository } from "src/app/AsyncHttpModule/models/rest.repository";
import { PaginationData } from "../models/pagination_data.model";

@Component({
    selector: "product-count",
    template: `<div class="bg-info p-a-1">Количество продуктов: {{ paginationData.countPtoducts }}.</div>`
})
export class ProductCountComponent {

    private differ: KeyValueDiffer<string, any> | null = null;
    count: number = 0;
    paginationData: PaginationData;



    constructor(
        private productRepository: RestProductRepository,
        private keyValueDiffers: KeyValueDiffers) {

        this.paginationData = this.productRepository.getPaginationData();
        this.productRepository.refreshPagination();
    }



    ngOnInit() {
        this.differ = this.keyValueDiffers
            .find(this.paginationData) // .find(this.productRepository.getProducts()) // 
            .create();
    }

    ngDoCheck() {
        if (this.differ) {
            let change = this.differ.diff(this.productRepository.getProducts());
            if (change != null) {
                // online обновление
                this.productRepository.refreshPagination();
                // offline обновление
                //      this.count = this.productRepository.getCountProducts();
            }
        }
    }
}