const express = require('express');
const bodyParser = require('body-parser');
const Blockchain = require('../blockchain/Blockchain');
const Block = require('../blockchain/Block');

const app = express();
const cors = require('cors');
const port = 5000;

let votingBlockchain = new Blockchain();
app.use(bodyParser.json());

app.post('/vote', (req, res) => {
    const { voterId, candidate } = req.body;

    // Verificar se o voto é válido
    if (!voterId || !candidate) {
        return res.status(400).send('Voter ID and candidate are required');
    }

    // Criar um novo bloco de voto
    const newBlock = new Block(votingBlockchain.chain.length, Date.now(), votingBlockchain.getLatestBlock().hash, { voterId, candidate });

    // Adicionar o bloco à blockchain
    votingBlockchain.addBlock(newBlock);

    res.status(201).send({
        message: 'Vote recorded successfully!',
        block: newBlock,
        blockchain: votingBlockchain.chain,
    });
});

app.get('/blockchain', (req, res) => {
    res.status(200).send(votingBlockchain.chain);
});

app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
});
