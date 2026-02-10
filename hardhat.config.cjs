require("@nomicfoundation/hardhat-toolbox");

/** @type import('hardhat/config').HardhatUserConfig */
// hardhat.config.cjs
module.exports = {
  solidity: {
    version: "0.8.28", // Stable version for Windows
    settings: {
      optimizer: {
        enabled: true,
        runs: 200,
      },
      evmVersion: "paris", // Bypasses PUSH0 opcode tracing bugs
    },
  },
  networks: {
    hardhat: {
      chainId: 1337,
    },
    localhost: {
      url: "http://127.0.0.1:8545",
      chainId: 1337,
    },
  },
  paths: {
    artifacts: "./frontend/src/assets/artifacts",
  },
};
