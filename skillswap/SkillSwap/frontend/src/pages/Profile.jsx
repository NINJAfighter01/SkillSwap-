import React, { useContext, useEffect, useState } from 'react';
import { AuthContext } from '../context/AuthContext';
import { UserService } from '../services/userService';
import ProfileCard from '../components/profile/ProfileCard';
import ProfileEdit from '../components/profile/ProfileEdit';
import Portfolio from '../components/profile/Portfolio';

const Profile = () => {
    const { user } = useContext(AuthContext);
    const [profileData, setProfileData] = useState(null);
    const [isEditing, setIsEditing] = useState(false);

    useEffect(() => {
        const fetchProfileData = async () => {
            try {
                const data = await UserService.getUserProfile(user.id);
                setProfileData(data);
            } catch (error) {
                console.error('Error fetching profile data:', error);
            }
        };

        if (user) {
            fetchProfileData();
        }
    }, [user]);

    const handleEditToggle = () => {
        setIsEditing(!isEditing);
    };

    return (
        <div className="profile-page">
            {profileData ? (
                <>
                    {isEditing ? (
                        <ProfileEdit profileData={profileData} onToggleEdit={handleEditToggle} />
                    ) : (
                        <ProfileCard profileData={profileData} onToggleEdit={handleEditToggle} />
                    )}
                    <Portfolio userId={user.id} />
                </>
            ) : (
                <p>Loading profile...</p>
            )}
        </div>
    );
};

export default Profile;