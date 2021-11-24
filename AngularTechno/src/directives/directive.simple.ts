import { Directive, ElementRef, Attribute, Input, SimpleChange, Output, EventEmitter, HostListener, HostBinding } from "@angular/core";
import { Product } from "src/models/Product/product.model";

@Directive({
    // нестандартным директивам назначается префикс, который используется в названии атрибута (задается 
    //      свойством selector) и в имени класса директивы
    selector: "[simple-directive]",
})
export class DirectiveSimple {

    // --------------- 

    // - Angular передает ElementRef в констуктор при создании нового экземпляра директивы
    //      ElementRef является управляющим элементов к которому применяется директива

    // - атрибут simple-directive-class применяется к тому же элементу, что и директива simple-directive, 
    //      благодаря синтаксису @Attribute("simple-directive-class") конструктор получает доступ 
    //      к значению атрибута:
    //      constructor(element: ElementRef, @Attribute("simple-directive-class") simpleDirectiveClass: string) {
    // пример использования в шаблоне:
    //      <td simple-directive simple-directive-class="bg-warning">{{ item.category }}</td>
    //      <td simple-directive simple-directive-class="bg-info">{{ item.price }}</td>

    // - использование атрибута simple-directive в конструкторе:
    //      constructor(element: ElementRef, @Attribute("simple-directive") simpleDirective: string) {
    // пример использования в шаблоне:
    //      <td simple-directive="bg-warning">{{ item.category }}</td>
    //      <td simple-directive="bg-info">{{ item.price }}</td>

    constructor(private element: ElementRef, @Attribute("simple-directive") simpleDirective: string) {
        this.element = element;
        this.inputProperty = null;
        this.isConsoleLog = false;
        this.ngOnChangesProperty = '';

        // nativeElement представляет HTML-элемент в модели DOM
        let nativeElement = element.nativeElement;
        // свойство classList позволяет управлять набором CSS классов элемента
        console.log(`classList = ${nativeElement.classList}`);
        nativeElement.classList.add(simpleDirective || "bg-success");

        // инициализация нестандартных событий
        this.productProperty = null;
        this.classProperty = null;
        this.initEvents();
    }

    // --------------- входное свойство с привязкой к данным

    // Input задает имя атрибута в элементе HTML
    // используются квадратные скобки, так как применяется привязка данных, примеры:
    //      [simple-directive]="isSuccess() ? 'bg-success' : 'bg-warning'"
    //      [simple-directive]="'bg-info'"
    @Input("simple-directive")
    inputProperty: string | null;

    @Input("is-console-log")
    isConsoleLog: boolean | null;

    @Input("ng-on-changes")
    ngOnChangesProperty: string | null;

    // --------------- методы жизненного цикла директив

    // значения входных свойств задаются после завершения конструктора, то есть конструктор 
    //      не имеет доступа к входным свойствам. Angular создает объекты директив, вычисляет 
    //      выражения атрибутов, результаты которых присваиваются входным свойствам, после чего
    //      вызывается метод ngOnInit

    // ngOnInit                 после инициализации всех входных свойств
    // ngOnChanges              перед вызовом метода ngOnInit и при изменении значения входного свойства
    // ngDoCheck                при старте процесса обнаружения изменений Angular, применяется для обновлений 
    //                          не связанных с изменениями входных свойств
    // ngAfterContentInit       после инициализации контента директивы
    // ngAfterContentChecked    в процессе обнаружения изменений Angular, после анализа контента директивы 
    // ngOnDestroy              перед уничтожением директивы

    // последовательность вызовов:
    //      --- --- ngOnChanges --- ---
    //      --- --- ngOnInit --- ---
    //      --- --- ngDoCheck --- ---
    //      --- --- ngAfterContentInit --- ---
    //      --- --- ngAfterContentChecked --- ---
    //      --- --- ngDoCheck --- ---
    //      --- --- ngAfterContentChecked --- ---
    //      --- --- ngOnDestroy --- ---

    // вызывается после инициализации всех входных свойств
    ngOnInit() {
        if (this.isConsoleLog) console.log('--- --- ngOnInit --- ---');
        this.element.nativeElement.classList.add(this.inputProperty || "bg-success");
    }

    // вызывается перед вызовом метода ngOnInit и при обнаружении изменений во входных свойствах
    //      изменение свойств не приводит к автоматической реакции директив
    ngOnChanges(changes: { [property: string]: SimpleChange }) {
        if (this.isConsoleLog) console.log('--- --- ngOnChanges --- ---');

        // именами свойств объекта changes являются изменившиеся входные свойства
        let change = changes["ng-on-changes"];
        if (change) {
            console.log(`Объект SimpleChange для свойства 'ng-on-changes': ${JSON.stringify(change)}`);
            let classList = this.element.nativeElement.classList;

            // isFirstChange - возвращает true, если метод ngOnChanges был вызван перед методом ngOnInit
            //      метод ngOnChanges впервые вызывается при инициализации входного свойства
            if (change.isFirstChange()) {
                return;
            }

            // Следует обязательно отменить предыдущее обновление!

            // previousValue - предыдущее значение входного свойства
            if (classList.contains(change.previousValue)) {
                classList.remove(change.previousValue);
            }

            // currentValue - текущее значение входного свойства
            if (!classList.contains(change.currentValue)) {
                classList.add(change.currentValue);
            }
        }
    }

    // вызывается при старте процесса обнаружения изменений Angular, применяется для обновлений 
    //      не связанных с изменениями входных свойств
    ngDoCheck() {
        if (this.isConsoleLog) console.log('--- --- ngDoCheck --- ---');
    }

    // вызывается после инициализации контента директивы
    ngAfterContentInit() {
        if (this.isConsoleLog) console.log('--- --- ngAfterContentInit --- ---');
    }

    // вызывается в процессе обнаружения изменений Angular, после анализа контента директивы 
    ngAfterContentChecked() {
        if (this.isConsoleLog) console.log('--- --- ngAfterContentChecked --- ---');
    }

    // вызывается перед уничтожением директивы
    ngOnDestroy() {
        if (this.isConsoleLog) console.log('--- --- ngOnDestroy --- ---');
    }

    // --------------- нестандартные события

    // нестандартные события используются для передачи изменений в другие части приложения

    @Input("product-property")
    productProperty: Product | null;

    // EventEmitter реализует механизм событий для директив Angular
    //      тип string говорит о том, что слушатели будут получать строку при генерации события
    @Output("category-event")
    click = new EventEmitter<string>();

    initEvents() {
        // событие category-event генерируется при нажатии на элементе - событие click
        this.element.nativeElement.addEventListener("click", (e: any) => {
            console.log(`--- addEventListener --- e = ${e}`);
            if (this.productProperty != null) {
                // метод emit генерирует нестандартное событие, слушатели получат объект или значение 
                //      переданное в качестве аргумента
                this.click.emit(this.productProperty.category);
                // применение:
                //      $event это значение переданное в EventEmitter.emit
                //      (category-event)="currentProduct.category=$event"
            }
        });
    }

    // чтобы код не зависел от DOM API следует использовать:
    //      - привязку класса управляющего элемента
    //      - привязку события, вместо addEventListener

    // привязка между свойством "class" элемента HTML и свойством "class-property" декоратора
    @Input("class-property")
    @HostBinding("class")
    classProperty: string | null;

    // привязка события "click"
    @HostListener("click")
    triggerCustomEvent() {
        if (this.productProperty != null) {
            console.log(`--- HostListener triggerCustomEvent --- `);
            this.click.emit(this.productProperty.category);
        }
    }
}