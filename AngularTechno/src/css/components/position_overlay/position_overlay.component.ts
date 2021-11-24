import { Component } from "@angular/core";

declare function setEventListeners(): any;

@Component({
    selector: "position-overlay-component",
    templateUrl: "./position_overlay.template.html",
    styleUrls: ["./position_overlay.style.css"],
})
export class PositionOverlayComponent {
    ngOnInit() {
        setEventListeners();
    }
}

// ---------------

// виды позиционирования: статическое, фиксированное, абсолютное, относительное, липкое

// --------------- Фиксированное позиционирование

// - фиксированное позиционирование позволяет определять положение элемента в области просмотра

// - элемент относительно которого выполняется позиционирование называется содержащий блок (containing block),
//      Фиксированное позиционирование: область просмотра
//      абсолютное позиционирование: ближайший позиционированный родительский элемент

// - 'position: static' определяет статическое позиционирование 
// - 'position: fixed' позиционирует элемент в области просмотра, свойства [top, right, bottom, left]
//      задают растояния от сторон области просмотра и ширину элемента, если указать не все свойства, то 
//      для указания ширины и высоты элемента можно использовать width/height:
//          position: fixed;
//          top: 1em;
//          right: 1em;
//          width: 20%
//          свойства bottom и height не указаны, поэтому высота элемента определяется его контентом

// - модальное окно скрывается с помощью свойства 'display: none', а отображается 'display: block'

// - чтобы позиционированные панели не перекрывали контент следует добавить к панеле отступы 
//      свойством 'right-margin: 20%'

// --------------- Абсолютное позиционирование

// абсолютное позиционирование определяет положение элемента относительно ближайшего позиционированного 
//      родительского элемента, обычно containing block является предком элемента, в противном случае
//      будет выполнен поиск containing block вверх по иерархии DOM, если containing block не будет
//      найден, то используется начальный containing block по размерам равный области просмотра 

// --------------- Относительное позиционирование

// - относительное позиционирование применяется к элементу при помощи свойства 'position: relative', 
//      свойства [top или bottom, right или left] перемещает элемент из исходного положения, но не изменяют
//      ширину и высоту элемента, как при фиксированном позиционировании, элемент будет перекрывать элементы, 
//      расположенные ниже его

// --------------- z-индекс

// - позиционированные элементы могут перекрывать друг друга

// - дерево визуализации определяет порядок отрисовки элементов, показывает внешний вид и позицию каждого элемента
//      порядок отрисовки определяется порядком указания элементов в HTML-коде, сначала отрисовываются 
//      непозиционированные элементы, затем позиционированные

// - относительное позиционирование зависит от документа, абсолютное позиционирование зависит от его 
//      позиционированного элемента-предка

// - свойство z-index задает порядок отображения элементов, элементы с большим значением появляются выше элементов с
//      меньшим, элементы с отрицательным значением появляются позади статических элементов

// - свойство z-index работает только с позиционированными элементами, а не статическими

// --------------- Контексты наложения

// контекст наложения - это группа элементов отображаемых вместе
// корень контекста наложения - это позиционированный элемент к которому применяется свойство z-index, 
//      дочерине элементы являются частью контекста наложения, который соотвествует корню, элементы 
//      контекста наложения рисуются вместе, то есть элемент вне контекста не может быть отрисован
//      между элементами входящими в этот контекст

// - контекст наложения создается свойствами: opacity со значением меньше 1, transform, filter, z-index

// - контекст наложения определяет какие элементы находятся поверх других, а блочные контексты форматирования 
//      связаны с потоком документа и определяют перекрытие элементов

// - порядок размещения элементов в контексте наложения:
//      - корневой элемент
//      - позиционированные элементы (вместе с дочерними) со свойством z-index меньше 0
//      - непозиционированные элементы.
//      - позиционированные элементы (вместе с дочерними) со свойством 'z-index: auto'
//      - позиционированные элементы (вместе с дочерними) со свойством z-index больше 0

// --------------- Липкое позиционирование

// липкое позиционирование - это гибрид между относительным и фиксированным позиционированием, 
//      элемент фиксируется на экране при прокрутке пока не достигнет определенной позиции, 
//      после чего разблокируется, липкий элемент всегда находится в пределах своего 
//      родительского элемента