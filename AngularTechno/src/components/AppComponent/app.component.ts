import { ApplicationRef, Component } from "@angular/core";
import { ProductRepository } from "./../../models/Product/product.repository";
import { Product } from "./../../models/Product/product.model";


@Component({
    selector: 'app',
    templateUrl: './app.template.html',
})
export class AppComponent {

    // --------------- встроенные директивы

    // звездочка перед именем директивы означает, что это директива микрошаблона

    // Директива ngIf включает элемент и его контент в документ HTML, если результат выражения равен true. 
    //      <div *ngIf="выражение">

    // Директива ngIf добавляет и удаляет элементы HTML из документа, вместо того чтобы просто отображать и 
    //      скрывать их. Чтобы изменить видимость элементов следует использовать привязку свойства hidden 
    //      или привязку стилевого свойства display со значением none.

    // Директива ngSwitch используется для выбора элементов, включаемых в документ HTML. Результат 
    //      выражения ngSwitch сравнивается с результатами выражений ngSwitchCase, ngSwitchDefault 
    //      содержит разметку по умолчанию. Работает как обычный switch.
    //      <div [ngSwitch]="выражение">
    //          <span *ngSwitchCase="выражение"></span>
    //          <span *ngSwitchDefault></span>
    //      </div>

    // Директива ngFor генерирует повторяющийся набор элементов HTML для каждого объекта в массиве. 
    //      <div *ngFor="#item of выражение"></div>

    // Директива ngTemplateOutlet используется для повторения блока контента в шаблоне.
    //      <template [ngTemplateOutlet]="myTempl"></template>

    // Директива ngClass используется для управления принадлежностью к классам.
    //      <div ngClass="выражение"></div>

    // Директива ngStyle используется для управления стилями, применяемыми непосредственно к элементам.
    //      <div ngStyle="выражение"></div>

    // --------------- локальные переменные ngFor

    // К переменным index, odd, first, last нельзя обращаться напрямую, следует использовать локальные переменные:
    //      *ngFor="let item of getProducts(); let i = index; let odd = odd; let first = first; let last = last;"

    // index    number      содержит позицию объекта
    // odd      boolean     true если объект находится в нечетной позиции
    // even     boolean     true если объект находится в четной позиции
    // first    boolean     true если объект находится в первой позиции
    // last     boolean     true если объект находится в последней позиции

    // --------------- Директивы

    productRepository: ProductRepository = new ProductRepository();

    // в процессе начальной загрузки Angular создает объект ApplicationRef, представляющий приложение
    constructor(ref: ApplicationRef) {
        // определить две переменные в глобальном пространстве имен: ApplicationRef и Model, 
        //      что позволит управлять ими в консоли JavaScript в браузере:
        //      - model.shiftTest() изменит содержимое репозитория;
        //      - appRef.tick() запускает процесс обнаружения изменений, вычисляет и обновляет привязки.
        (<any>window).appRef = ref;
        (<any>window).model = this.productRepository;

        // Загромождать глобальное пространство имен не рекомендуется!
    }

    // вернуть продукт по индексу
    getProductByPosition(index: number): Product {
        let products = this.productRepository.getProducts();
        return products[index];
    }

    // вернуть список классов по индексу
    getClassesByPosition(index: number): string {
        let product = this.getProductByPosition(index);
        return "p-a-1 " + ((product?.price && product.price < 50) ? "bg-info" : "bg-warning");
    }

    // --------------- Встроенные директивы

    targetName: string = 'тестовый_продукт';

    getProduct(key: number): Product | undefined {
        return this.productRepository.getProduct(key);
    }

    getProducts(): Product[] {
        return this.productRepository.getProducts();
    }

    getProductCount(): number {
        return this.productRepository.getCountProducts();
    }

    // --------------- ngFor trackBy

    // Проблема:
    // Представим, что первый объект в репозитории products был удален и был добавлен новый с теми же значениями 
    //      свойств id, name, category и price. В этом случае, чтобы отразить изменения директиве ngFor следует 
    //      выполнить два действия: 
    //      - уничтожить элементы HTML, представляющие первый объект в репозитории;
    //      - создать новые элементы HTML для отображения нового объекта.
    // В такой ситуации Angular не может определить, что удаленный и добавленный объекты, по сути, являются
    //      одним и тем же объектом и нет необходимости пересоздавать элементы HTML. Ситуация усугубляется
    //      когда замене подлежит вся коллекция объектов, например, при обновлении из внешнего источника Ajax.

    // Решение:
    // Для повышения эффективности обновления можно определить метод компонента, который поможет Angular 
    //      определить, когда два разных объекта представляют одни и те же данные. Метод должен определять 
    //      два параметра: позицию объекта в источнике данных и объект данных. Два объекта считаются равными, 
    //      если они дают одинаковые результаты.
    // 
    // Благодаря записи 'trackBy:getKey' директива ngFor может сопоставить два разных объекта с идентичными 
    //      данными, что позволяет сократить количество операций создания и удаления:
    //      <tr *ngFor="let item of getProducts(); trackBy:getKey">

    getKey(index: number, product: Product) {
        return product.id;
    }

    // --------------- Директива ngTemplateOutlet

    // В Angular 11 не нашел ngOutletContext!
    // В Angular 11 вместо "template" исползуется пара элементов ng-template/ng-container!
    //      ng-template определяет шаблон, который помещается в ng-container.  Шаблон помечается ссылочной переменной
    //      (#titleTemplate), которая используется в директиве ngTemplateOutlet. Директива ngTemplateOutlet ссылается
    //      на используемый шаблон и контекст с данными, который может быть передан из класса компонента или задан 
    //      прямо в разметке. Элементы ng-template и ng-container не включаются в документ HTML.

    myContext = {
        $implicit: 'from class - not value',
        localSk: ' - value'
    };
}
