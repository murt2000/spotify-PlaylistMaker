import React from "react";
import "./styleComponents/Header.css";
import ProfileInfo from "./ProfileInfo.jsx";

/*
Header continaing the website title and a night day button.
*/

function Header({ profileData, loadingProfile, profileError, toggleTheme, theme, handleLogout }) {

    return (
        <header id='header'>
            <div id="titleAndButton">
                <h1>Spotify Playlist Maker</h1>
                <button id="hbutton" onClick={() => toggleTheme()}>
                    <img className="day-night" src={theme === "dark" ? "assets/day-mode.png" : "assets/moon.png"} />
                </button>
            </div>
            <ProfileInfo profileData={profileData} loadingProfile={loadingProfile} profileError={profileError} handleLogout={handleLogout} />
        </header>
    )

}

export default Header;