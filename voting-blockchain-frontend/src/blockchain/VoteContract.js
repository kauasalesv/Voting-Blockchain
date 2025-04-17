class VoteContract {
    constructor() {
        this.votes = {};
    }

    vote(voter, candidate) {
        if (this.votes[voter]) {
            throw new Error('Este eleitor já votou.');
        }
        this.votes[voter] = candidate;
    }

    getResults() {
        const count = {};
        for (const candidate of Object.values(this.votes)) {
            count[candidate] = (count[candidate] || 0) + 1;
        }
        return count;
    }

    getVotes() {
        return this.votes;
    }
}

module.exports = VoteContract;
