// --------------- 16. SVG.

// SVG-изображения не зависят от разрешения экрана в отличие от растровых 
//      изображений форматов [JPEG, GIF, PNG], а также имеют намного меньший 
//      размер файла.

// SVG - это язык описания двухмерной графики в XML. SVG позволяет создавать 
//      три типа графических объектов: фигуры векторной графики, изображения и 
//      текст. 

// Графические объекты в файлах SVG представлены в виде векторных точек. Векторы 
//      задаются с помощью относительных величин, их можно масштабировать 
//      без потери качества до любых размеров. Благодаря векторам размер файла
//      SVG получается гораздо меньше, чем файлы форматов [JPEG, GIF, PNG].

// Проверка:
//      https://caniuse.com/?search=svg

// --- 16.1 Элементы SVG.

//      <?xml version="1.0" encoding="UTF-8" standalone="no"?>
//      <svg
//          width="198px"
//          height="188px"
//          viewBox="0 0 198 188"
//          version="1.1"
//          xmlns="http://www.w3.org/2000/svg"
//          xmlns:xlink="http://www.w3.org/1999/xlink"
//          xmlns:sketch="http://www.bohemiancoding.com/sketch/ns">
//
//          <!-- Generator: Sketch 3.2.2 (9983) - http://www.bohemiancoding.com/sketch -->
//
//          <title>Star 1</title>
//
//          <desc>Created with Sketch.</desc>
//
//          <defs></defs>
//
//          <g
//              id="Page-1"
//              stroke="none"
//              stroke-width="1"
//              fill="none"
//              fill-rule="evenodd"
//              sketch:type="MSPage">
//              <polygon
//                  id="Star-1"
//                  stroke="#979797"
//                  stroke-width="3"
//                  fill="#F8E81C"
//                  sketch:type="MSShapeGroup"
//                  points="99 154 40.2214748 184.901699 51.4471742 119.45085 3.89434837
//                  73.0983006 69.6107374 63.5491503 99 4 128.389263 63.5491503 194.105652
//                  73.0983006 146.552826 119.45085 157.778525 184.901699 ">
//              </polygon>
//          </g>
//      </svg>

// Корневой элемент svg содержит атрибуты: ширина (width), высота (height) и 
//      область просмотра (viewBox). 

// Область просмотра - это область экрана устройства, на которой просматривается 
//      содержимое. Фактически атрибуты width и height создают окно просмотра,
//      в котором отображаются фигуры, определенные внутри SVG. Если содержимое 
//      SVG выходит за рамки окна просмотра, то часть содержимого не будет видна.

// Атрибут viewbox определяет систему координат для управления всеми фигурами SVG.
//      Атрибут определяет четыре значения: min-x и min-y определяют левый 
//      верхний угол, еще два значения определяют ширину и высоту. Атрибут viewbox
//      позволяет увеличивать или уменьшать изображение. 

//      https://jenkov.com/tutorials/svg/svg-viewport-view-box.html

// Если атрибут viewbox уменьшит наполовину параметры ширины и высоты, то фигура 
//      уменьшится, чтобы поместиться в рамках SVG-параметров width и height.
//      <svg 
//          width="198px" 
//          height="188px" 
//          viewBox="0 0 99 94"

// Дополнительное пространство имен предназначено исключительно для программы, 
//      которая сгенерировала SVG. Если SVG используется в веб-приложении, то
//      ссылка на дополнительное пространство имен становится не нужна и 
//      удаляется для оптимизации размера SVG-графики.
//      xmlns:sketch="http://www.bohemiancoding.com/sketch/ns"

// Теги title и desc повышают доступность SVG-документа. Их можно использовать 
//      для описания содержимого графики, когда его невозможно просмотреть. 
//      Но если SVG-графика используется в качестве фоновой, то их можно убрать, 
//      чтобы уменьшить размер файла.
//      <title>Star 1</title>
//      <desc>Created with Sketch.</desc>

// Тег defs используется для хранения определений любого повторно используемого 
//      содержимого.
//      <defs></defs>

