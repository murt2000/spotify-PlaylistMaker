import { useState, useEffect } from 'react'



import SearchBar from './components/SearchBar.jsx'
import Header from './components/Header.jsx'
import SearchResults from './components/SearchResults.jsx'
import Playlists from './components/Playlists.jsx'
import LoginOverlay from './components/LoginOverlay.jsx'



import './App.css'

/*
App.JSX goals:
imports all component and makes the application full

Jamming project goals:

application should start with a header containing little except a WebSite name and light mode dark mode switch
under the header in its own 'row' is the serch component for the search input
the second 'row' contains the search results and the playlists

the search section should interface with the spotify API and show results from searching artist, songname, music genre or, and more if
nothing is inputted in the search it should display a random songs in the top 10 000 to give inspiration. 

the plyalists section is the smaller part to the major of the serch results at the top you have create new playlist(tracklist) and
that creates a new list that can be added to by searching for songs and adding them by click or drag. onclick you should be able to add
a song to multiple tracklists.

each tracklist should be expandable and colapsable and at the bottom of the tracklist should be the option to export the playlist
to spotify or share it on social media

footer should link to my Github page.
*/

function App() {

  const [token, setToken] = useState(null); 

  const CLIENT_ID ="005ca1c419964ede830a5ab4944221fe";
  const redirectUri = "https://murt2000.github.io/spotify-PlaylistMaker/";
  const SCOPES = "playlist-modify-private playlist-modify-public";

  console.log("Token:", token);
  console.log("Client ID:", CLIENT_ID);
  console.log("Redirect URI:", redirectUri);


  const AUTH_URL = `https://accounts.spotify.com/authorize?client_id=${CLIENT_ID}` +
    `&response_type=token&redirect_uri=${encodeURIComponent(redirectUri)}` +
    `&scope=${encodeURIComponent(SCOPES)}`;


    console.log("Auth URL:", AUTH_URL);
    useEffect(() => {
      const hash = window.location.hash.substring(1);
      const params = new URLSearchParams(hash);
      const accessToken = params.get("access_token");

      if(accessToken){
       setToken(accessToken);
       window.history.replaceState({}, "", "/");
      }
    }, [])
    function handleLogin() {
      window.location.href= AUTH_URL;
    }

  return (
    <>
    {!token && <LoginOverlay onLogin={handleLogin}/>}
    {token && (
      <div id='app-grid'>
        <Header/>
        <SearchBar token={token}/>
        <SearchResults token={token}/>
        
        <Playlists token={token}/>
        
      </div>
      ) }
    </>
  );
}

export default App
