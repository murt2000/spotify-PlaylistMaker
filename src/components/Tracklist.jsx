import React, { useState } from "react";
import Track from "./Track";
/* contains a list of track objects from track.jsx and uses them to create a list is a child of playlists
*/

function Tracklist({ tracks, artist, isInPlaylist, addTrack, rmvTrack }) {



    return (
        <div className="trackList">{tracks.map(track => (
            <Track
                key={track.id}
                trackName={track.name}
                artist={track.artist}
                trackImg={track.image}
                isInPlaylist={isInPlaylist}
                addTrack={addTrack}
                rmvTrack={rmvTrack}
            />))}

        </div>
    )
}


export default Tracklist; 