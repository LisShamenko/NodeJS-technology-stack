import { DOCUMENT } from "@angular/common";
import { Component, Inject } from "@angular/core";
import * as fontfaceobserver from "fontfaceobserver";

declare function fontsEventListeners(document: any, fontRoboto: FontFaceObserver, fontKurale: FontFaceObserver): any;

@Component({
    selector: "fonts-component",
    templateUrl: "./fonts.template.html",
    styleUrls: ["./fonts.style.css"],
})
export class FontsComponent {

    private fontRoboto: FontFaceObserver;
    private fontKurale: FontFaceObserver;

    constructor(@Inject(DOCUMENT) private document: any) {
        console.log('--- --- --- FontFaceObserver = ' + FontFaceObserver);
        this.fontRoboto = new FontFaceObserver('Roboto');
        this.fontKurale = new FontFaceObserver('Kurale');
        console.log('--- --- --- this.fontRoboto = ' + this.fontRoboto);
        console.log('--- --- --- this.fontKurale = ' + this.fontKurale);
    }

    ngOnInit() {
        fontsEventListeners(document, this.fontRoboto, this.fontKurale);
    }
}

// --------------- Веб-шрифты.

// - веб-шрифты задействуют правило @font-face для задания адреса шрифта, шрифты 
//      предоставляются сервисами: www.typekit.com, www.webtype.com, fonts.google.com и др.

// - гарнитурой называется совокупность шрифтов (начертаний) различных вариаций: 
//      обычный, полужирный, курсив и другие

// --------------- Контроль загрузки шрифтов.

// - шрифты могут сильно замедлять загрузку страницы, поэтому следует выбирать 
//      только действительно нужные начертания шрифта

// - медленная загрузка шрифта может привести к ряду эффектов в зависимости от 
//      обработки данной ситуации браузером, то есть шрифт не загружен, а разметка с 
//      контентом уже отображается: 
//      - FOUT (flash of unstyled text - вспышка нестилизованного текста) происходит,
//          если браузер заменяет стилизованный шрифт системным
//      - FOIT (flash of invisible text - вспышки невидимого текста) происходит, если
//          браузер просто скрывает текст до момента загрузки стилизованного шрифта

// - решением проблемы FOUT/FOIT является контроль загрузки шрифта через JavaScript:
//      'Font Face Observer' - 'https://fontfaceobserver.com/'

// - свойство font-display позволяет контролировать загрузку шрифтов без JavaScript, 
//      для быстрых соединений fallback, для медленных swap, если шрифт не важен optional:
//      auto        по умолчанию, 'вспышка невидимого текста'
//      swap        'вспышка нестилизованного текста'
//      fallback    сначала текст не видим (100мс), потом используются системные шрифты,
//                  стилизованный текст используется, как только будет загружен 
//      optional    браузер сам определяет какие шрифты использовать

// --------------- Текстовые интервалы.

// - свойство line-height и свойство letter-spacing отвечают за интервалы между 
//      строками (вертикальные) и между буквами (горизонтальные)
// - настройка этих свойств может сильно влиять на читабельность текста, при сжатом 
//      тексте строку можно пропустить или прочитать дважды, при растянутом тексте 
//      отдельные буквы привлекают слишком много внимания и требуются дополинтельные 
//      усилия для складывания слов
// - лучший способ определить интервалы: найти слишком сжатый и разреженный текст,
//      после чего выбрать промежуточное значение

// - для свойства line-height значение normal составляет примерно 1.2em, обычно 
//      хорошим значением для основного текста является интервал [1.4em, 1.6em],
//      для длинных строк используется большая высота строки, оптимальная длина 
//      строки 45-75 символов

// - свойство letter-spacing задает расстояние между символами, это значения в сотые
//      доли единицы em
