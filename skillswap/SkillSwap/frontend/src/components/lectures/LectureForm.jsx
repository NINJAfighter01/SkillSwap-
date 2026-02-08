import React, { useState, useEffect } from 'react';
import { useParams, useHistory } from 'react-router-dom';
import { createLecture, updateLecture, getLectureById } from '../../services/lectureService';

const LectureForm = () => {
    const { id } = useParams();
    const history = useHistory();
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [videoUrl, setVideoUrl] = useState('');
    const [isEditing, setIsEditing] = useState(false);

    useEffect(() => {
        if (id) {
            setIsEditing(true);
            const fetchLecture = async () => {
                const lecture = await getLectureById(id);
                setTitle(lecture.title);
                setDescription(lecture.description);
                setVideoUrl(lecture.videoUrl);
            };
            fetchLecture();
        }
    }, [id]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        const lectureData = { title, description, videoUrl };
        if (isEditing) {
            await updateLecture(id, lectureData);
        } else {
            await createLecture(lectureData);
        }
        history.push('/lectures');
    };

    return (
        <div className="lecture-form">
            <h2>{isEditing ? 'Edit Lecture' : 'Create Lecture'}</h2>
            <form onSubmit={handleSubmit}>
                <div>
                    <label>Title:</label>
                    <input
                        type="text"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        required
                    />
                </div>
                <div>
                    <label>Description:</label>
                    <textarea
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        required
                    />
                </div>
                <div>
                    <label>Video URL:</label>
                    <input
                        type="url"
                        value={videoUrl}
                        onChange={(e) => setVideoUrl(e.target.value)}
                        required
                    />
                </div>
                <button type="submit">{isEditing ? 'Update Lecture' : 'Create Lecture'}</button>
            </form>
        </div>
    );
};

export default LectureForm;