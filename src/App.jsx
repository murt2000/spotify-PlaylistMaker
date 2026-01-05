import { useState, useEffect } from "react";

import SearchBar from "./components/SearchBar.jsx";
import Header from "./components/Header.jsx";
import SearchResults from "./components/SearchResults.jsx";
import ActivePlaylist from "./components/ActivePlaylist.jsx";
import ImportPlaylist from "./components/ImportPLaylist.jsx";
import LoginOverlay from "./components/LoginOverlay.jsx";

import "./App.css";

const CLIENT_ID = "005ca1c419964ede830a5ab4944221fe";
const SCOPES = "playlist-modify-private playlist-modify-public user-read-private user-read-email";

// --- PKCE helpers ------------------------------------------------------------

function generateRandomString(length) {
  const possible =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-._~";
  const values = crypto.getRandomValues(new Uint8Array(length));
  return values.reduce(
    (acc, x) => acc + possible.charAt(x % possible.length),
    ""
  );
}

async function sha256(input) {
  const encoder = new TextEncoder();
  const data = encoder.encode(input);
  return window.crypto.subtle.digest("SHA-256", data);
}

function base64UrlEncode(buffer) {
  const bytes = new Uint8Array(buffer);
  let binary = "";
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary)
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}

async function createCodeChallenge(verifier) {
  const digest = await sha256(verifier);
  return base64UrlEncode(digest);
}

// --- App ---------------------------------------------------------------------

