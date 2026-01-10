import React, { useState, useEffect } from "react";
import Tracklist from "./Tracklist";
import Track from "./Track";

import './styleComponents/activePlaylist.css'




function activePlaylist({ activePlaylist, renameTracklist, rmvTrack, exportTracklist, crtBlank, createBlankPlaylist }) {
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(activePlaylist?.name ?? "");

  function saveName(newName) {
    console.log(`Saving name ${newName} for playlist`);
    renameTracklist(newName);
  }

  useEffect(() => {
    setEditName(activePlaylist?.name ?? "");
  }, [activePlaylist?.name]);

  function handleSubmit(e) {
    e.preventDefault();
    console.log(editName)
    const newName = (editName ?? "").trim();
    if (!newName) return;
    saveName(newName)
    setIsEditing(false);

  }

  function handleCancel() {
    setEditName(activePlaylist?.name ?? "");
    setIsEditing(false);
  }

  return (
    <div id="playlist">
      <div className="playlist-header">
        {isEditing ? (
          <form onSubmit={handleSubmit} style={{ display: 'inline-block' }}>
            <input
              type="text"
              value={editName}
              onChange={(e) => setEditName(e.target.value)}

              onKeyDown={(e) => {
                if (e.key === 'Escape') { handleCancel() };
                if (e.key === 'Enter') { handleSubmit() };

              }}
              autoFocus
            />
            <button type="submit" className="button" onClick={handleSubmit}>Save</button>
            <button type="button" className="button" onClick={handleCancel}>Cancel</button>
          </form>
        ) : (
          <h2 onDoubleClick={() => setIsEditing(true)}>{activePlaylist?.name ?? 'playlist'}</h2>
        )}
        <button className="button" type="button" onClick={exportTracklist}>Export</button>
        <button className="button" type="button" onClick={() => setIsEditing(true)}>Rename</button>
      </div>
      <Tracklist
        tracks={activePlaylist?.tracks || []}
        isInPlaylist={true}
        rmvTrack={rmvTrack}
      />
    </div>
  );
}
export default activePlaylist;