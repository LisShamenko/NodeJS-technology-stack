// --------------- 14. Transformations.

// --- 14.1 2D-transformations.

// Допускаются следующие 2D-преобразования:
//      scale - масштабирование элемента;
//      translate - перемещение элемента по экрану;
//      rotate - поворот элемента, в градусах или оборотах;
//      skew - наклон элемента по его координатам x и y;
//      matrix - универсальные матричные операции;

// Трансформация не влияет на положение элемента в потоке документа и 
//      не затрагивает другие элементы. Но трансформируемый элемент может
//      перекрывать другие элементы или может выйти за пределы экрана.

// Трансформация не применяется к некоторым строчным элементам, в этом случае 
//      следует заменить свойство 'display:inline' на любое другое, применить 
//      Flex или CSS-сетку. Для этого следует установить свойства 'display:flex' 
//      или 'display:grid' соответственно для родительского элемента.

// --- --- масштабирование (scale) 

// Свойство scale позволяет однородно масштабировать элемент.

// При наведении на элемент указателя мыши, этот элемент увеличится в 1.4 раза.
//      .scale:hover {
//          transform: scale(1.4);
//      }

// Значений меньше единицы приведет к сжатию элементов.
//      .scale:hover {
//          transform: scale(0.5);
//      }

// --- --- перемещение (translate) 

// Свойство translate перемещает элемент на указанное расстояние по обеим осям.
//      Положительные значения перемещают элементы вправо и вниз. Отрицательные
//      значения перемещают элементы влево и вверх. 
//      .translate:hover {
//          transform: translate(-20px, -20px);
//      }

// Свойства translateX() и translateY() позволяют перемещать элемент вдоль 
//      одной оси, X или Y соответственно.

// --- --- поворот (rotate) 

// Свойство rotate позволяет поворачивать элемент на указанный угол. Значение
//      угла может выражаться в градусах, градианах, радианах, оборотах.
//      Положительные значения задают поворот по часовой стрелке. Отрицательные
//      значения задают поворот против часовой стрелки.

// Поворот элемента 10 раз по часовой стрелки.
//      .rotate:hover {
//          transform: rotate(3600deg);
//      }

// --- --- наклон (skew) 

// Свойство skew выполняет наклон элемента по двум осям. Свойства skewX() и 
//      skewY() позволяют выполнять наклон только по одной оси.

//      .skew:hover {
//          transform: skew(40deg, 12deg);
//      }

// --- --- матрица (matrix) 

// Спецификация:
//      https://www.w3.org/TR/css-transforms-1/#mathematical-description
//      http://www.useragentman.com/matrix/

// Свойство matrix позволяет выполнять несколько видов преобразований в одном 
//      объявлении.

//      .matrix:hover {
//          transform: matrix(1.178, -0.256, 1.122, 1.333, -41.533, -1.989);
//      }

// --- --- свойство transform-origin

// Свойство transform-origin позволяет изменить точку приложения преобразования.
//      По умолчанию точка приложения преобразований находится в центре элемента, 
//      50% по обеим осям. Можно использовать любые единицы измерения CSS. 
//      При использовании процентов смещения задаются относительно высоты и ширины 
//      контейнера. Значения длины отмеряются относительно левого верхнего угла
//      контейнера. 

// Допустимые ключевые слова: 
//      left - 0% по горизонтали;
//      right - 100% по горизонтали;
//      top - 0% по вертикали;
//      bottom - 100% по вертикали;

//      .matrix:hover {
//          transform: matrix(1.678, -0.256, 1.522, 2.333, -51.533, -1.989);
//          transform-origin: 270px 20px;
//      }

// --- 14.2 Изменение точки трансформации.

// Трансформации выполняются относительно точки трансформации, которой по умолчанию 
//      является центр элемента. Для задания точки трансформации используется 
//      свойство transform-origin, можно указать несколько свойств через запятую.

// Точка трансформации задается в процентах или ключевыми словами [left,center,right]
//      по горизонтали и [top,center,bottom] по вертикали и можно использовать 
//      единицы измерения длины [px, em и др.]:
//          transform-origin: right center;     - справа по центру
//          transform-origin: 100% 50%;         - тоже самое в процентах

// --- 14.3 Производительность анимации.

// Анимации более требовательны к ресурсам, чем трансформации, поэтому следует 
//      отдать предпочтение трансформациям для явного задания позиции и размера.

