import { Directive, SimpleChange, ViewContainerRef, TemplateRef, Input } from "@angular/core";

@Directive({
    // директива будет применятся к управляющим элементам с атрибутом 'structureDirectiveOf'
    selector: "[structureDirectiveOf]"
})
export class DirectiveStructure {

    // --------------- ViewContainerRef

    // Представление (view) — это набор элементов HTML, содержащий директивы, привязки и выражения.
    //      ViewContainerRef используется для управления содержимым контейнера представлений
    //      или контейнер представлений отвечает за управление коллекцией представлений. 

    // element                          Свойство возвращает элемент ElementRef, представляющий контейнерный элемент
    // createEmbeddedView (template)    Метод использует шаблон для создания нового представления (подробности в тексте после таблицы). Метод также получает необязательные аргументы с данными контекста (см. раздел «Создание итеративных структурных директив») и индексом, который указывает, где должно быть вставлено представление. В результате создается объект ViewRef, который может использоваться с другими методами этой таблицы
    // clear()                          Метод удаляет все представления из контейнера
    // length                           Свойство возвращает количество представлений в контейнере
    // get(index)                       Метод возвращает объект ViewRef для представления с заданным индексом
    // indexOf(view)                    Метод возвращает индекс заданного объекта ViewRef
    // insert(view, index)              Метод вставляет представление с заданным индексом
    // remove(Index)                    Метод удаляет и уничтожает представление с заданным индексом
    // detach(index)                    Метод отсоединяет представление с заданным индексом без его уничтожения для последующего изменения его позиции методом insert

    // --------------- как работает:

    // Angular обрабатывает шаблон компонента и обнаруживает элемент template с привязкой к структурной
    //      директиве, после чего создается класс директивы DirectiveStructure, конструктору предоставляются
    //      необходимые объекты ViewContainerRef и TemplateRef, после чего Angular обрабатывает выражения и 
    //      привязки данных, вызывается первый раз ngOnChanges (метод isFirstChange вернет true)

    // директива получает значение выражения через входное свойство, но само выражение остается скрытым
    //      от директивы, а контекст для вычисления выражения предоставляется компонентом

    // компактный синтаксис использует * (звездочка), если Angular обнаруживает директиву и звездочку, то
    //      элемент помеченный директивой обрабатывается так, словно в документе присутствует элемент template
    //      при этом не требуется вносить изменения в код директивы

    // директива применяется к элементу template, полный синтаксис шаблона:
    //      <template [structureDirectiveOf]="isDirectiveWork">
    //          <table>
    //              ...
    //          </table>
    //      </template>

    // директива применяется к элементу table, компактный синтаксис:
    //      <table *structureDirectiveOf="isDirectiveWork">
    //          ...
    //      </table>

    // --------------- 

    // входное свойство получает результат выражения директивы, значение флага isDirectiveWork: 
    //      [structureDirectiveOf]="isDirectiveWork"
    @Input("structureDirectiveOf")
    expressionResult: boolean;

    constructor(
        // ViewContainerRef представляет размещение элемента template в документе HTML
        private container: ViewContainerRef,
        // TemplateRef представляет содержимое элемента template
        private template: TemplateRef<any>) {
        this.expressionResult = false;
    }

    // реакция на изменения в модели данных, переключение флага isDirectiveWork
    ngOnChanges(changes: { [property: string]: SimpleChange }) {
        console.log(`--- --- --- structural --- ngOnChanges --- expressionResult = ${changes["expressionResult"]}`);
        console.log(`--- --- --- structural --- ngOnChanges --- JSON = ${JSON.stringify(changes)}`);

        let change = changes["expressionResult"];
        if (change) {
            // - в зависимости от результата выражения "structureDirectiveOf" директива создает/уничтожает 
            //      содержимое template, чтобы скрывать/отображать контент следует использовать привязку
            //      стиля со свойствами display или visibility
            if (!change.isFirstChange() && !change.currentValue) {
                // - clear удаляет содержимое элемента template
                this.container.clear();
            } else if (change.currentValue) {
                // - createEmbeddedView отображает содержимое элемента template и добавляет представление 
                //      в контейнер представлений
                // - переменная this.template типа TemplateRef представляет содержимое элемента template,
                //      директива получает TemplateRef через конструктор при создании
                this.container.createEmbeddedView(this.template);
            }
        }
    }
}