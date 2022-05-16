(function () {
    // поиск всех экземпляров кнопок с классом dropdown_toggle
    var dropdowns = document.querySelectorAll('.dropdown__toggle');
    Array.prototype.forEach.call(dropdowns, function (dropdown) {
        // прослушка события click
        dropdown.addEventListener('click', function (event) {
            // переключение класса is-open
            event.target.parentNode.classList.toggle('is-open');
        });
    });
}());