// --- 14.4 Рендеринг страницы.

// Рендеринг - процесс визуализации элементов браузером, преобразование стилей 
//      в пиксели. Рендеринг можно разбить на три стадии: разметка, окрашивание, 
//      компоновка.

// 1. Разметка. На этой стадии браузер определяет размер и положение каждого 
//      элемента. Разметка будет пересчитываться заново при изменении размеров или 
//      расположения элементов, а так же если элемент создается или удаляется 
//      с помощью DOM JavaScript.

// 2. Окрашивание. Это стадия заполнения пикселов: отрисовка текста, изображений, 
//      цвета границ и теней. Изображения раскрашиваются по слоям. Элементы будут 
//      перерисовыватсья при изменении, например, цвета фона, но при этом не происходит 
//      пересчета разметки, что требует гораздо меньше вычислений. Каждый слой 
//      отрисовывается независимо от других слоев на странице, браузер отправляет 
//      слои в GPU на рендеринг. Главный слой обрабатывается в центральном процессоре (CPU). 
//      В идеале каждый элемент должен иметь свой слой, чем больше слоев тем больше 
//      потребляемой памяти и меньше время рендеринга.

// 3. Компоновка.
//      - На этой стадии все отрисованные слои собираются вместе и создается единое 
//          изображение для отображения. Слои собираются в определенном порядке, так 
//          что одни отображаются поверх других.
//      - Свойства opacity и transform значительно сокращают время рендеринга. 
//          Элементы к которым применяются эти свойства помещаются браузером 
//          на отдельный цветовой слой и может задействоваться аппаратное ускорение. 
//          Так как элемент находится на отдельном слое, то основной слой остается 
//          неизменным, что не требует повторных вычислений.
//      - При создании переходов и анимации следует использовать преимущественно 
//          свойства opacity и transform, тогда изменения коснутся только формирования 
//          слоев, а не разметки в целом. Разметку затрагивать следует только если 
//          нет другого выхода и всегда следует думать о возможных проблемах 
//          с производительностью (https://csstriggers.com/).

// Свойство will-change позволяет контролировать слои. Оно заранее сообщает браузеру, 
//      какие изменения элемента стоит ожидать и элемент помещается на отдельный слой.
//      Это свойство следует использовать только при реальных проблемах с производительностью:
//      https://dev.opera.com/articles/css-will-change-property/

// --- 14.5 3D-transformations.

// 3D-трансформации позволяют имитировать движение элемента в 3D пространстве.
//      Чтобы выполнять 3D-трансформации сначала следует с помощью свойства 
//      perspective определить трехмерное пространство, в рамках которого будут 
//      выполняться преобразования. Свойство perspective принимает значение длины, 
//      которое определяет расстояние от экрана просмотра до края 3D-пространства.

// Свойство translateZ выполняет смещение по оси Z, что отдаляет или приближает 
//      элемент относительно пользователя.

// Свойство rotateX вращает элемент вокруг горизонтальной оси X (наклоняя элемент 
//      вперед или назад).

// Свойство rotateY вращает элемент вокруг вертикальной оси Y (поворачивая элемент 
//      вправо или влево).

// Свойство rotateZ (эквивалентна rotate) выполняет вращение вокруг оси Z.

// Функция translate3d позволяет перемещать элемент по трем осям. Эта функция 
//      хорошо подходит для реализации всплывающих панелей, например, элементов 
//      навигации, располагающихся за пределами холста. 

// --- 14.6 Свойство перевернутого изображения.

// При указании значений свыше 90° для rotateX или rotateY изображение будет развернуто, 
//      при 180° зеркально отражено. Отображемое изображение будет являться обратной 
//      стороной исходного. Свойство 'backfасе-visibility:hidden' позволяет скрыть 
//      обратную сторону элемента.
//      https://3dtransforms.desandro.com/card-flip

// --- 14.7 Контроль перспективы.

// Трансформированные элементы вместе образуют 3D-сцену, перспективу можно 
//      рассматривать как расстояние между камерой и сценой.

// Перспектива задается двумя способами: трансформация perspective() или 
//      свойство perspective.

// --- 14.8 Профессиональные приемы 3D-трансформации.

// Свойство perspective-origin смещает камеру вправо или влево, вверх или вниз.

// По умолчанию перспектива отображается так, как если бы наблюдатель находился 
//      по центру элемента.