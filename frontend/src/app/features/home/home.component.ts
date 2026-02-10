import { Component, inject, OnInit, signal, computed, WritableSignal } from '@angular/core';
import { CommonModule, DecimalPipe } from '@angular/common';
import { Web3Service } from '../../core/services/web3.service';
import { Campaign } from '../../core/models/campaign.interface';
import { CampaignCardComponent } from '../../shared/components/campaign-card/campaign-card.component';
import { formatEther } from 'ethers';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, CampaignCardComponent, DecimalPipe],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css'],
})
export class HomeComponent implements OnInit {
  web3Service = inject(Web3Service);

  campaigns: WritableSignal<Campaign[]> = signal([]);
  loading = signal(false);
  filter = signal<'all' | 'active' | 'ended'>('all');

  now = signal(Date.now());

  filteredCampaigns = computed(() => {
    const filter = this.filter();
    const now = this.now();
    return this.campaigns().filter((campaign) => {
      const isExpired = now > Number(campaign.deadline) * 1000;
      if (filter === 'active') return !isExpired;
      if (filter === 'ended') return isExpired;
      return true;
    });
  });

  totalRaised = computed(() => {
    return this.campaigns().reduce((sum, c) => sum + Number(formatEther(c.raisedAmount)), 0);
  });

  activeCount = computed(() => {
    const now = this.now();
    return this.campaigns().filter((c) => now <= Number(c.deadline) * 1000).length;
  });

  ngOnInit() {
    this.refreshData();
    // Update time for filtering
    setInterval(() => {
      this.now.set(Date.now());
    }, 1000);
  }

  async refreshData() {
    this.loading.set(true);
    const data = await this.web3Service.getCampaigns();
    this.campaigns.set(data);
    this.loading.set(false);
  }

  setFilter(f: 'all' | 'active' | 'ended') {
    this.filter.set(f);
  }
}
