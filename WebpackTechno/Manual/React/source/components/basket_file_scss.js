import React from 'react';



// --- 2.2 CSS-in-CSS: Sass in React

// Способ заключается в использовании файлов SASS вместо CSS. 

// Sass (Syntactically Awesome Style Sheets) - это расширение CSS, которое дает 
//      дополнительные возможности CSS, например, переменные CSS и вложенные 
//      селекторы CSS. Псевдокласс :hover в файле SASS заменяется родительским 
//      селектором &, который ссылается на внешний селектор button. Таким образом, 
//      селекторы CSS можно вкладывать друг в друга.

// Еще один недостаток файлов CSS и SASS заключается в том, что весь CSS доступен 
//      глобально после его импорта. В большинстве случаев требуется ограничить 
//      использование стилей одним файлом JavaScript или одним компонентом React.

// импорт файла SASS
import './../css_file_css.scss';

// 
function Basket_file_scss({ items, onClick }) {
    return (
        <ul className="unordered-list">
            {items.map((item) => (
                <li key={item.id} className="list-item">
                    {item.name}
                    <button
                        type="button"
                        className="button"
                        onClick={() => onClick(item)}>
                        {item.isFavorite ? 'Unlike' : 'Like'}
                    </button>
                </li>
            ))}
        </ul>
    );
}
export default Basket_file_scss;