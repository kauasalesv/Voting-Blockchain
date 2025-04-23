import React, { useState, useEffect } from 'react';
import api from './services/api';
import './App.css';

import alice from './alice.png';
import carol from './carol.png';
import bob from './bob.png';
import defaultImage from './defaultImage.png';

export default function App() {
    const [voter, setVoter] = useState('');
    const [results, setResults] = useState({});
    const [message, setMessage] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleVote = async (candidate) => {
        const cleanCPF = voter.replace(/\D/g, '');

        if (!cleanCPF) {
            setMessage('Por favor, insira seu CPF.');
            clearMessageAfterDelay();
            return;
        }

        if (cleanCPF.length !== 11) {
            setMessage('CPF deve ter 11 dígitos.');
            clearMessageAfterDelay();
            return;
        }

        setIsLoading(true);
        try {
            const response = await api.post('/vote', {
                voter: cleanCPF,
                candidate
            });
            setMessage(response.data.message);
            clearMessageAfterDelay();
            await fetchResults();
        } catch (err) {
            setMessage(err.response?.data?.error || 'Erro ao votar.');
            clearMessageAfterDelay();
        } finally {
            setIsLoading(false);
        }
    };

    const clearMessageAfterDelay = () => {
        setTimeout(() => {
            setMessage('');
        }, 4000); // 4 segundos
    };

    const fetchResults = async () => {
        try {
            const response = await api.get('/results');
            setResults(response.data);
        } catch (err) {
            console.error('Erro ao buscar resultados:', err);
        }
    };

    useEffect(() => {
        fetchResults(); // Busca inicial

        const interval = setInterval(fetchResults, 1000); // Busca a cada 1 segundo

        return () => clearInterval(interval); // Limpa o intervalo ao desmontar
    }, []);


    return (
        <div className="app-container">
            <h1 className="app-title">Votação Descentralizada</h1>

            <div className="voter-input-container">
                <input
                    placeholder="Digite seu CPF"
                    value={voter}
                    onChange={e => {
                        let value = e.target.value.replace(/\D/g, '');
                        if (value.length > 11) value = value.slice(0, 11);
                        // Formata automaticamente: XXX.XXX.XXX-XX
                        setVoter(value.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4'));
                    }}
                    className="voter-input"
                    maxLength="14"
                />
            </div>

            <h2 className="candidates-title">Escolha seu candidato:</h2>
            <div className="candidates-grid">
                {['Alice', 'Bob', 'Carol'].map((candidate) => (
                    <div
                        key={candidate}
                        className={`candidate-card ${isLoading ? 'disabled' : ''}`}
                        onClick={() => !isLoading && handleVote(candidate)}
                    >
                        <img
                            src={
                                candidate === 'Alice' ? alice :
                                    candidate === 'Bob' ? bob :
                                        candidate === 'Carol' ? carol :
                                            defaultImage
                            }
                            alt={candidate}
                            className="candidate-image"
                        />
                        <div className="candidate-name">{candidate}</div>
                    </div>
                ))}
            </div>

            {message && (
                <div className={`message ${
                    message.toLowerCase().includes('erro') ? 'error' :
                        message.toLowerCase().includes('por favor') || message.toLowerCase().includes('já') ? 'warning' :
                            'success'
                }`}>
                    {message}
                </div>
            )}

            <h2 className="results-title">Resultados:</h2>
            <div className="results-list">
                {Object.entries(results).map(([name, count]) => (
                    <div key={name} className="result-item">
                        <span>{name}:</span>
                        <span>{count} voto(s)</span>
                    </div>
                ))}
            </div>
        </div>
    );
}