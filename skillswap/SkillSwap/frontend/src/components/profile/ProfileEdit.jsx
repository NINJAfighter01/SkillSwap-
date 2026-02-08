import React, { useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import { userService } from '../../services/userService';

const ProfileEdit = () => {
    const { user, setUser } = useContext(AuthContext);
    const [name, setName] = useState('');
    const [bio, setBio] = useState('');
    const [profilePicture, setProfilePicture] = useState(null);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        if (user) {
            setName(user.name);
            setBio(user.bio);
        }
    }, [user]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const updatedUser = await userService.updateProfile({ name, bio, profilePicture });
            setUser(updatedUser);
            navigate('/profile');
        } catch (error) {
            console.error('Error updating profile:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleFileChange = (e) => {
        setProfilePicture(e.target.files[0]);
    };

    return (
        <div className="profile-edit">
            <h2>Edit Profile</h2>
            <form onSubmit={handleSubmit}>
                <div>
                    <label>Name:</label>
                    <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        required
                    />
                </div>
                <div>
                    <label>Bio:</label>
                    <textarea
                        value={bio}
                        onChange={(e) => setBio(e.target.value)}
                        required
                    />
                </div>
                <div>
                    <label>Profile Picture:</label>
                    <input type="file" onChange={handleFileChange} />
                </div>
                <button type="submit" disabled={loading}>
                    {loading ? 'Updating...' : 'Update Profile'}
                </button>
            </form>
        </div>
    );
};

export default ProfileEdit;