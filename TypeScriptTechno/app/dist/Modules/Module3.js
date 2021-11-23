"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Module3 = void 0;
class Module3 {
    constructor() {
        this.id = 0;
        this.name = '';
        this.items = [];
    }
    print() {
        console.log(`id = ${this.id} --- name = ${this.name} --- ${JSON.stringify(this.items)}`);
    }
    add(item) {
        this.items.push(item);
        return this;
    }
    remove() {
        this.items.pop();
        return this;
    }
}
exports.Module3 = Module3;
//# sourceMappingURL=Module3.js.map