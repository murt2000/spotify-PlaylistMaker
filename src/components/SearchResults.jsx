import React, { useState, useEffect } from "react";
import Tracklist from "./Tracklist";

function SearchResults({ tracks, loading, query, error, addTrack }) {


    return (
        <div id='results'>
            <h2>Search results{query ? ` for "${query}"` : ''}</h2>
            {loading && <div>Loading...</div>}
            {error && <div>{error}</div>}
            <Tracklist
                tracks={tracks || []}
                isInPlaylist={false}
                addTrack={addTrack}

            />
        </div>
    );
}

export default SearchResults;