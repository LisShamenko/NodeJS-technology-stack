import { Directive, ViewContainerRef, TemplateRef, Input, SimpleChange, ViewRef } from "@angular/core";

@Directive({
    // директива будет применятся к элементам с атрибутом 'iteratorDirective'
    selector: "[iteratorDirectiveOf]"
})
export class DirectiveIterator {

    // входное свойство получает выражение, которое является источником данных
    @Input("iteratorDirectiveOf")
    dataSource: any;

    @Input("is-console-log")
    isConsoleLog: boolean;

    constructor(
        private container: ViewContainerRef,
        private template: TemplateRef<any>) {

        this.isConsoleLog = false;
    }

    // 
    ngOnInit() {
        if (this.isConsoleLog) {
            console.log("вызов обновления контента updateContent через метод ngOnInit");
        }
        this.updateContent();
    }

    // --------------- ngDoCheck

    // изменения данных на уровне коллекции, изменения этого типа происходят при добавлении и удалении
    //      объектов коллекции, такие изменения Angular не обнаруживает автоматически, при этом не 
    //      вызывается метод ngOnChanges, для обработки этого случая требуется реализация метода ngDoCheck, 
    //      который позволяет реагировать даже на те изменения, которые не обнаруживаются Angular
    // реализация метода ngDoCheck может ухудшить быстродействие приложения
    ngDoCheck() {
        if (this.isConsoleLog) {
            console.log("вызов обновления контента updateContent через метод ngDoCheck");
        }
        this.updateContent();
    }

    // метод ngDoCheck срабатывает каждый раз, когда Angular обнаруживает какие-либо изменения, что 
    //      происходит довольно часто, например, при получении фокуса элементом input, при событиях клавиш,
    //      при выполнении проверки данных и т. д.

    // --------------- контейнер представлений

    private updateContent() {

        // очищает контейнер представлений 
        this.container.clear();

        // добавляет новое представление для каждого объекта
        for (let i = 0; i < this.dataSource.length; i++) {

            // - в метод createEmbeddedView передается два аргумента:
            //      - объект TemplateRef предоставляет контент для вставки в контейнер
            //      - объект контекста предоставляет данные для неявного значения, которое задается 
            //          при помощи свойства $implicit, этот объект присваивается переменной шаблона item

            // - ViewContainerRef явялется контейнером представлений, переменная container этого типа управляет 
            //      представлениями после их создания, контейнер может содержать несколько представлений

            // - шаблон может повторно использоваться для создания нескольких представлений, например для строк tr таблицы 

            // - директива не обладает информацией о генерируемом контенте и используемых данных, Angular 
            //      предоставляет директиве источник данных через входное свойство и шаблон для каждого 
            //      представления через объект TemplateRef

            if (this.isConsoleLog) {
                console.log(`i = ${i} --- JSON = ${JSON.stringify(this.dataSource[i])}`);
            }

            let isSetInterval: boolean = false; // (i == 0); // 
            this.container.createEmbeddedView(this.template,
                new IteratorContext(this.dataSource[i], i, this.dataSource.length, isSetInterval)
            );
        }
    }
}

// --------------- $implicit

// полный и компактный варианты применения:
//      <template [iteratorDirectiveOf]="getProducts()" let-item let-i="index" let-odd="odd" let-even="even">
//      <tr *iteratorDirective="let item of getProducts(); let i = index; let odd = odd; let even = even">

// полный синтаксис - элемент template содержит два атрибута:
//      - привязка источника данных [iteratorDirectiveOf] получает коллекцию необходимых данных
//          имя атрибута должно заканчиваться символами Of для поддержки компактного синтаксиса
//      - let-item используется для определения неявного значения (implicit value), которое 
//          позволяет ссылаться на итерируемые объекты из элемента template, при этом значение
//          переменной не присваивается, так как она нужна только для определения имени переменной

// --------------- контекстные данные

// контекстные данные - это дополнительные данные, которые могут использоваться в привязках, 
//      например, директива ngFor предоставляет значения odd, even, first и last

// класс предоставляет шаблону объект контекста с дополнительными данными безопасным по отношению 
//      к типу способом, свойства объекта контекста используются для создания переменных шаблона с 
//      помощью синтаксиса let-<имя>:
//      <template [iteratorDirectiveOf]="getProducts()" let-item let-i="index" let-odd="odd" let-even="even">
export class IteratorContext {

    // неявное значение
    $implicit: any;

    // свойства используются для создания переменных шаблона
    index: number;
    odd: boolean;
    even: boolean;
    first: boolean;
    last: boolean;

    view: ViewRef | null;

    constructor($implicit: any, index: number, total: number, isSetInterval: boolean) {

        this.$implicit = $implicit;
        this.index = index;
        this.odd = (index % 2 == 1);
        this.even = !this.odd;
        this.first = index == 0;
        this.last = (index == total - 1);
        this.setData(index, total);

        this.view = null;

        // изменения данных объекта контекста на уровне свойств, такие изменения Angular обрабатывает 
        //      автоматически. Этот способ порождает каскадный эффект в привязках данных элемента 
        //      template, напрямую через изменение неявного значения или косвенно через дополнительные 
        //      контекстные значения
        if (isSetInterval) {
            setInterval(() => {
                this.odd = !this.odd;
                this.even = !this.even;
                this.$implicit.price++;
            }, 2000);
        }
    }

    setData(index: number, total: number) {
        this.index = index;
        this.odd = index % 2 == 1;
        this.even = !this.odd;
        this.first = index == 0;
        this.last = index == total - 1;
    }
}