// Элемент g позволяет группировать элементы. 

// Элемент polygon - это фигура SVG. В SVG есть ряд готовых к использованию 
//      фигур: path, rect, circle, ellipse, line, polyline, polygon.

// SVG-пути составляются из любого количества соединяемых точек, позволяя 
//      создать любую фигуру.

// --- 16.2 Вставка SVG на страницу.

// Диапазон возможностей SVG зависит от способа вставки файла SVG на страницу.

// --- --- тег img

// Добавить SVG-графику на страницу можно с помощью тега img. SVG-изображение 
//      будет вести себя практически так же, как и любое другое изображение.
//      <img src="mySconeVector.svg" alt="Amazing line art of a scone" />

// --- --- тег object

// Спецификация:
//      https://html.spec.whatwg.org/multipage/embedded-content.html#the-objectelement

// Тег object позволяет вставить SVG-графики. W3C рекомендует использовать этот тег
//      для содержимого веб-страницы, которое не имеет отношения к HTML. Тег содержит
//      атрибуты:
//      - data содержит ссылку на внешний SVG ресурс;
//      - type указывает описание MIME-типа, соответствующего содержимому,
//          тип 'image/svg+xml' обозначает данные в формате SVG;
//      - width/height позволяют ограничить размер SVG в пределах контейнера;

// Тег object делает SVG-графику доступной в коде JavaScript, что является 
//      аргументом в пользу этого тега. 

// Тег object может содержать сообщение, которое будет выводится, если браузер 
//      не поддерживает SVG-графику. Вместо текста можно вставить альтернативное 
//      изображение с помощью тега img, но изображение будет загружаться всегда, 
//      независимо от его надобности.

//      <object data="img/svgfile.svg" type="image/svg+xml">
//          <span class="fallback-info">Your browser doesn't support SVG</span>
//      </object>

// --- --- свойство background-image

// SVG-графику можно сделать фоновым изображением с помощью свойства 
//      background-image. 
//      .item {
//          background-image: url('image.svg');
//      }

// Чтобы обеспечить поддержку устаревших браузеров, не поддерживающих SVG 
//      следует использовать запросы возможностей @supports. 
//      .item {
//          background-image: url('image.png');
//      }
//      /* fill является свойством SVG */
//      @supports (fill: black) {
//          .item {
//              background-image: url('image.svg');
//          }
//      }

// Рекомендуется внедрять SVG-графику в качестве фоновых изображений, поскольку
//      этот способ использования SVG-графики широко поддерживается и просто 
//      реализуется, а также SVG-изображения неплохо кэшируются.

// --- --- URI-идентификаторы

// URI (uniform resource identifier) - унифицированный идентификатор ресурса,
//      указывает на ресурс, который должен быть включен в CSS-файл.
//      .external {
//          background-image: url('Star.svg');
//      }

// Изображение можно включить напрямую в состав таблицы стилей, что избавляет
//      от лишнего сетевого запроса. При таком способе кодирования SVG-графики
//      не рекомендуется пользоваться методом base64, поскольку SVG-содержимое 
//      не сжимается им так же хорошо, как текст.
//      .data-uri {
//          background-image: url(data:image/svg+xml,...двоичные данные...);
//      }

// --- --- вставка напрямую в HTML

// Если требуется анимировать SVG-графику или управлять ее через JavaScript, то
//      лучше делать вставку SVG данных непосредственно в код HTML.
//      https://benfrain.com/image-sprites-data-uris-icon-fonts-v-svgs/

// Элемент svg не нуждается в особом контейнере. SVG-разметка вставляется 
//      в саму разметку HTML.

//      <div>
//          <span class="inlineSVG">
//              <svg id="svgInline" width="198" height="188" viewBox="0 0 198 188" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
//                  <title>Star 1</title>
//                  <g class="star_Wrapper" fill="none" fill-rule="evenodd">
//                      <path id="star_Path" stroke="#979797" strokewidth="3" fill="#F8E81C" d="M99 154l-58.78 30.902 11.227-65.45L3.894 73.097l65.717-9.55L99 4l29.39 59.55 65.716 9.548-47.553 46.353 11.226 65.452z" />
//                  </g>
//              </svg>
//          </span>
//      </div>

