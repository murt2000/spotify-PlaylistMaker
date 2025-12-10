import React from 'react';
import { useEffect } from 'react';

function ProfileInfo({token}) {

    async function fetchProfileData() {
        const response = await fetch('https://api.spotify.com/v1/me', {
            method: 'GET',
            headers: { Authorization: `Bearer ${token}` 
        }});
        
        return await response.json();
        
    }
    <section>
        <h1>
            Profile Info
        </h1>
        <ul>
            <li>UserID : <span></span></li>
            <li>email : <span></span></li>
            <li>Spotify URI : <span></span></li>
            <li>Link : <span></span></li>
            <li>Profile Image : <span></span></li>
        </ul>
    </section>
}

export default ProfileInfo;