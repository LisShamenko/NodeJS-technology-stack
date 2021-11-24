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
    fontRoboto.load(null, timeout).then(function () {
        console.log("--- --- --- шрифт 'Roboto' загружен --- !!!");
        loadCrutch.isLoadRoboto = true;
        loadProcess(rootElement, loadCrutch);
    }).catch(function (e) {
        console.log("--- --- --- ошибка загрузки шрифта 'Roboto' --- !!!");
        loadCrutch.isLoadRoboto = false;
        loadProcess(rootElement, loadCrutch);
    });

    // 
    fontKurale.load(null, timeout).then(function () {
        console.log("--- --- --- шрифт 'Kurale' загружен --- !!!");
        loadCrutch.isLoadKurale = true;
        loadProcess(rootElement, loadCrutch);
    }).catch(function (e) {
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
    Promise.all([
        fontRoboto.load(null, timeout),
        fontKurale.load(null, timeout)
    ]).then(function () {

        // 1. добавить класс "fonts-loaded", чтобы использовать стилизованный текст
        //      завершает 'вспышку невидимого текста'
        rootElement.classList.add("fonts-loaded");
        console.log("--- --- --- шрифты загружены --- Promise рабоает --- используется класс 'fonts-loaded'");

        // 2. если стилизованный шрифт задан заранее для всей страницы, то сначала произойдет 
        //      'вспышка нестилизованного текста', которая закончится после загрузки шрифта, 
        //      при этом добавлять класс "fonts-loaded" не нужно

    }).catch(function (e) {

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