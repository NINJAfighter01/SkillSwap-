import React, { useContext } from 'react';
import { TokenContext } from '../../context/TokenContext';

const ProgressTracker = () => {
    const { progress } = useContext(TokenContext);

    return (
        <div className="progress-tracker">
            <h2 className="text-lg font-semibold">Your Learning Progress</h2>
            <div className="progress-bar">
                <div
                    className="progress-fill"
                    style={{ width: `${progress}%` }}
                ></div>
            </div>
            <p className="text-sm">{progress}% completed</p>
        </div>
    );
};

export default ProgressTracker;