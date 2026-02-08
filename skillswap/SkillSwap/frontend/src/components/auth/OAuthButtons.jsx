import React from 'react';
import { GoogleLogin } from 'react-google-login';
import { FacebookLogin } from 'react-facebook-login';
import { MicrosoftLogin } from 'react-microsoft-login';
import { useAuth } from '../../context/AuthContext';

const OAuthButtons = () => {
    const { loginWithGoogle, loginWithFacebook, loginWithMicrosoft } = useAuth();

    const handleGoogleSuccess = (response) => {
        loginWithGoogle(response);
    };

    const handleFacebookSuccess = (response) => {
        loginWithFacebook(response);
    };

    const handleMicrosoftSuccess = (response) => {
        loginWithMicrosoft(response);
    };

    const handleFailure = (error) => {
        console.error('OAuth login failed:', error);
    };

    return (
        <div className="flex flex-col space-y-4">
            <GoogleLogin
                clientId={process.env.REACT_APP_GOOGLE_CLIENT_ID}
                buttonText="Login with Google"
                onSuccess={handleGoogleSuccess}
                onFailure={handleFailure}
                cookiePolicy={'single_host_origin'}
            />
            <FacebookLogin
                appId={process.env.REACT_APP_FACEBOOK_APP_ID}
                autoLoad={false}
                fields="name,email,picture"
                callback={handleFacebookSuccess}
                onFailure={handleFailure}
                textButton="Login with Facebook"
            />
            <MicrosoftLogin
                clientId={process.env.REACT_APP_MICROSOFT_CLIENT_ID}
                buttonText="Login with Microsoft"
                onSuccess={handleMicrosoftSuccess}
                onFailure={handleFailure}
            />
        </div>
    );
};

export default OAuthButtons;