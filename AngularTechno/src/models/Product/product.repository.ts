import { Product } from "./product.model";
import { ProductsSource } from "./product.datasource";

// класс репозитория данных, предоставляет доступ к данным из источника данных
export class ProductRepository {

    // источник данных
    private _dataSource: ProductsSource;
    // кэширование данных из источника
    private _products: Product[];
    // последнее значение идентификатора
    private _lastId: number;

    constructor() {
        this._dataSource = new ProductsSource();
        this._products = new Array<Product>();

        // выполнить запрос данных через источник ProductsSource
        let data = this._dataSource.getData();
        data.forEach(p => this._products.push(p));

        // сортировка данных
        this._products.sort((a: Product, b: Product): number => {
            if (a.id !== undefined && b.id !== undefined) return (a.id - b.id);
            if (a.id !== undefined) return 1;
            if (b.id !== undefined) return -1;
            return 0;
        });
        let lastProduct = this._products[this._products.length - 1];
        this._lastId = (lastProduct.id !== undefined) ? lastProduct.id : 0;
    }

    // при написании репозитория следует учитывать два фактора:
    // - отображаемые данные должны представляться настолько эффективно, насколько это возможно. 
    //      Например, в форме массива Product[] с возможностью перебора.
    // - необходимо сохранить возможность представления неизмененных данных Angular для работы.
    //      Например, метод getProducts при многократном вызове должен возвращать один и тот же объект,
    //      иначе Angular выдаст сообщение об ошибке, даже если это два разных массива с одинаковыми данными.
    //      Класс Map в спецификации ES6 более эффективен чем массив, но при запросе его содержимого 
    //      генерируются новые массивы объектов, что вызовет ошибки Angular, поэтому придется смириться 
    //      со снижением эффективности и хранить данные в массиве.

    // возвращает один и тот же массив _products
    getProducts(): Product[] {
        return this._products;
    }

    // заменяет вызов: getProducts().length
    getCountProducts(): number {
        return this._products.length;
    }

    // вернуть продукт по идентификатору
    getProduct(id: number): Product | undefined {
        return this._products.find(p => p.id === id);
    }

    // заменяет вызов: getProduct(1).name
    getProductName(id: number, defaultName: string): string {
        let product = this._products.find(p => p.id === id);
        return (product === undefined || product.name === undefined) ? defaultName : product.name;
    }

    // добавить новый продукт
    addProduct(product: Product): void {
        product.id = this.generateID();
        this._products.push(product);
    }

    // сохранить продукт
    saveProduct(product: Product) {
        let index = this._products.findIndex(p => p.id === product.id);
        this._products.splice(index, 1, product);
    }

    // генерирует новый идентификатор
    private generateID(): number {
        this._lastId++;
        return this._lastId;
    }

    // удалить продукт
    deleteProduct(id: number) {
        let index = this._products.findIndex(p => p.id === id);
        if (index > -1) {
            this._products.splice(index, 1);
        }
    }

    // 
    swapProduct(): void {
        let p = this._products.shift();
        this._products.push(new Product(p?.id, p?.name, p?.category, p?.price));
    }
    // 
    shiftTest(): void {
        this._products.shift();
    }
}
