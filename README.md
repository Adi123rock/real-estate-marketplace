# Decentralized Real Estate Marketplace

A blockchain-based platform for listing, viewing, and purchasing real estate properties using cryptocurrency.

## Features

- List properties with details (name, location, price, etc.)
- Browse available properties in the marketplace
- Purchase properties with cryptocurrency
- View and manage your owned properties
- Update property details and sale status

## Technologies Used

- **Solidity** - Smart contract development
- **Truffle** - Development framework for Ethereum
- **Ganache** - Local Ethereum blockchain for testing
- **React** - Frontend framework
- **Web3.js** - Ethereum JavaScript API
- **MetaMask** - Cryptocurrency wallet and gateway

## Prerequisites

Before you begin, ensure you have the following installed:
- [Node.js](https://nodejs.org/) (v14.x or higher)
- [npm](https://www.npmjs.com/) (v6.x or higher)

## Installation Guide

### 1. Install Ganache

Ganache is a personal blockchain for Ethereum development that you can use to deploy contracts, develop applications, and run tests.

1. Download Ganache from [https://trufflesuite.com/ganache/](https://trufflesuite.com/ganache/)
2. Install and run Ganache
3. Create a new workspace (or use the default "Quickstart" workspace)
4. Make note of the RPC Server address (typically `http://127.0.0.1:7545`)

### 2. Install Truffle

Truffle is a development environment, testing framework, and asset pipeline for Ethereum.

```bash
npm install -g truffle
```

### 3. Set up MetaMask

MetaMask is a browser extension that allows you to interact with the Ethereum blockchain.

1. Install MetaMask extension for your browser from [https://metamask.io/download/](https://metamask.io/download/)
2. Set up a new MetaMask wallet (or import an existing one)
3. Connect MetaMask to your Ganache network:
   - Click on the network dropdown in MetaMask
   - Select "Add Network"
   - Enter the following details:
     - Network Name: `Ganache`
     - New RPC URL: `http://127.0.0.1:7545` (or whatever your Ganache RPC Server is)
     - Chain ID: `1337`
     - Currency Symbol: `ETH`
   - Click "Save"
4. Import an account from Ganache:
   - In Ganache, click on the key icon next to any account
   - Copy the private key
   - In MetaMask, click on your account icon > "Import Account"
   - Paste the private key and click "Import"

### 4. Clone and Set Up the Project

1. Clone the repository
```bash
git clone https://github.com/Adi123rock/real-estate-marketplace.git
cd real-estate-marketplace
```

2. Install dependencies for the main project
```bash
npm install
```

3. Install dependencies for the client
```bash
cd client
npm install
cd ..
```

### 5. Deploy Smart Contracts

1. Ensure Ganache is running
2. Deploy the contracts using Truffle
```bash
npm run truffle
```

### 6. Run the Application

1. Start the development server
```bash
npm run web
```

2. Open your browser and navigate to [http://localhost:3000](http://localhost:3000)
3. Ensure MetaMask is connected to your Ganache network and you have an imported account selected

## Usage

1. **Connect Wallet**: Click "Connect Wallet" to connect your MetaMask to the application
2. **List Property**: Fill out the property listing form with details and submit
3. **Browse Properties**: View available properties in the marketplace
4. **Buy Property**: Click "Buy" on a property listing and confirm the transaction in MetaMask
5. **Manage Properties**: View and manage your owned properties in the "My Properties" section

## Troubleshooting

- **MetaMask not connecting**: Ensure you're connected to the correct network in MetaMask
- **Transactions failing**: Check if you have sufficient ETH in your MetaMask account
- **Contract not found**: Verify that your contracts were deployed successfully with `truffle migrate --reset`
- **Images not loading**: Ensure you're using valid image URLs or IPFS links

## Development Notes

- Smart contracts are located in the `contracts` directory
- Migrations are in the `migrations` directory
- Tests are in the `test` directory
- Frontend code is in the `client/src` directory

## Team Details

- **ADITYA (230005003)**
- **ASHISH (230008011)**
- **HIMANSHU (230002029)**
- **SRIKANTH (230001018)** 
- **JOTHIRMAI (230003032)**
- **HRUDAY (230001051)**