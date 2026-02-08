import React from 'react';

const HowItWorks = () => {
    return (
        <div className="container mx-auto p-4">
            <h1 className="text-3xl font-bold mb-4">How SkillSwap Works</h1>
            <p className="mb-4">
                SkillSwap is a peer-to-peer skill-sharing platform that allows users to learn new skills and teach others in exchange for tokens. Here's how it works:
            </p>
            <h2 className="text-2xl font-semibold mb-2">1. Sign Up</h2>
            <p className="mb-4">
                Create an account using your email or through OAuth options like Google, Facebook, or Microsoft.
            </p>
            <h2 className="text-2xl font-semibold mb-2">2. Explore Skills</h2>
            <p className="mb-4">
                Browse through a variety of skills and lectures available on the platform. Use the search functionality to find specific topics.
            </p>
            <h2 className="text-2xl font-semibold mb-2">3. Learn and Earn Tokens</h2>
            <p className="mb-4">
                Watch lectures and take notes. Each lecture you view will deduct tokens from your wallet, while teachers earn tokens when you watch their content.
            </p>
            <h2 className="text-2xl font-semibold mb-2">4. Teach Others</h2>
            <p className="mb-4">
                If you have a skill to share, create your own lectures. Upload videos and materials, and earn tokens when others view your lectures.
            </p>
            <h2 className="text-2xl font-semibold mb-2">5. Manage Your Profile</h2>
            <p className="mb-4">
                Update your profile, track your learning progress, and manage your subscriptions through the dashboard.
            </p>
            <h2 className="text-2xl font-semibold mb-2">6. Payment and Subscriptions</h2>
            <p className="mb-4">
                Choose from various subscription plans to enhance your learning experience. Payments are securely processed through Razorpay.
            </p>
            <h2 className="text-2xl font-semibold mb-2">Join Us Today!</h2>
            <p>
                Sign up now and start your journey of learning and teaching skills with SkillSwap!
            </p>
        </div>
    );
};

export default HowItWorks;