// --------------- 10. Сравнение методов выполнения асинхронных задач.

// Fibers 
//      https://npmjs.org/package/fibers

// Streamline 
//      https://npmjs.org/package/streamline

//  ┌─────────────┬───────────────────────────────────────────────────┬─────────────────────────────────────────────────────┐
//  │ Решения     │ Плюсы                                             │ Минусы                                              │
//  ├─────────────┼───────────────────────────────────────────────────┼─────────────────────────────────────────────────────┤
//  │ обычный     │ - не требует применения дополнительных технологий │ Может потребоваться дополнительный код и            │
//  │ JavaScript  │ - часто обладает лучшей производительностью       │ относительно сложные алгоритмы                      │
//  │             │ - позволяет реализовать продвинутые алгоритмы     │                                                     │
//  ├─────────────┼───────────────────────────────────────────────────┼─────────────────────────────────────────────────────┤
//  │ пакет async │ - упрощает разработку наиболее распространенных   │ - добавляет внешнюю зависимость                     │
//  │             │   шаблонов управления выполнением                 │ - подходит не для всех вариантов управления         │
//  │             │ - поддерживает решения на основе обратных вызовов │   выполнением                                       │
//  │             │ - хорошая производительность                      │                                                     │
//  ├─────────────┼───────────────────────────────────────────────────┼─────────────────────────────────────────────────────┤
//  │ объекты     │ - наиболее простой и самый распространенный       │ - требует преобразования программных интерфейсов,   │
//  │ Promise     │   шаблон управления выполнением                   │   основанных на обратных вызовах                    │
//  │             │ - упрощает обработку ошибок                       │ - несколько снижает производительность              │
//  │             │ - является частью спецификации ES2015             │                                                     │
//  │             │ - гарантированный отложенный вызов onFulfilled и  │                                                     │
//  │             │   onRejected                                      │                                                     │
//  ├─────────────┼───────────────────────────────────────────────────┼─────────────────────────────────────────────────────┤
//  │ генераторы  │ - делает неблокирующий программный интерфейс      │ - требует наличия библиотеки управления выполнением │
//  │             │   похожим на блокирующий                          │ - требует обратных вызовов или объектов Promise для │
//  │             │ - упрощает обработку ошибок                       │   реализации непоследовательного выполнения         │
//  │             │ - является частью спецификации ES2015             │ - требует приведения программных интерфейсов к      │
//  │             │                                                   │   преобразователям или объектам Promise,            │
//  │             │                                                   │   не основанным на генераторах                      │
//  ├─────────────┼───────────────────────────────────────────────────┼─────────────────────────────────────────────────────┤
//  │ async/await │ - делает неблокирующий программный интерфейс      │ - возможно все еще не поддерживается и              │
//  │             │   похожим на блокирующий                          │   требует Babel                                     │
//  │             │ - наглядный и интуитивно понятный синтаксис       │                                                     │
//  └─────────────┴───────────────────────────────────────────────────┴─────────────────────────────────────────────────────┘