import React, { useState } from "react";

import './styleComponents/Track.css'


/* contains the induvidual track or song objects that are used as a listitem in a tracklist whitch are a listitem of the playlists component*/

function Track({ track, trackName, artist, trackImg, isInPlaylist, addTrack, rmvTrack, source, showButtons }) {

    return (
        <div className="trackBox">
            <div className="imgBox">
                <img className="trackImg" src={trackImg} alt={trackName} />
            </div>
            <div className="trackText">
                <h3 className="trackName">{trackName}</h3>
                <h4 className="trackArtist">{artist}</h4>
                <h4 className="trackSource">Source: {source}</h4>

            </div>
            {showButtons && (isInPlaylist
                ? <button className="trackButton" onClick={() => rmvTrack(track)}>-</button>
                : <button className="trackButton" onClick={() => addTrack(track)}>+</button>
            )}
        </div>
    )

}

export default Track;