// --------------- 1. Модули и зависимости.

// Применительно к модулям: любая сущность, состояние или формат данных, оказывающая 
//      влияние на модель поведения или структуру компонента, рассматривается как 
//      зависимость. Запутанность дерева зависимостей увеличивает техническую сложность 
//      проекта, что усложняет модификацию и расширение функциональности. 

// Модули являются основным механизмом организации и структурирования кода. Они просты и
//      удобочитаемы, обеспечивают сокрытие информации (инкапсуляцию) и повторное 
//      использование кода, предоставляют эффективный механизм экспортирования 
//      общедоступного интерфейса (module.exports), 

// сцепленность (cohesion) - мера корреляции функций компонента между собой. Модуль, 
//      предназначенный для выполнения только одного действия, когда все его элементы 
//      подчинены решению одной задачи, обладает высокой сцепленностью. Модуль, содержащий 
//      функции выполняющие пусть схожие, но разные задачи, имеет низкую сцепленность;

// связанность (coupling) - мера зависимости от других компонентов системы. Модуль тесно 
//      связан с другим модулем, если непосредственно читает или изменяет данные другого 
//      модуля. Модули, взаимодействующие через глобальное или общее состояние, также тесно 
//      связаны. Модули, взаимодействующие только через передачу параметров, слабо связаны.

// Модули должны обладать высокой сцепленностью и слабой связанностью, что обеспечивает
//      гибкость, повторное использование и расширяемость.

// Использование модулей ведет к созданию жестких связей. Загрузка модулей с собственным 
//      состоянием при помощи функции require похожа на работу с шаблоном 'одиночкой'.

// В JavaScript нет чистых интерфейсов и классов, динамическая типизация сама по себе 
//      обеспечивает естественный механизм для отделения интерфейсов от реализаций.

// --- Антишаблон Одиночка.

// Шаблон Одиночка на данный момент является антишаблоном.

// Шаблон Одиночка можно реализовать при помощи загрузки модулей с состоянием, в которых
//      экспортируется экземпляр объекта. Система модулей кэширует модули после первого 
//      вызова метода require, поэтому последующие вызовы возвратят кэшированный экземпляр.
//      Реализация будет не полной, поскольку в качестве ключа кэша применяется путь 
//      к модулю и каждый пакет может иметь свой набор зависимостей в node_modules, что 
//      гарантирует работу одиночки только в рамках текущего пакета.
// 
//      // экспорт в модуле db
//      module.exports = new Database('my-app-db');
//      // загрузка модуля, как будто 
//      const db = require('./db');

// Полноценный шаблон 'Одиночка' можно реализовать только при помощи глобальных переменных. 
//      Это гарантирует, что экземпляр будет единственным и общим для всего приложения. 
// 
//      global.db = new Database('my-app-db');