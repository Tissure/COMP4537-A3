import React from 'react';
import Search from "./Search";
import FilteredPokemon from "./FilteredPokemon";
import { useState } from "react";

function Main(accessToken) {
    const [typeSelectedArray, setTypeSelectedArray] = useState([]);
    return (
        <>
            <Search
                setTypeSelectedArray={setTypeSelectedArray}
                typeSelectedArray={typeSelectedArray}
            />
            <FilteredPokemon
                typeSelectedArray={typeSelectedArray}
                accessToken={accessToken}
            />
        </>
    );
}

export default Main;