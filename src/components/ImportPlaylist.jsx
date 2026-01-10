import { useState, useEffect } from "react";
import Playlists from "./Playlists";
import './styleComponents/importPlaylists.css'


function ImportPlaylist({ onClose, crtBlank, myPlaylists, loadingMyPlaylists, myPlaylistsError, onImportQueryChange, importQuery, selectPlaylist, tracksForPreview, onToggleExpand }) {

    /* importing playlist happens here this is a pop up
       can serch for spotify playlists import a user playlist or make a blank playlist    
    */
    const [expandedIds, setExpandedIds] = useState(() => new Set());
    const [previewTracksById, setPreviewTracksById] = useState({});
    const [loadingPreviewById, setLoadingPreviewById] = useState({});
    const [previewErrorById, setPreviewErrorById] = useState({});

    useEffect(() => {
        setExpandedIds(new Set());
        setPreviewTracksById({});
        setLoadingPreviewById({});
        setPreviewErrorById({});
    }, [importQuery]);

    if (loadingMyPlaylists) {
        return (
            <div>
                <h1>{loadingMyPlaylists}</h1>
            </div>
        )
    }
    const q = (importQuery ?? "").trim();

    function handleChange(e) {
        const v = e.target.value;
        onImportQueryChange?.(v);
    }


    async function toggleExpand(pl) {
        const id = pl?.id;
        console.log("expand hit");
        if (!id) return;


        if (expandedIds.has(id)) {
            const next = new Set(expandedIds);
            next.delete(id);
            setExpandedIds(next);
            return;
        }


        const next = new Set(expandedIds);
        next.add(id);
        setExpandedIds(next);


        if (previewTracksById[id]) return;

        const controller = new AbortController();

        try {
            setLoadingPreviewById(prev => ({ ...prev, [id]: true }));
            setPreviewErrorById(prev => ({ ...prev, [id]: null }));

            await tracksForPreview(pl, {
                signal: controller.signal,


                onChunk: (tracksSoFar) => {
                    setPreviewTracksById(prev => ({ ...prev, [id]: tracksSoFar }));
                },
            });
        } catch (err) {
            if (err.name !== "AbortError") {
                setPreviewErrorById(prev => ({ ...prev, [id]: err.message ?? "Failed preview" }));
            }
        } finally {
            setLoadingPreviewById(prev => ({ ...prev, [id]: false }));
            controller.abort();
            console.log(pl)

        }

    }

    return (
        <div id="big-box">
            <div className="search-box">
                <input
                    id='searchInput'
                    type='text'
                    placeholder="search spotify"
                    value={importQuery}
                    onChange={handleChange}
                />


                <label htmlFor="blankPl"></label>
                <button id="blankPl" className="importButton" onClick={() => crtBlank?.()}>Make a new Playlist</button>
                <button type="button" className="importButton" onClick={() => onClose?.()}>Close</button>
            </div>
            <div id="litsOfPlaylists">
                {loadingMyPlaylists && <div>{loadingMyPlaylists}</div>}
                {myPlaylistsError && <div>{myPlaylistsError}</div>}
                <h1>{!q ? "Your playlists" : `search for: ${q}`
                }</h1>
                {(myPlaylists ?? []).map((pl) => (
                    <Playlists key={pl.id ?? pl.name}
                        playlist={pl}
                        name={pl.name}
                        tracksTotal={pl.tracksTotal ?? pl.tracks?.length ?? 0}

                        image={pl.image}
                        selectPlaylist={selectPlaylist}


                        isExpanded={expandedIds.has(pl.id)}
                        previewTracks={previewTracksById[pl.id] ?? []}

                        previewLoading={!!loadingPreviewById[pl.id]}

                        previewError={previewErrorById[pl.id]}
                        onToggleExpand={() => toggleExpand(pl)}

                    />
                ))}

            </div>
        </div>
    )

}

export default ImportPlaylist;