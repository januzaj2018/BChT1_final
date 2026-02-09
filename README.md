# GreenPulse - Decentralized Eco-Crowdfunding

GreenPulse is a decentralized crowdfunding platform built on Ethereum that allows users to create and fund local environmental projects. Contributors receive **LEAF** tokens as rewards for their "Green Impact".

## 1. Architecture Overview

The system is built as a **Decentralized Application (DApp)** with three main layers:

- **Blockchain Layer (Smart Contracts)**: Handles logic, data storage, and value transfer (ETH & Tokens).
- **Application Layer (Frontend)**: React-based UI that interacts with the blockchain via ethers.js.
- **Wallet Layer (MetaMask)**: Manages user keys and signs transactions.

### Key Components

- **Factory Pattern**: `CampaignFactory` creates new instances of `Campaign` contracts. This ensures all campaigns are standard and secure.
- **Reward System**: A central `GreenToken` (ERC20) is minted by the Factory when users contribute to campaigns.
- **Web3Context**: A React Context provider that manages the connection to MetaMask, contract instances, and ensures the user is on the correct network.

---

## 2. Design & Implementation Decisions

- **Factory Pattern**: Used to easily track all deployed campaigns and ensure they are all "verified" builds. It also serves as the single "owner" of the Reward Token, centralizing minting authority.
- **State Management**: React `Context API` was chosen over Redux for simplicity in managing global Web3 state (account, provider, network).
- **Styling**: `TailwindCSS` allows for rapid UI development with a consistent, modern "Eco-friendly" aesthetic.
- **Network Handling**: The app strictly checks chain IDs to differentiate between Localhost (dev) and Sepolia (testnet), preventing mainnet accidents.

---

## 3. Smart Contract Logic

- **CampaignFactory (`contracts/CampaignFactory.sol`)**:

  - Deploys `GreenToken` in constructor.
  - `createCampaign`: Deploys a new `Campaign` contract and registers it.
  - `mintReward`: Validates that the caller is a registered Campaign, then mints LEAF tokens to the contributor.

- **Campaign (`contracts/Campaign.sol`)**:

  - `contribute`: Accepts ETH, updates balances, and calls `Factory.mintReward` to send 100 LEAF per 1 ETH to sending user.
  - `withdraw`: Allows creator to take funds ONLY if `goal` is reached.
  - `refund`: Allows contributors to get money back if `deadline` passed and `goal` NOT reached.

- **GreenToken (`contracts/GreenToken.sol`)**:
  - Standard ERC20 Token.
  - Minting restricted to `onlyOwner` (The Factory contract).

---

## 4. Frontend-Blockchain Interaction

1.  **Connection**: The app uses `window.ethereum` to request accounts from MetaMask.
2.  **Provider**: `ethers.BrowserProvider` wraps the MetaMask connection to send read/write requests.
3.  **Reading Data**: `getSummary()` simply reads data from the blockchain without gas fees.
4.  **Writing Data**: Functions like `contribute()` trigger a MetaMask popup requiring user signature and gas fee payment.
5.  **Event Listening**: The app listens for `accountsChanged` and `chainChanged` events to auto-reload or update UI.

---

## 5. Deployment Instructions

### Prerequisites

- Node.js & npm
- MetaMask Browser Extension

### Step 1: Start Local Blockchain

Open a terminal in the root folder:

```bash
npx hardhat node
```

- **IMPORTANT**: Keep this terminal open!
- Copy one of the "Private Keys" listed (e.g., Account #0).

### Step 2: Deploy Contracts

Open a **new** terminal:

```bash
npx hardhat run scripts/deploy.cjs --network localhost
```

- Copy the address labeled `CampaignFactory deployed to:`.

### Step 3: Configure Frontend

- Open `frontend/src/context/Web3Context.jsx`.
- Replace the `factoryAddress` string with your new address.

### Step 4: Run Frontend

```bash
cd frontend
npm install
npm run dev
```

---

## 6. Obtaining Test ETH

Do **NOT** use real money.

### Option A: Localhost (Recommended)

When running `npx hardhat node`, Hardhat automatically gives you 20 accounts with 10,000 Test ETH each.

1.  Open MetaMask.
2.  Add Network -> "Add a network manually":
    - **Name**: Localhost 8545
    - **RPC URL**: `http://127.0.0.1:8545`
    - **Chain ID**: `31337` (or `1337`)
    - **Currency Symbol**: ETH
3.  Import Account -> Paste the Private Key you copied in Step 1.

### Option B: Sepolia Testnet

If deploying to public testnet:

1.  Switch MetaMask to "Sepolia".
2.  Go to [Google Cloud Web3 Faucet](https://cloud.google.com/application/web3/faucet/ethereum/sepolia) or [Alchemy Faucet](https://www.alchemy.com/faucets/ethereum-sepolia).
3.  Enter your address and request funds.
