// --------------- Контроль загрузки шрифтов.

//      https://fontfaceobserver.com/

function loadProcess(rootElement, loadCrutch) {
    if (loadCrutch.isLoadRoboto === null || loadCrutch.isLoadKurale === null) {
        console.log("--- --- --- --- Был получен результат загрузки только одного из шрифтов.");
    }
    else if (loadCrutch.isLoadRoboto === true && loadCrutch.isLoadKurale === true) {
        rootElement.classList.add("fonts-loaded");
        console.log("--- --- --- --- оба шрифта были загружены: fonts-loaded");
    }
    else {
        rootElement.classList.add("fonts-failed");
        console.log(`--- --- --- --- 
            один из шрифтов не был загружен: fonts-failed,
            шрифт Roboto был загружен: ${loadCrutch.isLoadRoboto},
            шрифт Kurale был загружен: ${loadCrutch.isLoadKurale}
        `);
    }
}

function fontsEventListeners(documentObject, fontRoboto, fontKurale) {

    console.log("--- Контроль загрузки шрифтов.");
    console.log("--- --- documentObject = " + documentObject);
    console.log("--- --- fontRoboto = " + JSON.stringify(fontRoboto));
    console.log("--- --- fontKurale = " + JSON.stringify(fontKurale));

    // 
    let rootElement = document.documentElement;
    let timeout = 2000;
    let loadCrutch = {
        isLoadRoboto: null,
        isLoadKurale: null
    };

    // 
    fontRoboto.load(null, timeout)
        .then(function () {
            console.log("--- --- --- шрифт 'Roboto' загружен --- !!!");
            loadCrutch.isLoadRoboto = true;
            loadProcess(rootElement, loadCrutch);
        })
        .catch(function (e) {
            console.log("--- --- --- ошибка загрузки шрифта 'Roboto' --- !!!");
            loadCrutch.isLoadRoboto = false;
            loadProcess(rootElement, loadCrutch);
        });

    // 
    fontKurale.load(null, timeout)
        .then(function () {
            console.log("--- --- --- шрифт 'Kurale' загружен --- !!!");
            loadCrutch.isLoadKurale = true;
            loadProcess(rootElement, loadCrutch);
        })
        .catch(function (e) {
            console.log("--- --- --- ошибка загрузки шрифта 'Kurale' --- !!!");
            loadCrutch.isLoadKurale = false;
            loadProcess(rootElement, loadCrutch);
        });

    // --------------- далее Promise рабоает, но не загружается шрифт Kurale

    // смотри:
    //      https://angular.io/api/core/NgZone
    //      ZoneAwarePromise

    // ожидает загрузки шрифтов
    //      1. 'вспышка невидимого текста' лучше при быстром соединении
    //      2. 'вспышка нестилизованного текста' лучше при медленном соединении
    Promise.all([fontRoboto.load(null, timeout), fontKurale.load(null, timeout)])
        .then(function () {

            // 1. добавить класс "fonts-loaded", чтобы использовать стилизованный текст
            //      завершает 'вспышку невидимого текста'
            rootElement.classList.add("fonts-loaded");
            console.log("--- --- --- шрифты загружены --- Promise рабоает --- используется класс 'fonts-loaded'");

            // 2. если стилизованный шрифт задан заранее для всей страницы, то сначала произойдет 
            //      'вспышка нестилизованного текста', которая закончится после загрузки шрифта, 
            //      при этом добавлять класс "fonts-loaded" не нужно

        })
        .catch(function (e) {

            // 1. добавить класс "fonts-failed", чтобы использовать резервный стандартный шрифт
            //      что заменит 'вспышку невидимого текста' на 'вспышку нестилизованного текста',
            rootElement.classList.add("fonts-failed");
            console.log("--- --- --- ошибка загрузки шрифта --- используется класс 'fonts-failed'");

            // 2. если шрифт не загрузится, то добавление класса "fonts-failed" предоставит 
            //      резервный шрифт
        });

    //  создать элемент script, не работает в Angular
    //      let script = document.createElement("script");
    //      script.src = "..." + ".js";
    //      script.async = true;
    //      script.onload = function () { 
    //          let roboto = new FontFaceObserver("Roboto");
    //          let kurale = new FontFaceObserver("Kurale");
    //          ...
    //      };
    //      document.head.appendChild(script);
}

window.onload = () => {

    let fontRoboto = new FontFaceObserver('Roboto');
    let fontKurale = new FontFaceObserver('Kurale');
    console.log('--- --- --- this.fontRoboto = ', fontRoboto);
    console.log('--- --- --- this.fontKurale = ', fontKurale);

    fontsEventListeners(document, fontRoboto, fontKurale);
};

