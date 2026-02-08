import React, { useEffect, useState } from 'react';
import { getLectures } from '../../services/lectureService';
import LectureCard from './LectureCard';
import LoadingSpinner from '../common/LoadingSpinner';
import ErrorBoundary from '../common/ErrorBoundary';

const LectureList = () => {
    const [lectures, setLectures] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchLectures = async () => {
            try {
                const data = await getLectures();
                setLectures(data);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchLectures();
    }, []);

    if (loading) {
        return <LoadingSpinner />;
    }

    if (error) {
        return <div>Error: {error}</div>;
    }

    return (
        <div className="lecture-list">
            {lectures.map((lecture) => (
                <LectureCard key={lecture.id} lecture={lecture} />
            ))}
        </div>
    );
};

export default LectureList;