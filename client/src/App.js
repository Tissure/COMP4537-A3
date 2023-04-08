import Search from "./Search";
import FilteredPokemon from "./FilteredPokemon";
import { useState } from "react";

function App() {
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

export default App;