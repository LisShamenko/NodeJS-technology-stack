// --------------- 

function setEventListeners() {
    (function () {
        var toggle = document.querySelector('.dropdown__toggle');
        // переключает класс is-open при нажатии кнопки меню
        toggle.addEventListener('click', function (event) {
            event.preventDefault();
            var dropdown = event.target.parentNode;
            dropdown.classList.toggle('is-open');
        });
    }());
}