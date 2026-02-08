import React from 'react';
import { Link } from 'react-router-dom';
import SearchBar from '../components/common/SearchBar';
import LectureList from '../components/lectures/LectureList';
import { useEffect, useState } from 'react';
import { getLectures } from '../services/lectureService';

const Home = () => {
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

    return (
        <div className="home">
            <h1 className="text-3xl font-bold mb-4">Welcome to SkillSwap</h1>
            <SearchBar />
            {loading && <p>Loading lectures...</p>}
            {error && <p className="text-red-500">{error}</p>}
            <LectureList lectures={lectures} />
            <div className="mt-4">
                <Link to="/about" className="text-blue-500 hover:underline">
                    Learn more about us
                </Link>
            </div>
        </div>
    );
};

export default Home;