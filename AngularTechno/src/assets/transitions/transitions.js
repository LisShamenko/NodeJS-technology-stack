// --------------- отображение/сокрытие меню

function transitionsEventListeners() {

    // 
    let toggles = document.getElementsByClassName('dropdown__toggle');
    for (let i = 0; i < toggles.length; i++) {
        const toggle = toggles[i];
        const dropdown = toggle.parentElement;

        // переключает класс is-open при нажатии кнопки
        toggle.addEventListener('click', function (e) {
            e.preventDefault();
            dropdown.classList.toggle('is-open');
        });
    }

    // 
    let toggle = document.getElementsByClassName('dropdown__toggle__last')[0];
    let dropdown = toggle.parentElement;
    let drawer = document.getElementsByClassName('dropdown__drawer__last')[0];
    // высота drawer-элемента
    let height = drawer.scrollHeight;

    // если элемент скрыт правилом 'display: none', то scrollHeight будет равно 0,
    //      'display: block' дает доступ к свойству scrollHeight, значение свойства
    //      устанавливается: 
    //      el.style.display = 'block';
    //      el.style.display = 'none';

    toggle.addEventListener('click', function (e) {
        e.preventDefault();
        dropdown.classList.toggle('is-open');
        if (dropdown.classList.contains('is-open')) {
            // устанавливается высота для открытия drawer-элемента
            drawer.style.setProperty('height', height + 'px');
        } else {
            // сброс высоты для закрытия drawer-элемента
            drawer.style.setProperty('height', '0');
        }
    });

    // событие transitionend срабатывает, когда CSS transition закончил своё выполнение. 
    //      https://developer.mozilla.org/ru/docs/Web/API/HTMLElement/transitionend_event

    // событие transitionend позволяет выполнить действие сразу после завершения перехода
    toggle.addEventListener('transitionend', function (e) {
        e.preventDefault();
    }, false);
}