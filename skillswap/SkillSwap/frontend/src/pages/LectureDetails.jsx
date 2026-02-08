import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { getLectureDetails } from '../services/lectureService';
import LecturePlayer from '../components/lectures/LecturePlayer';
import NotesList from '../components/notes/NotesList';
import LoadingSpinner from '../components/common/LoadingSpinner';
import ErrorBoundary from '../components/common/ErrorBoundary';

const LectureDetails = () => {
    const { id } = useParams();
    const [lecture, setLecture] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchLectureDetails = async () => {
            try {
                const data = await getLectureDetails(id);
                setLecture(data);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchLectureDetails();
    }, [id]);

    if (loading) {
        return <LoadingSpinner />;
    }

    if (error) {
        return <div>Error: {error}</div>;
    }

    return (
        <ErrorBoundary>
            <div className="lecture-details">
                <h1>{lecture.title}</h1>
                <LecturePlayer videoUrl={lecture.videoUrl} />
                <NotesList lectureId={lecture.id} />
            </div>
        </ErrorBoundary>
    );
};

export default LectureDetails;