import React, { useContext } from 'react';
import { ThemeContext } from '../../context/ThemeContext';

const DarkModeToggle = () => {
    const { isDarkMode, toggleDarkMode } = useContext(ThemeContext);

    return (
        <button
            onClick={toggleDarkMode}
            className={`p-2 rounded-md focus:outline-none ${isDarkMode ? 'bg-gray-800 text-white' : 'bg-gray-200 text-black'}`}
        >
            {isDarkMode ? 'Light Mode' : 'Dark Mode'}
        </button>
    );
};

export default DarkModeToggle;