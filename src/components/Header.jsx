import React from "react";
import "./styleComponents/Header.css";
import ProfileInfo from "./ProfileInfo.jsx";
 
/*
Header continaing the website title and a night day button.
*/

function Header({profileData, loadingProfile, profileError}) {

    return(
        <header id='header'>
            <div id="titleAndButton">
            <h1>Spotify playlist maker</h1>
            <button className="hButton">Day</button>
            </div>
            <ProfileInfo profileData={profileData} loadingProfile={loadingProfile} profileError={profileError}/>
        </header>
    )
    
}

export default Header;