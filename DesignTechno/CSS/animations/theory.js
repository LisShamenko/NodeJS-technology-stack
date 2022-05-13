// --------------- отображение/сокрытие меню

function animationsEventListeners() {

    /* --------------- Добавление класса is-loading при нажатии кнопки. */

    var input = document.getElementById('trip');
    var button = document.getElementById('submit-button');

    /*
     * нажатие кнопки 'Сохранить' останавливает обычный процесс отправки формы, что 
     * позволяет пользователю оставаться на странице, пока приложение отправляет форму
     */

    // этот код обеспечивает отправку данных формы с помощью JavaScript
    button.addEventListener('click', function (event) {
        // предотвращение отправки данных формы
        event.preventDefault();
        // отображение вращающегося значка загрузки
        button.classList.add('is-loading');
        // отключается возможность ввода данных
        button.disabled = true;
        input.disabled = true;
    });

    /* --------------- Добавление класса shake после односекундной задержки. */

    var input = document.getElementById('trip');
    var button = document.getElementById('submit-button');

    // переменная на которую будет ссылаться тайм-аут
    var timeout = null;

    button.addEventListener('click', function (event) {
        event.preventDefault();

        // отмена текущего тайм-аута (если есть)
        clearTimeout(timeout);
        button.classList.add('is-loading');
        button.disabled = true;
        input.disabled = true;

        // возврат к нормальному состоянию
        setTimeout(function () {
            button.classList.remove('is-loading');
            button.disabled = false;
            input.disabled = false;
        }, 1000);
    });

    // запуск анимации при помощи JavaScript, когда пользоватлеь вводит символ
    input.addEventListener('keyup', function () {
        // отмена текущего тайм-аута
        clearTimeout(timeout);
        // добавление класса shake после односекундной задержки, переменная тайм-аут будет 
        //      сбрасываться, если интервал между нажатиями пользователя будет меньше 1 секунды
        timeout = setTimeout(function () {
            button.classList.add('shake');
        }, 1000);
    });

    // удаление класса shake по окончании анимации
    button.addEventListener('animationend', function () {
        // API-для взаимодействия с CSS-анимацией, animationend:
        //      https://developer.mozilla.org/ru/docs/Web/API/Animation
        button.classList.remove('shake');
    });

    /* --------------- Сброс анимации. */

    var mainFlyinGrid = document.getElementById('main-flyin-grid');
    var startAnimation = document.getElementById('start-animation');

    startAnimation.addEventListener('click', function (event) {
        event.preventDefault();

        // удалить класс запускающий анимацию
        for (let i = 0; i < mainFlyinGrid.children.length; i++) {
            const child = mainFlyinGrid.children[i];
            child.classList.remove('flyin-grid__item');
        }

        // добавить класс запускающий анимацию
        setTimeout(function () {
            for (let i = 0; i < mainFlyinGrid.children.length; i++) {
                const child = mainFlyinGrid.children[i];
                child.classList.add('flyin-grid__item');
            }
        }, 1000);
    });
}

window.onload = animationsEventListeners;

// --------------- 15. Animations.

// --- 15.1 Ключевые кадры.

// Спецификация:
//      https://www.w3.org/TR/css-animations-1/#keyframes

// Анимация состоит из ключевых кадров, в которых элементы принимают определенные
//      положения. Браузер выполняет интерполяцию между ключевыми кадрами, так что 
//      движение выглядит плавным. 

// Анимация состоит из двух частей: набора ключевых кадров внутри @keyframes и 
//      анимации этого набора при помощи свойства animation.

// Правило @keyframes определяет имя анимации и описывает действия, которые 
//      будут выполняться на каждом цикле анимации. Имя анимации должно отражать 
//      действие, производимое анимацией.

// РЕКОМЕНДАЦИЯ:
//      - для повторяющейся анимации следует убедится, что конечное значение 
//          совпадает с начальным, чтобы анимация была плавной
//      - анимация немедленно передает смысл, делая интерфейс менее навязчивым, 
//          всегда следует оценивать, способна ли анимация предоставить пользователям 
//          полезную обратную связь

// С точки зрения каскадности правила анимации @keyframes имеют приоритет 
//      над остальными. Правила анимации переопределяют стили, указанные в любом 
//      другом месте таблицы стилей, независимо от специфичности селекторов, что 
//      гарантирует согласованность всех ключевых кадров независимо от других 
//      правил, примененных к элементу за пределами анимации.

// Некоторые мобильные браузеры требуют использования префикса -webkit- для свойства 
//      animation (-webkit-animation) и для правила @keyframes (@-webkit-keyframes).

// --- --- свойства анимации

// Спецификация:
//      https://www.w3.org/TR/css-animations-1/

// Свойство animation применяет анимацию к элементу. Свойство принимает 
//      следующие параметры в порядке указания: animation-name, animation-duration, 
//      animation-delay, animation-iteration-count, animation-direction, 
//      animation-fill-mode.

// Можно запускать несколько анимаций при помощи свойства animation.
//      .flipper:hover .flipper-vertical {
//          transform: rotateX(180deg);
//          /* 
//           * анимация запускается на 2s, будет использовать функцию 
//           *      перехода ease-in-out-back в виде кривой Безье,
//           *      анимация будет повторяться 5 раз
//           */
//          animation: pulse 2s 1s cubic-bezier(0.68, -0.55, 0.265, 1.55) 5
//          animation: animOne 1s alternate both, animTwo 0.3s forwards
//          alternate both;
//      }

// - animation-name
//      имя анимации, которое объявляется через правило @keyframes;

// - animation-duration
//      длительность анимации;

// - animation-timing-function
//      временная функция, описывающая воспроизведение анимации;

// - animation-iteration-count
//      количество повторений анимации, infinite - бесконечно;

// - animation-play-state
//      свойство определяет следующие значения:
//          running - анимация будет проигрываться;
//          paused - анимация будет остановлена;

// - animation-delay
//      задержка перед началом анимации;

// - animation-fill-mode
//      сохраняет значения, определенные в ключевых кадрах, когда анимация 
//      меняет направление;

// - animation-direction
//      направление анимации, alternate - направление чередуется;

//      .animation-properties {
//          animation-name: warning;
//          animation-duration: 1.5s;
//          animation-timing-function: ease-in-out;
//          animation-iteration-count: infinite;
//          /* допускаются: paused */
//          animation-play-state: running; 
//          animation-delay: 0s;
//          /* допускаются: forwards, backwards, both */
//          animation-fill-mode: none; 
//          /* допускаются: reverse, alternate, alternate-reverse */
//          animation-direction: normal; 
//      }

// --- --- свойство animation-fill-mode

// Спецификация:
//      https://www.w3.org/TR/css-animations-1/#animation-fill-mode

// Свойство animation-fill-mode позволяет сохранить значения анимации после 
//      ее завершения. По умолчанию, при завершении анимации элемент возвращается 
//      к исходному виду. 

// --- 15.2 Анимация 3D-трансформаций.

// --- 15.3 Задержка запуска анимации и режим заполнения.

// Свойство animation-delay позволяет задать задержку анимации аналогично 
//      transition-delay.

// --- 15.4 Передача смысла с помощью анимации.

// РЕКОМЕНДАЦИЯ:
//      - с помощью анимации можно сообщить о нажатии кнопки для отправки формы или 
//          о получении сообщения;
//      - во время ожидания ответа после отправки формы следует отображать индикатор 
//          ожидания, например, анимировать вращающийся полумесяц с помощью свойств 
//          border и border-radius;