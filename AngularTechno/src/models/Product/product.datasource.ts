import { Product } from "./product.model";

// класс источника данных предоставляет данные приложению
export class ProductsSource {

    private _data: Product[];

    constructor() {
        this._data = new Array<Product>(
            new Product(1, "тестовый_продукт", "спорт", 135),
            new Product(2, "switch_продукт", "спорт", 45.20),
            new Product(3, "продукт 3", "еда", 15.50),
            new Product(4, "продукт 4", "еда", 120.99),
            new Product(5, "продукт 5", "посуда", 100)
        );
    }

    getData(): Product[] {
        return this._data;
    }
}