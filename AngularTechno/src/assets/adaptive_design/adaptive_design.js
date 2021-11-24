// --------------- 

function adaptiveDesignEventListeners() {
    (function () {
        var button = document.getElementById('toggle-menu');
        /* обработчик события щелчка (срабатывает также в результате прикосновения к сенсорному экрану) */
        button.addEventListener('click', function (event) {
            event.preventDefault();
            var menu = document.getElementById('main-menu');
            /* переключает класс is-open меню */
            menu.classList.toggle('is-open');
        });
    })();
}