// --- 16.3 Повторное использование SVG.

// Благодаря значениям атрибутов [display, width, height] SVG-графика не занимает 
//      никакого пространства. Эти же стили могут быть установлены в таблице CSS.
//      SVG-элемент используется для размещения символов графических объектов, 
//      которые могут использоваться в других местах.

// Элемент symbol используется при определении фигуры для повторного применения.
//      <svg display="none" width="0" height="0" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
//          <defs>
//              <symbol id="icon-drag-left-right" viewBox="0 0 1344 1024">
//              <title>drag-left-right</title>
//              <path class="path1" d="M256 192v-160l-224 224 224 224v-160h256v-128z"></path>

// Элемент use позволяет повторно использовать графические объекты SVG, которые 
//      уже были где-то определены. Атрибут xlink ссылается на идентификатор 
//      повторно отображаемого символа. 
//      <svg class="icon-drag-left-right">
//          <use xlink:href="#icon-drag-left-right"></use>
//      </svg>

// По умолчанию ширина и высота символа будут равны 100%. Для изменения размеров 
//      символа можно применить правила.
//      .icon-drag-left-right {
//          width: 2.5rem;
//          height: 2.5rem;
//      }

// --- --- разные цвета в разных контекстах

// Можно изменить цвет на основе контекста. Это полезно, если требуется иметь 
//      несколько версий одного значка в различных цветовых решениях.
//      .icon-drag-left-right {
//          fill: #f90;
//      }
//      .different-context .icon-drag-left-right {
//          fill: #ddd;
//      }

// Создание двухтональных значков, наследующих цвет от родителей.
//      .icon-drag-left-right {
//          width: 2.5rem;
//          height: 2.5rem;
//          /* 
//           * значение заливки fill получат пути в SVG-символе, у которых 
//           *      нет атрибута fill со значением currentColor
//           */
//          fill: #f90;
//          /* 
//           * это значение получат пути в SVG-символе, у которых 
//           *      атрибут fill имеет значение currentColor
//           */
//          color: #ccc; 
//      }

// --- --- изменение цвета с помощью пользовательских свойств

// Пользовательские свойства CSS наиболее эффективный способ изменения цвета
//      SVG-изображения. Недостатком этого подхода является необходимость 
//      включать одинаковые SVG-данные в страницы, где они нужны. Это отрицательно 
//      влияет на производительность, поскольку непосредственные SVG-данные 
//      трудно поддаются кэшированию. 

// SVG с двумя элементами path, у которых установлены атрибуты fill и stroke. 
//      <svg class="shape" width="268" height="254" xmlns="http://www.w3.org/2000/svg">
//          <g fill="none" fill-rule="evenodd" stroke-width="10">
//              <path stroke="var(--stroke1)" fill="var(--fill1)" d="M134 6.18L6.73 98.647l48.613 149.615h157.314L261.27 98.647 134 6.18z" />
//              <path stroke="var(--stroke2)" fill="var(--fill2)" d="M134 36.18l-98.738 71.738 37.714 116.074h122.048l37.714-116.074L134 36.18z" />
//          </g>
//      </svg>

// Для каждого элемента path устанавливаются значения stroke и fill при помощи
//      пользовательских свойств CSS. Имея эти значения можно установить цвета
//      SVG-изображения с помощью CSS или JavaScript.
//      .shape {
//          display: block;
//          --stroke1: #ddd;
//          --fill1: #444;
//          --stroke2: #f90;
//          --fill2: #663d00;
//      }
//      .shape:hover {
//          --stroke1: #333;
//          --fill1: #444;
//          --stroke2: #fff;
//          --fill2: #ffc266;
//      }

// --- --- повторное использование внешних SVG

//      https://github.com/jonathantneal/svg4everybody

