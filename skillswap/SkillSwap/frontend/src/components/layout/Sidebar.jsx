import React from 'react';
import { Link } from 'react-router-dom';

const Sidebar = () => {
    return (
        <div className="sidebar">
            <h2 className="sidebar-title">SkillSwap</h2>
            <ul className="sidebar-menu">
                <li>
                    <Link to="/">Home</Link>
                </li>
                <li>
                    <Link to="/dashboard">Dashboard</Link>
                </li>
                <li>
                    <Link to="/lectures">Lectures</Link>
                </li>
                <li>
                    <Link to="/profile">Profile</Link>
                </li>
                <li>
                    <Link to="/subscription">Subscription</Link>
                </li>
                <li>
                    <Link to="/about">About</Link>
                </li>
                <li>
                    <Link to="/contact">Contact</Link>
                </li>
                <li>
                    <Link to="/feedback">Feedback</Link>
                </li>
                <li>
                    <Link to="/blog">Blog</Link>
                </li>
                <li>
                    <Link to="/info">Info</Link>
                </li>
            </ul>
        </div>
    );
};

export default Sidebar;