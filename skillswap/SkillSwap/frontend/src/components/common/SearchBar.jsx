import React from 'react';

const SearchBar = ({ searchTerm, setSearchTerm }) => {
    const handleInputChange = (event) => {
        setSearchTerm(event.target.value);
    };

    return (
        <div className="relative">
            <input
                type="text"
                value={searchTerm}
                onChange={handleInputChange}
                placeholder="Search lectures..."
                className="w-full p-2 border border-gray-300 rounded-md"
            />
            <button className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-blue-500 text-white p-2 rounded-md">
                Search
            </button>
        </div>
    );
};

export default SearchBar;