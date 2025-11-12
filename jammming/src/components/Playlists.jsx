import React from "react";
import Tracklist from "./Tracklist";
import Track from "./Track";

/* should me makeing a list of tracklists containing tracks as well as a button up top to make additional tracklists */

function Playlists() {

    const sampleTracks = [
        {id: 1, name: 'What you know', artist: 'Two door cinema club', image:'cat.thing'},
        {id: 2, name: 'chinatown Blues', artist:'ODDEEO, karmaWears White Tears', image:'sunset.png'}
    ]

    return(
        <div id='Playlists'>
            <h2>Your playlists</h2>
            <Tracklist
                tracks={sampleTracks}
                isInPlaylist={true}
                addTrack={(name) => console.log(`adding ${name}`)}
                rmvTrack={(name) => console.log(`removeing ${name}`)}
                
                />
                
        </div>
    );
}
export default Playlists