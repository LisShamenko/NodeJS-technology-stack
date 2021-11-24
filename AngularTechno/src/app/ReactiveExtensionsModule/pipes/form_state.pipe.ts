import { Inject, Pipe } from "@angular/core";
import { ProductRepository } from "src/models/Product/product.repository";
import { FormState, MODES } from "../models/sharedState.model";
import { PRODUCT_REPOSITORY } from "../tokens/re.tokens";

// --------------- async

// - канал async позволяет получать последнее уведомление из последовательности событий 
//      прямо в шаблоне, канал является грязным ('pure:false'), то есть метод transform 
//      будет вызываться очень часто и при любых изменениях в приложении

// - свойство stateEvents это зависимость в конструкторе компонента:
//      @Inject(SUBJECT_INSTANCE) private stateEvents: Observable<FormState>

// - stateEvents передается каналу async, который передает последнее полученное событие 
//      следующему каналу
//      {{ stateEvents | async | json }}
//      {{ stateEvents | async | formStatePipe }}

@Pipe({
    name: "formStatePipe",
    pure: true
})
export class FormStatePipe {

    constructor(@Inject(PRODUCT_REPOSITORY) private productRepository: ProductRepository) { }

    transform(value: any): string {
        console.log(`--- RE --- pipe --- ${JSON.stringify(value)} ---`);
        if (value instanceof FormState) {
            let state = value as FormState;
            if (state) {
                if (state.mode == MODES.EDIT) {
                    if (state.id != undefined) {
                        let product = this.productRepository.getProduct(state.id);
                        if (product) {
                            return `mode: ${MODES[state.mode]}, product: ${(state.id != undefined) ? product.name : ""}`;
                        }
                    }
                }
                else if (state.mode == MODES.CREATE) {
                    if (state.product != undefined) {
                        return `mode: ${MODES[state.mode]}, product: ${state.product.name}`;
                    }
                }
            }
        }
        return '';
    }
}