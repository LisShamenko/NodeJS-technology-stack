import React from "react";
import Ingredient from "./Ingredient";

// 
export default function IngredientsList({ list }) {
    return (
        <ul className="ingredients">
            {
                // элементы массива сопоставляются с компонентами Ingredient
                list.map((ingredient, i) => (
                    // оператор распространения JSX передаст все данные 
                    //      в компонент Ingredient в качестве свойств
                    <Ingredient key={i} {...ingredient} />
                ))
            }
        </ul>
    );
}