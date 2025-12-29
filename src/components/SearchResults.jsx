import React, { useState, useEffect } from "react";
import Tracklist from "./Tracklist";

function SearchResults({ token, searchTracks, query }) {
    const [tracks, setTracks] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        let mounted = true;
        if (!query || !query.trim()) {
            setTracks([]);
            return;
        }
        async function doSearch() {
            setLoading(true);
            try {
                const items = await searchTracks(query, token, 10) || [];
                if (!mounted) return;
                const mapped = items.map(t => ({
                    id: t.id ?? "",
                    name: t.name ?? "",
                    artist: (t.artists || []).map(a => a.name).join(", ") ?? "",
                    image: t.album?.images?.[0]?.url ?? "",
                    uri: t.uri ?? "",
                    source: "spotify",
                }));
                setTracks(mapped);
            } catch (err) {
                console.error('search error', err);
            } finally {
                if (mounted) setLoading(false);
            }
        }
        doSearch();
        return () => { mounted = false; };
    }, [query, token, searchTracks]);

    return (
        <div id='results'>
            <h2>Search results{query ? ` for "${query}"` : ''}</h2>
            {loading && <div>Loading...</div>}
            <Tracklist
                tracks={tracks}
                isInPlaylist={false}
                addTrack={() => console.log('track added')}
                rmvTrack={() => console.log('track removed')}
            />
        </div>
    );
}

export default SearchResults;