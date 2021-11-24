import { Injectable } from "@angular/core";
import { PaginationData } from "src/app/RoutingModule/models/pagination_data.model";
import { RestProductsSource } from "./rest.datasource";
import { RestProduct } from "./rest.model";

// ---------------

@Injectable()
export class RestProductRepository {

    private _products: RestProduct[] = new Array<RestProduct>();
    private _paginationData: PaginationData = new PaginationData(0, 0);



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
        return this._products.find(p => p.id == id);
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
                let index = this._products.findIndex(p => p.id == product.id);
                this._products.splice(index, 1, p);
            });
    }

    deleteProduct(id: number): void {
        this._dataSource
            .deleteProduct(id)
            .subscribe(() => {
                console.log(`--- --- deleteProduct --- ---`);
                let index = this._products.findIndex(p => p.id == id);
                if (index > -1) {
                    this._products.splice(index, 1);
                }
            });
    }

    // --------------- навигация по коллекции

    getNextProductId(id: number): number | undefined {
        return this.getProductByOffset(id, 1);
    }

    getPreviousProductId(id: number): number | undefined {
        return this.getProductByOffset(id, -1);
    }

    getProductByOffset(id: number, offset: number) {
        if (this._products.length == 0) {
            return undefined;
        }

        let index = this._products.findIndex(p => p.id == id) + offset;
        if (index >= this._products.length) {
            index = 0;
        }
        else if (index < 0) {
            index = this._products.length - 1;
        }
        return this._products[index].id;
    }

    // --------------- дочерние маршруты  

    getPaginationData() {
        return this._paginationData;
    }

    refreshPagination() {
        this._dataSource.getPagination().subscribe(data => {
            console.log('--- --- refreshPagination = ' + JSON.stringify(data));
            Object.assign(this._paginationData, data);
        });
    }

    getCountCategories(): number {
        let products = this.getCategories();
        return products.length;
    }

    getCountProducts(): number {
        return this._products.length;
    }

    getCategories(): string[] {
        return this._products
            .map(p => p.category ? p.category : '')
            .filter((category, index, array) => array.indexOf(category) == index);
    }
}