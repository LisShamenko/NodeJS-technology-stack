// --------------- 3. Схема GraphQL.

// API реализованное через REST является коллекцией конечных точек. API реализованное 
//      через GraphQL является коллекцией типов, которая называется схемой. Перед 
//      разработкой API следует определить используемые типы данных.

// Schema First - это методология проектирования, при которой разработка ведется
//      на основе общепринятой схемы данных. Команда бэкенда имеет четкое 
//      представление о данных, которые необходимо хранить и доставлять. Команда
//      фронтенда имеет описание данных приходящих со стороны сервера. Обе команды
//      будут иметь список терминов для совместной работы над системой.

// Schema Definition Language (SDL) - язык определения схем поддерживаемый GraphQL.
//      Файлы схемы GraphQL являются текстовыми документами с определениями типов, 
//      которые будут использоваться клиентами и серверами.

// --- 3.1 Типы.

// Типы в GraphQL являются пользовательскими объектами, которые описывают функции 
//      и данные приложения. Это основные элементы схемы GraphQL. Тип содержит 
//      поля, которые представляют данные, связанные с каждым объектом. Каждое 
//      поле возвращает определенный тип данных или список типов.

// Схема представляет собой набор определений типов. Схему можно указать в файле
//      с расширением '.graphql'. 

// Определение пользовательского типа объекта Photo. GraphQL содержит встроенные 
//      типы, которые так же называются скалярными: Int, Float, String, Boolean, ID.
//      Символ '!' указывает, что поле не может быть нулевым (null).

//      type Photo {                // тип Photo
//          id: ID!                 // уникальный идентификатор
//          url: String!            // ссылка на файл изображения
//          name: String!           // имя и описание
//          description: String     // не является обязательным, может принимать
//                                  //      значение null
//      }

// --- 3.2 Скалярные типы.

// Встроенные скалярные типы GraphQL: Int, Float, String, Boolean, ID. 

// GraphQL позволяет создавать собственные скалярные типы. Скалярный тип 
//      не является объектом и не имеет полей, но позволяет определить проверку
//      на допустимость.

// Создание собственного типа DateTime. Поля типа DateTime будут возвращать
//      строку JSON. Собственный скаляр позволяет убедится, что строка может 
//      быть сериализована и отформатирована как дата и время.

//      scalar DateTime             // скалярный тип DateTime
//      type Photo {
//          id: ID!
//          name: String!
//          url: String!
//          description: String
//          created: DateTime!      // поле скалярного типа 
//      }

// Пакет graphql-custom-types содержит пользовательские скалярные типы.

// --- 3.3 Перечисления.

// Перечисление (enum) - скалярный тип, который позволяет полю возвращать
//      ограниченный набор строковых значений.

// Перечисление определяет пять типов фотографий.
//      enum PhotoCategory {
//          SELFIE
//          PORTRAIT
//          ACTION
//          LANDSCAPE
//          GRAPHIC
//      }

// Тип перечисления можно использовать при определении полей. 
//      type Photo {
//          id: ID!
//          name: String!
//          url: String!
//          description: String
//          created: DateTime!
//          category: PhotoCategory!
//      }

// --- 3.4 Соединения и списки.

// GraphQL позволяет определять поля, возвращающие списки любого типа. Список
//      может состоять из нескольких типов, если используется тип union или 
//      interface.

// null-значения со списками
// [Int]        список целых значений, которые могут быть нулевыми
// [Int!]       список целых значений, которые не могут быть нулевыми
// [Int]!       ненулевой список целых значений, которые могут быть нулевыми
// [Int!]!      ненулевой список целых значений, которые не могут быть нулевыми

// Если список не содержит значений, то можно вернуть пустой массив JSON, 
//      поскольку пустой массив не является значением null.

// --- --- соединение 'один к одному'

// При создании поля типа объекта фактически создается соединение между двумя 
//      объектами. Соединение одного типа объекта с другим типом объекта 
//      называется соединением 'один к одному', а в теории графов ребром.

// Если фотография публикуется пользователем, то тип объекта Photo соединяется 
//      с типом объекта User через ребро postedBy. 
//      Photo ---(postedBy)--→ User

