import { Injectable } from "@angular/core";
import { RestProductsSource } from "./rest.datasource";
import { RestProduct } from "./rest.model";

// --------------- 

@Injectable()
export class RestProductRepository {

    private _products: RestProduct[] = new Array<RestProduct>();



    constructor(private _dataSource: RestProductsSource) {
        // метод getData выполняет асинхронный запрос HTTP к REST-совместимой веб-службе
        //      метод subscribe используется для получения данных с сервера
        this._dataSource.getData().subscribe(data => this._products = data);
    }



    // --------------- 

    clearProducts() {
        this._products.splice(0, this._products.length);
    }

    refreshProducts() {
        this._dataSource.getData().subscribe(data => {
            this._products = data;
        });
    }

    // --------------- REST-совместимые веб-службы

    // REST (Representational State Transfer)

    // - спецификации REST не существует, но есть множество подходов под общим названием 'REST-совместимости'

    // - REST-совместимые веб-службы использует методы HTTP (команды verbs), чтобы задавать операции на сервере,
    //      а URL-адрес определяет объекты данных к которым применяется операция

    // --------------- 

    //      GET     /products
    //      GET     /products/id
    //      POST    /products
    //      PUT     /products/id
    //      PATCH   /products/id
    //      DELETE  /products/id

    getProducts(): RestProduct[] {
        return this._products;
    }

    getProduct(id: number): RestProduct | undefined {
        return this._products.find(p => p.id === id);
    }

    addProduct(product: RestProduct): void {
        this._dataSource
            .saveProduct(product)
            .subscribe(p => {
                console.log(`--- --- addProduct --- ---`);
                this._products.push(p);
            });
    }

    updateProduct(product: RestProduct): void {
        this._dataSource
            .updateProduct(product)
            .subscribe(p => {
                console.log(`--- --- updateProduct --- ---`);
                let index = this._products.findIndex(p => p.id === product.id);
                this._products.splice(index, 1, p);
            });
    }

    deleteProduct(id: number): void {
        this._dataSource
            .deleteProduct(id)
            .subscribe(() => {
                console.log(`--- --- deleteProduct --- ---`);
                let index = this._products.findIndex(p => p.id === id);
                if (index > -1) {
                    this._products.splice(index, 1);
                }
            });
    }
}