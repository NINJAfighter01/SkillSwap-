import React from 'react';

const Footer = () => {
    return (
        <footer className="bg-gray-800 text-white py-4">
            <div className="container mx-auto text-center">
                <p>&copy; {new Date().getFullYear()} SkillSwap. All rights reserved.</p>
                <div className="flex justify-center space-x-4 mt-2">
                    <a href="/about" className="hover:underline">About Us</a>
                    <a href="/services" className="hover:underline">Services</a>
                    <a href="/contact" className="hover:underline">Contact</a>
                    <a href="/feedback" className="hover:underline">Feedback</a>
                    <a href="/blog" className="hover:underline">Blog</a>
                </div>
            </div>
        </footer>
    );
};

export default Footer;