//      type User {
//          login: ID!            // идентификатор
//          name: String                // имя
//          avatar: String              // фото
//      }
//      type Photo {
//          id: ID!
//          name: String!
//          url: String!
//          description: String
//          created: DateTime!
//          category: PhotoCategory!
//          postedBy: User!             // соединение через ребро postedBy
//      }

// --- --- соединение 'один ко многим'

// Этот вид соединения позволяет делать графы ненаправленными. Это дает клиентам
//      максимальную гибкость при создании запросов, поскольку по такому графу
//      можно перемещаться начиная с любого узла. Чтобы создать соединение
//      'один ко многим' следует создать связь в обе стороны между типами объектов
//      User и Photo. Photo связан с одним User. User связан с массивом Photo.

//      type User {
//          login: ID!
//          name: String
//          avatar: String
//          postedPhotos: [Photo!]!     // опубликованные пользователем фотографии
//      }

// Тип Query определяет запросы, доступные в API. Для типов User и Photo добавлено
//      по два запроса: totalPhotos и totalUsers возвращают количество записей,
//      allPhotos и allUsers возвращает список таких записей. 

// Следует добавить новые пользовательские типы в корневой тип Query, чтобы
//      они были доступны в запросе.
//      type Query {
//          totalPhotos: Int!
//          allPhotos: [Photo!]!
//          totalUsers: Int!
//          allUsers: [User!]!
//      }
//      // тип запроса Query добавляется в schema, что делает 
//      //      запросы доступными в API GraphQL
//      schema {
//          query: Query
//      }

// Фотографии и пользователи могут быть выбраны в следующем запросе.
//      query {
//          totalPhotos
//          allPhotos {
//              name
//              url
//          }
//      }

// --- --- соединения 'многие ко многим'

// Соединение 'многие ко многим' позволяет соединять списки узлов с другими
//      списками узлов. Пользователь может быть помечен на нескольких фотографиях.
//      Фотография может содержать несколько пользователей. Этот вид соединения
//      состоит из двух соединений 'один ко многим'.

// Тегирование, следует добавить поля списков к обоим типам User и Photo.
//      type User {
//              ...
//          inPhotos: [Photo!]!         // фотографии пользователей
//      }
//      type Photo {
//              ...
//          taggedUsers: [User!]!       // теги пользователей
//      }

// --- --- сквозные типы

// Сквозной тип - это промежуточное звено в соединении 'многие ко многим', которое
//      может включать данные о самом соединении. Само соединение объявляется типом
//      объекта.

// Обычное соединение 'многие ко многим' между пользователями.
//      type User {
//          friends: [User!]!
//      }

// Сквозное соединение 'многие ко многим' через массив типов объектов Friendship.
//      type User {
//          friends: [Friendship!]!
//      }

// Сквозной тип Friendship связывает двух или более пользователей и предоставляет
//      информацию об этой связи.
//      type Friendship {
//          friend_a: User!         // соединение между двумя конкретными
//          friend_b: User!         //      пользователями
//          friends: [User!]!       // соединение включающее множество пользователей
//          howLong: Int!           // время дружбы
//          whereWeMet: Location    // пользовательский тип Location
//      }

// --- --- списки разных типов

// Объединения и интерфейсы позволяют создавать поля, которые могут содержать 
//      разные типы объектов. Объединения рекомендуется применять, если объекты 
//      содержат совершенно разные поля. Интерфейсы рекомендуется применять, 
//      если тип объекта должен содержать определенные поля для взаимодействия 
//      с другим типом объекта.

// --- 3.5 Типы объединения.

// Тип объединения используется для возврата нескольких разных типов. Можно 
//      объединить сколько угодно типов в рамках одного типа объединения.

// Тип объединения AgendaItem, который объединяет два типа Group и Workout. 
//      union AgendaItem = Group | Workout
//      type Group {
//          name: String!
//          subject: String
//          students: [User!]!
//      }
//      type Workout {
//          name: String!
//          reps: Int!
//      }
//      type Query {
//          agenda: [AgendaItem!]!
//      }

