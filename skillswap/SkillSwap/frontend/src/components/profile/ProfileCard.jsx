import React from 'react';

const ProfileCard = ({ user }) => {
    return (
        <div className="bg-white shadow-md rounded-lg p-6">
            <div className="flex items-center">
                <img
                    src={user.avatar || '/path/to/default/avatar.png'}
                    alt="User Avatar"
                    className="w-16 h-16 rounded-full mr-4"
                />
                <div>
                    <h2 className="text-xl font-semibold">{user.name}</h2>
                    <p className="text-gray-600">{user.email}</p>
                </div>
            </div>
            <div className="mt-4">
                <h3 className="text-lg font-medium">Bio</h3>
                <p className="text-gray-700">{user.bio || 'No bio available.'}</p>
            </div>
            <div className="mt-4">
                <h3 className="text-lg font-medium">Skills</h3>
                <ul className="list-disc list-inside">
                    {user.skills && user.skills.length > 0 ? (
                        user.skills.map((skill, index) => (
                            <li key={index} className="text-gray-700">{skill}</li>
                        ))
                    ) : (
                        <li className="text-gray-700">No skills listed.</li>
                    )}
                </ul>
            </div>
        </div>
    );
};

export default ProfileCard;