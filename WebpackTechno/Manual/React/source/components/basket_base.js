import React from 'react';

// Компонент отображает список элементов с кнопками. 
function Basket_base({ items, onClick }) {
    return (
        <ul>
            {items.map((item) => (
                <li key={item.id}>
                    {item.name}
                    <button type="button" onClick={() => onClick(item)}>
                        {item.isFavorite ? 'Unlike' : 'Like'}
                    </button>
                </li>
            ))}
        </ul>
    );
}
export default Basket_base;