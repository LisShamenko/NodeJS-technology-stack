function positionOverlayEventListeners() {

    console.log('--- positionOverlayEventListeners()');

    //
    let rootElement = document.documentElement;
    console.log('--- --- rootElement = ', rootElement);

    // поиск по id относительно документа
    positionOverlay = document.getElementById("position_overlay");
    console.log('--- --- positionOverlay = ', positionOverlay);

    // поиск по классу относительно компонента
    let modalArray = positionOverlay.getElementsByClassName('modal');
    console.log('--- --- modalArray = ', modalArray);

    // поиск по селектору относительно компонента
    let modal = positionOverlay.querySelector('[id=modal]');
    let button = positionOverlay.querySelector('[id=open]');
    let close = positionOverlay.querySelector('[id=close]');

    // 
    console.log('--- --- modal = ', modal);
    console.log('--- --- button = ', button);
    console.log('--- --- close = ', close);

    // 
    button.addEventListener('click', function (event) {
        console.log('--- button addEventListener');
        event.preventDefault();
        // чтобы показать окно устанавливается 'display: block'
        modal.style.display = 'block';
    });

    // 
    close.addEventListener('click', function (event) {
        console.log('--- click addEventListener');
        event.preventDefault();
        // чтобы скрыть окно устанавливается 'display: block'
        modal.style.display = 'none';
    });
}

window.onload = positionOverlayEventListeners;

// --------------- 7. Виды позиционирования.

// Статическое, фиксированное, абсолютное, относительное, липкое.

// --- 7.1 Фиксированное позиционирование.

// Фиксированное позиционирование позволяет определять положение элемента 
//      в области просмотра.

// Элемент относительно которого выполняется позиционирование называется содержащий 
//      блок (containing block). Фиксированное позиционирование определяет положение 
//      элемента в области просмотра. Абсолютное позиционирование определяет положение 
//      элемента на основе ближайшего позиционированного родительского элемента.

// Свойство 'position: static' определяет статическое позиционирование.

// Свойство 'position: fixed' позиционирует элемент в области просмотра. Свойства 
//      [top, right, bottom, left] задают растояния от сторон области просмотра и 
//      ширину элемента. Если указать не все свойства, то для указания ширины и 
//      высоты элемента можно использовать width/height:
//          position: fixed;
//          top: 1em;
//          right: 1em;
//          width: 20%
//              свойства bottom и height не указаны, поэтому высота элемента 
//              определяется его контентом

// Модальное окно скрывается с помощью свойства 'display: none', а отображается 
//      через свойство 'display: block'.

// Чтобы позиционированные панели не перекрывали контент следует добавить к панеле 
//      отступы свойством 'right-margin: 20%'.

// --- 7.2 Абсолютное позиционирование.

// Абсолютное позиционирование определяет положение элемента относительно ближайшего 
//      позиционированного родительского элемента. Обычно containing block является 
//      предком элемента, в противном случае будет выполнен поиск containing block 
//      вверх по иерархии DOM. Если containing block не будет найден, то используется 
//      начальный containing block по размерам равный области просмотра.

// --- 7.3 Относительное позиционирование.

// Относительное позиционирование применяется к элементу при помощи свойства 
//      'position: relative'. Свойства [top или bottom, right или left] перемещают 
//      элемент из исходного положения, но не изменяют ширину и высоту элемента, как 
//      при фиксированном позиционировании. Элемент будет перекрывать элементы, 
//      расположенные ниже его.

// --- 7.4 z-индекс.

// Позиционированные элементы могут перекрывать друг друга.

// Дерево визуализации определяет порядок отрисовки элементов, показывает внешний 
//      вид и позицию каждого элемента. Порядок отрисовки определяется порядком 
//      указания элементов в HTML-коде, сначала отрисовываются непозиционированные 
//      элементы, затем позиционированные.

// Относительное позиционирование зависит от документа, абсолютное позиционирование 
//      зависит от его позиционированного элемента-предка.

// Свойство z-index задает порядок отображения элементов. Элементы с большим значением 
//      появляются выше элементов с меньшим, элементы с отрицательным значением 
//      появляются позади статических элементов.

// Свойство z-index работает только с позиционированными элементами, а не статическими.

// --- 7.5 Контексты наложения.

// Контекст наложения - это группа элементов отображаемых вместе.

// Корень контекста наложения - это позиционированный элемент к которому применяется 
//      свойство z-index. Дочерине элементы являются частью контекста наложения, 
//      который соотвествует корню. Элементы контекста наложения рисуются вместе, 
//      то есть элемент вне контекста не может быть отрисован между элементами 
//      входящими в этот контекст.

// Контекст наложения создается свойствами: opacity со значением меньше 1, transform, 
//      filter, z-index.

// Контекст наложения определяет какие элементы находятся поверх других, а блочные 
//      контексты форматирования связаны с потоком документа и определяют перекрытие 
//      элементов.

// Порядок размещения элементов в контексте наложения:
//      - корневой элемент
//      - позиционированные элементы (вместе с дочерними) со свойством z-index меньше 0
//      - непозиционированные элементы
//      - позиционированные элементы (вместе с дочерними) со свойством 'z-index: auto'
//      - позиционированные элементы (вместе с дочерними) со свойством z-index больше 0

// --- 7.6 Липкое позиционирование.

// Липкое позиционирование - это гибрид между относительным и фиксированным 
//      позиционированием. Элемент фиксируется на экране при прокрутке пока 
//      не достигнет определенной позиции, после чего разблокируется. Липкий 
//      элемент всегда находится в пределах своего родительского элемента.