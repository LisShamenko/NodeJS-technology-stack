// --------------- 9. CSS-селекторы.

//      http://caniuse.com
//      http://gs.statcounter.com

// --- 9.1 Анатомия CSS-правил.

// Спецификация:
//      https://www.w3.org/TR/selectors-4/

// Это правило состоит из селектора '.round' и объявления 'border-radius: 10px'. 
//      Объявление состоит из свойством 'border-radius' и значения '10px'. 
//      .round {                    /* селектор */
//          border-radius: 10px;    /* объявление */
//      }

// --- 9.2 Псевдоэлементы и псевдоклассы.

// Псевдоэлементы похожи на элементы, но ими не являются. Псевдоэлементы 
//      объявляются при помощи двух двоеточий.

// Следующее правило вставляет псевдоэлемент ::before в элемент .thing с указанным 
//      текстом. Псевдоэлемент ::before ведет себя как первый дочерний элемент. 
//      Псевдоэлемент ::after ведет себя как последний дочерний элемент. 
//      .thing::before {
//          content: "префикс";
//      }

// Результат в браузере:
//      <div class="thing">
//          ::before
//          element text
//          ::after
//      </div>

// Псевдоклассы выбирают то, что нельзя выбрать селектором. Псевдоклассы 
//      объявляются одним двоеточием. Можно представить, что псевдокласс 
//      работает только с частью выбранного селектором элемента.

// --- 9.3 Селекторы.

// --- --- селекторы атрибутов

// Спецификация:
//      https://html.spec.whatwg.org/multipage/dom.html#embedding-custom-non-visible-data-with-the-data-*-attributes

// Селекторы атрибутов позволяют выбирать элементы по значению их атрибутов.

// Селектор выбирает элемент img и другие элементы при условии, что они 
//      имеют атрибут alt.
//      <img src="..." alt="my cat" />
//      img[alt] {
//          border: 3px dashed #e15f5f;
//      }

// Можно добавить селектор отрицания :not, чтобы выбрать изображения, у которых 
//      нет атрибута alt или у этого атрибута нет значения:
//      <img src="..." alt="my cat" />
//      <img src="..." alt="" />
//      <img src="..." />
//      img:not([alt]), img[alt=""] {
//          border: 3px solid red;
//      }

// Визуальное выделение изображений, в которых отсутствует альтернативный текст 
//      помогает повысить доступность страницы для вспомогательных технологий.

// Можно выбирать по значению атрибута.
//      <img src="..." alt="my cat" />
//      img[alt="my cat"] {
//          border: 3px solid blue;
//      }

// CSS позволяет выбирать элементы на основе подстрок значений их атрибутов:
// -  подстрока находится в начале значения;
// -  значение содержит экземпляр подстроки;
// -  значение заканчивается подстрокой.

// Оба изображения можно выбрать по подстроке в начале значения их атрибута. 
//      Символ ^ (карет) означает 'начинается с'.
//      <li data-type="todo-first">first</li>
//      <li data-type="todo-second">second</li>
//      [data-type^="todo"] {
//          border: 3px solid blue;
//      }

// Элемент можно выбрать по атрибуту, который содержит указанную подстроку. 
//      Символ * означает 'содержит'.
//      <p data-ingredients="scones cream jam">selected</p>
//      [data-ingredients*="cream"] {
//          color: red;
//      }

// Элемент можно выбрать по подстроке, находящейся в конце его атрибута.
//      Символом '$' означает 'заканчивается подстрокой'.
//      <p data-ingredients="scones cream jam">selected</p>
//      <p data-ingredients="toast jam butter">selected</p>
//      <p data-ingredients="jam toast butter">selected</p>
//      [data-ingredients$="jam"] {
//          color: red;
//      }

