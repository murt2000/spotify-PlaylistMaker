import React, {useState} from "react";



/* contains the induvidual track or song objects that are used as a listitem in a tracklist whitch are a listitem of the playlists component*/ 

function Track({ trackName, artistName, trackImg, isInPlaylist, addTrack, rmvTrack}) {
    
    return(
        <div>
            <h3>{trackName}</h3>
            <h4>{artistName}</h4>
            <img src={trackImg} alt={trackName} />
            {
            isInPlaylist ? 
            (
            <button onClick={() => rmvTrack(trackName)}>-</button>
            ):( <button onClick={() => addTrack(trackName)}>+</button>
            )}
        </div>
    )

}

export default Track;