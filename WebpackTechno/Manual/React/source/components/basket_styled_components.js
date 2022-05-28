import React from 'react';



// --- 2.4 CSS-in-JS: Styled Components in React

// В этом подходе не используются файлы стилей, поскольку все необходимое
//      для стилизации поставляется с помощью JavaScript. 

// Библиотека styled-components позволяет создавать компоненты из тегов HTML и 
//      стилей, указанных в виде строки. 
//      npm install styled-components
import styled from 'styled-components';

// Библиотека Styled Components избавляет от многих проблем, которые раньше 
//      решались с помощью модулей CSS (область видимости) и Sass (функции CSS).

// Создать компонент Button, который можно использовать в JSX. При определении
//      стиля доступны расширенные возможности, как у Sass.
const Button = styled.button`
    cursor: pointer;
    border: 1px solid #1a202c;
    padding: 8px;
    min-width: 64px;
    background: transparent;
    transition: all 0.1s ease-in;

    &:hover {
        background: #1a202c;
        color: #ffffff;
    }
`;

// Объект styled предлагает функции для создания всех элементов HTML. Всё, что
//      помещается в строковый литерал, становится стилем компонента.
const UnorderedList = styled.ul`
    margin: 0;
    padding: 0;
    list-style-type: none;
`;

// 
const ListItem = styled.li`
    display: flex;
    justify-content: space-between;
    padding: 8px 0;
`;

//
function Basket_styled_components({ items, onClick }) {
    return (
        <UnorderedList>
            {items.map((item) => (
                <ListItem key={item.id}>
                    {item.name}
                    {
                        // Любые свойства компонента Button будут передаваться 
                        //      в HTML-элемент кнопки.
                    }
                    <Button type="button" onClick={() => onClick(item)}>
                        {item.isFavorite ? 'Unlike' : 'Like'}
                    </Button>
                </ListItem>
            ))}
        </UnorderedList>
    );
}
export default Basket_styled_components;