import React from "react";
import Recipe from "./Recipe";

// код можно улучшить, если использовать деструктуризацию объекта, чтобы 
//      ввести переменные title и recipes в область видимости функции Menu:
//
//      function Menu(props)
//                      │ ╰────╮ 
//      function Menu({ title, recipes })

// 
export default function Menu({ title, recipes }) {
    return (
        <article>
            <header>
                <h1>{title}</h1>
            </header>
            
            <hr />
            {
                // Для каждого элемента массива recipes добавляется компонент Recipe.
                //      Свойства указываются вручную. Свойство key используется 
                //      для идентификации каждого элемента.
            }
            <div className="recipes" >
                {recipes.map((recipe, i) => (
                    <Recipe key={i}
                        name={recipe.name}
                        steps={recipe.steps}
                        ingredients={recipe.ingredients}
                    />
                ))}
            </div>

            <hr />
            {
                // Код можно улучшить с помощью оператора распространения JSX, 
                //      это добавит поля объекта recipe в качестве свойств 
                //      компоненту Recipe, но свойств может оказаться слишком
                //      много.
            }
            <div className="recipes">
                {recipes.map((recipe, i) => (
                    <Recipe key={i}
                        {...recipe}
                    />
                ))}
            </div>
        </article>
    );
}