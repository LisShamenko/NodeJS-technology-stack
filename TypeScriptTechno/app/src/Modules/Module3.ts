export class Module3 {
    id: number;
    name: string;
    items: number[];
    constructor() {
        this.id = 0;
        this.name = '';
        this.items = [];
    }
    print(): void {
        console.log(`id = ${this.id} --- name = ${this.name} --- ${JSON.stringify(this.items)}`);
    }
    add(item: number): Module3 {
        this.items.push(item);
        return this;
    }
    remove(): Module3 {
        this.items.pop();
        return this;
    }
}