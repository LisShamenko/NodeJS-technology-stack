import React from "react";
import StarRating from "./StarRating";
import { useCustomContext } from "./../providers/CustomProvider";

// компонент Color
export default function Color({ id, title, color, rating }) {

    // получает доступ к функциям rateColor и removeColor через контекст
    const { rateColor, removeColor } = useCustomContext();

    // 
    return (
        <section>
            <h1>{title}</h1>
            <button onClick={() => removeColor(id)}>X</button>
            <div style={{ height: 50, backgroundColor: color }} />
            <StarRating
                selectedStars={rating}
                onRate={rating => rateColor(id, rating)}
            />
        </section>
    );
}