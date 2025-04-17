const express = require('express');
const cors = require('cors');
const Blockchain = require('../blockchain/Blockchain');
const VoteContract = require('../blockchain/VoteContract');

// Cria a aplicação Express
const app = express();
const PORT = 4000;

// Configura middlewares
app.use(cors());
app.use(express.json());

// Inicializa as instâncias de blockchain e contrato
const blockchain = new Blockchain(2);
const voteContract = new VoteContract();

// Rota para votar
app.post('/vote', (req, res) => {
    const { voter, candidate } = req.body;

    try {
        voteContract.vote(voter, candidate);
        const block = blockchain.addBlock({ voter, candidate });

        // Agora esses logs vão funcionar
        console.log('Novo bloco criado:', block);
        console.log('Estado atual da blockchain:', blockchain.chain);

        res.json({ message: 'Voto registrado!', block });
    } catch (err) {
        console.error('Erro ao registrar voto:', err.message);
        res.status(400).json({ error: err.message });
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