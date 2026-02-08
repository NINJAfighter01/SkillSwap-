import React, { useState } from 'react';
import { submitFeedback } from '../services/api';

const Feedback = () => {
    const [feedback, setFeedback] = useState('');
    const [successMessage, setSuccessMessage] = useState('');
    const [errorMessage, setErrorMessage] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await submitFeedback({ feedback });
            setSuccessMessage('Feedback submitted successfully!');
            setFeedback('');
            setErrorMessage('');
        } catch (error) {
            setErrorMessage('Failed to submit feedback. Please try again.');
            setSuccessMessage('');
        }
    };

    return (
        <div className="feedback-container">
            <h1 className="text-2xl font-bold">Feedback</h1>
            <form onSubmit={handleSubmit} className="mt-4">
                <textarea
                    value={feedback}
                    onChange={(e) => setFeedback(e.target.value)}
                    placeholder="Your feedback..."
                    className="w-full p-2 border border-gray-300 rounded"
                    rows="5"
                    required
                />
                <button type="submit" className="mt-2 p-2 bg-blue-500 text-white rounded">
                    Submit Feedback
                </button>
            </form>
            {successMessage && <p className="text-green-500 mt-2">{successMessage}</p>}
            {errorMessage && <p className="text-red-500 mt-2">{errorMessage}</p>}
        </div>
    );
};

export default Feedback;