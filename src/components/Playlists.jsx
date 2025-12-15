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

function Playlists({playlists, loadingPlaylists, playlistsError}) {

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


            {playlists.map(tl => (
                <div key={tl.id} className="plBox">

                   
                    {!tl.editingName ? ( 
                    <h3
                        className="playlistHeader"
                        //onClick={() => toggleTracklist(tl.id)}
                        //onDoubleClick={() =>startEditing(tl.id)}
                        style={{cursor: "pointer", userSelect: 'none'}}    
                    >
                        
                    <span className="arrow">
                        {tl.expanded ? "▼" : "▶"}
                    </span>
                    {tl.name}
                     </h3> 
                    ) : ( 
                        
                        <input
                        type='text'
                        autoFocus
                        defaultValue={tl.name}
                        onBlur={(e) => saveName(tl.id, e.target.value)}
                        onKeyDown={(e) => {
                            if(e.key === 'Enter'){
                                saveName(tl.id, e.target.value)
                            }
                        }}
                        />
                    )}
                   
                   

                      

                    {tl.expanded && (
                        <div className="tracklistContainer">    
                        <Tracklist
                            tracks={[]}
                            isInPlaylist={true}
                            addTrack={(name) => console.log(`adding ${name}`)}
                            rmvTrack={(name) => console.log(`removeing ${name}`)}
                        />
                    <button id="export">Export</button>
                    </div>
            )}
            
            </div>
            ))}
        </div>
    );
}
export default Playlists;