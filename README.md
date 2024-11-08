# 📦 StorageSharingPlatform - Decentralized Storage Sharing dApp

## Overview  
The **StorageSharingPlatform** is a decentralized platform built on Ethereum, allowing users to rent out unused storage space or purchase storage from others. It leverages smart contracts for secure rental agreements and payments, with transactions conducted using a custom ERC20 token called **StorageToken**.  

The platform ensures data security through **file encryption**, **fragmentation**, and **redundancy** to prevent data loss.

---

## Features
- **Peer-to-Peer Storage Marketplace**: Rent or buy storage space from other users.
- **Smart Contracts**: Automated agreements with transparent payment flows.
- **StorageToken**: Custom ERC20 token used for transactions.
- **File Encryption & Fragmentation**: Protects files by encrypting and splitting them.
- **Redundancy**: Creates backups to prevent data loss.

---

## Project Structure
StorageSharingPlatform/ 

│ ├── contracts/ 

│ ├── StorageMarket.sol

│ └── StorageToken.sol

├── app.js

├── index.html

├── style.css

├── README.md

├── LICENSE

## Usage Instructions

### Prerequisites  
1. **MetaMask** browser extension installed.  
2. **Ganache** to create a local Ethereum blockchain.  
3. **Remix IDE** to deploy smart contracts.  
4. **Node.js** and **npm** installed for any required dependencies.

### Smart Contracts
StorageToken.sol: Implements the ERC20 token used for payments.
StorageMarket.sol: Manages listings, rental agreements, and payments.

### Technology Stack
**Frontend**: HTML, CSS, JavaScript (Web3.js)
**Smart Contracts**: Solidity (deployed via Remix IDE)
**Blockchain**: Local Ethereum blockchain using Ganache
**Wallet Integration**: MetaMask

# Sample Hardhat Project
This project demonstrates a basic Hardhat use case. It comes with a sample contract, a test for that contract, and a Hardhat Ignition module that deploys that contract.

Try running some of the following tasks:

```shell
npx hardhat help
npx hardhat test
REPORT_GAS=true npx hardhat test
npx hardhat node
npx hardhat ignition deploy ./ignition/modules/Lock.js
```
