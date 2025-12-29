import React, { useState } from "react";

import './styleComponents/SearchBar.css'

/* Accept `onQueryChange` prop and call it when input changes */
function SearchBar({ token, onQueryChange }) {
    const [value, setValue] = useState("");

    function handleChange(e) {
        const v = e.target.value;
        setValue(v);
        if (typeof onQueryChange === 'function') onQueryChange(v);
    }

    return (
        <div id='searchbar'>
            <input
                id='searchInput'
                type='text'
                placeholder="search spotify"
                value={value}
                onChange={handleChange}
            />
        </div>
    )
}

export default SearchBar;