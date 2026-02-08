import React from 'react';

const Info = () => {
    return (
        <div className="container mx-auto p-4">
            <h1 className="text-2xl font-bold mb-4">Information</h1>
            <p className="mb-2">
                SkillSwap is a peer-to-peer skill-sharing platform where users can learn new skills and earn tokens by teaching others.
            </p>
            <h2 className="text-xl font-semibold mt-4">Features</h2>
            <ul className="list-disc list-inside mb-4">
                <li>Authentication with email/password and OAuth options.</li>
                <li>Dashboard for tracking learning progress and tokens.</li>
                <li>Lecture system for browsing and watching lectures.</li>
                <li>Notes system for taking and managing notes.</li>
                <li>Subscription plans for accessing premium content.</li>
            </ul>
            <h2 className="text-xl font-semibold mt-4">Contact Us</h2>
            <p>If you have any questions or feedback, feel free to reach out to us!</p>
        </div>
    );
};

export default Info;