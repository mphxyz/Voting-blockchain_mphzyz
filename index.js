// index.js - Voting Blockchain Mini Level 5B

class Block {
  constructor(index, timestamp, data, previousHash = '') {
    this.index = index;
    this.timestamp = timestamp;
    this.data = data;
    this.previousHash = previousHash;
    this.hash = this.calculateHash();
  }

  calculateHash() {
    // Gunakan crypto.subtle.digest untuk hash yang lebih aman (SHA-256)
    const str = this.index + this.timestamp + JSON.stringify(this.data) + this.previousHash;
    return crypto.subtle.digest('SHA-256', new TextEncoder().encode(str))
      .then(buffer => {
        return Array.from(new Uint8Array(buffer))
          .map(b => b.toString(16).padStart(2, '0'))
          .join('');
      });
  }
}

class Blockchain {
  constructor() {
    this.chain = [];
    this.loadFromStorage();
  }

  // ... (createGenesisBlock, getLatestBlock tetap sama)

  async addBlock(newData) {
    const previousBlock = this.getLatestBlock();
    const newBlock = new Block(
      previousBlock.index + 1,
      new Date().toLocaleString(),
      newData,
      previousBlock.hash
    );
    newBlock.hash = await newBlock.calculateHash(); // Tunggu hash selesai
    this.chain.push(newBlock);
    this.saveToStorage();
  }

  isChainValid() {
    for (let i = 1; i < this.chain.length; i++) {
      const current = this.chain[i];
      const previous = this.chain[i - 1];
      
      if (current.hash !== current.calculateHash()) {
        return false;
      }
      
      if (current.previousHash !== previous.hash) {
        return false;
      }
    }
    return true;
  }

  loadFromStorage() {
    const stored = localStorage.getItem('blockchainData');
    if (stored) {
      this.chain = JSON.parse(stored);
      if (!this.isChainValid()) {
        console.warn("Chain tidak valid, reset ke genesis block");
        this.reset();
      }
    } else {
      this.chain = [this.createGenesisBlock()];
      this.saveToStorage();
    }
  }

  // ... (method lainnya tetap sama)
}

// Inisialisasi
const blockchain = new Blockchain();
let walletVotes = JSON.parse(localStorage.getItem("walletVotes")) || {};

// ... (fungsi connectWallet, vote, dll tetap sama)

document.addEventListener('DOMContentLoaded', () => {
  const wallet = getWalletAddress();
  if (wallet) {
    document.getElementById('walletInfo').innerText = `Wallet: ${wallet}`;
    if (walletVotes[wallet]) {
      disableVoting();
    }
  }
  displayBlockchain();
  displayRekap();
});