// --------------- 12. Шрифты.

// Спецификация:
//      http://www.w3.org/TR/css3-fonts

// Системные шрифты исключают сетевые запросы, загрузку шрифтов и визуальные 
//      переходы при смене шрифтов.

// Веб-шрифты задействуют правило @font-face для задания адреса шрифта, шрифты 
//      предоставляются сервисами: www.typekit.com, www.webtype.com, 
//      fonts.google.com и др.

// Стеки шрифтов позволяют составлять списки предпочтительных шрифтов. Браузер 
//      считывает объявление слева направо, пока не найдет доступный шрифт.
//      font-family: 
//          -apple-system,          // macOS, для Safari
//          BlinkMacSystemFont,     // macOS, для Chrome
//          Roboto,                 // Android
//          Ubuntu,                 // Ubuntu Linux
//          'Segoe UI',             // Windows
//          'Helvetica Neue', Arial, 
//          sans-serif;             // последний вариант это любой шрифт без засечек

// Браузеры могут использовать разные форматы шрифтов. Для Internet Explorer это
//      Embedded OpenType с расширением eot. Для других браузеров это TrueType 
//      с расширением ttf. Существуют шрифты форматов SVG и Web Open Font Format 
//      с расширениями .woff или .woff2. Формат woff2 - это более эффективный
//      способ сжатия информации о шрифте.

// Гарнитурой называется совокупность шрифтов (начертаний) различных вариаций: 
//      обычный, полужирный, курсив и другие.

// --- 12.1 Правило @font-face.

// Правило @font-face делает веб-шрифт доступным в коде CSS, оно ссылается 
//      на шрифты и сообщает браузеру, где получить нужные файлы. Правило 
//      определяет следующие настройки:
//      - font-family задает название шрифта;
//      - src указывает источник шрифта, где функция url указывает источник, а
//          функция format указывает формат шрифта;

//      @font-face {
//          font-family: 'InterRegular';
//          src: 
//              url('../fonts/Inter-Regular.woff2') format('woff2'), 
//              url('Inter-Regular.woff') format('woff');
//          font-weight: normal;
//          font-style: normal;
//          font-display: fallback;
//      }

// Применить шрифт по его названию.
//      .hero-Image {
//          font-family: 'InterRegular', sans-serif;
//      }

// --- 12.2 Контроль загрузки шрифтов.

// Шрифты могут сильно замедлять загрузку страницы, поэтому следует выбирать 
//      только нужные начертания шрифта.

// Если основной шрифт является веб-шрифтом, то рекомендуется загрузить его
//      заранее с помощью link в разделе заголовка, атрибут rel должен указывать
//      на предварительную загрузку.

//      <link rel="preload" 
//          href="fonts/inter.var.woff2" as="font" type="font/woff2" 
//          crossorigin />

// Медленная загрузка шрифта может привести к ряду эффектов в зависимости от обработки 
//      данной ситуации браузером, то есть шрифт не загружен, а разметка с контентом 
//      уже отображается: 
//      - FOUT (flash of unstyled text - вспышка нестилизованного текста) происходит,
//          если браузер заменяет стилизованный шрифт системным;
//      - FOIT (flash of invisible text - вспышки невидимого текста) происходит, если
//          браузер просто скрывает текст до момента загрузки стилизованного шрифта;

// Решением проблемы FOUT/FOIT является контроль загрузки шрифта через JavaScript:
//      Font Face Observer (https://fontfaceobserver.com/).

// --- --- свойство font-display

// Спецификация:
//      https://www.w3.org/TR/css-fonts-4/#font-display-desc

// Свойство font-display позволяет контролировать загрузку шрифтов без JavaScript.

// РЕКОМЕНДАЦИЯ:
//      Для быстрых соединений следует использовать fallback, для медленных swap, 
//      если шрифт не важен optional.

// Перед отображением текста браузер зависает в ожидании завершения загрузки 
//      веб-шрифта. Эта задержка называется вспышкой невидимого текста (FOIT, 
//      flash of invisible text). После загрузки шрифта браузер отобразит текст.

// Если задержка будет слишком заметна, то можно сделать следующее:
// - дождаться загрузки шрифта (несколько секунд или до бесконечности),
//      в этом случае происходит вспышка невидимого текста;
// - сначала отобразить текст системным шрифтом, а затем заменить его 
//      правильным шрифтом, в этом случае происходит вспышка нестилизованного 
//      текста (FOUT, flash of unstyled text).

// Свойство font-display позволяют в некоторой степени контролировать 
//      какой из вариантов будет использоваться.