// Вместо вставки SVG-символов в каждую страницу, с помощью элемента use 
//      можно создать ссылку на внешний SVG-файл. 

// Значение href ссылается на внешний SVG-файл (defs.svg) и указывает 
//      идентификатор символа (#icon-drag-left-right) внутри этого файла. 
//      Загружаемый SVG-файл будет кэшироваться браузером, а разметка 
//      не будет засоряться SVG-данными. Но при таком подходе динамические 
//      изменения, вносимые в defs.svg с помощью JavaScript, в элементах 
//      use обновляться не будут.

//      <svg class="icon-drag-left-right">
//          <use xlink:href="defs.svg#icon-drag-left-right"></use>
//      </svg>

// --- 16.4 Способы вставки SVG-данных.

// SVG-ресурсы могут вести себя по-разному в зависимости от способа 
//      их вставки на страницу:
//      - внутрь тега img;
//      - внутрь тега object;
//      - в качестве фонового изображения;
//      - непосредственно в код страницы.

//                  Способ установки определяет возможности. 
//                  ╭──────────────────────────────────────╮
//                  │      в качестве фонового изображения │
//                  │ непосредственно в код страницы │  .  │
//                  │       внутрь тега object │  .  │  .  │
//                  │    внутрь тега img │  .  │  .  │  .  │
//      ╭───────────┴──────────────╮  ↓  │  ↓  │  ↓  │  ↓  │
//      │ SMIL                     │ Да  │ Да  │ Да  │ Да  │
//      │ Внешняя CSS-таблица      │ Нет │  1  │ Да  │ Нет │
//      │ Внутренний CSS-код       │ Да  │ Да  │ Да  │ Да  │
//      │ Доступ к коду JavaScript │ Нет │ Да  │ Да  │ Нет │
//      │ Кэшируемость             │ Да  │ Да  │  2  │ Да  │
//      │ Медиазапрос в SVG        │ Да  │ Да  │  3  │ Да  │
//      │ Повторное использование  │ Нет │ Да  │ Да  │ Нет │
//      ╰──────────────────────────┴─────┴─────┴─────┴─────╯
//      Примечания:
//      1. Внешнюю таблицу стилей для оформления SVG использовать можно, 
//          но ссылку на таблицу нужно сделать из кода SVG.
//      2. Можно использовать ссылку на внешний SVG-файл, который будет 
//          кэшироваться, но ссылка не работает в Internet Explorer.
//      3. Медиазапрос внутри раздела стилей SVG-графики работает в отношении
//          размера документа, в котором он находится, а не в отношении 
//          размера самой SVG-графики.

// Наличие свойств в этой таблице еще не означает, что они реализованы 
//      в каждом браузере или работают везде одинаково!

// --- --- Internet Explorer / SVG

// Работа SVG в Internet Explorer отличается от других браузеров.

// Во всех версиях Internet Explorer, совместимых с SVG-графикой, отсутствует
//      возможность ссылаться на внешние SVG-источники. 

// Internet Explorer применяет стили из внешних таблиц стилей к SVG-объектам 
//      вне зависимости от способа их вставки. Другие браузеры применяют стили 
//      из внешних таблиц стилей к SVG-объектам, если они вставлены в элемент 
//      object или непосредственно в код страницы. 

// Internet Explorer не позволяет применять к SVG анимационные эффекты с помощью
//      кода CSS, поэтому анимация SVG в этом браузере реализуется через JavaScript.

// --- 16.5 Дополнительные возможности SVG.

// SVG-графика всегда выводится на экран с максимально допустимой 
//      для устройства резкостью. 

// --- --- SMIL-анимация

// Спецификация:
//      https://www.w3.org/TR/smil-animation/

// Internet Explorer не поддерживает SMIL. Chrome отложил отказ от SMIL.
//      Теоретически SMIL можно использовать, но поддержка этого механизма
//      сильно ограничена.

// SMIL (synchronized multimedia integration language) - это способ создания 
//      анимации для SVG-графики.

