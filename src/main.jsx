import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

/* see this as an intermediary between App and index */

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

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>
)
