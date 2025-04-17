import React, { useState } from 'react';
import axios from 'axios';

function App() {
  const [voterId, setVoterId] = useState('');
  const [candidate, setCandidate] = useState('');
  const [message, setMessage] = useState('');
  const [blockchain, setBlockchain] = useState([]);

  const handleVote = async () => {
    try {
      const response = await axios.post('http://localhost:5000/vote', {
        voterId,
        candidate
      });
      setMessage('Vote registered!');
      setBlockchain(response.data.blockchain);
    } catch (error) {
      setMessage('Error: Could not register vote.');
    }
  };

  const handleVoterIdChange = (e) => setVoterId(e.target.value);
  const handleCandidateChange = (e) => setCandidate(e.target.value);

  return (
      <div className="App">
        <h1>Blockchain Voting System</h1>
        <div>
          <input
              type="text"
              placeholder="Enter your voter ID"
              value={voterId}
              onChange={handleVoterIdChange}
          />
          <input
              type="text"
              placeholder="Enter candidate name"
              value={candidate}
              onChange={handleCandidateChange}
          />
          <button onClick={handleVote}>Vote</button>
        </div>
        <p>{message}</p>
        <h2>Blockchain</h2>
        <pre>{JSON.stringify(blockchain, null, 2)}</pre>
      </div>
  );
}

export default App;
