import { Component, Inject } from "@angular/core";
import { NgForm } from "@angular/forms";
import { MODES, FormState } from "../models/sharedState.model";

import { Product } from "src/models/Product/product.model";
import { ProductRepository } from "src/models/Product/product.repository";
import { Observable } from "rxjs";
import { filter, map, distinctUntilChanged, skipWhile, takeWhile } from 'rxjs/operators';
import { PRODUCT_REPOSITORY, SUBJECT_INSTANCE } from "../tokens/re.tokens";

// --------------- Observable

// - класс Observable отслеживает последовательность событий, любой объект может 
//      подписаться на Observable, чтобы получать уведомления и реагировать только 
//      на конкретные события, а не на все изменения в приложении

// - метод subscribe принимает три функции в качестве аргументов, для подписки требуется 
//      передать только функцию onNext:
//      onNext           вызывается при инициировании нового события
//      onError          вызывается при инициировании ошибки
//      onCompleted      вызывается при завершении последовательности событий

// - сигнатура метода subscribe:
//      subscribe(
//          observerOrNext?: Partial<Observer<T>> | ((value: T) => void), 
//          error?: (error: any) => void, 
//          complete?: () => void
//      ): Subscription

// - API:
//      https://rxjs.dev/guide/overview
//      https://www.learnrxjs.io/
//      https://github.com/ReactiveX/rxjs

@Component({
    selector: "re-form",
    templateUrl: "./re_form.component.html",
    styleUrls: ["./re_form.style.css"],
})
export class REFormComponent {

    currentProduct: Product = new Product();
    editing: boolean = false;

    // - служба с идентификатором SUBJECT_INSTANCE передается как объект Observable<FormState>, 
    //      который позволяет подписаться на уведомления типа FormState
    constructor(
        @Inject(PRODUCT_REPOSITORY) private productRepository: ProductRepository,
        @Inject(SUBJECT_INSTANCE) public stateEvents: Observable<FormState>) {

        // --------------- Operators

        //      http://github.com/Reactive-Extensions/RxJS
        //      https://www.learnrxjs.io/learn-rxjs/operators/
        //      https://www.learnrxjs.io/learn-rxjs/operators/filtering/filter

        // filter                   аналог функции Array.filter
        // map                      аналог функции Array.map
        // distinctUntilChanged     подавляет события до изменения объекта события
        // skipWhile                отбрасывает все события пока не выполнится условие
        // takeWhile                отбрасывает все события после выполнения условия

        //
        this.stateEvents
            // skipWhile и takeWhile определяют условия, по которым события отбрасываются 
            //      или передаются подписчику
            .pipe(skipWhile(state => state.mode == MODES.EDIT))
            // фильтрация событий
            .pipe(filter(state => state.id != 3))
            // фильтрует последовательность событий оставляя только уникальные значения, но умеет 
            //      сравнивать только простые типы, для фильтрации объектов следует передать
            //      функцию сравнения в качестве аргумента
            .pipe(distinctUntilChanged())
            .pipe(distinctUntilChanged((firstState: FormState, secondState: FormState) => {
                return firstState.mode == secondState.mode && firstState.id == secondState.id;
            }))
            // преобразование событий, исходный объект изменяться не должен 
            .pipe(map((state: FormState) => new FormState(state.mode, state.id == 5 ? 1 : state.id)))
            // 
            .subscribe((update: FormState) => {
                console.log(`--- RE --- subscribe --- FormState = ${JSON.stringify(FormState)} ---`);
            });

        // 
        this.stateEvents
            .subscribe((update: FormState) => {
                this.editing = (update.mode == MODES.EDIT);
                if (this.editing) {
                    console.log('--- RE --- subscribe --- form --- MODES.EDIT ---');

                    // функция обрабатывает каждый получаемый объект FormState
                    this.currentProduct = new Product();
                    if (update.id != undefined) {
                        // копировать все свойства объекта из репозитория в объект формы
                        Object.assign(this.currentProduct, this.productRepository.getProduct(update.id));
                    }
                }
                else {
                    console.log(`--- RE --- subscribe --- form --- MODES.CREATE --- ${JSON.stringify(update.product)}`);

                    //
                    this.currentProduct = new Product();
                    if (update.product != undefined) {
                        Object.assign(this.currentProduct, update.product);
                    }
                }
            });

        // преобразование объектов FormState
        this.stateEvents
            .pipe(map((state: FormState) => state.mode == MODES.EDIT ? state.id : -1))
            .pipe(filter((id: number | undefined) => id != 3))
            .subscribe((id: number | undefined) => {
                console.log('--- RE --- subscribe --- form --- FormState => id ---');
                //      this.editing = id != -1;
                //      this.currentProduct = new Product();
                //      if (id != undefined && id != -1) {
                //          Object.assign(this.currentProduct, this.productRepository.getProduct(id))
                //      }
            });
    }

    submitForm(form: NgForm) {
        console.log(`--- RE --- submit --- form.valid = ${form.valid} ---`);
        if (form.valid) {
            if (this.editing) {
                this.editing = false;
                this.productRepository.saveProduct(this.currentProduct);
            }
            else {
                this.productRepository.addProduct(this.currentProduct);
            }
            this.currentProduct = new Product();
            form.reset();
        }
    }

    resetForm() {
        console.log(`--- RE --- reset ---`);
        this.currentProduct = new Product();
        this.editing = false;
    }
}