import { Component } from "@angular/core";

@Component({
    selector: "float-elements-component",
    templateUrl: "./float_elements.template.html",
    styleUrls: ["./float_elements.style.css"],
})
export class FloatElementsComponent { }

// --------------- плавающие элементы

// плавающий элемент - это объект, который извлекается из потока документа и выравнивается по одной 
//      из сторон контейнера, поток документа будет обтекать такой элемент, несколько таких элементов 
//      будут выстраиваться один за другим по горизонтале

// - плавающие элементы использовались как инструмент компоновки страниц, потому что это был единственный 
//      вариант, сейчас как альтернативы используются: свойства 'display: inline-block' или 'display: table',
//      flex-контейнеры, CSS-сетки

// - шаблон двойного контейнера:
// контент размещается внутри двух вложенных контейнеров и поля внутреннего контейнера не выходят за 
//      пределы внешнего, внешний контейнер растягивается на всю ширину области просмотра 'width: 100%',

// --------------- схлопывание контейнера и clearfix

// - плавающие элементы не добавляют высоту родительским элементам, как это делают другие элементы в 
//      потоке документа, плавающие элементы извлекаются из нормального потока документа, все это 
//      исходит из первоначального предназначения плавающих элементов, быть обтекаемыми текстом,
//      плавающий элемент из одного контейнера будет обтекаться текстом из следующего контейнера

// - если контейнер со свойством 'clear: both' поместить после плавающего элемента, то это расширит
//      высоту основного контейнера до нижнего края плавающего элемента, так как контейнер clear
//      размещается ниже плавающего элемента, значения left и right сбрасывают соответствующие 
//      типы обтекания 

// Псевдоэлементы - это специальные селекторы, воздействующие на разные части документа, 
//      ::before и ::after для вставки контента в начало или конец элемента

// --------------- Захват плавающего элемента.

// РЕКОМЕНДАЦИЯ:
// если не известно количество элементов в строке, например, это может зависеть от ширины области
// просмотра, то лучше сделать разметку по другому: flex-контейнерами, строчно-блочными элементами

// --------------- Блочный контекст форматирования.

// шаблон медиаобъекта: изображение слева, описательный контент — справа

// блок контекста форматирования - это часть потока документа, в которой размещаются элементы, 
//      блок контекста изолирует свой контент от внешнего контекста, если установить для элемента 
//      новый блок контекста форматирования, то он не будет накладываться на блоки других 
//      элементов:
//
// - поля всех элементов внутри блока не будут схлопываться с полями элементов вне блока
// - плавающие элементы внутри блока не перекрываются с элементами вне блока
// - свойство clear примененное к блоку сбросит обтекание внутри блока

// способы создать новый блок контекста форматирования:
// 
// - плавающие элементы, любое значение float кроме none (left, right)
// - любое значение overflow, кроме visible (hidden, auto, scroll)
// - блочные контейнеры, значения display: 
//      [inline-block, table-cell, table-caption, flex, inline-flex, grid, inline-grid]
// - значения position: absolute, fixed

// корневой элемент страницы создает блок контекста форматирования верхнего уровня

// --------------- CSS-сетка.

// CSS-сетки - набор классов позволяющих структурировать часть страницы на строки и колонки,
//      сетка содержит наборы значений ширины, позиционирования и не задает никаких визуальных
//      стилей, внутри сетки может быть размещен любой стилизованный контент