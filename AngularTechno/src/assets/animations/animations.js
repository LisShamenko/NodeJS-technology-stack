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