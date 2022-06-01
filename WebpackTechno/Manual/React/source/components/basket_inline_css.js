import React from 'react';



// --- 2.5 Inline CSS in React

// Встроенные стили CSS не должны заменять подходы подключения CSS. Но они 
//      полезны для быстрого прототипирования или управления CSS через JavaScript.
//      Для этого в атрибут style элементов JSX можно передавать объект стиля и
//      не требуется изменять файлы CSS.

// Недостаток этого подхода в том, что код JSX становится менее читабельным, 
//      поскольку код отвечающий за стиль смешивается с кодом HTML. 
function Basket_inline_css({ items, onClick }) {
    return (
        <ul
            style={{
                margin: '0',
                padding: '0',
                listStyleType: 'none',
            }} >
            {items.map((item) => (
                <li key={item.id}
                    style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        padding: '8px 0',
                    }}>
                    {item.name}
                    <button type="button" onClick={() => onClick(item)}
                        style={{
                            cursor: 'pointer',
                            border: '1px solid #1a202c',
                            padding: '8px',
                            minWidth: '64px',
                            background: 'transparent',
                            transition: 'all 0.1s ease-in',
                        }} >
                        {item.isFavorite ? 'Unlike' : 'Like'}
                    </button>
                </li>
            ))}
        </ul>
    );
}
export default Basket_inline_css;