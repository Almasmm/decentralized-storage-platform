# Decentralized Storage Sharing Platform

## Objective
To create a decentralized platform where users can rent out unused storage space on their devices, and others can use it to store their files securely and affordably.

## Motivation
- Reduce costs associated with centralized cloud storage services.
- Promote resource sharing by utilizing underutilized storage space.
- Provide a decentralized, secure, and censorship-resistant storage option.

## Core Features
1. **Peer-to-Peer Storage Marketplace**: Users can rent out their unused storage space on their devices or purchase storage from others on a decentralized network.
2. **Smart Contracts for Data Storage and Payments**: Manages agreements between storage providers and consumers, ensuring transparent and fair payments based on storage usage.
3. **File Encryption**: Files sent by consumers are encrypted to ensure data security.

## Detailed Architecture
### 1. User Application
- **Storage Providers**: Register available space for rent.
- **Storage Consumers**: Purchase available space for rent, upload files, and send them to the storage provider's machine.
- **Dashboard**: Track storage usage, payments, and performance.

### 2. Blockchain Layer
- **Smart Contracts**: Automate storage rental agreements, payments, and data retrieval.

### 3. Token System
- **Storage Tokens (ERC-20)**: Used for payments between storage providers and consumers.

## User Flows
### Storage Provider User Flow
1. **Sign-Up/Sign-In**: Register or log in with email or wallet.
2. **Profile Setup**: Set up profile details like available storage and pricing.
3. **Storage Listing Creation**: Create and publish storage listings.
4. **Waiting for Requests**: Wait for consumer requests to rent storage.
5. **Accepting Requests**: Review and accept storage contract requests.
6. **Storage Monitoring**: Track storage usage, uptime, and payments.
7. **Payment and Contract Conclusion**: Receive payment at contract end or renewal.

### Storage Consumer User Flow
1. **Sign-Up/Sign-In**: Register or log in with email or wallet.
2. **Storage Search**: Search for storage based on size, price, and security.
3. **View Provider Profile**: View provider listings and storage details.
4. **Contract Agreement**: Initiate a smart contract for the selected storage.
5. **File Upload and Encryption**: Upload files, which are encrypted before sending.
6. **Monitoring Storage Usage**: Track storage usage, encryption status, and contract status.
7. **Payment and Contract Renewal**: Make payments or renew/terminate the contract.

### File Transfer Process
- When storage is purchased by a consumer, the consumer sends the encrypted file to the provider, who then saves it locally.
- File transfer can be implemented using sockets from one machine to another, ensuring the process is simple and secure.

## Platform Overview
- **User Types**: Users can log in as either a consumer or provider using a MetaMask wallet.
- **Main Page (Consumer)**: Displays available storage rentals and lists purchased storages. Purchased storage includes options to upload and send files to the storage provider.
- **Main Page (Provider)**: Allows creating new storage listings for rent and displays sold rental information. Includes requests from consumers that need approval. Providers can download files sent by consumers, with active buttons for available downloads.

## Tech Stack
- **Frontend**: HTML, CSS, JavaScript (developed in VS Code)
- **Blockchain**: Solidity (for smart contracts), Ganache-CLI (for local blockchain)
- **Wallet Integration**: MetaMask
- **Smart Contract Development**: HardHat (testing and deployment), OpenZeppelin modules (for ERC-20 storage tokens)
- **Backend**: Node.js with Express (no databases)

## Running the Platform
1. **Step 1**: Deploy smart contracts on a local blockchain using Ganache-CLI.
2. **Step 2**: Run the server locally (e.g., `live-server public`).

