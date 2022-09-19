import { Component, EventEmitter, HostListener, Input, Output } from "@angular/core";
import { ProductsSource } from "../../../src/models/Product/product.datasource";
import { Product } from "../../../src/models/Product/product.model";
import { ProductRepository } from "../../../src/models/Product/product.repository";

@Component({
    selector: "fourth-component",
    templateUrl: "./fourth.template.html"
})
export class FourthComponent {

    category: string = "category 1";
    asyncProducts: Product[] = [];

    constructor(
        private productRepository: ProductRepository,
        private productsSource: ProductsSource) { }

    getProducts(): Product[] {
        let products = this.productRepository.getProducts();
        return products.filter(product => product.category == this.category);
    }

    getProductsAsync() {
        return this.asyncProducts;
    }

    getCountProducts(): number {
        let products = this.getProducts();
        return products.length;
    }

    // 
    highlighted: boolean = false;

    // 
    @Output("fourth-highlight")
    change = new EventEmitter<boolean>();

    // "$event.target.value"
    @HostListener("mouseenter", ["$event.type"])
    @HostListener("mouseleave", ["$event.type"])
    setHighlight(type: string) {
        this.highlighted = (type == "mouseenter");
        this.change.emit(this.highlighted);
    }

    // 
    @Input("input-string")
    inputString: string = "";

    // 
    ngOnInit() {
        this.updateData();
    }

    setCategory(category: string) {
        this.category = category;
        this.updateData();
    }

    updateData() {
        this.productsSource.getDataAsync().subscribe(
            data => this.asyncProducts = data.filter(p => p.category == this.category));
    }
}