import React, { useEffect, useState } from 'react';
import Page from './Page';
import Pagination from './Pagination';
import axios from 'axios';
// import Cookies from 'js-cookie';

function FilteredPokemon({ typeSelectedArray }) {
  const [pokemons, setPokemons] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const pokemonsPerPage = 10;

  useEffect(() => {
    async function fetchPokemons() {
      const response = await axios.get('https://raw.githubusercontent.com/fanzeyi/pokemon.json/master/pokedex.json');
      let data = response.data.filter(pokemon =>
        typeSelectedArray.every((type => pokemon.type.includes(type)))
      );

      setPokemons(data);
    }
    fetchPokemons();
  }, [typeSelectedArray]);

  const indexOfLastRecord = currentPage * pokemonsPerPage;
  const indexOfFirstRecord = indexOfLastRecord - pokemonsPerPage;
  const currentPokemons = pokemons.slice(indexOfFirstRecord, indexOfLastRecord);
  const numberOfPages = Math.ceil(pokemons.length / pokemonsPerPage);

  return (
    <>
      < Page currentPokemons={currentPokemons} currentPage={currentPage} />
      < Pagination
        numberOfPages={numberOfPages}
        currentPage={currentPage}
        setCurrentPage={setCurrentPage}
      />
    </>
  );
}

export default FilteredPokemon;
