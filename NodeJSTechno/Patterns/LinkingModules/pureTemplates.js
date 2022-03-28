// --------------- 2. Шаблоны связывания модулей.

// --- Сервер аутентификации с жесткими зависимостями.

//      ╭────────────────╮   ╭─────────────╮   ╭────╮
//      │ AuthController │ → │ AuthService │ → │ DB │   
//      ╰────────────────╯   ╰─────────────╯   ╰────╯

// - AuthController     принимает и обрабатывает данные от клиента;
// - AuthService        выполняет проверку предоставленных учетных данных 
//                      с данными в базе;
// - DB                 работает с базой;

// Порядок соединения компонентов будет определять возможность их многократного 
//      использования, уровень тестируемости и обслуживаемости. 

// POST '/login'        получает данные аутентификации, имя/пароль пользователя 
//                      в формате JSON возвращает веб-маркер в формате JSON 
//                      (JSON Web Token, JWT);
// GET '/checkToken'    извлекает маркер из параметра запроса GET и проверяет 
//                      его допустимость;

// JSON (JSON Web Token, JWT)
//      https://datatracker.ietf.org/doc/html/draft-ietf-oauth-json-web-token
//      https://nodejsdev.ru/doc/jwt/

// express 
//      https://npmjs.org/package/express

// levelup 
//      https://npmjs.org/package/levelup

// --------------- 2.1 Жесткие зависимости.

// Жесткие зависимости возникают при явной загрузки модулей с помощью require. 
//      В рамках примера это означает, что DB подключается к AuthService, который 
//      подключается к AuthController и оба связывания выполняются при помощи 
//      require.

// sublevel 
//      https://npmjs.org/package/level-sublevel

// Запуск:
// - node app
// - выполнить вход можно следующей командой, вернет токен:
//      curl -X POST -d '{"username": "alice", "password":"secret"}' http://localhost:3000/login -H "Content-Type: application/json"
// - для тестирования веб­службы '/checkLogin', вернет {"ok":"true","user":{"username":"alice"}}:
//      curl -X GET -H "Accept: application/json" http://localhost:3000/checkToken?token=<TOKEN HERE>

// Преимущества: 
// - наглядная организация модулей, в которой легко разобраться и которую несложно 
//      отлаживать, где каждый модуль инициализируется и подключается без необходимости
//      внешнего вмешательства.

// Недостатки:
// - исключается связывание модуля с другими экземплярами, что затрудняет повторное 
//      использование и модульное тестирование.

// Недостатки использования жестких зависимостей связаны с состоянием экземпляров.
//      При подключении модулей не имеющих состояния проблем не возникает, к таким 
//      относятся модули экспортирующие фабрики, конструкторы или наборы функций 
//      без состояния.

// --------------- 2.2 Внедрение зависимостей (Dependency Injection, DI).

// В этом шаблоне зависимости предоставляются в качестве входных данных с помощью 
//      высокоуровневых компонентов, которые централизованно связывают все модули 
//      системы. Модули можно повторно использовать в различных контекстах, так как 
//      можно передавать любые реализации зависимостей.

// Жесткие зависимости от конкретных экземпдяров заменяются на фабрики, которые 
//      получают наборы зависимостей в качестве аргументов.

// Существуют следующие реализации этого подхода:
// - DI (внедрение с помощью фабрик);
// - внедрение через конструктор, зависимости передаются в конструктор при создании:
//      const service = new Service(dependencyA, dependencyB);
// - внедрение через свойства, зависимости внедряются в объект после его создания:
//      const service = new Service();
//      service.dependencyA = anInstanceOfDependencyA;

// Преимущества: 

// - Устранение тесных связей, особенно между модулями и экземплярами с состоянием,
//      Все зависимости не создаются внутри модуля, а передаются извне. Это значительно
//      облегчает модульное тестирование, поскольку упрощает создание фиктивных 
//      зависимостей.

// - Перекладывание ответственности за внедрение зависимостей на высокоуровневые 
//      компоненты, которые являются менее многоразовыми, чем компоненты низкого 
//      уровня. По мере увеличения уровня, компоненты становятся все более конкретными. 
//      То есть выбор реализации зависимостей откладывается, как можно дольше, 
//      чтобы стабилизировать низжние уровни и вынести меняющиеся участки кода 
//      на верхние уровни.

// - Внедрение через свойства предполагает создание объекта в несогласованном состоянии, 
//      что делает этот способ наименее надежным, но полезным при разрешении циклических
//      зависисмостей.
function fixing_cyclic_dependencies() {

    // циклические зависимости являются признаком плохого проектирования: 
    function Afactory(b) {
        return {
            foo: () => b.say(),
            what: () => 'Hello!'
        }
    }
    function Bfactory(a) {
        return {
            a: a,
            say: () => console.log(a.what)
        }
    }

    // взаимоблокировку зависимостей можно разрешить с помощью внедрения свойств:
    const b = Bfactory(null);
    const a = Afactory(b);
    b.a = a;
}

// Недостатки:

// - Невозможность разрешения зависимостей в момент написания кода затрудняет понимание 
//      взаимосвязей между различными компонентами системы.

