import React, {useState} from "react";
import Track from "./Track";
/* contains a list of track objects from track.jsx and uses them to create a list is a child of playlists
*/ 

function Tracklist({ tracks, isInPlaylist, addTrack, rmvTrack}) {



    return(
        <div>{tracks.map(track => (
            <Track
            key={track.id}
            trackName={track.name}
            artistName={track.artist}
            trackImg={track.image}
            isInPlaylist={isInPlaylist}
            addTrack={addTrack}
            rmvTrack={rmvTrack}
            />))}</div>
    )
}


export default Tracklist; 