import React from "react";
import IngredientsList from "./IngredientsList";
import InstructionsList from "./InstructionsList";

// функциональный компонент Recipe
export default function Recipe({ name, ingredients, steps }) {

    // с помощью деструктуризации объекта можно ссылаться на необходимые 
    //      свойства, чтобы не применять приставку 'props.'

    return (
        // преобразует символы к нижнему регистру и заменяет пробелы на дефисы
        <section id={name.toLowerCase().replace(/ /g, "-")}>
            <h1>{name}</h1>
            {
                // выражение сопоставляет каждый ингредиент с элементом li, 
                //      который выводит название ингредиента
                // 
                //      <ul className="ingredients">
                //          {ingredients.map((ingredient, i) => (
                //              <li key={i}>{ingredient.name}</li>
                //          ))}
                //      </ul>
            }
            {
                // функция map возвращает массив дочерних элементов
                // 
                //      <section className="instructions">
                //          <h2>Cooking Instructions</h2>
                //          {steps.map((step, i) => (
                //              <p key={i}>{step}</p>
                //          ))}
                //      </section>
            }
            {
                // ингредиенты передаются компоненту в виде массива в свойстве list
            }
            <IngredientsList list={ingredients} />
            <InstructionsList title="Cooking Instructions" steps={steps} />
        </section>
    );
}