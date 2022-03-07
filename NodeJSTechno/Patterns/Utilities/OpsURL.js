"use strict";

const path = require('path');
// 
const { URL } = require('url');
// очищает строки от символов юникода
const slug = require('slug');
// лёгкий генератор HTML
const cheerio = require('cheerio');



// преобразовать url-адрес в имя файла
function getNameByURL(url, basePath = '') {

    // разбор URL
    const parsedUrl = new URL(url);

    // 
    const urlPath = parsedUrl
        // разбить адрес 'http://www.example.com'
        .href.split('/')                            // ['http:', '', 'www.example.com', '']
        // убрать пустые сегменты
        .filter(c => c !== '')                      // ['http:', 'www.example.com']
        // убрать символы юникода, которые 
        //      не могут входить в название файла
        .map(c => slug(c, { remove: null }))        // ['http', 'wwwexamplecom']
        // собрать url заново
        .join('/');                                 //  'http/wwwexamplecom'

    // добавить hostname к url
    let filename = path.join(parsedUrl.hostname, urlPath);

    // проверка расширения, extname вернет расширение файла
    if (!path.extname(filename).match(/htm/)) {
        filename += '.html';
    }

    // добавить базовый путь к файлу
    filename = path.join(basePath, filename);

    // 
    return filename;
};

// 
function getLinksFromBody(currentUrl, body) {

    // создать HTML-элемент 'a'
    let c = cheerio.load(body)('a');
    // преобразование масивоподобного объекта с элементами 'a' 
    //      в настоящий массив элементов 'a' 
    let items = [].slice.call(c);

    // 
    return items
        // для каждого элемента 'a' изъять адрес href
        .map(element => getLinkUrl(currentUrl, element))
        // убрать из массива null элементы
        .filter(element => !!element);
};

// 
function getLinkUrl(currentUrl, element) {

    // заменить относительный путь элемента 'a' на абсолютный
    const link = resolve(currentUrl, element.attribs.href || "");

    // проверка на совпадение hostname или отсутствие pathname
    //      const linkUrl = new URL(link);
    //      const curUrl = new URL(currentUrl);
    //      if (linkUrl.hostname !== curUrl.hostname || !linkUrl.pathname) {
    //          return null;
    //      }

    // 
    return link;
};

//      ┌────────────────────────────────────────────────────────────────────────────────────────────────┐
//      │                                              href                                              │
//      ├──────────┬──┬─────────────────────┬────────────────────────┬───────────────────────────┬───────┤
//      │ protocol │  │        auth         │          host          │           path            │ hash  │
//      │          │  │                     ├─────────────────┬──────┼──────────┬────────────────┤       │
//      │          │  │                     │    hostname     │ port │ pathname │     search     │       │
//      │          │  │                     │                 │      │          ├─┬──────────────┤       │
//      │          │  │                     │                 │      │          │ │    query     │       │
//      "  https:   //    user   :   pass   @ sub.example.com : 8080   /p/a/t/h  ?  query=string   #hash "
//      │          │  │          │          │    hostname     │ port │          │                │       │
//      │          │  │          │          ├─────────────────┴──────┤          │                │       │
//      │ protocol │  │ username │ password │          host          │          │                │       │
//      ├──────────┴──┼──────────┴──────────┼────────────────────────┤          │                │       │
//      │   origin    │                     │         origin         │ pathname │     search     │ hash  │
//      ├─────────────┴─────────────────────┴────────────────────────┴──────────┴────────────────┴───────┤
//      │                                              href                                              │
//      └────────────────────────────────────────────────────────────────────────────────────────────────┘
//          Схема URL.

// 
function resolve(from, to) {

    // если from не содержит protocol, то результат будет иметь
    //      protocol из второго аргумента:
    //      ('foo', 'resolve://') => 'resolve://foo'
    let urlFrom = new URL(from, 'resolve://');

    // аналогично протокол будет скопирован из urlFrom
    let urlTo = new URL(to, urlFrom);

    // 
    if (urlTo.protocol === 'resolve:') {
        // protocol отсутствует и в from и в to, тогда адрес формируется
        //      как относительный путь, из pathname/search/hash
        return `${urlTo.pathname}${urlTo.search}${urlTo.hash}`;
    }
    else {
        // адрес возвращается как есть
        return urlTo.toString();
    }
}

// 
module.exports.getNameByURL = getNameByURL;
module.exports.getLinkUrl = getLinkUrl;
module.exports.getLinksFromBody = getLinksFromBody;