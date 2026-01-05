import React from "react";
import Playlists from "./Playlists";
import './styleComponents/importPlaylists.css'


function ImportPlaylist({ onClose, crtBlank, myPlaylists, loadingMyPlaylists, myPlaylistsError, onImportQueryChange, importQuery, selectPlaylist }) {

    /* importing playlist happens here this is a pop up
       can serch for spotify playlists import a user playlist or make a blank playlist    
    */
    if (loadingMyPlaylists) {
        return (
            <div>
                <h1>{loadingMyPlaylists}</h1>
            </div>
        )
    }

    function handleChange(e) {
        const v = e.target.value;
        onImportQueryChange?.(v);
    }
    return (
        <div>
            <input
                id='searchInput'
                type='text'
                placeholder="search spotify"
                value={importQuery}
                onChange={handleChange}
            />
            {myPlaylistsError && <div>{myPlaylistsError}</div>}

            <label htmlFor="blankPl">Make a new Playlist</label>
            <button id="blankPl" onClick={() => crtBlank?.()}>make</button>
            <button type="button" onClick={() => onClose?.()}>Close</button>
            <div id="litsOfPlaylists">
                {(myPlaylists ?? []).map((pl) => (
                    <Playlists key={pl.id ?? pl.name}
                        playlist={pl}
                        name={pl.name}
                        tracksTotal={pl.tracksTotal ?? pl.tracks?.length ?? 0}
                        isOwnedByMe={pl.isOwnedByMe}
                        image={pl.image}
                        selectPlaylist={selectPlaylist}

                    />
                ))}

            </div>
        </div>
    )

}

export default ImportPlaylist;