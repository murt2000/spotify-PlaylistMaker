import { useState, useEffect, use } from "react";

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
  console.log("App loaded, current token:", token);

  const isLocal =
    window.location.hostname === "localhost" ||
    window.location.hostname === "127.0.0.1";

  const redirectUri = isLocal
    ? "http://127.0.0.1:5173/spotify-PlaylistMaker/"
    : "https://murt2000.github.io/spotify-PlaylistMaker/";

  console.log("Using redirect URI:", redirectUri);

  // 1) Login: build authorize URL with PKCE, then redirect
  async function handleLogin() {
    console.log("Login button clicked");

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
    console.log("Auth URL on login attempt:", authUrl);

    window.location.href = authUrl;
  }

  // 2) After redirect back: read ?code=..., exchange for access_token
  useEffect(() => {
    console.log("Location after load:", window.location.href);

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
        console.log("Token response:", data);

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
    if (!token){
     setProfileData(null);
    return;
  }

    const controller = new AbortController();

    (async () => {
      try{
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

// might keep this function for future use
  /*async function fetchProfileData() {
        const response = await fetch('https://api.spotify.com/v1/me', {
            method: 'GET',
            headers: { Authorization: `Bearer ${token}` 
        }});
        
        return await response.json();
        
    }
*/
  return (
    <>
      {!token && <LoginOverlay onLogin={handleLogin} />}
      {token && (
        <div id="app-grid">
          <Header profileData={profileData} loadingProfile={loadingProfile} profileError={profileError} />
          <SearchBar token={token} />
          <SearchResults token={token} />
          <Playlists token={token} />
        </div>
      )}
    </>
  );
}

export default App;
