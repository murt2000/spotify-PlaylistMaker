import React from "react";
import "./styleComponents/Header.css";
import ProfileInfo from "./ProfileInfo.jsx";
import dayIcon from "../assets/day-mode.png";
import moonIcon from "../assets/moon.png";

/*
Header continaing the website title and a night day button.
*/

function Header({ profileData, loadingProfile, profileError, toggleTheme, theme, handleLogout }) {

    return (
        <header id='header'>
            <div id="titleAndButton">
                <h1>Spotify Playlist Maker</h1>
                <button id="hbutton" onClick={() => toggleTheme()}>
                    <img className="day-night" src={theme === "dark" ? dayIcon : moonIcon} />
                </button>
            </div>
            <ProfileInfo profileData={profileData} loadingProfile={loadingProfile} profileError={profileError} handleLogout={handleLogout} />
        </header>
    )

}

export default Header;