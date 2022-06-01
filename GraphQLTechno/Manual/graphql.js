// --------------- 1. GraphQL.

//      http://spec.graphql.org/
//      https://graphql.org/code/
//      https://github.com/graphql/graphql-js

// --- 1.1 Язык запросов GraphQL.

// GraphQL - это язык запросов для реализации API и среда выполнения для запросов 
//      данных. Сервис GraphQL является транспортно независимым, но обычно 
//      обслуживается через HTTP.

// SWAPI (Star Wars API) - сервис для выполнения запросов GraphQL для получения
//      данных о фильмах Star Wars.
//      https://graphql.org/swapi-graphql

// GraphQL позволяет получать все необходимые данные по одному запросу. На сервере 
//      запрос проверяется на наличие системы типов. Каждый сервис GraphQL определяет 
//      типы в схеме GraphQL. Систему типов можно представить как схему данных API, 
//      состоящую из списка пользовательских объектов.

// GraphQL можно рассматривать как декларативный язык для извлечения данных. 
//      В запросе перечисляются данные, которые следует вернуть, но не уточняется, 
//      как они должны быть получены.

// --- --- спецификация GraphQL

// GraphQL - это спецификация для клиент-серверного взаимодействия. Спецификация 
//      описывает язык и грамматику, которые применяются при написании запросов.
//      А также устанавливает систему типов, механизмы ее выполнения и проверки.
//      GraphQL не определяет используемый язык программирования, хранение данных 
//      и поддерживаемых клиентов. Язык запросов - это рекомендации, архитектура
//      проекта определяется разработчиком.

// --- --- принципы проектирования GraphQL

// - Запросы GraphQL формируется в виде иерархии полей и результат запроса будет
//      иметь точно такую же иерархию данных.

// - Реализация GraphQL зависит от потребностей клиента, языка и среды выполнения, 
//      которые поддерживает клиент.

// - Сервер GraphQL имеет строгую типизацию. Каждая точка данных в схеме имеет 
//      определенный тип данных.

// - Запросы GraphQL формируются клиентами.

// - GraphQL позволяет делать запросы к системе типов.

// --- 1.2 Недостатки REST.

// Архитектура REST - это ресурсо-ориентированная архитектура, в которой пользователи 
//      перемещаются по веб-ресурсам, выполняя операции: GET, PUT, POST, DELETE. 
//      Сеть ресурсов можно рассматривать как виртуальную машину состояний, а 
//      операции как изменения текущего состояния в машине.

// --- --- чрезмерная выборка данных

// Обычно запросы REST выдают избыточные данные в формате JSON. Например,
//      следующая выборка получает множество не нужных данных:

// GET-запрос 'https://swapi.co/api/people/1/'
//      {
//          "name":         "...",
//          "height":       "...",
//          "mass":         "...",
//          "hair_color":   "...",
//          "skin_color":   "...",
//          "eye_color":    "...",
//          "birth_year":   "...",
//          "gender":       "...",
//          "homeworld":    "...",
//          "films":        [
//                              "https://swapi.co/api/films/2/",
//                                  ...
//                          ],
//          "species":      [...],
//          "vehicles":     [...],
//          "starships":    [...],
//          "created":      "...",
//          "edited":       "...",
//          "url":          "https://swapi.co/api/people/1/"
//      }

// Запрос GraphQL позволяет выбрать только те данные, которые реально нужны:
//      {
//          "name":         "...",
//          "height":       "...",
//          "mass":         "..."
//      }

// --- --- недостаточная выборка данных

// Если первый GET-запрос содержит не все данные, то потребуются дополнительные
//      запросы данных. Например, предыдущий запрос не получает данные по фильмам
//      в поле films. Чтобы получить названия всех фильмов потребуется сделать 
//      дополнительные запросы в количестве равном длине массива films. Каждый 
//      запрос приводит к передаче избыточных данных. 

//      {
//          "title":            "...",
//          "episode_id":       0,
//          "opening_crawl":    "...",
//          "director":         "...",
//          "producer":         "...",
//          "release_date":     "...",
//          "characters":       [...],
//          "planets":          [...],
//          "starships":        [...],
//          "vehicles":         [...],
//          "species":          [...],
//          "created":          "...",
//          "edited":           "...",
//          "url":              "https://swapi.co/api/films/2/"
//      }

// Проблема недостаточной выборки может быть решена GraphQL с помощью определения
//      вложенного запроса и получения всех данных в одной выборке. Форма запроса 
//      будет соответствовать форме возвращаемых данных.

// --- --- управление конечными точками

// При поддержки REST API приходится создавать новые конечные точки, количество 
//      которых может быстро выйти из-под контроля. Приложения могут использовать
//      настраиваемые конечные точки для минимизации HTTP-запросов. Настройка 
//      новых конечных точек увеличивает время разработки и усложняет взаимодействие 
//      между frontend и backend разработчиками.

// Сервер GraphQL использует единую конечную точку, которая управляет несколькими 
//      источниками данных и упрощает организацию данных. Многие системы используют 
//      GraphQL и REST вместе. Конечная точка GraphQL может извлекать данные 
//      из конечных точек REST, что является отличным способом постепенного 
//      внедрения GraphQL.