// Использование типа объединения agenda в запросе. В запросе используются
//      встроенные фрагменты.
//      query schedule {
//          agenda {
//              ...on Workout {
//                  name
//                  reps
//              }
//              ...on Group {
//                  name
//                  subject
//                  students
//              }
//          }
//      }

// --- 3.6 Интерфейсы.

// Интерфейс - это абстрактный тип, который может быть реализован типом объекта.
//      Объект реализующий интерфейс должен включать все поля определенные
//      в интерфейсе. Интерфейс гарантирует, что определенные типы всегда будут
//      включать определенные поля, которые можно запрашивать независимо от типа.

//      scalar DataTime
//      interface AgendaItem {                  // интерфейс AgendaItem
//          name: String!               ╮
//          start: DateTime!            ├ поля интерфейса
//          end: DateTime!              ╯
//      }
//      type Group implements AgendaItem {      // реализация интерфейса
//          name: String!               ╮
//          start: DateTime!            ├ поля интерфейса
//          end: DateTime!              ╯
//          participants: [User!]!
//          topic: String!
//      }
//      type Workout implements AgendaItem {    // реализация интерфейса
//          name: String!               ╮
//          start: DateTime!            ├ поля интерфейса
//          end: DateTime!              ╯
//          reps: Int!
//      }
//      type Query {                // список agenda возвращает типы реализующие
//          agenda: [AgendaItem!]!  //      интерфейс AgendaItem
//      }

// Запрос применяющий интерфейс AgendaItem.
//      query schedule {
//          agenda {
//              name
//              start
//              end
//              ...on Workout {
//                  reps
//              }
//          }
//      }

// --- 3.7 Аргументы.

// Аргументы позволяют отправлять динамические данные для настройки результатов
//      запроса. Аргументы можно добавлять в любые поля. Аргумент должен иметь 
//      любой скалярный тип определенный в схеме.

// Аргументы используются для указания идентификаторов.
//      type Query {
//              ...
//          User(login: ID!): User!   // обязательные аргументы, определяются
//          Photo(id: ID!): Photo!          //       как поля не допускающие null
//      }

// Запрос передает идентификатор пользователя в аргументе login.
//      query {
//          User(login: "MoonTahoe") {
//              name
//              avatar
//          }
//      }

// Запрос передает идентификатор фотографии в аргументе id.
//      query {
//          Photo(id: "14TH5B6NS4KIG3H4S") {
//              name
//              description
//              url
//          }
//      }

// Использование аргументов для указания параметров пагинации, сортировки и 
//      фильтрации.
//      type User {
//          postedPhotos(
//              first: Int = 25
//              start: Int = 0
//              sort: SortDirection = DESCENDING
//              sortBy: SortablePhotoField = created
//              category: PhotoCategory
//          ): [Photo!]
//          ...
//      }

// --- --- фильтрация данных

// Аргументы могут быть необязательными, если не указывать символ '!'.
//      type Query {
//              ...
//          // необязательное поле category с типом перечисления PhotoCategory,
//          //      если значение не передать в запрос, то будут возвращены
//          //      все элементы, иначе будет применена фильтрация к выборке
//          allPhotos(category: PhotoCategory): [Photo!]!
//      }

// Запрос с передачей необязательного аргумента для фильтрации выборки.
//      query {
//          allPhotos(category: "SELFIE") {
//              name
//              description
//              url
//          }
//      }

// --- --- пагинация данных

// Пагинация данных - это механизм управления объемом возвращаемых данных.
//      Данные разбиваются и возвращаются порциями. Для реализации пагинации
//      требуется два аргумента:
//      first - количество данных на одной странице;
//      start - начальная позиция первой записи для возврата.

// Количество страниц можно определить разделив общее количество элементов 
//      на размер одной страницы данных: 
//      pages = total/pageSize.

// Необязательные аргументы first и start с указанием значений по умолчанию.
//      type Query {
//              ...
//          allUsers(first: Int=50 start: Int=0): [User!]!
//          allPhotos(first: Int=25 start: Int=0): [Photo!]!
//      }

// Запрос выбирает 10 записей начиная с 90.
//      query {
//          allUsers(first: 10 start: 90) {
//              name
//              avatar
//          }
//      }

// --- --- сортировка