// - Зависимости должны следовать в определенном порядке, что требует составления 
//      графа зависимостей вручную и этот процесс может стать неуправляемым при 
//      достаточно большом количестве зависимостей. Если разделить процесс внедрения 
//      ответственности на несколько компонент, каждый из которых отвечает за разрешение 
//      собственного графа зависимостей, то можно временно уменьшить рост сложности.

// --------------- 2.3 Локатор служб.

// Этот шаблон заключается в наличии центрального реестра для управления компонентами 
//      системы, который выступает в качестве посредника при загрузке зависимости любым 
//      модулем. Вместо жесткого связывания зависимости запрашиваются у локатора служб, 
//      что создает зависимость компонента от самого локатара и снижает возможность 
//      повторного использования. 

// Express сервер может использоваться в качестве простого локатора служб. Для 
//      регистрации служб используется метод expressApp.set, а для извлечения метод 
//      expressApp.get. Это удобно при работе с Express, поскольку экземпляр сервера 
//      внедрен в любое промежуточное программное обеспечение и доступен через свойство 
//      request.app.

// Можно определить три вида локатаров. 

// - Жесткая зависимость от локатора служб, что дает минимум преимуществ с точки зрения 
//      ослабления связей и считается антишаблоном. Между модулем и локатаром образуется 
//      тесная связь, что не облегчает повторное использование, поскольку лишь добавляет 
//      еще один уровень косвенности и сложности.

// - Внедрение локатора можно рассматривать как удобный способ внедрения всего набора 
//      зависимостей сразу.

// - Глобальный локатор служб подразумевает наличие ссылки на локатор в глобальной 
//      области видимости. Имеет те же недостатки, что и жесткое связывание локатора 
//      служб, но является объектом одиночкой и может использоваться разными пакетами 
//      как общий экземпляр. 

// Преимущества:

// - Отложенная загрузка зависимостей, то есть каждый экземпляр создается только 
//      по мере необходимости. 

// - Все зависимости внедряются автоматически и нет необходимости заранее знать 
//      правильный порядок создания экземпляров и связывания модулей. Здесь локатор 
//      может превосходить DI по удобству.

// Недостатки:

// - Снижает повторное использование. Использование локатара служб влияет на гибкость 
//      всей архитектуры. Глобальный локатор или жесткая зависимость от локатара сводят 
//      на нет все преимущества этого шаблона. Жесткое связывание зависимостей заменяется 
//      привязкой к экземпляру локатора, что не дает преимуществ с точки зрения повторного 
//      использования. Здесь локатор находится между шаблоном жестких зависимостей и DI.

// - Снижает удобочитаемость. Локатор служб усложняет определение зависимостей, 
//      затребованных компонентом. Локатор скрывает зависимости между компонентами, 
//      поскольку они разрешаются во время выполнения, что усложняет понимание. При 
//      использовании DI зависимости передаются явным способом в фабрики или конструкторы. 
//      Локатор служб делает это не явно, что требует дополнительной проверки кода или 
//      наличия документации с перечислением зависимостей компонента.

// - Локатор служб можно ошибочно принять за DI-контейнер, поскольку они оба выполняют 
//      роль реестра служб, но делают это по­разному. Компоненты сами загружают свои 
//      зависимости из локатора служб. При использовании DI ­контейнера компонентам 
//      ничего неизвестно о нем.

// --------------- 2.4 Контейнер внедрения зависимостей

//      https://www.npmjs.com/search?q=dependency%20injection.

// args-list - используется для извлечения имен аргументов функции
//      htps://npmjs.org/package/args-list

// Модули должны объявлять свои зависимости одним из следующих методов:
//      на основе имен аргументов фабрик и конструкторов; как перечисление в фабрике; 
//      объявлятся модулем; указываться в анотациях к аргументам.
//      

// - Внедрение зависимостей на основе имен аргументов фабрики или конструктора. 
//      Чтобы получить имена аргументов функции используется метод toString, который 
//      позволяет сериализовать функцию и получить ее исходный код. После чего можно 
//      получить список аргументов с помощью регулярных выражений. Данный подход 
//      несовместим с минификацией, которая используется для сжатия клиентского кода. 
//      Минификация урезает имена локальных переменных, в том числе и аргументы функций, 
//      что делает невозможным использование этого приема.
// 
//      // код с двумя зависимостями, db и tokenSecret
//      module.exports = (db, tokenSecret) => { }

// - Зависимости для внедрения могут быть перечислены в фабричной функции.
//      module.exports = (a, b) => {}; 
//      module.exports._inject = ['db', 'another/dependency'];

// - Модуль можно описать как массив имен зависимостей, за которыми следует фабричная функция.
//      module.exports = ['db', 'another/depencency', (a, b) => {}];

// - Зависимости могут быть перечислены в анотациях для каждого аргумента функции, что
//      также не работает с минификацией.
//      module.exports = function(a /*db*/, b /*another/depencency*/) {};

// Преимущества:

// - Слабая связность между модулями, что повышает повторное использование и 
//      упрощает тестирования. 

// - Позволяет использовать ручное внедрение зависимостей без использования 
//      контейнера.

// Недостатки:

// - Увеличилась сложность реализации за счет разрешения зависимостей 
//      во время выполнения.