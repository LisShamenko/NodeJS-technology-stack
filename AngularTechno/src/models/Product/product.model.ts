// класс модели
export class Product {
    constructor(
        public id?: number,
        public name?: string,
        public category?: string,
        public price?: number) { }

    getChangeString(): string {
        return `${this.id} - ${this.name} - ${this.category} - ${this.price}`;
    }
}