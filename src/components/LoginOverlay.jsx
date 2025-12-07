import React from "react";
import "./styleComponents/loginOverlay.css"

function LoginOverlay({onLogin}) {
    return(
        <div className="overlay">
            <div className="overlay-box">
                <p>quick</p>
                <h2>Login</h2>
                <p>You must log in to spotify</p>
                <button className="login-btn" onClick={onLogin}> Login</button>
            </div>
        </div>
    );
}
export default LoginOverlay;