const crypto = require('crypto');

class Block {
    constructor(index, timestamp, previousHash, data, hash = '') {
        this.index = index;
        this.timestamp = timestamp;
        this.previousHash = previousHash;
        this.data = data;
        this.hash = hash || this.calculateHash();
    }

    calculateHash() {
        const hashData = `${this.index}${this.timestamp}${this.previousHash}${JSON.stringify(this.data)}`;
        return crypto.createHash('sha256').update(hashData).digest('hex');
    }

    static createGenesisBlock() {
        return new Block(0, Date.now(), "0", { vote: "initial" });
    }
}

module.exports = Block;
