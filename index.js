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
    return btoa(this.index + this.timestamp + JSON.stringify(this.data) + this.previousHash);
  }
}

class Blockchain {
  constructor() {
    this.chain = [];
    this.loadFromStorage();
  }

  createGenesisBlock() {
    return new Block(0, new Date().toLocaleString(), "Blok Genesis", "0");
  }

  getLatestBlock() {
    return this.chain[this.chain.length - 1];
  }

  addBlock(newData) {
    const previousBlock = this.getLatestBlock();
    const newBlock = new Block(
      previousBlock.index + 1,
      new Date().toLocaleString(),
      newData,
      previousBlock.hash
    );
    this.chain.push(newBlock);
    this.saveToStorage();
  }

  saveToStorage() {
    localStorage.setItem('blockchainData', JSON.stringify(this.chain));
  }

  loadFromStorage() {
    const stored = localStorage.getItem('blockchainData');
    if (stored) {
      this.chain = JSON.parse(stored);
    } else {
      this.chain = [this.createGenesisBlock()];
      this.saveToStorage();
    }
  }

  reset() {
    localStorage.removeItem('blockchainData');
    localStorage.removeItem('walletAddress');
    localStorage.removeItem('walletVotes');
    this.chain = [this.createGenesisBlock()];
    this.saveToStorage();
  }
}

const blockchain = new Blockchain();
let walletVotes = JSON.parse(localStorage.getItem("walletVotes")) || {};

function getWalletAddress() {
  return localStorage.getItem('walletAddress') || null;
}

function connectWallet() {
  const wallet = prompt("Masukkan alamat wallet kamu:");
  if (wallet) {
    localStorage.setItem('walletAddress', wallet);
    alert("Wallet berhasil terhubung!");
    document.getElementById('walletInfo').innerText = `Wallet: ${wallet}`;
    if (walletVotes[wallet]) {
      disableVoting();
    }
  }
}

function vote() {
  const wallet = getWalletAddress();
  if (!wallet) {
    alert("Hubungkan wallet terlebih dahulu!");
    return;
  }

  if (walletVotes[wallet]) {
    alert("Wallet ini sudah melakukan voting!");
    return;
  }

  const candidate = document.getElementById('voteOption').value;
  const data = `Vote untuk Kandidat ${candidate} oleh ${wallet}`;
  blockchain.addBlock(data);

  walletVotes[wallet] = true;
  localStorage.setItem("walletVotes", JSON.stringify(walletVotes));

  alert("Voting berhasil!");
  displayBlockchain();
  displayRekap();
  disableVoting();
}

function disableVoting() {
  document.getElementById('voteOption').disabled = true;
  document.querySelector('button[onclick="vote()"]')?.setAttribute("disabled", true);
}

function displayBlockchain() {
  const container = document.getElementById('blockchain');
  container.innerHTML = '';
  blockchain.chain.forEach(block => {
    const div = document.createElement('div');
    div.className = 'block';
    div.innerText = `
Blok ${block.index}
Waktu: ${block.timestamp}
Data: ${block.data}
Hash: ${block.hash}
Hash Sebelumnya: ${block.previousHash}`;
    container.appendChild(div);
  });
}

function displayRekap() {
  const count = { A: 0, B: 0, C: 0 };
  blockchain.chain.forEach(block => {
    if (typeof block.data === 'string') {
      if (block.data.includes("Kandidat A")) count.A++;
      if (block.data.includes("Kandidat B")) count.B++;
      if (block.data.includes("Kandidat C")) count.C++;
    }
  });
  document.getElementById('rekapSuara').innerText = `A: ${count.A} suara\nB: ${count.B} suara\nC: ${count.C} suara`;
}

function exportData() {
  const dataStr = JSON.stringify(blockchain.chain, null, 2);
  const blob = new Blob([dataStr], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'blockchain_data.json';
  a.click();
}

document.addEventListener('DOMContentLoaded', () => {
  const wallet = getWalletAddress();
  if (wallet) {
    document.getElementById('walletInfo').innerText = `Wallet: ${wallet}`;
    if (walletVotes[wallet]) {
