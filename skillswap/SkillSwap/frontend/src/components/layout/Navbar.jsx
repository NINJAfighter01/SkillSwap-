import React from 'react';
import { Link } from 'react-router-dom';
import DarkModeToggle from '../common/DarkModeToggle';

const Navbar = () => {
    return (
        <nav className="bg-white shadow-md">
            <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
                <div className="text-xl font-bold">
                    <Link to="/">SkillSwap</Link>
                </div>
                <div className="flex items-center space-x-4">
                    <Link to="/about" className="text-gray-700 hover:text-blue-500">About</Link>
                    <Link to="/services" className="text-gray-700 hover:text-blue-500">Services</Link>
                    <Link to="/contact" className="text-gray-700 hover:text-blue-500">Contact</Link>
                    <Link to="/feedback" className="text-gray-700 hover:text-blue-500">Feedback</Link>
                    <Link to="/blog" className="text-gray-700 hover:text-blue-500">Blog</Link>
                    <DarkModeToggle />
                </div>
            </div>
        </nav>
    );
};

export default Navbar;