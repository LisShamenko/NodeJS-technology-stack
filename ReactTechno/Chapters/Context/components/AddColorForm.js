import React from "react";
import { useCustomContext } from "./../providers/CustomProvider";
import useInput from "./../../../hooks/useInput";

// компонент AddColorForm, метод onNewColor заменяется на использование 
//      хука useCustomContext
// 
//      AddColorForm({ onNewColor = f => f })
export default function AddColorForm() {

    // 
    const { addColor } = useCustomContext();

    // 
    const [titleProps, resetTitle] = useInput("");
    const [colorProps, resetColor] = useInput("#000000");

    // 
    const submit = e => {
        e.preventDefault();

        // функции вызываются напрямую
        //      onNewColor(titleProps.value, colorProps.value);
        addColor(titleProps.value, colorProps.value);
        resetTitle();
        resetColor();
    };

    // 
    return (
        <form onSubmit={submit}>
            <input {...titleProps} type="text" placeholder="..." required />
            <input {...colorProps} type="color" required />
            <button>ADD</button>
        </form>
    );
}