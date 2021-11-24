import { ViewRef } from "@angular/core";

export class ModuleIteratorContext {

    $implicit: any;
    index: number;
    odd: boolean;
    even: boolean;
    first: boolean;
    last: boolean;
    view: ViewRef | null;

    constructor($implicit: any, index: number, total: number) {
        this.$implicit = $implicit;
        this.index = index;
        this.odd = (index % 2 == 1);
        this.even = !this.odd;
        this.first = index == 0;
        this.last = (index == total - 1);
        this.setData(index, total);
        this.view = null;
    }

    setData(index: number, total: number) {
        this.index = index;
        this.odd = index % 2 == 1;
        this.even = !this.odd;
        this.first = index == 0;
        this.last = index == total - 1;
    }
}