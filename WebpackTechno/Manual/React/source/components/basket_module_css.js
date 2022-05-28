import React, { Fragment } from 'react';



// --- 2.3 CSS-in-CSS: CSS Modules in React

//  CSS-модули можно использовать как с CSS, так и с Sass. 

// Явный импорт CSS-модуля из файла SASS. Объект стиля JavaScript будет содержать
//      все стили из файла CSS и его можно использовать в JSX компонента React.
import styles from './../css.module.css';

// 
function Basket_module_css({ items, onClick }) {

    console.log('---', styles);

    // Стиль можно получить обратившись к свойству объекта styles, если имя класса 
    //      состоит из одного слова. Имена классов CSS обычно имеют форму в нотации
    //      kebab-case, в этом случае стиль можно получить с помощью строки.
    return (
        <Fragment>
            <ul className={styles['unordered-list']}>
                {items.map((item) => (
                    <li key={item.id} className={styles['list-item']}>
                        {item.name}
                        <button type="button"
                            className={styles.button}
                            onClick={() => onClick(item)} >
                            {item.isFavorite ? 'Unlike' : 'Like'}
                        </button>
                    </li>
                ))}
            </ul>
        </Fragment>
    );
}
export default Basket_module_css;