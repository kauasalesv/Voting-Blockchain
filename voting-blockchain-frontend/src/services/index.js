const express = require('express');
const cors = require('cors');
const Blockchain = require('../blockchain/Blockchain');
const VoteContract = require('../blockchain/VoteContract');

const index = express();
const PORT = 4000;

index.use(cors());
index.use(express.json());

const blockchain = new Blockchain(2);
const voteContract = new VoteContract();

index.post('/vote', (req, res) => {
    const { voter, candidate } = req.body;

    try {
        voteContract.vote(voter, candidate);
        const block = blockchain.addBlock({ voter, candidate });
        res.json({ message: 'Voto registrado!', block });
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

index.get('/results', (req, res) => {
    res.json(voteContract.getResults());
});

index.get('/chain', (req, res) => {
    res.json(blockchain.chain);
});

index.listen(PORT, () => {
    console.log(`Servidor rodando em http://localhost:${PORT}`);
});
