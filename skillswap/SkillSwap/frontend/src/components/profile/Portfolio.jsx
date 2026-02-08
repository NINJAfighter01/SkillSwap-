import React, { useEffect, useState, useContext } from 'react';
import { UserContext } from '../../context/TokenContext';
import { getUserPortfolio } from '../../services/userService';

const Portfolio = () => {
    const { user } = useContext(UserContext);
    const [portfolio, setPortfolio] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchPortfolio = async () => {
            try {
                const data = await getUserPortfolio(user.id);
                setPortfolio(data);
            } catch (err) {
                setError('Failed to load portfolio');
            } finally {
                setLoading(false);
            }
        };

        if (user) {
            fetchPortfolio();
        }
    }, [user]);

    if (loading) {
        return <div>Loading...</div>;
    }

    if (error) {
        return <div>{error}</div>;
    }

    return (
        <div className="portfolio">
            <h2>{user.name}'s Portfolio</h2>
            <ul>
                {portfolio.map((item) => (
                    <li key={item.id}>
                        <h3>{item.title}</h3>
                        <p>{item.description}</p>
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default Portfolio;