// Возможные значения:
// - auto       на усмотрение браузера;
// - block      белый экран на срок до 3s, затем используется указанный шрифт;
// - swap       короткий период блокировки на 100ms для загрузки веб-шрифта,
//              на время загрузки используется системный шрифт, FOUT;
// - fallback   сначала текст не видим (100мс), потом используются системные 
//              шрифты, стилизованный текст используется, как только будет загружен ;
// - optional   браузер сам определяет какие шрифты использовать;

// --- 12.3 вариативные шрифты

// Спецификация:
//      https://drafts.csswg.org/css-fonts-4/#introduction

// Вариативный шрифт содержит все нужное для всех размеров в одном файле, 
//      который будет иметь больший размер, чем обычная версия.

// Для работы с вариативным шрифтом используется немного другой синтаксис:
//      - функция format указывает значение 'woff2-variations', которое 
//          сообщает браузеру об использовании вариативного шрифта; 
//      - свойство font-weight указывает диапазон значений, которые
//          может использовать шрифт;
//      - свойство font-style содержит ключевое слово oblique, которое 
//          задает наклонные символы;
//      - свойство font-display сообщает браузеру способ загрузки и отображения 
//          шрифта;
//      @font-face {
//          font-family: 'Inter-V';
//          src: url('fonts/inter.var.woff2') format('woff2-variations');
//          font-weight: 100 900;
//          font-style: oblique 0deg 10deg;
//          font-display: fallback;
//      }

// --- --- оси вариации

// Ось вариации (variation axis) - это определение шкалы допустимых значений
//      для отображения шрифта. Диапазон значений не должен быть огромным и
//      может быть ограничен двумя значениями. 

// Оси вариации делятся на зарегистрированные и пользовательские.

// --- --- зарегистрированные оси

// - Толщина (weight) - насколько тяжелым выглядит текст: 
//      'font-weight: 200'
// - Ширина (width) - насколько узким (сжатым) или разряженным выглядит текст:
//      'font-stretch: 110%'
// - Курсив (italic) - отображается ли шрифт в курсивном начертании или нет:
//      'font-style: italic'
// - Наклон (slant) - изменяет угол наклона текста и не заменяет глифы:
//      'font-style: oblique 4deg'
// - Оптический размер (optical-size) - настройка оптического размера, что 
//      означает изменение глифа в зависимости от его размера для большей 
//      ясности, например, глиф в окне просмотра большого размера может
//      иметь более тонкие линии.

// Свойство font-variation-settings позволяет объединить настройки вариативного 
//      шрифта в одну пару свойство/значение:
//      font-variation-settings: 'wght' 300, 'slnt' -4;

// Спецификация:
//      https://drafts.csswg.org/css-fonts-4/

// --- --- пользовательские оси

// Вариативные шрифты могут иметь собственные оси. Пользовательские оси 
//      записывается в верхнем регистре в отличии от зарегистрированых осей 
//      в настройках вариативного шрифта.

// Шрифт FS Pimlico Glow VF имеет ось GLOW:
//      font-variation-settings: 'GLOW' 500;

// --- --- расширенные свойства шрифтов

// Расширенные свойства представляют собой настройки, которые можно включить 
//      с помощью CSS. Свойство font-feature-settings позволяет применять
//      расширенные свойства.
//      https://rsms.me/inter/lab/?varfont=1.

// Отображать нули со слешем:
//      font-feature-settings: 'zero';

// Чтобы просто включить настройку в стили:
//      font-feature-settings: 'zero' 0;

// Можно вызвать несколько настроек, 'L в нижнем регистре с хвостом' и 
//      'I в верхнем регистре с засечками':
//      font-feature-settings: 'cv08', 'cv05';

// --- 12.4 Текстовые интервалы.

// Свойство line-height и свойство letter-spacing отвечают за интервалы между 
//      строками (вертикальные) и между буквами (горизонтальные).

// Настройка этих свойств может сильно влиять на читабельность текста, при сжатом 
//      тексте строку можно пропустить или прочитать дважды, при растянутом тексте 
//      отдельные буквы привлекают слишком много внимания и требуются дополинтельные 
//      усилия для складывания слов.

// Лучший способ определить интервалы: найти слишком сжатый и разреженный текст,
//      после чего выбрать промежуточное значение.

// Для свойства line-height значение normal составляет примерно 1.2em, обычно 
//      хорошим значением для основного текста является интервал [1.4em, 1.6em],
//      для длинных строк используется большая высота строки, оптимальная длина 
//      строки 45-75 символов.

// Свойство letter-spacing задает расстояние между символами, это значения в сотые
//      доли единицы em.
