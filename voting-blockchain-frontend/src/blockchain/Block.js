const crypto = require('crypto');

class Block {
    constructor(index, timestamp, data, previousHash = '', nonce = 0) {
        this.index = index;
        this.timestamp = timestamp;
        this.data = data;
        this.previousHash = previousHash;
        this.nonce = nonce;
        this.hash = this.calculateHash();

        // Garante valores fixos para o bloco genesis
        if (this.isGenesis()) {
            this.timestamp = "2023-01-01T00:00:00.000Z";
            this.data = "Genesis Block";
            this.previousHash = "0";
            this.hash = this.calculateHash();
        }
    }

    isGenesis() {
        return this.index === 0 && this.previousHash === '';
    }

    calculateHash() {
        return crypto.createHash('sha256')
            .update(this.index + this.timestamp + JSON.stringify(this.data) + this.previousHash + this.nonce)
            .digest('hex');
    }

    mineBlock(difficulty) {
        while (!this.hash.startsWith('0'.repeat(difficulty))) {
            this.nonce++;
            this.hash = this.calculateHash();
        }
    }
}

module.exports = Block;