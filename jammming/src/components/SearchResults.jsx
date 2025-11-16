import React, {useState} from "react";
import Tracklist from "./Tracklist";


function SearchResults(params) {
    const testSerchReults = {id: 1,
        name: 'repeat',
        expanded: true,
        editingName: false,
        tracks:[
            {id: 101, name: 'What you know', artist: 'Two door cinema club', image:"../public/two-door-cinema-club_tourist-history_2010-596777.jpeg"},
            {id: 102, name: 'chinatown Blues', artist:'ODDEEO, karmaWears White Tears', image:"../public/interludium-powerwolf-992x992-3374247939.jpg"}
        ]
        }

    return(
        <div id='results'>
            <h2>Search results</h2>
            <Tracklist 
                tracks={testSerchReults.tracks}
                isInPlaylist={false}
                addTrack={() => console.log('track added')}
                rmvTrack={() => console.log('track removed')}
            />
        </div>
    )

}

export default SearchResults;