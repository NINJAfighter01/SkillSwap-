import React from 'react';

const Blog = () => {
    return (
        <div className="container mx-auto p-4">
            <h1 className="text-3xl font-bold mb-4">Blog</h1>
            <p className="mb-4">Welcome to the SkillSwap blog! Here you will find articles, tips, and updates about skill sharing, learning, and teaching.</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Example Blog Post */}
                <div className="bg-white shadow-md rounded-lg p-4">
                    <h2 className="text-xl font-semibold">How to Effectively Teach a Skill</h2>
                    <p className="text-gray-700">Teaching a skill can be rewarding. Here are some tips to make your lectures engaging and effective...</p>
                    <a href="#" className="text-blue-500 hover:underline">Read more</a>
                </div>
                <div className="bg-white shadow-md rounded-lg p-4">
                    <h2 className="text-xl font-semibold">Top Skills to Learn in 2023</h2>
                    <p className="text-gray-700">Looking to learn something new? Here are the top skills that are in demand this year...</p>
                    <a href="#" className="text-blue-500 hover:underline">Read more</a>
                </div>
                {/* Add more blog posts as needed */}
            </div>
        </div>
    );
};

export default Blog;