import React from 'react';
import { useEffect } from 'react';
import "./styleComponents/ProfileInfo.css";

function ProfileInfo({ profileData, loadingProfile, profileError, handleLogout }) {

    if (loadingProfile) {
        return <div>Loading profile...</div>;
    }
    if (profileError) {
        return <div>Error loading profile: {profileError}</div>;
    }
    if (!profileData) {
        return null;
    }
    const inital = profileData.display_name?.[0] ?? profileData.id?.[0] ?? "?";
    const avatarUrl = profileData.images?.[0]?.url;


    return (
        <section>

            <button id='logout' onClick={() => handleLogout()}>
                Log Out
            </button>

            <div id="profileInfo">
                <p id="displayName" className='pInfo'>
                    {profileData.display_name ?? "Spotify user"}
                </p>
                <p id="email" className='pInfo'>
                    {profileData.email ?? "No email available"}
                </p>
            </div>
            <div id="profilePic">
                {avatarUrl ? (
                    <img id="pic" src={avatarUrl} alt="?" />)
                    :
                    (<div id="avatarPH">{inital}</div>)}
            </div>


        </section>);
}

export default ProfileInfo;