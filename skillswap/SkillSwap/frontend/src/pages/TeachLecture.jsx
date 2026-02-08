import React, { useState } from 'react';
import LectureForm from '../components/lectures/LectureForm';
import { createLecture } from '../services/lectureService';
import { useHistory } from 'react-router-dom';

const TeachLecture = () => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const history = useHistory();

    const handleLectureSubmit = async (lectureData) => {
        setLoading(true);
        setError(null);
        try {
            await createLecture(lectureData);
            history.push('/dashboard'); // Redirect to dashboard after successful creation
        } catch (err) {
            setError('Failed to create lecture. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container mx-auto p-4">
            <h1 className="text-2xl font-bold mb-4">Teach a New Lecture</h1>
            {error && <div className="text-red-500 mb-4">{error}</div>}
            <LectureForm onSubmit={handleLectureSubmit} loading={loading} />
        </div>
    );
};

export default TeachLecture;