import { Directive, ViewContainerRef, TemplateRef, Input, SimpleChange, IterableDiffer, IterableDiffers, ChangeDetectorRef } from "@angular/core";
import { IterableChanges, IterableChangeRecord, IterableDifferFactory, EmbeddedViewRef } from "@angular/core";
import { IteratorContext } from "./directive.iterator";
// import { Product } from "./../models/Product/product.model";


@Directive({
    selector: "[differDirectiveOf]"
})
export class DirectiveDiffer {

    // 
    private differ: IterableDiffer<any> | null; // any => Product

    // 
    private views: Map<any, IteratorContext> = new Map<any, IteratorContext>();

    @Input("differDirectiveOf")
    dataSource: any; // any => Product[]

    constructor(
        private container: ViewContainerRef,
        private template: TemplateRef<any>,
        private differs: IterableDiffers,
        private changeDetector: ChangeDetectorRef) {

        // при объявлении конкретного типа для this.dataSource следует инициализировать свойство 
        //this.dataSource = [];
        this.differ = null; //this.differ = this.differs.find(this.dataSource).create();
    }

    // --------------- отслеживание представлений

    // IterableDiffers (differs) - это классы предназначенные для обнаружения изменений в разных типах объектов
    ngOnInit() {

        // differs.find возвращает фабрику IterableDifferFactory для указанного входного свойства с типом any
        let differFactory: IterableDifferFactory = this.differs.find(this.dataSource);

        // фабрика позволяет создать IterableDiffer, который может отслеживать изменения в коллекции объектов
        //      this.changeDetector (ChangeDetectorRef) вызывает ошибка
        this.differ = differFactory.create((index: number, item: any) => { // any => Product
            // необязательная функция позволяет отслеживать изменения в содержимом элементов коллекции
            //      заводская реализация trackBy для ngFor
            return item.getChangeString();
        });
    }

    ngDoCheck() {

        // --------------- IterableDiffer.Diff

        // IterableDiffer.diff получает объект для сравнения и возвращает список изменений или null

        // collection                       возвращает коллекцию объектов, проанализированных на наличие изменений
        // length                           возвращает количество объектов в коллекции
        // forEachItem(func)                вызывает функцию для каждого объекта в коллекции
        // forEachPreviousItem(func)        вызывает функцию для каждого объекта в предыдущей версии коллекции
        // forEachAddedItem(func)           вызывает функцию для каждого нового объекта в коллекции 
        // forEachMovedItem(func)           вызывает функцию для каждого объекта, позиция которого изменилась
        // forEachRemovedItem(func)         вызывает функцию для каждого объекта, который был удален из коллекции
        // forEachIdentityChange(func)      вызывает функцию для каждого объекта с изменившейся идентичностью

        // --------------- IterableChangeRecord

        // item             возвращает объект данных
        // trackById        возвращает идентификатор (если используется trackBy)
        // currentIndex     возвращает текущий индекс объекта в коллекции
        // previousIndex    возвращает предыдущий индекс объекта в коллекции

        if (this.differ != null) {
            let changes: IterableChanges<any> | null = this.differ.diff(this.dataSource); // any => Product

            // если метод IterableDiffer.diff вернул список изменений, то:
            if (changes != null) {

                // 1. следует выполнить функцию для каждого нового элемента
                changes.forEachAddedItem((addition: IterableChangeRecord<any>) => { // any => Product

                    // создать новый объект контекстных данных
                    let index = (addition.currentIndex) ? addition.currentIndex : -1;
                    let isSetInterval: boolean = false; // (addition.currentIndex == 0); // 
                    let newIteratorContext = new IteratorContext(
                        addition.item, index, this.dataSource.length, isSetInterval);

                    // создать ViewRef
                    let view: EmbeddedViewRef<Object> = this.container.createEmbeddedView(
                        this.template, newIteratorContext);

                    // записать все в Map
                    newIteratorContext.view = view;
                    this.views.set(addition.trackById, newIteratorContext);
                });

                // 2. следует выполнить функцию для каждого удаленного элемента
                let removals = false;
                changes.forEachRemovedItem(removedItem => {
                    removals = true;

                    // найти представление
                    let iteratorContext: IteratorContext | undefined = this.views.get(removedItem.trackById);

                    // удалить представление из контэйнера представлений и из Map 
                    if (iteratorContext != null && iteratorContext.view != null) {
                        this.container.remove(this.container.indexOf(iteratorContext.view));
                        this.views.delete(removedItem.trackById);
                    }
                });

                // сделать пересчет индексов с учетом удаленных представлений, чтобы привязки на основе индекса 
                //      работали правильно (четные/не четные)
                if (removals) {
                    let index = 0;
                    this.views.forEach(iteratorContext => iteratorContext.setData(index++, this.views.size));
                }


            }
        }
    }
}

