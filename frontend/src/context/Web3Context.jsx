import React, { createContext, useState, useEffect, useCallback } from "react";
import { ethers } from "ethers";
import CampaignFactoryArtifact from "../artifacts/contracts/CampaignFactory.sol/CampaignFactory.json";
import CampaignArtifact from "../artifacts/contracts/Campaign.sol/Campaign.json";
import GreenTokenArtifact from "../artifacts/contracts/GreenToken.sol/GreenToken.json";

export const Web3Context = createContext();

export const Web3Provider = ({ children }) => {
  const [account, setAccount] = useState(null);
  const [provider, setProvider] = useState(null);
  const [factoryContract, setFactoryContract] = useState(null);
  const [chainId, setChainId] = useState(null);
  const [ethBalance, setEthBalance] = useState("0");
  const [tokenBalance, setTokenBalance] = useState("0");
  const [networkName, setNetworkName] = useState("");

  const factoryAddress = "0x5FbDB2315678afecb367f032d93F642f64180aa3"; // Updated address

  const initContracts = useCallback(
    async (_provider, signer) => {
      try {
        if (
          !factoryAddress ||
          factoryAddress === "0x0000000000000000000000000000000000000000"
        )
          return;

        const _factory = new ethers.Contract(
          factoryAddress,
          CampaignFactoryArtifact.abi,
          signer || _provider,
        );
        setFactoryContract(_factory);
        console.log("GreenPulse: Factory initialized at", factoryAddress);
      } catch (error) {
        console.error("GreenPulse: Contract init error", error);
      }
    },
    [factoryAddress],
  );

  const getNetworkName = (chainId) => {
    switch (Number(chainId)) {
      case 31337:
      case 1337:
        return "Localhost";
      case 11155111:
        return "Sepolia";
      case 1:
        return "Mainnet";
      default:
        return "Unknown Network";
    }
  };

  const fetchBalances = useCallback(async (_provider, _account, _factory) => {
    if (!_provider || !_account) return;
    try {
      // ETH Balance
      const balance = await _provider.getBalance(_account);
      setEthBalance(ethers.formatEther(balance));

      // Token Balance
      if (_factory) {
        const tokenAddress = await _factory.token();
        const tokenContract = new ethers.Contract(
          tokenAddress,
          GreenTokenArtifact.abi,
          _provider,
        );
        const tBalance = await tokenContract.balanceOf(_account);
        setTokenBalance(ethers.formatEther(tBalance));
      }
    } catch (err) {
      console.error("Error fetching balances:", err);
    }
  }, []);

  const connectWallet = async () => {
    console.log("GreenPulse: Connecting...");
    try {
      if (!window.ethereum) {
        alert("MetaMask not detected! Please install the extension.");
        return;
      }

      const _provider = new ethers.BrowserProvider(window.ethereum);
      const accounts = await window.ethereum.request({
        method: "eth_requestAccounts",
      });

      const signer = await _provider.getSigner();
      const address = await signer.getAddress();
      const network = await _provider.getNetwork();

      setAccount(address);
      setProvider(_provider);
      setChainId(network.chainId);
      setNetworkName(getNetworkName(network.chainId));

      await initContracts(_provider, signer);

      // Delay slightly to ensure factory contract is set in state if we were optimizing,
      // but here we can just create a temp instance or rely on the effect.
      // Better: pass the factory instance directly if possible, or wait for next render.
      // For now, let's just fetch ETH balance immediately.
      const balance = await _provider.getBalance(address);
      setEthBalance(ethers.formatEther(balance));

      // We will let the useEffect dependency on factoryContract trigger token balance fetch
      console.log(
        "GreenPulse: Connected as",
        address,
        "on chain",
        network.chainId.toString(),
      );
    } catch (error) {
      console.error("GreenPulse: Connection failed", error);
      alert("Metamask connection failed: " + (error.reason || error.message));
    }
  };

  const checkIfWalletIsConnected = useCallback(async () => {
    if (!window.ethereum) return;
    try {
      const accounts = await window.ethereum.request({
        method: "eth_accounts",
      });
      if (accounts.length > 0) {
        const _provider = new ethers.BrowserProvider(window.ethereum);
        const signer = await _provider.getSigner();
        const address = await signer.getAddress();
        const network = await _provider.getNetwork();

        setAccount(address);
        setProvider(_provider);
        setChainId(network.chainId);
        setNetworkName(getNetworkName(network.chainId));
        await initContracts(_provider, signer);
      }
    } catch (error) {
      console.error("GreenPulse: Auto-connect error", error);
    }
  }, [initContracts]);

  useEffect(() => {
    checkIfWalletIsConnected();
  }, [checkIfWalletIsConnected]);

  useEffect(() => {
    if (account && provider && factoryContract) {
      fetchBalances(provider, account, factoryContract);
    }
  }, [account, provider, factoryContract, fetchBalances]);

  useEffect(() => {
    if (window.ethereum) {
      const handleAccountsChanged = (accounts) => {
        if (accounts.length > 0) {
          setAccount(accounts[0]);
          window.location.reload();
        } else {
          setAccount(null);
          setFactoryContract(null);
        }
      };

      const handleChainChanged = () => {
        window.location.reload();
      };

      window.ethereum.on("accountsChanged", handleAccountsChanged);
      window.ethereum.on("chainChanged", handleChainChanged);

      return () => {
        window.ethereum.removeListener(
          "accountsChanged",
          handleAccountsChanged,
        );
        window.ethereum.removeListener("chainChanged", handleChainChanged);
      };
    }
  }, [checkIfWalletIsConnected]);

  return (
    <Web3Context.Provider
      value={{
        account,
        connectWallet,
        factoryContract,
        provider,
        chainId,
        networkName,
        ethBalance,
        tokenBalance,
        CampaignArtifact,
        GreenTokenArtifact,
      }}
    >
      {children}
    </Web3Context.Provider>
  );
};
