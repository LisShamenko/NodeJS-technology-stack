import React from "react";

// 
export default function InstructionsList({ title, steps }) {
    return (
        <section className="instructions">
            <h2>{title}</h2>
            {steps.map((s, i) => (
                <p key={i}>{s}</p>
            ))}
        </section>
    );
}