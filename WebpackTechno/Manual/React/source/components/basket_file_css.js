import React from 'react';



// --- 2.1 CSS-in-CSS: CSS in React

// Этот способ заключается в использовании файлов CSS в компонентах React. 
//      Это означает, что будут доступны все классы стилей из файла CSS и
//      для добавления новых классов потребуется редактировать файл CSS.
//      Недостаток этого метода в том, что обычный CSS не предоставляет
//      расширенных возможностей, как Sass.

// импорт файла CSS
import './../css_file_css.css';

// 
function Basket_file_css({ items, onClick }) {
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
export default Basket_file_css;