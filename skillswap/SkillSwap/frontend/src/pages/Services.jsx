import React from 'react';

const Services = () => {
    return (
        <div className="services-page">
            <h1 className="text-3xl font-bold mb-4">Our Services</h1>
            <p className="mb-4">
                At SkillSwap, we offer a variety of services to help you learn and teach skills effectively. 
                Our platform connects learners with experienced teachers, providing a seamless experience for both parties.
            </p>
            <h2 className="text-2xl font-semibold mb-2">What We Offer:</h2>
            <ul className="list-disc list-inside mb-4">
                <li>Peer-to-peer skill sharing</li>
                <li>Personalized learning experiences</li>
                <li>Access to a wide range of lectures and resources</li>
                <li>Token-based economy for rewarding teaching and learning</li>
                <li>Subscription plans for enhanced features</li>
            </ul>
            <h2 className="text-2xl font-semibold mb-2">Get Started:</h2>
            <p>
                Join us today and start your journey of learning and teaching new skills. 
                Sign up now to explore our offerings and connect with others in the community!
            </p>
        </div>
    );
};

export default Services;