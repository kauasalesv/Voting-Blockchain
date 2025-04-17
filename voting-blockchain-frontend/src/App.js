import React, { useState, useEffect } from 'react';
import api from './services/api';

export default function App() {
    const [voter, setVoter] = useState('');
    const [candidate, setCandidate] = useState('');
    const [results, setResults] = useState({});
    const [message, setMessage] = useState('');

    const handleVote = async () => {
        try {
            const response = await api.post('/vote', { voter, candidate });
            setMessage(response.data.message);
            fetchResults();
        } catch (err) {
            setMessage(err.response?.data?.error || 'Erro ao votar.');
        }
    };

    const fetchResults = async () => {
        const response = await api.get('/results');
        setResults(response.data);
    };

    useEffect(() => {
        fetchResults();
    }, []);

    return (
        <div style={{ padding: 20 }}>
            <h1>Votação Descentralizada</h1>
            <input
                placeholder="Seu nome ou ID"
                value={voter}
                onChange={e => setVoter(e.target.value)}
            />
            <input
                placeholder="Candidato"
                value={candidate}
                onChange={e => setCandidate(e.target.value)}
            />
            <button onClick={handleVote}>Votar</button>
            <p>{message}</p>
            <h2>Resultados:</h2>
            <ul>
                {Object.entries(results).map(([name, count]) => (
                    <li key={name}>{name}: {count} voto(s)</li>
                ))}
            </ul>
        </div>
    );
}
