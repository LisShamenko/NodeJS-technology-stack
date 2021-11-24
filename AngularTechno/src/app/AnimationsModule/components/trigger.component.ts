import { Component, Inject } from "@angular/core";
import { ActivatedRoute } from "@angular/router";
import { RestProduct } from "src/app/AsyncHttpModule/models/rest.model";
import { RestProductRepository } from "src/app/AsyncHttpModule/models/rest.repository";
import { AnimationsTrigger } from "./../animations/table.animations";
import { AnimationEvent } from "@angular/animations";

// - анимации применяются при помощи специальных привязок данных, которые связывают 
//      триггер анимации с элементом HTML, цель привязки определяет триггер с помощью
//      имени триггера и @, а выражение определяет состояние элемента:
//      <tr [@animationsTrigger]="getRowState(item.category)">

// - как применяется анимация: 
//      1 - выражение привязки данных возвращает состояние анимации, которое назначается 
//          управляющему элементу
//      2 - цель привязки данных определяет триггер в котором содержатся стили CSS
//      3 - по состоянию анимации выбираются стили CSS применяемые к элементу
//      4 - переход определяет, как следует применять стили CSS, если выражение привязки 
//          данных вернет новое состояние

@Component({
    selector: "trigger-component",
    templateUrl: "./trigger.template.html",
    // свойству animations присваивается массив триггеров, анимация применяется в
    //      к элементам шаблоне 
    animations: [AnimationsTrigger]
})
export class TriggerComponent {

    category: string = "";

    constructor(
        private productRepository: RestProductRepository,
        activeRoute: ActivatedRoute) {

        activeRoute.params.subscribe(params => {
            this.category = params["category"] || "";
        });
    }

    getProductsByFilter(): RestProduct[] {
        return this.productRepository.getProducts()
            .filter(p => this.category == '' || p.category == this.category);
    }

    getCategories(): string[] {
        return this.productRepository.getCategories();
    }

    getRowState(product: RestProduct): string {
        if (product.category && this.category != "") {
            this.category == product.category ? "selected" : "notselected";
            return this.category;
        }
        else {
            return "";
        }
    }

    // --------------- события триггеров анимации

    // триггеры создают обертку для наборов состояний и переходов и формируют связь 
    //      между элементами к которым применяются анимации, тригерная директива 
    //      [@animationsTrigger] генерирует события анимации AnimationTransitionEvent:
    //      - fromState    состояние из которого выходит элемент
    //      - toState      состояние в которое входит элемент
    //      - totalTime    продолжительность анимации

    writeAnimationEvent(event: AnimationEvent, product: RestProduct, start: boolean) {
        console.log(`
            --- AnimationEvent 
            --- name = ${product.name}, start = ${start} 
            --- fromState = ${event.fromState}, toState = ${event.toState}, totalTime = ${event.totalTime}`);
    }
}



/**
 * An instance of this class is returned as an event parameter when an animation
 * callback is captured for an animation either during the start or done phase.
 *
 * ```typescript
 * @Component({
 *   host: {
 *     '[@myAnimationTrigger]': 'someExpression',
 *     '(@myAnimationTrigger.start)': 'captureStartEvent($event)',
 *     '(@myAnimationTrigger.done)': 'captureDoneEvent($event)',
 *   },
 *   animations: [
 *     trigger("myAnimationTrigger", [
 *        // ...
 *     ])
 *   ]
 * })
 * class MyComponent {
 *   someExpression: any = false;
 *   captureStartEvent(event: AnimationEvent) {
 *     // the toState, fromState and totalTime data is accessible from the event variable
 *   }
 *
 *   captureDoneEvent(event: AnimationEvent) {
 *     // the toState, fromState and totalTime data is accessible from the event variable
 *   }
 * }
 * ```
 */
//export declare interface AnimationEvent {
//    // The name of the state from which the animation is triggered.
//    fromState: string;
//    // The name of the state in which the animation completes.
//    toState: string;
//    // The time it takes the animation to complete, in milliseconds.
//    totalTime: number;
//    // The animation phase in which the callback was invoked, one of
//    // "start" or "done".
//    phaseName: string;
//    // The element to which the animation is attached.
//    element: any;
//    // Internal.
//    triggerName: string;
//    // Internal.
//    disabled: boolean;
//}

