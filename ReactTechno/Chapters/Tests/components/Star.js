import React from "react";
import { FaStar } from "react-icons/fa";

export default function Star({ selected = false }) {
    return (
        <>
            <h1>Star</h1>
            <FaStar color={selected ? "red" : "grey"} id="star" />
        </>
    );
}