function App() {
  const [token, setToken] = useState(null);

  const [profileData, setProfileData] = useState(null);
  const [loadingProfile, setLoadingProfile] = useState(false);
  const [profileError, setProfileError] = useState(null);

  const [myPlaylists, setMyPlaylists] = useState([]);
  const [loadingMyPlaylists, setLoadingMyPlaylists] = useState(false);
  const [myPlaylistsError, setMyPlaylistsError] = useState(null);

  const [activePlaylist, setActivePlaylist] = useState(null);

  const [searchQuery, setSearchQuery] = useState("");
  const [importQuery, setImportQuery] = useState("");

  const [searchResults, setSearchResults] = useState([]);
  const [loadingSearch, setLoadingSearch] = useState(false);
  const [searchError, setSearchError] = useState(null);

  const [showImportPlaylist, setShowImportPlaylist] = useState(false);

  const isLocal =
    window.location.hostname === "localhost" ||
    window.location.hostname === "127.0.0.1";

  const redirectUri = isLocal
    ? "http://127.0.0.1:5173/spotify-PlaylistMaker/"
    : "https://murt2000.github.io/spotify-PlaylistMaker/";



  // 1) Login: build authorize URL with PKCE, then redirect
  async function handleLogin() {


    const codeVerifier = generateRandomString(128);
    localStorage.setItem("spotify_code_verifier", codeVerifier);

    const codeChallenge = await createCodeChallenge(codeVerifier);

    const params = new URLSearchParams({
      response_type: "code", // PKCE uses code, not token
      client_id: CLIENT_ID,
      scope: SCOPES,
      redirect_uri: redirectUri,
      code_challenge_method: "S256",
      code_challenge: codeChallenge,
    });

    const authUrl =
      "https://accounts.spotify.com/authorize?" + params.toString();


    window.location.href = authUrl;
  }

  // 2) After redirect back: read ?code=..., exchange for access_token
  useEffect(() => {


    async function handleCallback() {
      const url = new URL(window.location.href);
      const code = url.searchParams.get("code");
      const error = url.searchParams.get("error");

      console.log("Query code:", code);
      console.log("Query error:", error);

      // Already stored and valid token?
      const storedToken = localStorage.getItem("spotify_access_token");
      const storedExpiry = localStorage.getItem("spotify_token_expires_at");
      if (storedToken && storedExpiry && Date.now() < Number(storedExpiry)) {
        console.log("Using stored token from localStorage");
        setToken(storedToken);
        return;
      }

      if (error) {
        console.error("Spotify auth error:", error);
        return;
      }

      if (!code) {
        console.log("No code in URL, user not logged in yet.");
        return;
      }

      const codeVerifier = localStorage.getItem("spotify_code_verifier");
      if (!codeVerifier) {
        console.error("Missing code_verifier in localStorage");
        return;
      }

      const body = new URLSearchParams({
        client_id: CLIENT_ID,
        grant_type: "authorization_code",
        code,
        redirect_uri: redirectUri,
        code_verifier: codeVerifier,
      });

      try {
        const response = await fetch("https://accounts.spotify.com/api/token", {
          method: "POST",
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
          },
          body: body.toString(),
        });

        if (!response.ok) {
          const text = await response.text();
          console.error("Token endpoint error:", response.status, text);
          return;
        }

        const data = await response.json();


        const accessToken = data.access_token;
        const expiresIn = data.expires_in; // seconds
        const expiresAt = Date.now() + expiresIn * 1000;

        localStorage.setItem("spotify_access_token", accessToken);
        localStorage.setItem(
          "spotify_token_expires_at",
          expiresAt.toString()
        );

        setToken(accessToken);

        // Clean URL (remove ?code=...)
        const cleanUrl = window.location.origin + window.location.pathname;
        window.history.replaceState({}, "", cleanUrl);
      } catch (err) {
        console.error("Error exchanging code for token:", err);
      }
    }

    handleCallback();
  }, [redirectUri]);

  // Fetch profile data logic here

  useEffect(() => {
    if (!token) {
      setProfileData(null);
      return;
    }

    const controller = new AbortController();

    (async () => {
      try {
        setLoadingProfile(true);
        setProfileError(null);

        const response = await fetch('https://api.spotify.com/v1/me', {
          method: 'GET', // redundant, fetch uses GET by default keep for clarity
          headers: { Authorization: `Bearer ${token}` },
          signal: controller.signal,
        });

        if (!response.ok) {
          throw new Error(`Spotify /profile failed: ${response.status}`);
        }

        const data = await response.json();
        setProfileData(data);

      } catch (err) {
        if (err.name !== 'AbortError') {
          console.error('Error fetching profile data:', err);
          setProfileError(err.message);
        }
      } finally {
        setLoadingProfile(false);
      }
    })();
    return () => controller.abort();
  }, [token]);


  //fetch logic for user playlist
  useEffect(() => {
    if (!showImportPlaylist) return;
    if (!token) return;
    if (!profileData?.id) return;

    const controller = new AbortController();

    (async () => {
      try {
        setLoadingMyPlaylists(true);
        setMyPlaylistsError(null);

        const userId = String(profileData.id);

        let url = "https://api.spotify.com/v1/me/playlists?limit=50";
        const all = [];

        while (url) {
          const res = await fetch(url, {
            headers: { Authorization: `Bearer ${token}` },
            signal: controller.signal,
          });

          if (!res.ok) {
            const text = await res.text();
            throw new Error(`Fetch playlists failed (${res.status}): ${text}`);
          }

          const data = await res.json();

          all.push(
            ...(data.items ?? []).map((pl) => {
              const ownerId = String(pl.owner?.id ?? "");
              const isOwnedByMe = ownerId !== "" && ownerId === userId;

              return {
                id: pl.id, // spotify playlist id
                name: pl.name ?? "Untitled playlist",
                image: pl.images?.[0]?.url ?? "",
                tracksTotal: pl.tracks?.total ?? 0,
                isOwnedByMe,
                source: "spotify",
                tracks: [],
                nextTracksUrl: null,
              };
            })
          );

          url = data.next;
        }

        setMyPlaylists(all);
      } catch (err) {
        if (err.name !== "AbortError") {
          console.error("Error fetching playlists:", err);
          setMyPlaylistsError(err.message ?? "Failed to fetch playlists");
          setMyPlaylists([]);
        }
      } finally {
        setLoadingMyPlaylists(false);
      }
    })();

    return () => controller.abort();
  }, [showImportPlaylist, token, profileData?.id]);

  // fetch logic for searched playlists
  useEffect(() => {
    if (!showImportPlaylist) return;
    if (!token) return;

    const q = importQuery.trim();

    // If query is empty -> show my playlists again
    if (!q) {
      setMyPlaylists(myPlaylists);
      return;
    }

    const controller = new AbortController();

    const t = setTimeout(async () => {
      try {
        setLoadingMyPlaylists(true);
        setMyPlaylistsError(null);

        const params = new URLSearchParams({
          q,
          type: "playlist",
          limit: "20",
        });

        const res = await fetch(`https://api.spotify.com/v1/search?${params.toString()}`, {
          headers: { Authorization: `Bearer ${token}` },
          signal: controller.signal,
        });

        if (!res.ok) {
          const text = await res.text();
          throw new Error(`Playlist search failed (${res.status}): ${text}`);
        }

        const data = await res.json();

        const mapped = (data.playlists?.items ?? [])
          .filter(Boolean)
          .map((pl) => ({
            id: pl.id,
            name: pl.name ?? "Untitled playlist",
            image: pl.images?.[0]?.url ?? "",
            tracksTotal: pl.tracks?.total ?? 0,
            isOwnedByMe: false,
            source: "spotify",
            tracks: [],
            nextTracksUrl: null,
          }));

        setMyPlaylists(mapped);
      } catch (err) {
        if (err.name !== "AbortError") {
          console.error("Error searching playlists:", err);
          setMyPlaylistsError(err.message ?? "Failed to search playlists");
          setMyPlaylists([]);
        }
      } finally {
        setLoadingMyPlaylists(false);
      }
    }, 500); // debounce 500ms 

    return () => {
      clearTimeout(t);
      controller.abort();
    };
  }, [importQuery, showImportPlaylist, token]);




  function mapTracks(items = []) {
    return items.map(i => i.track)
      .filter(Boolean)
      .map(t => ({
        id: t.id ?? "",
        uri: t.uri ?? "",
        name: t.name ?? "",
        artist: t.artists?.map(a => a.name).join(", ") ?? "",
        image: t.album?.images?.[0].url ?? "",
        source: "spotify",
      }));
  }

  async function fetchTracks(playlist) {

    //further implementation needed
    console.log("fetchTracks fired")
    const id = playlist?.id
    if (!id) {
      console.error("no playlist in state")
      return;
    }
    const controller = new AbortController();
    try {
      const collected = [];
      let url = `https://api.spotify.com/v1/playlists/${id}/tracks?limit=100`;
      let lastData = null;

      while (url) {
        const res = await fetch(url, {
          headers: { Authorization: `Bearer ${token}` },
          signal: controller.signal,
        });

        if (!res.ok) {
          const errBody = await res.text();
          throw new Error(`Spotify playlist tracks failed (${res.status}): ${errBody}`);
        }

        const data = await res.json();
        lastData = data;

        const chunk = mapTracks(data.items);
        collected.push(...chunk);

        // update interim state so UI can show progress while fetching
        setActivePlaylist(prev => prev && prev.id === id ? {
          ...prev,
          tracks: collected.slice(),
          nextTracksUrl: data.next ?? null,
          tracksTotal: data.total ?? prev.tracksTotal ?? collected.length,
        } : prev);

        url = data.next;
      }

      // final state update (ensure totals are correct)
      setActivePlaylist(prev => prev && prev.id === id ? {
        ...prev,
        tracks: collected,
        nextTracksUrl: lastData?.next ?? null,
        tracksTotal: lastData?.total ?? prev.tracksTotal ?? collected.length,
      } : prev);

    } catch (err) {
      if (err.name !== "AbortError") {
        console.error("error fetching tracks", err)
      }
    } finally {
      controller.abort();
    }
    // fetched all pages and stored tracks in state
  }

  function crtBlank() { //needs more logic and maybe properties spotify URI id etc 
    const newList = {
      id: null,
      //Date.now().toString()
      name: `new Playlist`,
      image: "",
      editingName: false,
      tracks: [],
      tracksTotal: 0,
      source: "local",
      spotifyPlaylistId: null,
      isOwnedByMe: true // set to false if this fucks the export
    };
    setActivePlaylist(newList);
    setImportQuery("")
    setShowImportPlaylist(false);

  }
  function selectPlaylist(pl) {
    console.log(pl);
    // pl can be an object from `playlists` or a newly created local playlist
    setActivePlaylist({
      ...pl,
      tracks: pl.tracks ?? [],
      nextTracksUrl: pl.nextTracksUrl ?? null,
    });
    setImportQuery("");
    setShowImportPlaylist(false);
    fetchTracks(pl)
  }

  function renameTracklist(newName) {    // gets an id and new name from playlist component and changes it in state
    setActivePlaylist(prev => {
      return { ...prev, name: newName };
    });
  }

  async function exportTracklist() {

    const playlist = activePlaylist;

    if (!token) {
      console.error("No token provided for exportTracklist");
      return;
    }
    if (!profileData) {
      console.error("No profileData provided for exportTracklist");
      return;
    }
    if (!playlist) {
      console.error("No playlist provided for exportTracklist");
      return;
    }

    console.log("export fired")
    if (playlist.source === "local" || !playlist.isOwnedByMe) {
      return await exportTracklistAsNew();
    } else {
      return await exportTracklistModExisting();
    }
  }
  async function exportTracklistAsNew() {
    const playlist = activePlaylist;
    // Used for localy created playlsit as well as playlists not belonging to the user
    const user_id = String(profileData?.id ?? "");
    if (!user_id) {
      console.error("No user ID found in profileData for exportTracklistAsNew");
      return;
    }
    const body = JSON.stringify({
      name: playlist.name ?? "New Playlist",
      public: false,
      collaborative: false,
      description: "Created with the Spotify Playlist Maker" // add URl 
    });
    let spotifyPlaylistId = null;
    let spotifyPlaylistUrl = "";

    try {
      const res = await fetch(`https://api.spotify.com/v1/users/${encodeURIComponent(user_id)}/playlists`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        }, body: body,
      });
      if (!res.ok) {
        const errBody = await res.text();
        throw new Error(`Spotify create playlist failed (${res.status}): ${errBody}`);
      }
      const data = await res.json();
      spotifyPlaylistId = data.id;
      spotifyPlaylistUrl = data.external_urls?.spotify ?? "";
      console.log("Created new Spotify playlist with ID:", spotifyPlaylistId);
    }
    catch (err) {
      console.error("Error exporting tracklist as new playlist:", err);
      return { ok: false, error: err.message ?? 'unknown error' };
    }

    // add tracks to the playlist in chunks of 100

    const trackUris = (playlist.tracks ?? []).map(t => t?.uri).filter(Boolean);
    if (trackUris.length === 0) {
      return { ok: true, mode: "created", playlistId: spotifyPlaylistId, playlistUrl: spotifyPlaylistUrl, tracksExported: 0 };
    }
    try {
      const chunkSize = 100;

      const totaluris = trackUris.length

      for (let i = 0; i < totaluris; i += chunkSize) {
        const uris = trackUris.slice(i, i + chunkSize);


        if (uris.length === 0) continue;

        const trackBody = JSON.stringify({ uris: uris });

        const res = await fetch(`https://api.spotify.com/v1/playlists/${spotifyPlaylistId}/tracks`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: trackBody,
        });
        if (!res.ok) {
          const errBody = await res.text();
          throw new Error(`Spotify add tracks failed (${res.status}): ${errBody}`);
        }
      }
    }
    catch (err) {
      console.error("Error adding tracks to new playlist:", err);
      return { ok: false, playlistId: spotifyPlaylistId, error: err.message ?? 'unknown error' };
    }
    return {
      ok: true,
      mode: "created",
      playlistId: spotifyPlaylistId,
      playlistUrl: spotifyPlaylistUrl,
      tracksExported: trackUris.length,
    };
  }
  async function exportTracklistModExisting() {
    const playlist = activePlaylist;
    // if preowned modify that playlist on spotify with new name and tracks
    // -use a diffrent function for logic
    if (!playlist.id) {
      console.error("No playlist ID provided for exportTracklistModExisting");
      return;
    }
    if (playlist.source !== "spotify" || !playlist.isOwnedByMe) {
      return { ok: false, error: "playlist not owned by user or not from spotify" };
    }
    if (!profileData) {
      console.error("no profileData provided for exportTracklistModExisting");
      return;
    }

    if (playlist.name && playlist.name.trim()) {
      const resName = await fetch(`https://api.spotify.com/v1/playlists/${playlist.id}`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name: playlist.name.trim() }),
      });

      if (!resName.ok) {
        const errBody = await resName.text();
        throw new Error(`Spotify rename failed (${resName.status}): ${errBody}`);
      }
    }
    const trackUris = (playlist.tracks ?? []).map(t => t?.uri).filter(Boolean);
    const chunkSize = 100;
    const firstChunk = trackUris.slice(0, chunkSize);
    const remainingChunks = [];
    for (let i = chunkSize; i < trackUris.length; i += chunkSize) {
      remainingChunks.push(trackUris.slice(i, i + chunkSize));
    }
    try {
      const res = await fetch(`https://api.spotify.com/v1/playlists/${playlist.id}/tracks`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          uris: firstChunk
        }),
      });
      if (!res.ok) {
        const errBody = await res.text();
        throw new Error(`Spotify replace tracks failed (${res.status}): ${errBody}`);
      }
    }
    catch (err) {
      console.error("Error replacing tracks in existing playlist:", err);
      return { ok: false, error: err.message ?? 'unknown error' };
    }
    try {
      for (const uris of remainingChunks) {
        const res = await fetch(`https://api.spotify.com/v1/playlists/${playlist.id}/tracks`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ uris: uris }),
        });
        if (!res.ok) {
          const errBody = await res.text();
          throw new Error(`Spotify add tracks failed (${res.status}): ${errBody}`);
        }
      }
    }
    catch (err) {
      console.error("Error replacing tracks in existing playlist:", err);
      return { ok: false, error: err.message ?? 'unknown error' };
    }
    return {
      ok: true,
      mode: "updated",
      playlistId: playlist.id,
      tracksExported: trackUris.length,
    }

  }
  async function searchTracks(query, token, limit = 50, signal) {

    try {
      const params = new URLSearchParams({
        q: query,
        type: "track",
        limit: limit,
      });
      const res = await fetch(`https://api.spotify.com/v1/search?${params}`, {
        headers: { Authorization: `Bearer ${token}` },
        signal,
      });

      if (!res.ok) {
        const errBody = await res.text();
        throw new Error(`Spotify search failed (${res.status})`);
      }

      const data = await res.json();
      return data.tracks.items;
    } catch (err) {
      if (err.name !== "AbortError") {
        console.error("error fetching tracks", err);
      }
    }
    return [];
  }
  useEffect(() => {
    let mounted = true;
    let controller;

    if (!searchQuery || !searchQuery.trim()) {
      setSearchResults([]);
      setLoadingSearch(false);
      setSearchError(null);
      return;
    }

    const t = setTimeout(async () => {
      controller = new AbortController();
      setLoadingSearch(true);
      setSearchError(null);


      try {
        const items = await searchTracks(searchQuery, token, 50, controller.signal);
        if (!mounted) return;

        const mapped = (items || []).map(t => ({
          id: t.id ?? "",
          uri: t.uri ?? "",
          name: t.name ?? "",
          artist: t.artists?.map(a => a.name).join(", ") ?? "",
          image: t.album?.images?.[0].url ?? "",
          source: "spotify",
        }));
        setSearchResults(mapped);
      }
      catch (err) {
        setSearchError(err.message ?? 'something wrong');
        setSearchResults([]);
      }
      finally {
        if (mounted) setLoadingSearch(false);
      }
    }, 300)
    return () => {
      mounted = false;
      clearTimeout(t);
      controller?.abort();
    };
  }, [searchQuery, token]);

  function addTrack(track) { // add a selected track from search results to the expanded playlist
    const newTrack = {
      id: track.id ?? "",
      uri: track.uri ?? "",
      name: track.name ?? "",
      artist: track.artist,
      image: track.image ?? "",
      source: "added",
    };
    // we want to add the track to the playlist === expandedPlaylistId
    setActivePlaylist(prev => {
      const trackInPlaylist = (prev.tracks ?? []).some(t => t.id === newTrack.id);
      if (trackInPlaylist) return prev;
      const newTracks = [...(prev.tracks ?? []), newTrack];
      const newTotal = (prev.tracksTotal ?? prev.tracks?.length ?? 0) + 1;
      return { ...prev, tracks: newTracks, tracksTotal: newTotal };
    });
  }
  function rmvTrack(track) {

    setActivePlaylist(prev => {
      if (!prev) return prev;
      const trackInPlaylist = (prev.tracks ?? []).some(t => t.id === track.id);
      if (!trackInPlaylist) return prev;
      const newTracks = (prev.tracks ?? []).filter(t => t.id !== track.id);
      const newTotal = (prev.tracksTotal ?? prev.tracks?.length ?? 0) - 1;
      return { ...prev, tracks: newTracks, tracksTotal: newTotal };
    });
  }


  return (
    <>
      {!token && <LoginOverlay onLogin={handleLogin} />}
      {token && (
        <div id="app-grid">
          <Header profileData={profileData} loadingProfile={loadingProfile} profileError={profileError} />
          {showImportPlaylist ? (
            <ImportPlaylist
              onClose={() => setShowImportPlaylist(false)}
              myPlaylists={myPlaylists}
              loadingMyPlaylists={loadingMyPlaylists}
              myPlaylistsError={myPlaylistsError}
              selectPlaylist={selectPlaylist}
              profileData={profileData}
              crtBlank={crtBlank}
              importQuery={importQuery}
              onImportQueryChange={setImportQuery}
            />
          ) : (
            <>
              <SearchBar onQueryChange={setSearchQuery} onImportRequest={setShowImportPlaylist} />
              <SearchResults
                query={searchQuery}
                tracks={searchResults}
                loading={loadingSearch}
                error={searchError}
                addTrack={addTrack}

              />
              <ActivePlaylist
                activePlaylist={activePlaylist}
                rmvTrack={rmvTrack}
                exportTracklist={exportTracklist}
                renameTracklist={renameTracklist}
              />
            </>
          )}
        </div>
      )}
    </>
  );
}

export default App;
