import React from "react";
import "./styleComponents/Header.css";
import ProfileInfo from "./ProfileInfo.jsx";

/*
Header continaing the website title and a night day button.
*/

function Header({ profileData, loadingProfile, profileError, toggleTheme, theme }) {

    return (
        <header id='header'>
            <div id="titleAndButton">
                <h1>Spotify playlist maker</h1>
                <button className="hbutton" onClick={() => toggleTheme()}>
                    <img className="day-night" src={theme === "dark" ? "dist/day-mode.png" : "dist/moon.png"} />
                </button>
            </div>
            <ProfileInfo profileData={profileData} loadingProfile={loadingProfile} profileError={profileError} />
        </header>
    )

}

export default Header;