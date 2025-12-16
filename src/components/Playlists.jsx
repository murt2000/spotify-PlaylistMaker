import React, { useState } from "react";
import Tracklist from "./Tracklist";
import Track from "./Track";

import './styleComponents/Playlist.css'
/* 
import playlist meta data in App.jsx and display user's playlists
when expanded fetch tracks for that playlist from spotify api and display them using tracklist component, store those tracks in state and keep them
so you don't have to fetch them again when collapsing/expanding
able to add new playlists
able to rename playlists
able to expand/collapse playlists to show/hide tracks
disable renaming playlists that were imported from spotify
export button clicks gives a pop up with options export import on export reload website 
*/




function Playlists({playlists, loadingPlaylists, playlistsError, onToggleTracklist, expandedPlaylistId}) {

    
    if (loadingPlaylists) {
        return <div>Loading playlists...</div>;
    }
    if (playlistsError) {
        return <div>Error loading playlists: {playlistsError.message}</div>;
    }

    // we keep names and editing here as it does not come from spotify api
   /* function startEditing(id) {
        setTracklists(prev =>
            prev.map(tl =>
                tl.id === id
                ? {...tl, editingName: true}
                : tl
            )
        )
        
    }
    function saveName(id, newName){
        setTracklists(prev =>
            prev.map(tl =>
                tl.id === id
                ?{...tl, name: newName, editingName: false}
                : tl
            )
        )
    }*/

    function saveName(id, newName){
        // placeholder function
        console.log(`Saving name ${newName} for playlist with id ${id}`);
    }


    console.log("playlists:", playlists);
console.log("first playlist:", playlists?.[0]);
    return(
        <div id='Playlists'>
            <h2>Your playlists</h2>
            <button>+</button>


            {playlists.map(pl => {
  const isExpanded = expandedPlaylistId === pl.id;

  return (
    <div key={pl.id} className="plBox">
      <h3
        className="playlistHeader"
        onClick={() => onToggleTracklist(pl.id)}
        style={{ cursor: "pointer", userSelect: "none" }}
      >
        <span className="arrow">{isExpanded ? "▼" : "▶"}</span>
        {pl.name}
      </h3>

      {isExpanded && (
        <div className="tracklistContainer">
          <Tracklist tracks={[]} isInPlaylist={true} addTrack={() => {}} rmvTrack={() => {}} />
          <button id="export">Export</button>
        </div>
      )}
    </div>
  );
})}

        </div>
    );
}
export default Playlists;