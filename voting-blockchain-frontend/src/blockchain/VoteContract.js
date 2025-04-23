class VoteContract {
    constructor(blockchain = [], db = null) {
        // Verifica se blockchain é um array válido
        if (!Array.isArray(blockchain)) {
            throw new Error('O parâmetro blockchain deve ser um array');
        }

        this.votes = {};
        this.candidates = ['Alice', 'Bob', 'Carol'];
        this.usedCPFs = new Set();
        this.blockchain = blockchain;
        this.db = db; // Banco de dados para armazenamento persistente, se necessário.
        this._processBlockchain(); // Processa a blockchain uma vez no início
    }

    // Validação matemática do CPF
    _validateCPF(cpf) {
        if (typeof cpf !== 'string' || cpf.length !== 11 || /^(\d)\1{10}$/.test(cpf)) {
            return false;
        }

        let sum = 0;
        for (let i = 0; i < 9; i++) {
            sum += parseInt(cpf[i]) * (10 - i);
        }
        let remainder = (sum * 10) % 11;
        if (remainder === 10) remainder = 0;
        if (remainder !== parseInt(cpf[9])) return false;

        sum = 0;
        for (let i = 0; i < 10; i++) {
            sum += parseInt(cpf[i]) * (11 - i);
        }
        remainder = (sum * 10) % 11;
        return remainder === parseInt(cpf[10]);
    }

    // Processa a blockchain existente uma vez (otimização)
    _processBlockchain() {
        const processedVotes = [];

        // Processa blocos em lotes para evitar travamentos em grandes volumes
        this.blockchain.forEach(block => {
            if (block.index === 0) return; // Ignora o bloco genesis

            const voteData = block.data;
            if (this._isValidVoteData(voteData)) {
                this._addVoteToIndexes(voteData);
                processedVotes.push(voteData);
            }
        });

        // Armazena votos de forma eficiente, se necessário, em um banco de dados
        if (this.db) {
            this.db.saveVotes(processedVotes); // Exemplo de como armazenar votos em um banco de dados
        }
    }

    // Verifica se os dados do voto são válidos
    _isValidVoteData(voteData) {
        return voteData &&
            voteData.voter &&
            voteData.candidate &&
            this._validateCPF(voteData.voter) &&
            this.candidates.includes(voteData.candidate);
    }

    // Registra o voto
    _addVoteToIndexes(voteData) {
        if (this.usedCPFs.has(voteData.voter)) {
            // Caso o CPF já tenha votado
            return;
        }

        // Registra o voto
        this.usedCPFs.add(voteData.voter);
        this.votes[voteData.voter] = voteData.candidate;
    }

    // Função para registrar um novo voto
    vote(voterCPF, candidate) {
        // Valida o formato do CPF
        if (!this._validateCPF(voterCPF)) {
            throw new Error('CPF inválido');
        }

        // Verifica se o CPF já votou
        if (this.usedCPFs.has(voterCPF)) {
            throw new Error('Este CPF já votou');
        }

        // Verifica candidato válido
        if (!this.candidates.includes(candidate)) {
            throw new Error('Candidato inválido');
        }

        // Registra o voto
        this.usedCPFs.add(voterCPF);
        this.votes[voterCPF] = candidate;

        return { success: true, message: 'Voto registrado com sucesso' };
    }

    // Retorna os resultados da votação
    getResults() {
        const count = this.candidates.reduce((acc, candidate) => {
            acc[candidate] = 0;
            return acc;
        }, {});

        for (const candidate of Object.values(this.votes)) {
            count[candidate]++;
        }

        return count;
    }

    // Retorna todos os votos
    getVotes() {
        return this.votes;
    }

    // Verifica se um eleitor já votou
    hasVoted(voterCPF) {
        return this.usedCPFs.has(voterCPF);
    }
}

module.exports = VoteContract;
