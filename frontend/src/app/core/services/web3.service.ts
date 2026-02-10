import { Injectable, signal, WritableSignal } from '@angular/core';
import { ethers, BrowserProvider, Contract, formatEther, parseEther } from 'ethers';
import CampaignFactoryArtifact from '../../../assets/artifacts/contracts/CampaignFactory.sol/CampaignFactory.json';
import CampaignArtifact from '../../../assets/artifacts/contracts/Campaign.sol/Campaign.json';
import GreenTokenArtifact from '../../../assets/artifacts/contracts/GreenToken.sol/GreenToken.json';

@Injectable({
  providedIn: 'root',
})
export class Web3Service {
  public account: WritableSignal<string | null> = signal(null);
  public provider: WritableSignal<BrowserProvider | null> = signal(null);
  public factoryContract: WritableSignal<Contract | null> = signal(null);
  public chainId: WritableSignal<string | null> = signal(null);
  public ethBalance: WritableSignal<string> = signal('0');
  public tokenBalance: WritableSignal<string> = signal('0');

  private factoryAddress = '0x5FbDB2315678afecb367f032d93F642f64180aa3';
  public CampaignArtifact = CampaignArtifact;

  constructor() {
    this.initReadOnly();
    this.checkIfWalletIsConnected();
    this.setupEventListeners();
  }

  private async initReadOnly() {
    if (typeof window !== 'undefined' && (window as any).ethereum) {
      try {
        const provider = new ethers.BrowserProvider((window as any).ethereum);
        this.provider.set(provider);
        const factory = new ethers.Contract(
          this.factoryAddress,
          CampaignFactoryArtifact.abi,
          provider
        );
        this.factoryContract.set(factory);
      } catch (e) {
        console.error('Read-only init failed', e);
      }
    }
  }

  private setupEventListeners() {
    if (typeof window !== 'undefined' && (window as any).ethereum) {
      (window as any).ethereum.on('accountsChanged', (accounts: string[]) => {
        if (accounts.length > 0) {
          this.account.set(accounts[0]);
          window.location.reload();
        } else {
          this.account.set(null);
          this.factoryContract.set(null);
        }
      });
      (window as any).ethereum.on('chainChanged', () => window.location.reload());
    }
  }

  async connectWallet() {
    if (typeof window === 'undefined' || !(window as any).ethereum) {
      alert('Please install MetaMask!');
      return;
    }
    try {
      const provider = new ethers.BrowserProvider((window as any).ethereum);
      await provider.send('eth_requestAccounts', []);
      const signer = await provider.getSigner();
      const address = await signer.getAddress();
      await this.handleAccounts(address, provider, signer);
    } catch (error) {
      console.error('Connection failed', error);
    }
  }

  private async checkIfWalletIsConnected() {
    if (typeof window === 'undefined' || !(window as any).ethereum) return;
    try {
      const provider = new ethers.BrowserProvider((window as any).ethereum);
      const accounts = await provider.send('eth_accounts', []);
      if (accounts.length > 0) {
        const signer = await provider.getSigner();
        const address = await signer.getAddress();
        await this.handleAccounts(address, provider, signer);
      }
    } catch (e) {
      console.error('Auto-connect failed', e);
    }
  }

  private async handleAccounts(account: string, provider: BrowserProvider, signer: any) {
    this.account.set(account);
    this.provider.set(provider);

    const network = await provider.getNetwork();
    this.chainId.set(network.chainId.toString());

    const factory = new ethers.Contract(this.factoryAddress, CampaignFactoryArtifact.abi, signer);
    this.factoryContract.set(factory);

    await this.fetchBalances(provider, account, factory);
  }

  private async fetchBalances(provider: BrowserProvider, account: string, factory: Contract) {
    const balance = await provider.getBalance(account);
    this.ethBalance.set(formatEther(balance));

    try {
      const tokenAddress = await factory['token']();
      if (tokenAddress && tokenAddress !== ethers.ZeroAddress) {
        const tokenContract = new ethers.Contract(tokenAddress, GreenTokenArtifact.abi, provider);
        const tBalance = await tokenContract['balanceOf'](account);
        this.tokenBalance.set(formatEther(tBalance));
      }
    } catch (e) {
      console.error('Error fetching token balance', e);
    }
  }

  async getCampaigns(): Promise<any[]> {
    const factory = this.factoryContract();
    const provider = this.provider();
    if (!factory || !provider) return [];

    try {
      const addresses = await factory['getDeployedCampaigns']();
      const campaigns = await Promise.all(
        addresses.map(async (addr: string) => {
          const campaign = new ethers.Contract(addr, CampaignArtifact.abi, provider);
          const summary = await campaign['getSummary']();
          return {
            address: addr,
            creator: summary[0],
            goal: summary[1],
            raisedAmount: summary[2],
            deadline: summary[3],
            balance: summary[4],
            title: summary[5],
            description: summary[6],
          };
        })
      );
      return campaigns;
    } catch (e) {
      console.error('Error fetching campaigns', e);
      return [];
    }
  }

  async createCampaign(
    goal: string,
    durationInDays: string,
    title: string,
    description: string
  ): Promise<void> {
    const factory = this.factoryContract();
    if (!factory) throw new Error('Factory contract not loaded');

    const goalInWei = parseEther(goal.toString());
    const durationInSeconds = Number(durationInDays) * 24 * 60 * 60;

    const tx = await factory['createCampaign'](goalInWei, durationInSeconds, title, description);
    await tx.wait();
  }

  async getCampaignDetails(address: string): Promise<{ summary: any; comments: any[] } | null> {
    const provider = this.provider();
    if (!provider) return null;

    try {
      const contract = new ethers.Contract(address, CampaignArtifact.abi, provider);
      const summary = await contract['getSummary']();
      const comments = await contract['getComments']();

      return {
        summary: {
          address,
          creator: summary[0],
          goal: summary[1],
          raisedAmount: summary[2],
          deadline: summary[3],
          balance: summary[4],
          title: summary[5],
          description: summary[6],
        },
        comments,
      };
    } catch (e) {
      console.error('Error fetching campaign details', e);
      return null;
    }
  }

  async contribute(address: string, amount: string): Promise<void> {
    const provider = this.provider();
    if (!provider) throw new Error('Wallet not connected');

    const signer = await provider.getSigner();
    const contract = new ethers.Contract(address, CampaignArtifact.abi, signer);

    const tx = await contract['contribute']({
      value: parseEther(amount.toString()),
    });
    await tx.wait();
  }

  async endCampaign(address: string): Promise<void> {
    const provider = this.provider();
    if (!provider) throw new Error('Wallet not connected');

    const signer = await provider.getSigner();
    const contract = new ethers.Contract(address, CampaignArtifact.abi, signer);

    const tx = await contract['endCampaign']();
    await tx.wait();
  }

  async addComment(address: string, text: string): Promise<void> {
    const provider = this.provider();
    if (!provider) throw new Error('Wallet not connected');

    const signer = await provider.getSigner();
    const contract = new ethers.Contract(address, CampaignArtifact.abi, signer);

    const tx = await contract['addComment'](text);
    await tx.wait();
  }
}
