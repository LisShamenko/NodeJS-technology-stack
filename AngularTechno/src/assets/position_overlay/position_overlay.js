// --------------- 

function positionOverlayEventListeners() {

    console.log('--- --- position overlay --- set events listeners ---');

    let rootElement = document.documentElement;
    console.log("--- rootElement = ", rootElement);

    // поиск по id относительно документа
    positionOverlay = document.getElementById("position_overlay");
    console.log("--- positionOverlay = ", positionOverlay);

    // поиск по классу относительно компонента
    let modalArray = positionOverlay.getElementsByClassName('modal');
    console.log("--- modalArray = ", modalArray);

    // поиск по селектору относительно компонента
    let modal = positionOverlay.querySelector('[id=modal]');
    let button = positionOverlay.querySelector('[id=open]');
    let close = positionOverlay.querySelector('[id=close]');

    // 
    console.log("--- modal = ", modal);
    console.log("--- button = ", button);
    console.log("--- close = ", close);

    // 
    button.addEventListener('click', function (event) {
        console.log('--- button addEventListener');
        event.preventDefault();
        // чтобы показать окно устанавливается 'display: block'
        modal.style.display = 'block';
    });

    // 
    close.addEventListener('click', function (event) {
        console.log('--- click addEventListener');
        event.preventDefault();
        // чтобы скрыть окно устанавливается 'display: block'
        modal.style.display = 'none';
    });
}