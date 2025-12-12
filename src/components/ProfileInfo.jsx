import React from 'react';
import { useEffect } from 'react';

function ProfileInfo({profileData, loadingProfile, profileError}) {

    if(loadingProfile){
        return <div>Loading profile...</div>;
    }
    if(profileError){
        return <div>Error loading profile: {profileError}</div>;
    }
    if (!profileData) {
        return null;
    }
    
    const avatarUrl = profileData.images?.[0]?.url;
    return(
    <section>
       <div id="profileInfo">
        <h1 id="displayName" className='pInfo'>
            {profileData.dispay_name ?? "Spotify user"}
        </h1>
        <h1 id="email" className='pInfo'>
            {profileData.email ?? "No email available"}
            </h1>
        <div id="profilePic">
            <img src={avatarUrl} alt="no pImg" />
            </div>
       </div>

    </section>);
}

export default ProfileInfo;