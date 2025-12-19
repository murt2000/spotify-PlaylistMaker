import { useState, useEffect } from "react";

import SearchBar from "./components/SearchBar.jsx";
import Header from "./components/Header.jsx";
import SearchResults from "./components/SearchResults.jsx";
import Playlists from "./components/Playlists.jsx";
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

  const [playlists, setPlaylists] = useState([]);
  const [loadingPlaylists, setLoadingPlaylists] = useState(false);
  const [playlistsError, setPlaylistsError] = useState(null);

  const [expandedPlaylistId, setExpandedPlaylistId] = useState(null);


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
          throw new Error(`Spotify /profildata failed: ${response.status}`);
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

  // Playlists fetching logic is here
  useEffect(() => {
    if (!token) {
      setPlaylists([]);
      return;
    }

    const controller = new AbortController();

    (async () => {

      try {
        setLoadingPlaylists(true);
        setPlaylistsError(null);

        const res = await fetch('https://api.spotify.com/v1/me/playlists', {
          headers: { Authorization: `Bearer ${token}` },
          signal: controller.signal,
        });
        if (!res.ok) {
          throw new Error('spotify fetch playlists failed' + res.status);
        }
        const data = await res.json();
        const mapped = data.items.map(tl => ({ // tl is for tracklist it is a playlist, but named tracklist in app to avoid confusion
          id: tl.id,
          name: tl.name,
          image: tl.images?.[0]?.url ?? "",
          isOwnedbyMe: tl.owner?.id === profileData?.id,
          source: "spotify", // for imported playlist always spotify for created local
          tracks: [],
          tracksTotal: tl.tracks.total ?? 0,
          loaded: false,
          nextTracksUrl: null,
        }))
        setPlaylists(mapped);
      }
      catch (err) {
        if (err.name !== 'AbortError') {
          console.error('Error fetching playlists:', err);
          setPlaylistsError(err.message);
        }
      }
      finally { setLoadingPlaylists(false); }
    })();
    return () => controller.abort();
  }, [token]);



  function toggleTracklist(id) {
    // modify to close others when one is opened and to fetch tracks if not loaded yet 
    setExpandedPlaylistId(prev => {
      const isOpening = prev !== id;
      if (isOpening) fetchTracksIfNeeded(id);
      return isOpening ? id : null;
    });

  }

  function mapTracks(items = []) {
    return items.map(i => i.track)
      .filter(Boolean)
      .map(t => ({
        id: t.id ?? "",
        uri: t.uri ?? "",
        name: t.name ?? "",
        artist: t.artists?.map(a => a.name).join(", ") ?? "",
        image: t.album?.images?.[0].url ?? "",
      }));
  }

  async function fetchTracksIfNeeded(id) {
    console.log("fetchTracks fired")
    const tl = playlists.find(p => p.id === id);
    if (!tl || tl.loaded) return;

    const controller = new AbortController();
    try {
      const res = await fetch(
        `https://api.spotify.com/v1/playlists/${id}/tracks?limit=50`,
        {
          headers: { Authorization: `Bearer ${token}` },
          signal: controller.signal,
        }
      );
      if (!res.ok) {
        const errBody = await res.text();
        throw new Error(`Spotify playlist tracks failed (${res.status})`);
      }

      const data = await res.json();

      const newTracks = mapTracks(data.items);


      setPlaylists(prev => prev.map(p => p.id === id ?
        {
          ...p,
          tracks: newTracks,
          loaded: data.next == null,
          nextTracksUrl: data.next ?? null,
          tracksTotal: data.total ?? p.tracksTotal ?? newTracks.length,
        }
        : p
      )
      );
    }
    catch (err) {
      if (err.name !== "AbortErrror") {
        console.error("error fetching tracks", err)
      }
    }
    finally {
      console.log(playlists)

    }
  }
  async function loadMore(id) {
    const tl = playlists.find(p => p.id === id);
    if (!tl.nextTracksUrl) return;

    const url = tl.nextTracksUrl
    console.log("Load more url", url);

    const res = await fetch(url, { headers: { Authorization: `Bearer ${token}` }, });

    if (!res.ok) {
      const errBody = await res.text();
      throw new Error(`load more failed (${res.status}): ${errBody}`);
    }
    const data = await res.json();

    const newTracks = mapTracks(data.items);

    setPlaylists(prev => prev.map(p => p.id === id ? {
      ...p,
      tracks: [...(p.tracks ?? []), ...newTracks],
      nextTracksUrl: data.next ?? null,
      tracksTotal: data.total ?? p.tracksTotal,
      tracksLoaded: data.next == null,
    }
      : p
    )
    );

  }

  function addTracklist() { //needs more logic and maybe properties spotify URI id etc 
    const newList = {
      id: Date.now(),
      name: `new Tracklist ${tracklists.length + 1}`,
      expanded: true,
      editingName: false,
      tracks: [],
      source: "local",
      spotifyPlaylistId: null,
      loaded: false,
      isOwnedbyMe: false // false since that will invoke export for a new playlist instead of trying to change it on spotify
    };
    setTracklists(prev =>
      prev.map(tl => ({ ...tl, expanded: false })).concat(newList)
    )
  }
  function removeTracklist(id) {
    setTracklists(prev => prev.filter(tl => tl.id !== id));
  }
  function renameTracklist(id, newName) {    // gets an id and new name from playlist component and changes it in state
    setPlaylists(prev => prev.map(pl =>
      pl.id === id
        ? { ...pl, name: newName }
        : pl
    )
    );
  }


  return (
    <>
      {!token && <LoginOverlay onLogin={handleLogin} />}
      {token && (
        <div id="app-grid">
          <Header profileData={profileData} loadingProfile={loadingProfile} profileError={profileError} />
          <SearchBar token={token} />
          <SearchResults token={token} />
          <Playlists
            playlists={playlists}
            loadingPlaylists={loadingPlaylists}
            playlistsError={playlistsError}
            onToggleTracklist={toggleTracklist}
            expandedPlaylistId={expandedPlaylistId}
            renameTracklist={renameTracklist}
            loadMore={loadMore}
          />
        </div>
      )}
    </>
  );
}

export default App;
