import { Component, inject, OnInit, signal, computed } from '@angular/core';
import { CommonModule, DecimalPipe, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { Web3Service } from '../../core/services/web3.service';
import { formatEther } from 'ethers';

@Component({
  selector: 'app-campaign-details',
  standalone: true,
  imports: [CommonModule, FormsModule, DecimalPipe, DatePipe],
  templateUrl: './campaign-details.component.html',
  styleUrls: ['./campaign-details.component.css'],
})
export class CampaignDetailsComponent implements OnInit {
  route = inject(ActivatedRoute);
  web3Service = inject(Web3Service);

  campaignData = signal<any>(null);
  comments = signal<any[]>([]);

  amount = '';
  commentText = '';

  loading = signal(false);
  contributeLoading = signal(false);
  endLoading = signal(false);
  commentLoading = signal(false);

  now = signal(Date.now());

  progress = computed(() => {
    const data = this.campaignData();
    if (!data) return 0;
    const goal = Number(data.goal);
    const raised = Number(data.raisedAmount);
    return goal > 0 ? (raised / goal) * 100 : 0;
  });

  formattedGoal = computed(() => {
    const data = this.campaignData();
    return data ? formatEther(data.goal) : '0';
  });

  formattedRaised = computed(() => {
    const data = this.campaignData();
    return data ? formatEther(data.raisedAmount) : '0';
  });

  isExpired = computed(() => {
    const data = this.campaignData();
    if (!data) return false;
    return this.now() > Number(data.deadline) * 1000;
  });

  timeLeft = computed(() => {
    const data = this.campaignData();
    if (!data) return { days: 0, hours: 0 };
    const deadlineMs = Number(data.deadline) * 1000;
    const diff = Math.max(0, deadlineMs - this.now());
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    return { days, hours };
  });

  isCreator = computed(() => {
    const data = this.campaignData();
    const account = this.web3Service.account();
    if (!data || !account) return false;
    return data.creator.toLowerCase() === account.toLowerCase();
  });

  constructor() {
    setInterval(() => this.now.set(Date.now()), 1000);
  }

  async ngOnInit() {
    this.route.params.subscribe((params) => {
      const address = params['address'];
      if (address) {
        this.loadData(address);
      }
    });
  }

  async loadData(address: string) {
    this.loading.set(true);
    const data = await this.web3Service.getCampaignDetails(address);
    if (data) {
      this.campaignData.set(data.summary);
      this.comments.set(data.comments);
    }
    this.loading.set(false);
  }

  async handleContribute() {
    if (!this.web3Service.account()) return alert('Connect wallet first');
    if (!this.amount || isNaN(Number(this.amount))) return alert('Enter valid amount');

    this.contributeLoading.set(true);
    try {
      await this.web3Service.contribute(this.campaignData().address, this.amount);
      alert('Contribution successful');
      this.amount = '';
      this.loadData(this.campaignData().address);
    } catch (e: any) {
      console.error(e);
      alert('Failed: ' + (e.reason || e.message));
    } finally {
      this.contributeLoading.set(false);
    }
  }

  async handleEndCampaign() {
    if (!confirm('Are you sure you want to end this campaign?')) return;
    this.endLoading.set(true);
    try {
      await this.web3Service.endCampaign(this.campaignData().address);
      alert('Campaign ended');
      this.loadData(this.campaignData().address);
    } catch (e: any) {
      console.error(e);
      alert('Failed: ' + (e.reason || e.message));
    } finally {
      this.endLoading.set(false);
    }
  }

  async handlePostComment() {
    if (!this.web3Service.account()) return alert('Connect wallet first');
    if (!this.commentText.trim()) return;

    this.commentLoading.set(true);
    try {
      await this.web3Service.addComment(this.campaignData().address, this.commentText);
      this.commentText = '';
      this.loadData(this.campaignData().address);
    } catch (e: any) {
      console.error(e);
      alert('Failed: ' + (e.reason || e.message));
    } finally {
      this.commentLoading.set(false);
    }
  }
}
