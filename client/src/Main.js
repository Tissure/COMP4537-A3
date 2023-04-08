import React from 'react';
import Search from "./Search";
import FilteredPokemon from "./FilteredPokemon";
import { useState } from "react";

function Main() {
    const [typeSelectedArray, setTypeSelectedArray] = useState([]);
    return (
        <>
            <Search
                setTypeSelectedArray={setTypeSelectedArray}
                typeSelectedArray={typeSelectedArray}
            />
            <FilteredPokemon
                typeSelectedArray={typeSelectedArray}
            />
        </>
    );
}

export default Main;