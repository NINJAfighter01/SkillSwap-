import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { getLectureById } from '../../services/lectureService';
import LoadingSpinner from '../common/LoadingSpinner';
import ErrorBoundary from '../common/ErrorBoundary';

const LecturePlayer = () => {
    const { id } = useParams();
    const [lecture, setLecture] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchLecture = async () => {
            try {
                const data = await getLectureById(id);
                setLecture(data);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchLecture();
    }, [id]);

    if (loading) {
        return <LoadingSpinner />;
    }

    if (error) {
        return <ErrorBoundary>{error}</ErrorBoundary>;
    }

    return (
        <div className="lecture-player">
            <h1>{lecture.title}</h1>
            <video controls>
                <source src={lecture.videoUrl} type="video/mp4" />
                Your browser does not support the video tag.
            </video>
            <div className="lecture-description">
                <p>{lecture.description}</p>
            </div>
        </div>
    );
};

export default LecturePlayer;