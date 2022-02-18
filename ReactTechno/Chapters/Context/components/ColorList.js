import React from "react";
import Color from "./Color";
import { useCustomContext } from "./../providers/CustomProvider";

// компонент ColorList
export default function ColorList() {

    // компонент получает доступ к контексту через хук
    const { colors } = useCustomContext();

    // 
    if (!colors.length) {
        return (<div>No Colors.</div>);
    }

    // 
    return (
        <div className="color-list">
            {colors.map(color => <Color key={color.id} {...color} />)}
        </div>
    );
}