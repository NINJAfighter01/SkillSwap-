import React from 'react';

const About = () => {
    return (
        <div className="container mx-auto p-4">
            <h1 className="text-3xl font-bold mb-4">About SkillSwap</h1>
            <p className="mb-4">
                SkillSwap is a peer-to-peer skill-sharing platform designed to empower individuals to learn new skills and share their expertise with others. Our mission is to create a community where knowledge is freely exchanged, and everyone has the opportunity to grow and develop.
            </p>
            <h2 className="text-2xl font-semibold mb-2">Our Vision</h2>
            <p className="mb-4">
                We envision a world where learning is accessible to everyone, regardless of their background or location. By connecting learners with skilled teachers, we aim to foster a culture of continuous learning and personal development.
            </p>
            <h2 className="text-2xl font-semibold mb-2">How It Works</h2>
            <p className="mb-4">
                Users can register on our platform to either learn new skills or teach their own. By participating in lectures, users earn tokens that can be used for future learning opportunities. Our easy-to-use interface allows for seamless navigation and interaction.
            </p>
            <h2 className="text-2xl font-semibold mb-2">Join Us</h2>
            <p>
                Whether you want to learn something new or share your knowledge, SkillSwap is the perfect place for you. Join us today and start your journey towards skill mastery!
            </p>
        </div>
    );
};

export default About;