// Селекторы атрибутов можно группировать. Следующее правило выбирает элемент
//      соответствующие атрибуты которого имеют значения "swimming" и "indoor".
//      <li data-activity-name="running"    data-location="indoor"  >Running</li>
//      <li data-activity-name="swimming"   data-location="indoor"  >Swimming</li>
//      <li data-activity-name="cycling"    data-location="outdoor" >Cycling</li>
//      <li data-activity-name="swimming"   data-location="outdoor" >Swimming</li>
//      [data-activity-name="swimming"][data-location="indoor"] {
//          color: red;
//      }

// Спецификация CSS не позволяет использовать селекторы идентификаторов и имен 
//      классов, которые начинаются с цифр, что можно обойти с помощью селектора 
//      атрибутов, например, [id="10"].
//      https://html.spec.whatwg.org/multipage/dom.html#the-id-attribute
//      https://www.w3.org/TR/CSS21/syndata.html#characters

// --- --- структурные псевдоклассы: last-child и first-child

// Элементы можно выбирать на основе их местоположения в DOM. 

// Разметка:
//      <nav class="nav-Wrapper">
//          <a href="/home" class="nav-Link">Home</a>
//          <a href="/About" class="nav-Link">About</a>
//          <a href="/Films" class="nav-Link">Films</a>
//          <a href="/Forum" class="nav-Link">Forum</a>
//          <a href="/Contact-Us" class="nav-Link nav-LinkLast">Contact Us</a>
//      </nav>

// Применение :last-child.
//      .nav-Wrapper {
//          display: flex;
//      }
//      .nav-Link:last-child {
//          margin-left: auto;
//      }

// Селектор :first-child позволяет выбрать первый элемент в списке. 
//      div:first-child {
//      }

// Селектор :last-child позволяет выбрать последний элемент в списке.
//      div:last-child {
//      }

// Селектор :only-child позволяет выбрать только один элемент.

// Селектор :only-of-type позволяет выбрать только один элемент заданного типа.

// --- --- структурные псевдоклассы: nth-child

// Выбрать каждый второй элемент списка (четные).
//      .nav-Link:nth-child(odd) { ... }

// Выбрать каждый первый элемент списка (нечетные).
//      .nav-Link:nth-child(even) { ... }

// Правила на основе nth выбирают элементы по индексу:
//      - nth-child(n)          выбирает дочерние элементы
//      - nth-last-child(n)     выбирает дочерние элементы в обратном порядке
//      - nth-of-type(n)
//      - nth-last-of-type(n)

// Параметр (n) можно использовать следующими двумя способами:
//      - в виде целого числа
//      - в виде числового выражения

// Выбрать второй элемент списка.
//      .nav-Link:nth-child(2) { ... }

// Выбрать каждый третий элемент начиная с первого
//      .nav-Link:nth-child(3n+1) { ... }

// Разметка:
//      <div>
//          <span>1</span>
//          <span>2</span>
//          <span>3</span>
//          <span>4</span>
//          <span>5</span>
//          <span>6</span>
//          <span>7</span>
//          <span>8</span>
//          <span>9</span>
//          <span>0</span>
//      </div>

// Выбрать каждый второй элемент (2n) начиная с третьего элемента слева (3).
//      span:nth-child(2n+3) {
//          background-color: #f90;
//          border-radius: 50%;
//      }

// Выбрать каждый следующий элемент, начиная со второго. Значение '1n+2' 
//      эквивалентно 'n+2'.
//      span:nth-child(1n+2) { ... }

// Выбрать каждый третий элемент. Значение '3n+3' эквивалентно '3n', поскольку
//      каждый третий элемент начинается с третьего элемента.
//      span:nth-child(3n+3) { ... }

// Выбрать начиная с -2 элемента, после чего выбирается каждый третий элемент,
//      то есть будут выбран следующий ряд: 1, 4, 7, ...
//      span:nth-child(3n-2) { ... }

// Можно изменить направление на обратное с помощью отрицательного значения.
//      span:nth-child(-2n+3) { ... } 

// Селектор :nth-last-child выбирает дочерние элементы в обратном порядке.
//      Выбрать третий элемент с конца, а затем все элементы после него.
//      span:nth-last-child(-n+3) { ... }

