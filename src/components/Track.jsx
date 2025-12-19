import React, { useState } from "react";

import './styleComponents/Track.css'


/* contains the induvidual track or song objects that are used as a listitem in a tracklist whitch are a listitem of the playlists component*/

function Track({ trackName, artist, trackImg, isInPlaylist, addTrack, rmvTrack }) {

    return (
        <div className="trackBox">
            <div className="imgBox">
                <img className="trackImg" src={trackImg} alt={trackName} />
            </div>
            <div className="trackText">
                <h3 className="trackName">{trackName}</h3>
                <h4 className="trackArtist">{artist}</h4>
            </div>
            {
                isInPlaylist ?
                    (
                        <button className="trackButton" onClick={() => rmvTrack(trackName)}>-</button>
                    ) : (<button className="trackButton" onClick={() => addTrack(trackName)}>+</button>
                    )}
        </div>
    )

}

export default Track;