// Элемент g включает фигуру звезды и SMIL-анимацию внутри элемента animate. 
//      Анимация меняет цвет звезды с желтого на зеленый в течение 2s.
//      <g class="star_Wrapper" fill="none" fill-rule="evenodd">
//          <animate
//              xlink:href="#star_Path"
//              attributeName="fill"
//              attributeType="XML"
//              begin="0s"
//              dur="2s"
//              fill="freeze"
//              from="#F8E81C"
//              to="#14805e" />
//          <path
//              id="star_Path"
//              stroke="#979797"
//              stroke-width="3"
//              fill="#F8E81C"
//              d="M99 154l-58.78 30.902 11.227-65.45L3.894 73.097l65.717-9.55L99 4l29.39 59.55 65.716 9.548-47.553 46.353 11.226 65.452z" />
//      </g>

// Tweening (inbetweening) - это переходное состояние между двумя позициями анимации.

// --- --- внешние стили SVG 

// Спецификация:
//      https://www.w3.org/TR/SVG/styling.html#ReferencingExternalStyleSheets

// Задать стиль SVG-документа можно с помощью кода CSS, который может быть 
//      размещен в самом документе или во внешней таблице стилей. Такая 
//      возможность существует, если SVG интегрируется через тег object или 
//      непосредственно в код страницы.

// Для создания ссылки на внешнюю таблицу стилей внутри SVG-документа 
//      существует два варианта. Рекомендуется второй вариант, поскольку 
//      только этот вариант поддерживается Internet Explorer.

// - можно поместить следующий фрагмент кода в раздел заголовка:
//      <link href="styles.css" type="text/css" rel="stylesheet"/>

// - можно добавить следующую строку кода выше открывающего SVG-элемента:
//      <?xml-stylesheet href="styles.css" type="text/css"?>
//      <svg width="198" height="188" viewBox="0 0 198 188" ... ></svg>

// --- --- внутрение стили SVG 

// Стили можно поместить в элемент defs внутри SVG-документа. Для надежности 
//      следует добавить маркер Character Data (CDATA), который сообщает 
//      браузеру, что информация не должна быть истолкована как XML-разметка. 
//      <defs>
//          <style type="text/css">
//              <![CDATA[
//                  #star_Path {
//                      stroke: red;
//                  }
//              ]]>
//          </style>
//      </defs>

// --- 16.6 Анимация SVG с помощью CSS.

// По умолчанию исходная точка преобразования в SVG не устанавливается как 50% 50% 
//      (по центру обеих осей), а имеет значение 0 0 (в левом верхнем углу). 

// --- 16.7 Анимация SVG с помощью JavaScript.

// С SVG-графикой можно работать через JavaScript, если она вставлена в тег 
//      object или встроена напрямую в код страницы. В коде можно изменить класс 
//      элемента svg или его родительского элемента. 

// Следующий CSS-код инициирует запуск анимации.
//      svg {
//          /* нет анимации */
//      }
//      .added-with-js svg {
//          /* есть анимация */
//      }

// Анимацию к SVG-графике можно применить с помощью JavaScript: вручную или
//      с применением библиотек анимации:
//      - GreenSock (http://greensock.com)
//      - Velocity.js (http://julian.com/research/velocity/)
//      - Snap.svg (http://snapsvg.io/)

// --- 16.8 Оптимизация SVG.

// SVGO 
//      https://github.com/svg/svgo

// SVGOMG
//      https://jakearchibald.github.io/svgomg/

// Iconizr, перед созданием ресурса прогоняет SVG-файл через SVGO для его оптимизации.
//      http://iconizr.com/ 

// --- 16.9 SVG-фильтры.

// Внутри фильтра сначала задается поворот тона с помощью фильтра feColorMatrix, 
//      результат которого передается следующему фильтру через атрибут result. 
//      Затем применяется размытие с помощью фильтра feGaussianBlur.
//      <svg xmlns="http://www.w3.org/2000/svg" version="1.1">
//          <defs>
//              <filter id="myfilter" x="0" y="0">
//                  <feColorMatrix in="SourceGraphic" type="hueRotate" values="90" result="A" />
//                  <feGaussianBlur in="A" stdDeviation="6" />
//              </filter>
//          </defs>
//      </svg>

