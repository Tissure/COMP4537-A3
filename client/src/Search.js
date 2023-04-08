import React, { useEffect } from 'react';
import axios from 'axios';
import { useState } from 'react';

function Search({ setTypeSelectedArray, typeSelectedArray }) {
    const [types, setTypes] = useState([]);


    // this function will be called only once when the component is mounted
    useEffect(() => {
        async function fetchTypes() {
            const response = await axios.get('https://raw.githubusercontent.com/fanzeyi/pokemon.json/master/types.json');
            setTypes(response.data.map(type => type.english));
        }
        fetchTypes();
    }, []);


    const handleClickF = (e) => {
        const { value, checked } = e.target;

        if (checked) {
            setTypeSelectedArray(typeSelectedArray => [...typeSelectedArray, value]);
        } else {
            setTypeSelectedArray(typeSelectedArray => typeSelectedArray.filter(type => type !== value));
        }
    };


    return (
        <div>
            {
                types.map(type => <div key={type}>
                    <input
                        type="checkbox"
                        value={type}
                        id={type}
                        onChange={handleClickF}
                    />
                    <label htmlFor={type}>{type}</label>


                </div>)
            }
        </div>
    );
}

export default Search;