const express = require('express');
const cors = require('cors');
const Blockchain = require('../blockchain/Blockchain');
const VoteContract = require('../blockchain/VoteContract');
const axios = require('axios');

// Cria a aplicação Express
const app = express();
const PORT = process.env.PORT || 4000;

// Configura middlewares
app.use(cors());
app.use(express.json());

// Inicializa as instâncias de blockchain e contrato
const blockchain = new Blockchain(2);

console.log('\n=== Informações do Genesis Block ===');
console.log('Hash:', blockchain.chain[0].hash);
console.log('Timestamp:', blockchain.chain[0].timestamp);
console.log('PreviousHash:', blockchain.chain[0].previousHash);

// Verificação de consistência
if (!blockchain.isValid()) {
    console.error('ERRO: Blockchain inválida no startup!');
    process.exit(1);
}

let voteContract = new VoteContract(blockchain.chain);

function updateContract() {
    voteContract = new VoteContract(blockchain.chain);
}

const initialPeers = process.env.INITIAL_PEERS ? process.env.INITIAL_PEERS.split(',') : [];
let peers = [...initialPeers];


// Registro de novos nós
app.post('/register-node', (req, res) => {
    const { nodeUrl } = req.body;
    if (!peers.includes(nodeUrl)){
        peers.push(nodeUrl);
        console.log('Novo nó registrado:', nodeUrl);
    }

    console.log('Nós registrados:', peers);
    res.json({ message: 'Nó registrado com sucesso!', peers });
});

// Endpoint para listar peers (para debug)
app.get('/peers', (req, res) => {
    res.json(peers);
});

// Broadcast de bloco para todos os peers
// Broadcast de bloco para todos os peers
const broadcastBlock = (block) => {
    if (peers.length === 0) {
        console.warn('Nenhum peer registrado. Bloco não será enviado.');
        return;
    }

    for (const peer of peers) {
        axios.post(`${peer}/receive-block`, block)
            .then(() => {
                console.log(`Bloco enviado com sucesso para ${peer}`);
            })
            .catch((err) => {
                console.error(`Erro ao enviar bloco para ${peer}: ${err.message}`);
            });
    }
};


// Rota para votar
app.post('/vote', (req, res) => {
    const { voter, candidate } = req.body;

    try {
        voteContract.vote(voter, candidate);
        const block = blockchain.addBlock({ voter, candidate });
        broadcastBlock(block);

        updateContract();

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

    console.log('\n=== Validação de Bloco ===');
    console.log('Bloco recebido:', {
        index: receivedBlock.index,
        previousHash: receivedBlock.previousHash,
        hash: receivedBlock.hash
    });
    console.log('Último bloco local:', {
        index: latest.index,
        hash: latest.hash
    });

    // Validação do bloco genesis
    if (receivedBlock.index === 0) {
        const genesis = blockchain.chain[0];
        if (receivedBlock.hash !== genesis.hash) {
            console.error('ERRO: Bloco genesis diferente!');
            return res.status(400).json({
                error: 'Bloco genesis inválido',
                expected: genesis.hash,
                received: receivedBlock.hash
            });
        }
        return res.json({ message: 'Bloco genesis válido' });
    }

    // Validação para blocos subsequentes
    if (receivedBlock.previousHash !== latest.hash) {
        console.error('ERRO: previousHash não corresponde!');
        console.log('Esperado:', latest.hash);
        console.log('Recebido:', receivedBlock.previousHash);

        // Tentativa de sincronização automática
        syncChains();

        return res.status(400).json({
            error: 'Bloco inválido: previousHash não corresponde',
            expected: latest.hash,
            received: receivedBlock.previousHash
        });
    }

    // Se passar nas validações, adiciona o bloco
    blockchain.chain.push(receivedBlock);
    updateContract();
    console.log('Bloco adicionado com sucesso!');
    res.json({ message: 'Bloco adicionado' });
});

// Função de sincronização
async function syncChains() {
    console.log('Iniciando sincronização com peers...');
    for (const peer of peers) {
        try {
            const response = await axios.get(`${peer}/chain`);
            if (response.data.length > blockchain.chain.length && response.data[0].hash === blockchain.chain[0].hash) {
                console.log(`Sincronizando com ${peer}`);
                blockchain.chain = response.data;
                return true;
            }
        } catch (err) {
            console.error(`Falha ao sincronizar com ${peer}:`, err.message);
        }
    }
    return false;
}

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

// Encerra o socket UDP quando o servidor fecha
process.on('SIGINT', () => {
    socket.close();
    process.exit();
});

// Inicia o servidor
app.listen(PORT, () => {
    console.log(`Servidor rodando em http://localhost:${PORT}`);
    console.log('Genesis block:', blockchain.chain[0]);
    console.log('Hash do genesis:', blockchain.chain[0].hash);
});

module.exports = app;