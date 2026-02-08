import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { getNotesByLectureId, saveNote } from '../../services/notesService';

const NotesEditor = () => {
    const { lectureId } = useParams();
    const [notes, setNotes] = useState('');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchNotes = async () => {
            try {
                const response = await getNotesByLectureId(lectureId);
                setNotes(response.data.notes);
            } catch (error) {
                console.error('Error fetching notes:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchNotes();
    }, [lectureId]);

    const handleSave = async () => {
        try {
            await saveNote(lectureId, notes);
            alert('Notes saved successfully!');
        } catch (error) {
            console.error('Error saving notes:', error);
            alert('Failed to save notes.');
        }
    };

    if (loading) {
        return <div>Loading...</div>;
    }

    return (
        <div className="notes-editor">
            <h2>Edit Notes</h2>
            <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows="10"
                cols="50"
            />
            <button onClick={handleSave}>Save Notes</button>
        </div>
    );
};

export default NotesEditor;