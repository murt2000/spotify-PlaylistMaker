import React from "react";


function Playlists({ playlist, selectPlaylist, onImport, name, tracksTotal, isOwnedByMe, image }) {

    return (
        <div className="playlists-list">

            <div className="playlist-row">
                <div style={{ height: 24, width: 24 }} id="img-box">
                    <img style={{ height: 24, width: 24 }} src={image || ""} />
                </div>
                <div className="playlist-meta">
                    <div className="playlist-name">{name ?? "playlist"}</div>
                    <div className="playlist-track-count">{tracksTotal}tracks</div>
                    <div className="playlist-state">{isOwnedByMe}</div>




                </div>
                <div className="playlist-actions">
                    <button type="button" onClick={() => selectPlaylist(playlist)}>Import</button>
                </div>
            </div>
        </div>
    );
}

export default Playlists;