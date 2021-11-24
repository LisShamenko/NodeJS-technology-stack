// --------------- доступ к пользовательским свойствам

function setCSSProperty(color) {

    console.log("---------------");

    // - эта техника позволяет применять JavaScript для изменения темы сайта, выделять отдельные 
    //      части страницы или вносить любые другие изменения в реальном времени
    let rootElement = document.documentElement;
    console.log("--- rootElement = ", rootElement);

    // 
    rootElement = document.getElementById("dark_panel");
    console.log("--- dark_panel = ", rootElement);

    // получает объект styles для элемента
    let styles = getComputedStyle(rootElement);
    console.log("--- styles = ", styles);

    // получает значение --main-background-color из объекта styles
    let mainColor = styles.getPropertyValue("--main-background-color");

    // 
    console.log("--- mainColor = ", mainColor);
    console.log("--- mainColor = ", String(mainColor).trim());

    // обновить переменную --main-background-color 
    let colorRegexp = /rgb\((\d{1,3}), (\d{1,3}), (\d{1,3})\)/;
    let match = colorRegexp.exec(color);
    if (match != null) {
        console.log('Red: ' + match[1] + ' Green: ' + match[2] + ' Blue: ' + match[3]);
        rootElement.style.setProperty("--main-background-color", color);
    }
    else {
        rootElement.style.setProperty("--main-background-color", randomColor());
    }
}

function randomColor() {
    return 'rgb(' + random(0, 255) + ', ' + random(0, 255) + ', ' + random(0, 255) + ')';
}

function random(min, max) {
    return Math.floor(Math.random() * (max - min)) + min;
}