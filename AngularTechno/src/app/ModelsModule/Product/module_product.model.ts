export class ModuleProduct {
    constructor(
        public id?: number,
        public name?: string,
        public category?: string,
        public price?: number) { }

    getModuleString(): string {
        return `${this.id} - ${this.name} - ${this.category} - ${this.price}`;
    }
}