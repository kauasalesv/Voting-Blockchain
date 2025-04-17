const Block = require('./Block');

class Blockchain {
    constructor(difficulty = 2) {
        this.chain = [this.createGenesisBlock()];
        this.difficulty = difficulty;
    }

    createGenesisBlock() {
        return new Block(0, Date.now(), 'Genesis Block', '0');
    }

    getLatestBlock() {
        return this.chain[this.chain.length - 1];
    }

    addBlock(data) {
        const previousBlock = this.getLatestBlock();
        const newBlock = new Block(this.chain.length, Date.now(), data, previousBlock.hash);
        newBlock.mineBlock(this.difficulty);
        this.chain.push(newBlock);
        return newBlock;
    }

    isValid() {
        for (let i = 1; i < this.chain.length; i++) {
            const curr = this.chain[i];
            const prev = this.chain[i - 1];

            if (curr.hash !== curr.calculateHash() || curr.previousHash !== prev.hash) {
                return false;
            }
        }
        return true;
    }
}

module.exports = Blockchain;
