// react и react-dom импортируются, чтобы webpack мог добавить их в пакет
import React from "react";
import { render } from "react-dom";

// импорт корневого компонента и данных
import Menu from "./components/Menu";
import dataRecipes from "./data/dataRecipes";

// рендеринг компонента в DOM
render(
    // данные передаются в виде свойства recipes
    <Menu recipes={dataRecipes.recipes} title="Recipes" />,
    document.getElementById("main-recipes")
);