// На SVG-разметку можно сослаться при помощи следующего синтаксиса. Но этот 
//      метод не работает в Internet Explorer 10 и 11. 
//      <img class="svg-filter" src="queen@2x-1024x747.png" />
//      .svg-filter {
//          filter: url('star_svg.svg#myfilter');
//      }

// Для поддержки Internet Explorer можно использовать элемент image, чтобы включить
//      изображение в документ SVG. Изображение, к которому должен применяться 
//      фильтр, является единственным содержимым SVG-документа кроме элемента defs. 
//      Для ссылки на фильтр используется атрибут filter с идентификатором нужного 
//      фильтра.

//      <svg height="747px" width="1024px" viewBox="0 0 1024 747" xmlns="http://www.w3.org/2000/svg" version="1.1" >
//          <defs>
//              <filter id="myfilter" x="0" y="0">
//                  <feColorMatrix in="SourceGraphic" type="hueRotate" values="90" result="A" />
//                  <feGaussianBlur in="A" stdDeviation="6" />
//              </filter>
//          </defs>
//          <image x="0" y="0" height="747px" width="1024px"
//              xmlns:xlink="http://www.w3.org/1999/xlink"
//              xlink:href="queen@2x-1024x747.png"
//              filter="url(#myfilter)">
//          </image>
//      </svg>

// --- 16.10 Медиазапросы внутри SVG.

// Все браузеры, понимающие SVG-документы, должны учитывать определяемые
//      внутри этих документов медиазапросы CSS.

//      <style type="text/css"><![CDATA[
//          #star_Path {
//              stroke: red;
//          }
//          @media (min-width: 800px) {
//              #star_Path {
//                  stroke: violet;
//              }
//          }
//      ]]></style>

// Внутренний медиазпрос указывает, что обводка звезды по контуру будет violet 
//      при ширине экрана не меньше 800 px. Но когда SVG помещается на страницу 
//      с помощью [img, object, background], то медиазапрос будет относится 
//      к элементу SVG, а не HTML-документу, в который он помещен. Это означает,
//      что min-width определяет минимальную ширину самой SVG-графики. Поэтому 
//      SVG-фигура отобразится без лиловой обводки на странице шириной не менее 
//      800 px.

// Если SVG-документ вставляется непосредственно в код страницы, то он сливается 
//      с окружающим HTML, поэтому медиазапрос будет относится к окну просмотра
//      браузера, а не к SVG. 

// Чтобы заставить медиазапрос внутри SVG вести себя всегда одинаково следует
//      использовать медиасвойство 'min-device-width'. Независимо от размера 
//      SVG-графики и способа ее вставки на страницу будет учитываться ширина 
//      области просмотра устройства.
//      @media (min-device-width: 800px) {
//          #star_Path {
//              stroke: violet;
//          }
//      }

// --- 16.11 Советы по внедрению

// Если не требуется добавлять анимацию к SVG, то можно использовать тег img или 
//      свойство background-image. Это позволяет указать альтернативные ресурсы, 
//      которые обеспечат лучшую производительность.

// Следует автоматизировать как можно больше шагов по созданию svg, что снизит 
//      количество ошибок и даст более предсказуемый результат.

// Для вставки в проект статичных SVG-объектов следует выбрать только один способ:
//      тег img, свойство background-image или внедрение напрямую в код HTML. 
//      Использование разных способов загрузки ресурсов может приводить 
//      к путанице и усложняет поддержку.

// Универсального варианта SVG-анимации нет. Для простых эффектов анимации
//      следует использовать CSS. Для сложных эффектов анимации, которые
//      должны работать в Internet Explorer следует использовать библиотеки
//      анимации: GreenSock, Velocity.js, Snap.svg.