// При запросе списка данных можно передать значения аргументам, которые будут
//      определять сортировку результата запроса. Способ сортировки можно задать
//      через типы перечисления.

// Направление сортировки.
//      enum SortDirection {
//          ASCENDING
//          DESCENDING
//      }

// Сортировка ограничивается только указанными полями.
//      enum SortablePhotoField {
//          name
//          description
//          category
//          created
//      }

// Указание в запросе allPhotos аргументов сортировки sort и sortBy.
//      Query {
//          allPhotos(
//              sort: SortDirection = DESCENDING
//              sortBy: SortablePhotoField = created
//          ): [Photo!]!
//      }

// Запрос всех фотографий и сортировка по полю name.
//      query {
//          allPhotos(sortBy: name)
//      }

// --- 3.8 Мутации.

// Мутации должны определяться в пользовательском типе объекта и добавляться
//      в схему. Нет никакой разницы между определениями мутации и запроса, но
//      мутация должна создаваться, когда действие направлено на изменение данных.

// Мутации определяют действия, которые пользователи могут сделать с сервисом.
//      При разработке сервиса GraphQL следует создать список действий, которые
//      могут быть выполнены над данными. Это и будут мутации.

// Мутации должны быть добавлены в корневой тип Mutation в схеме, чтобы сделать
//      их доступными для клиента.
//      type Mutation {
//          // мутация postPhoto позволяет публиковать фотографии
//          postPhoto(
//              name: String!
//              description: String
//              category: PhotoCategory=PORTRAIT
//          ): Photo!
//      }
//      schema {
//          query: Query
//          mutation: Mutation
//      }

// Мутация создает фотографию с указанием обязательного аргумента name.
//      Мутация возвращает информацию о созданной фотографии, включая 
//      сгенерированные на сервере идентификатор, url-адрес и время создания. 
//      mutation {
//          postPhoto(name: "Sending the Palisades") {
//              id
//              url
//              created
//              postedBy {
//                  name
//              }
//          }
//      }

// --- --- переменные мутации

// В мутациях можно объявлять переменные, что делает мутацию более универсальной. 
//      mutation postPhoto(
//          $name: String!
//          $description: String
//          $category: PhotoCategory
//      ) {
//          postPhoto(
//              name: $name
//              description: $description
//              category: $category
//          ) {
//              id
//              name
//              email
//          }
//      }

// --- 3.9 Типы ввода.

// Тип ввода аналогичен типу объекта, но применяется только для входных аргументов.

// Использование типа ввода PostPhotoInput для указания входных аргументов.
//      input PostPhotoInput {
//          name: String!
//          description: String
//          category: PhotoCategory=PORTRAIT
//      }
//      type Mutation {
//          postPhoto(input: PostPhotoInput!): Photo!
//      }

// В запросе мутация принимает только один аргумент со всеми входными значениями.
//      mutation newPhoto($input: PostPhotoInput!) {
//          // переменная '$input' передается в мутацию
//          postPhoto(input: $input) {
//              id
//              url
//              created
//          }
//      }

// В запрос мутации следует передать объект JSON в качестве переменной input.
//      {
//          "input": {
//              "name": "...",
//              "description": "...",
//              "category": "LANDSCAPE"
//          }
//      }

// Типы ввода помогают использовать аргументы, упорядочивают схему и улучшают 
//      документацию схемы, что делает API более более простым в освоении.

// Типы ввода позволяют организовать более четкую схему GraphQL. Типы ввода
//      позволяют группировать параметры пагинации, сортировки и фильтрации. 
//      input PhotoFilter {                     // фильтрация Photo
//          category: PhotoCategory             //      по enum
//          createdBetween: DateRange           //      интервалу дат
//          taggedUsers: [ID!]                  //      по тегу
//          searchText: String                  //      по строке
//      }
//      input DateRange {                       // интервал дат
//          start: DateTime!
//          end: DateTime!
//      }
//      input DataPage {                        // пагинация
//          first: Int = 25
//          start: Int = 0
//      }
//      input DataSort {                        // сортировка
//          sort: SortDirection = DESCENDING
//          sortBy: SortablePhotoField = created
//      }
//      // Типы ввода повторно используются в нескольких типах объекта.
//      type User {
//              ...
//          postedPhotos(filter:PhotoFilter, paging:DataPage, sorting:DataSort): [Photo!]!
//          inPhotos(filter:PhotoFilter, paging:DataPage, sorting:DataSort): [Photo!]!
//      }
//      type Photo {
//              ...
//          taggedUsers(sorting:DataSort): [User!]!
//      }
//      type Query {
//              ...
//          allUsers(paging:DataPage, sorting:DataSort): [User!]!
//          allPhotos(filter:PhotoFilter, paging:DataPage, sorting:DataSort): [Photo!]!
//      }

