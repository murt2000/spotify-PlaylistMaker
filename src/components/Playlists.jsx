import React, { useState } from "react";
import Tracklist from "./Tracklist";
import Track from "./Track";

import './styleComponents/Playlist.css'
/* should me makeing a list of tracklists containing tracks as well as a button up top to make additional tracklists */

function Playlists() {

    const [tracklists, setTracklists] = useState([
        {id: 1,
        name: 'repeat',
        expanded: true,
        editingName: false,
        tracks:[
            {id: 101, name: 'What you know', artist: 'Two door cinema club', image:"../public/two-door-cinema-club_tourist-history_2010-596777.jpeg"},
            {id: 102, name: 'chinatown Blues', artist:'ODDEEO, karmaWears White Tears', image:"../public/interludium-powerwolf-992x992-3374247939.jpg"}
        ]
        },
        {
            id:2,
            name: 'metal',
            expanded: false,
            editingName: false,
            tracks:[
                { id:201, name:'Son of a wolf', artist:'Powerwolf', image: 'wolf-bishop.png' },
                {id:202, name: 'Army of the Night', artist:'Powerwolf', image: 'wolf-pagan.png'}
            ]
        }

    ])

    function toggleTracklist(id) {
        setTracklists(prev =>
            prev.map(tl =>
                tl.id === id
                ? {...tl, expanded: !tl.expanded}
                : {...tl, expanded: false }
            )

        );

    }

    function addTracklist() {
        const newList = {
            id: Date.now(),
            name: `new Tracklist ${tracklists.length + 1}`,
            expanded: true,
            editingName: false,
            tracks: []
        };
        setTracklists(prev =>
            prev.map(tl => ({...tl, expanded: false })).concat(newList)
        )
        
    }

    function startEditing(id) {
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
    }
    return(
        <div id='Playlists'>
            <h2>Your playlists</h2>
            <button onClick={addTracklist}>+</button>


            {tracklists.map(tl => (
                <div key={tl.id} className="plBox">

                   
                    {!tl.editingName ? ( 
                    <h3
                        className="playlistHeader"
                        onClick={() => toggleTracklist(tl.id)}
                        onDoubleClick={() =>startEditing(tl.id)}
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

                        <Tracklist
                tracks={tl.tracks}
                isInPlaylist={true}
                addTrack={(name) => console.log(`adding ${name}`)}
                rmvTrack={(name) => console.log(`removeing ${name}`)}
                />
            )}
            </div>
            ))}
        </div>
    );
}
export default Playlists;