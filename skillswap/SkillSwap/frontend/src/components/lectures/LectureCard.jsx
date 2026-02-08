import React from 'react';

const LectureCard = ({ lecture, onWatch }) => {
    return (
        <div className="bg-white shadow-md rounded-lg p-4 m-2">
            <h2 className="text-xl font-bold">{lecture.title}</h2>
            <p className="text-gray-700">{lecture.description}</p>
            <div className="flex justify-between items-center mt-4">
                <span className="text-gray-500">{lecture.teacher}</span>
                <button 
                    className="bg-blue-500 text-white px-4 py-2 rounded"
                    onClick={() => onWatch(lecture.id)}
                >
                    Watch
                </button>
            </div>
        </div>
    );
};

export default LectureCard;