import React, { useEffect, useState, useContext } from 'react';
import { TokenContext } from '../../context/TokenContext';
import { notesService } from '../../services/notesService';

const NotesList = () => {
    const { token } = useContext(TokenContext);
    const [notes, setNotes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchNotes = async () => {
            try {
                const response = await notesService.getNotes(token);
                setNotes(response.data);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchNotes();
    }, [token]);

    if (loading) {
        return <div>Loading...</div>;
    }

    if (error) {
        return <div>Error: {error}</div>;
    }

    return (
        <div>
            <h2>Your Notes</h2>
            <ul>
                {notes.map(note => (
                    <li key={note.id}>
                        <h3>{note.title}</h3>
                        <p>{note.content}</p>
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default NotesList;