import { Product } from "src/models/Product/product.model";

export enum MODES {
    CREATE, EDIT
}

export class FormState {
    constructor(
        public mode: MODES,
        public id?: number,
        public product?: Product) { }
}