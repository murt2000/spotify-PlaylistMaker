import { useState, useEffect } from "react";
import Tracklist from "./Tracklist";

import './styleComponents/playlists.css'



function Playlists({ playlist, selectPlaylist, onImport, name, tracksTotal, isOwnedByMe, image, tracks, isExpanded, onToggleExpand, previewTracks, previewLoading, previewError, }) {



    return (
        <div className="playlist">
            <div className="playlist-row">
                <div id="img-box">
                    <img id="img" src={image || ""} />
                </div>

                <div className="playlist-headings">
                    <div className="playlist-meta">
                        <h2 className="playlist-item">{name ?? "playlist"}</h2>
                        <h3 className="playlist-item">{tracksTotal} tracks</h3>
                    </div>

                    <div className="playlist-actions">
                        <button type="button" className="button" onClick={() => selectPlaylist(playlist)}>
                            Import Playlist
                        </button>


                        <button type="button" className="button" onClick={onToggleExpand}>
                            {isExpanded ? "Collapse" : "Expand"}
                        </button>
                    </div>
                </div>
            </div>


            {isExpanded && (
                <div className="playlist-preview">
                    {previewLoading && <div>Loading preview…</div>}
                    {previewError && <div style={{ color: "red" }}>{previewError}</div>}

                    {!previewLoading && !previewError && (
                        <div id="tracklist">
                            <Tracklist
                                tracks={previewTracks ?? []}
                                isInPlaylist={false}
                                showButtons={false}
                            />
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}

export default Playlists;