// Селекторы :nth-of-type и :nth-last-of-type позволяют выбирать элементы
//      на основе их типа.

// Разметка:
//      <div>
//          <span class="span-class"></span>
//          <span class="span-class"></span>
//          <span class="span-class"></span>
//          <span class="span-class"></span>
//          <span class="span-class"></span>
//          <div class="span-class"></div>
//          <div class="span-class"></div>
//          <div class="span-class"></div>
//          <div class="span-class"></div>
//          <div class="span-class"></div>
//      </div>

// Независимо от наличия класса span-class у всех элементов следующие правила
//      выбирут только span-элементы.
//      .span-class:nth-of-type(-2n+3) {
//          background-color: #f90;
//          border-radius: 50%;
//      }

// Предыдущие селекторы на основе nth не фильтруют выбор для следующих, а 
//      элемент должен соответствовать каждому из выборов. Элемент .Item 
//      должен быть первым из четырех и одним из четырех последних.
//      .Item:nth-child(4n+1):nth-last-child(-n+4) {
//          border-bottom: 0;
//      }

// --- 9.4 Комбинаторы.

// Обычный селектор '.parent .descendant' выберет любой элемент, являющийся 
//      потомком элемента .parent с классом .descendant, независимо от уровня 
//      его расположения.

// Разметка:
//      <div class="parent">
//          <div class="descendant child">
//              <div class="descendant grandchild"></div>
//          </div>
//      </div>

// Дочерний комбинатор выбирает только прямых потомков родительского элемента.
//      Символ '>' называется символом дочернего комбинатора.
//      .parent > .descendant { ... }

// Разметка:
//      <div>
//          <div class="item one">one</div>
//          <div class="item">two</div>
//          <div class="item">three</div>
//          <div class="item">four</div>
//          <div class="item">five</div>
//          <div class="item">six</div>
//      </div>

// Комбинатор следующего соседнего элемента позволяет выбрать элемент .one и 
//      его следующего родственника. Символ '+' означает следующий соседний элемент.
//      .one + .item {
//          border: 3px dashed #f90;
//      }

// Комбинатор всех соседних элементов позволяет выбрать все элементы после 
//      третьего. Символ '~' означает 'все соседние элементы'.
//      .item:nth-child(3) ~ .item {
//          border: 3px dashed #f90;
//      }

// --- 9.5 Селектор отрицания (:not).

// Спецификация:
//      http://www.w3.org/TR/selectors/#structural-pseudos
//      http://www.w3.org/TR/selectors/#UIstates

// Селектор псевдокласса отрицания позволяет выбирать элементы, которые 
//      не попадают под определенные условия выбора. 

// Разметка:
//      <div>
//          <div class="a-div"></div>
//          <div class="a-div"></div>
//          <div class="a-div"></div>
//          <div class="a-div not-me"></div>
//          <div class="a-div"></div>
//      </div>

// Выбирает все элементы div с классом .a-div, за исключением тех, которые
//      имеют класс .not-me.
//      .a-div:not(.not-me) {
//          background-color: orange;
//          border-radius: 50%;
//      }

// --- 9.6 Селектор пустого элемента (:empty).

// Разметка:
//      <div class="thing"></div>

// Следующий стиль добавит фоновый цвет к контейнеру div, даже если он 
//      содержит только пробелы.
//      .thing {
//          padding: 1rem;
//          background-color: violet;
//      }

// При отсутствии содержимого в div все равно будет виден его фоновый цвет, 
//      задаваемый свойством background-color. 
//      .thing:empty {
//          display: none;
//      }

// Данный контейнер div не является пустым, поскольку символ пробела
//      не означает пустоту!
//      <div class="thing"> </div>

// Комментарии не влияют на наличие или отсутствие пробельного символа 
//      в элементе. Следующий контейнер будет считаться пустым.
//      <div class="thing"><!--I'm empty, honest I am--></div>