// Запрос принимает сложные входные данные.
//      query getPhotos($filter:PhotoFilter, $page:DataPage, $sort:DataSort) {
//          allPhotos(filter:$filter, paging:$page, sorting:$sort) {
//              id
//              name
//              url
//          }
//      }

// Запрос принимает аргументы для двух типов ввода из трех: $filter, $page, $sort.
//      {
//          "filter": {
//              "category": "ACTION",
//              "taggedUsers": ["MoonTahoe", "EvePorcello"],
//              "createdBetween": {
//                  "start": "2018-11-6",
//                  "end": "2018-5-31"
//              }
//          },
//          "page": {
//              "first": 100
//          }
//      }

// --- 3.10 Возвращаемые типы.

// Запросы могут возвращать метаданные после выполнения запроса в дополнение 
//      к полезным данным. 

// Мутация githubAuth для авторизации возвращает пользователя и токен.
//      type AuthPayload {
//          user: User!
//          token: String!
//      }
//      type Mutation {
//              ...
//          githubAuth(code: String!): AuthPayload!
//      }

// --- 3.11 Подписки.

// Подписка реализует шаблон 'Pub/Sub' с помощью технологий передачи в реальном
//      времени. В схеме тип Subscription определяется, как обычный тип объекта.
//      В пользовательском типе объекта подписка определяется, как поле с типом
//      Subscription. Подписка яыляется отличным решением для обработки данных
//      в реальном времени.

// Пользовательский объект Subscription. При публикации фото, оно будет передано
//      всем клиентам подписавшимся к newPhoto. При создании пользователя, 
//      уведомления получат все клиенты подписавшиеся к newUser.
//      type Subscription {
//          newPhoto: Photo!
//          newUser: User!
//      }

// Подписка должна быть указана в схеме.
//      schema {
//          query: Query
//          mutation: Mutation
//          subscription: Subscription
//      }

// Подписки могут использовать аргументы. Например, для фильтрации уведомлений.
//      type Subscription {
//          newPhoto(category: PhotoCategory): Photo!
//          newUser: User!
//      }

// Подписка позволяет получать уведомления только о публикации фотографий
//      в категории "ACTION".
//      subscription {
//          newPhoto(category: "ACTION") {
//              id
//              name
//              url
//              postedBy {
//                  name
//              }
//          }
//      }

// --- 3.12 Документация схемы.

// При написании схемы GraphQL можно добавлять описание для каждого поля. 
//      Это даст дополнительную информацию о типах и полях схемы, а так же
//      может быть использовано при генерации документации.

// Комментарии к типу User.
//      """
//      пользователь
//      """
//      type User {
//          """
//          идентификатор
//          """
//          login: ID!
//          """
//          имя
//          """
//          name: String
//          """
//          url-адрес фото профиля
//          """
//          avatar: String
//          """
//          фото опубликованные пользователем
//          """
//          postedPhotos: [Photo!]!
//          """
//          фото с пользователем
//          """
//          inPhotos: [Photo!]!
//      }

// Комментарии к аргументам.
//      type Mutation {
//          """
//          авторизация пользователя
//          """
//          githubAuth(
//              "код авторизации"
//              code: String!
//          ): AuthPayload!
//      }

// Комментарии к типам ввода.
//      """
//      входные данные для публикации фото
//      """
//      input PostPhotoInput {
//          "имя фото"
//          name: String!
//          "(опционально) описание фото"
//          description: String
//          "(optional) категория фото"
//          category: PhotoCategory=PORTRAIT
//      }
//      postPhoto(
//          "данные фото"
//          input: PostPhotoInput!
//      ): Photo!