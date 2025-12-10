import React from "react";
import "./styleComponents/Header.css";
import ProfileInfo from "./ProfileInfo";
 
/*
Header continaing the website title and a night day button.
*/

function Header({ token }) {

    return(
        <header id='header'>
            <h1>Spotify playlist maker</h1>
            <button className="hButton">D</button>
            <ProfileInfo token={token}/>
            <h2>hei</h2>
        </header>
    )
    
}

export default Header;