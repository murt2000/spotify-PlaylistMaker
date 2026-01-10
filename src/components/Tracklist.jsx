import React, { useState } from "react";
import Track from "./Track";
/* contains a list of track objects from track.jsx and uses them to create a list is a child of playlists
*/

function Tracklist({ tracks, isInPlaylist, addTrack, rmvTrack, track, showButtons = true }) {



    return (
        <div className="trackList">{tracks.map(track => (
            <Track
                track={track}
                key={track.id}
                trackName={track.name}
                artist={track.artist}
                trackImg={track.image}
                isInPlaylist={isInPlaylist}
                source={track.source}
                addTrack={addTrack}
                rmvTrack={rmvTrack}
                showButtons={showButtons}
            />))}

        </div>
    )
}


export default Tracklist; 