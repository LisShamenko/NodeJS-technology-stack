import { Directive, Input, Output, EventEmitter, SimpleChange, ContentChild, ContentChildren, QueryList } from "@angular/core";
import { DirectiveChild } from "./directive.child";

@Directive({
    // директива будет применяться к элементам table
    selector: "table"
})
export class DirectiveParent {

    // директивы могут взаимодействовать друг с другом через запросы к управляющему элементу
    //      с целью поиска дочерних директив, либо через общий доступ к службам

    @Input("isSetChild")
    isSetChild: Boolean;

    @Input("isSetChildren")
    isSetChildren: Boolean;

    // --------------- @ContentChild

    // - при наличи декоратора @ContentChild, директива запрашивает контент управляющего элемента с целью 
    //      поиска дочерних директив, первая найденная директива присваивается декорированному свойству

    // - директива принимает один или несколько классов директив

    // - можно использовать имена переменных шаблонов, тогда будет найдена первая директива, присвоенная 
    //      указанной переменной, например: @ContentChild("v") найдет директиву, присвоенную 'v'

    // - в запрос можно включить результаты от потомков дочерних директив:
    //      @ContentChild(DirectiveChild, { descendants: true }).

    @ContentChild(DirectiveChild)
    contentChild: DirectiveChild | null;

    // --------------- @ContentChildren

    // - декоратор @ContentChildren находит все объекты директив, соответствующие запросу

    // - результаты запроса предоставляются через объект QueryList

    @ContentChildren(DirectiveChild, { descendants: true })
    contentChildren: QueryList<DirectiveChild> | null;

    // --------------- QueryList

    // length               количество найденных объектов директив
    // first                первый найденный объект директивы
    // last                 последний найденный объект директивы
    // map(function)        эквивалент метода Array.map
    // filter(function)     эквивалент метода Array.filter
    // reduce(function)     эквивалент метода Array.reduce
    // forEach(function)    эквивалент метода Array.forEach
    // some(function)       эквивалент метода Array.some
    // changes              используется для отслеживания результатов изменений

    constructor() {
        this.isSetChild = false;
        this.isSetChildren = false;
        this.contentChild = null;
        this.contentChildren = null;
    }

    ngOnChanges(changes: { [property: string]: SimpleChange }) {
        let change = changes["isSetChild"];
        if (change) {
            // вызвать метод у одной найденной директивы
            if (this.contentChild != null) {
                this.contentChild.setChildClass(change.currentValue);
            }

            // // вызвать метод у всех найденных директив
            // this.updateContentChildren(change.currentValue, 'ngOnChanges');
        }
    }

    private updateContentChildren(isSet: Boolean, space: string) {
        if (this.contentChildren == null) {
            return;
        }

        //console.log(`${space}:
        //    --- parent directive --- updateContentChildren 
        //    --- this.contentChildren = ${this.contentChildren.length}
        //    --- isSet = ${isSet}`);

        if (this.contentChildren != null && isSet != undefined) {
            this.contentChildren.forEach((child, index) => {
                child.setChildClass(index % 2 ? isSet : !isSet);
            });
        }
    }

    // --------------- уведомления об изменениях

    // - результаты запросов @ContentChild и @ContentChildren автоматически обновляются при изменении
    //      контента управляющего элемента (добавление/удаление элементов с дочерними директивами), 
    //      для получения уведомлений следует использовать интерфейс Observable (Reactive Extensions 
    //      Observable), значения свойств устанавливаются после срабатывания ngAfterContentInit, поэтому
    //      следует отправлять уведомления через этот метод

    ngAfterContentInit() {
        if (this.contentChildren == null) {
            return;
        }

        //console.log(`
        //    --- ngAfterContentInit 
        //    --- this.contentChildren = ${this.contentChildren}
        //    --- this.contentChildren.changes = ${this.contentChildren.changes}`);

        // - changes возвращает метод subscribe, через который можно подписаться на изменение 
        //      содержимого QueryList, который содержит директивы найденные @ContentChildren 
        this.contentChildren.changes.subscribe(() => {

            // - setTimeout откладывает выполнение до завершения callback-функции переданной 
            //      subscribe, если не использовать setTimeout, то Angular выдаст ошибку, так 
            //      как директива будет пытаться начать новый цикл обновлений до завершения 
            //      текущего обновления
            setTimeout(() => this.updateContentChildren(this.isSetChildren, 'ngAfterContentInit'), 0);
        });
    }

}
