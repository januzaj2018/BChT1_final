# GreenPulse - Decentralized Eco-Crowdfunding

GreenPulse is a decentralized crowdfunding platform built on Ethereum that allows users to create and fund local environmental projects. Contributors receive **LEAF** tokens as rewards for their "Green Impact".

## 1. Architecture Overview

The system is built as a **Decentralized Application (DApp)** with three main layers:

- **Blockchain Layer (Smart Contracts)**: Handles logic, data storage, and value transfer (ETH & Tokens).
- **Application Layer (Frontend)**: **Angular-based** UI that interacts with the blockchain via `ethers.js` and managed through **Angular Signals**.
- **Wallet Layer (MetaMask)**: Manages user keys and signs transactions.

### Key Components

- **Factory Pattern**: `CampaignFactory` creates new instances of `Campaign` contracts. This ensures all campaigns are standard and secure.
- **Reward System**: A central `GreenToken` (ERC20) is minted by the Factory when users contribute to campaigns.
- **Web3Service**: A centralized Angular service that manages the connection to MetaMask, contract instances, and real-time state using **Angular Signals**.

---

## 2. Design & Implementation Decisions

- **Framework**: Migrated from React to **Angular** for better modularity and built-in state management (Signals).
- **Styling**: Integrated **Material Tailwind** with TailwindCSS for a premium, responsive "Eco-friendly" aesthetic.
- **State Management**: **Angular Signals** provide fine-grained reactivity, making the UI extremely responsive to blockchain state changes.
- **Gas Optimization**: Smart contracts use optimized patterns (e.g., `external view` for summaries, `O(1)` mapping lookups) to minimize user costs.
- **Deployment Strategy**: Hardhat is configured to output artifacts directly into the Angular assets folder for seamless integration.

---

## 3. Smart Contract Logic

- **CampaignFactory (`contracts/CampaignFactory.sol`)**:

  - Deploys `GreenToken` in constructor.
  - `createCampaign`: Deploys a new `Campaign` contract with metadata (title, description).
  - `mintReward`: Validates that the caller is a registered Campaign before minting LEAF tokens.

- **Campaign (`contracts/Campaign.sol`)**:
  - `contribute`: Accepts ETH, mints **100 LEAF per 1 ETH**, and auto-closes if the goal is reached.
  - `withdraw`: Creator can claim funds ONLY if the goal is met.
  - `refund`: Enables contributors to reclaim ETH if the campaign fails after the deadline.

---

## 4. Testing & Gas Reporting

The project includes a comprehensive test suite for the full campaign lifecycle.

- **Run Tests**:
  ```bash
  npx hardhat test test/FullCampaign.test.cjs
  ```
- **Gas Report**: A `gas-report.txt` is automatically generated after running tests, documenting the cost of every function call in researchers' USD estimates.

---

## 5. Deployment Instructions

### Prerequisites

- Node.js (v18+) & npm
- MetaMask Browser Extension

### Step 1: Start Local Blockchain

```bash
npx hardhat node
```

_Keep this terminal open._

### Step 2: Deploy Contracts

```bash
npx hardhat run scripts/deploy.cjs --network localhost
```

_Note the `CampaignFactory` address provided in the output._

### Step 3: Run Frontend

```bash
cd frontend
npm install
npx ng serve
```

_Open `http://localhost:4200` in your browser._

---

## 6. Development Tools

- **Workflow Verification**: CI/CD pipeline configured via `.github/workflows/ci.yml`.
- **Prettier**: Consistent formatting across Solidity and TypeScript files.
- **Gas Optimization**: Verified via `hardhat-gas-reporter`.