// --------------- IterableDifferFactory

//      // Provides a factory for {@link IterableDiffer}.
//      export declare interface IterableDifferFactory {
//          supports(objects: any): boolean;
//          create<V>(trackByFn?: TrackByFunction<V>): IterableDiffer<V>;
//      }

// --------------- TrackByFunction

//      // An optional function passed into the`NgForOf` directive that defines how to track
//      // changes for items in an iterable.
//      // The function takes the iteration index and item ID.
//      // When supplied, Angular tracks changes by the return value of the function.
//      export declare interface TrackByFunction<T> {
//          (index: number, item: T): any;
//      }

// --------------- IterableChangeRecord

//      // Record representing the item change information.
//      export declare interface IterableChangeRecord<V> {
//          // Current index of the item in `Iterable` or null if removed.
//          readonly currentIndex: number | null;
//          // Previous index of the item in `Iterable` or null if added.
//          readonly previousIndex: number | null;
//          // The item.
//          readonly item: V;
//          // Track by identity as computed by the `TrackByFunction`.
//          readonly trackById: any;
//      }

// --------------- IterableChanges

//      // An object describing the changes in the`Iterable` collection since last time `IterableDiffer#diff()` was invoked.
//      export declare interface IterableChanges<V> {
//          // Iterate over all changes. `IterableChangeRecord` will contain information about changes to each item.
//          forEachItem(fn: (record: IterableChangeRecord<V>) => void): void;
//          // Iterate over a set of operations which when applied to the original `Iterable` will produce the new `Iterable`.
//          //
//          // NOTE: These are not necessarily the actual operations which were applied to the original
//          // `Iterable`, rather these are a set of computed operations which may not be the same as the ones applied.
//          //
//          // @param record A change which needs to be applied
//          // @param previousIndex The `IterableChangeRecord#previousIndex` of the `record` refers to the
//          //        original `Iterable` location, where as `previousIndex` refers to the transient location
//          //        of the item, after applying the operations up to this point.
//          // @param currentIndex The `IterableChangeRecord#currentIndex` of the `record` refers to the
//          //        original `Iterable` location, where as `currentIndex` refers to the transient location
//          //        of the item, after applying the operations up to this point.
//          forEachOperation(fn: (record: IterableChangeRecord<V>, previousIndex: number | null, currentIndex: number | null) => void): void;
//          // Iterate over changes in the order of original `Iterable` showing where the original items have moved.
//          forEachPreviousItem(fn: (record: IterableChangeRecord<V>) => void): void;
//          // Iterate over all added items.
//          forEachAddedItem(fn: (record: IterableChangeRecord<V>) => void): void;
//          // Iterate over all moved items.
//          forEachMovedItem(fn: (record: IterableChangeRecord<V>) => void): void;
//          // Iterate over all removed items.
//          forEachRemovedItem(fn: (record: IterableChangeRecord<V>) => void): void;
//          // Iterate over all items which had their identity (as computed by the `TrackByFunction`) changed.
//          forEachIdentityChange(fn: (record: IterableChangeRecord<V>) => void): void;
//      }