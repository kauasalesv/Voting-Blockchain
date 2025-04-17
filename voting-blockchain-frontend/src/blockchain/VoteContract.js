class VoteContract {
    constructor() {
        this.votes = {};
        this.candidates = ['Alice', 'Bob', 'Carol'];
        this.usedCPFs = new Set();
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

    getVotes() {
        return this.votes;
    }

    hasVoted(voterCPF) {
        return this.usedCPFs.has(voterCPF);
    }
}

module.exports = VoteContract;