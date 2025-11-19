import React, {useState} from "react";

import './styleComponents/SearchBar.css'

/*function for a sting input -- maybe interface with the API here. */

function SearchBar(){

    return(
        <div id='searchbar'>
            <input id='searchInput' type='text' placeholder="search spotify"/> 

        </div>
    )
}
export default SearchBar;