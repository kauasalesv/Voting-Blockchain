const express = require('express');
const cors = require('cors');
const Blockchain = require('../blockchain/Blockchain');
const VoteContract = require('../blockchain/VoteContract');

// Cria a aplicação Express
const app = express();
const axios = require('axios');
const PORT = 4000;

// Configura middlewares
app.use(cors());
app.use(express.json());

// Inicializa as instâncias de blockchain e contrato
const blockchain = new Blockchain(2);
const voteContract = new VoteContract();
let peers = [];

// Registro de novos nós
app.post('/register-node', (req, res) => {
    const { nodeUrl } = req.body;
    if (!peers.includes(nodeUrl)) peers.push(nodeUrl);
    res.json({ message: 'Nó registrado com sucesso!', peers });
});

// Broadcast de bloco para todos os peers
const broadcastBlock = (block) => {
    for (const peer of peers) {
        try {
            axios.post(`${peer}/receive-block`, block);
        } catch (err) {
            console.error(`Erro ao enviar para ${peer}: ${err.message}`);
        }
    }
};

// Rota para votar
app.post('/vote', (req, res) => {
    const { voter, candidate } = req.body;

    try {
        voteContract.vote(voter, candidate);
        const block = blockchain.addBlock({ voter, candidate });
        broadcastBlock(block);

        // Agora esses logs vão funcionar
        console.log('Novo bloco criado:', block);
        console.log('Estado atual da blockchain:', blockchain.chain);

        res.json({ message: 'Voto registrado!', block });
    } catch (err) {
        console.error('Erro ao registrar voto:', err.message);
        res.status(400).json({ error: err.message });
    }
});

// Recebimento de blocos de outros nós
app.post('/receive-block', (req, res) => {
    const receivedBlock = req.body;
    const latest = blockchain.getLatestBlock();

    if (receivedBlock.previousHash === latest.hash) {
        blockchain.chain.push(receivedBlock);
        res.json({ message: 'Bloco adicionado!' });
    } else {
        res.status(400).json({ error: 'Bloco inválido.' });
    }
});


// Rota para resultados
app.get('/results', (req, res) => {
    const results = voteContract.getResults();
    console.log('Resultados solicitados:', results);
    res.json(results);
});

// Rota para visualizar a cadeia
app.get('/chain', (req, res) => {
    console.log('Cadeia solicitada:', blockchain.chain);
    res.json(blockchain.chain);
});

// Inicia o servidor (isso deve estar no final do arquivo)
app.listen(PORT, () => {
    console.log(`Servidor rodando em http://localhost:${PORT}`);
});

// Exporta o app para testes (se necessário)
module.exports = app;