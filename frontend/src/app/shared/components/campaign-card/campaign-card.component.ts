import { Component, Input, OnInit, OnDestroy, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { formatEther } from 'ethers';
import { Campaign } from '../../../core/models/campaign.interface';

@Component({
  selector: 'app-campaign-card',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './campaign-card.component.html',
  styleUrls: ['./campaign-card.component.css'],
})
export class CampaignCardComponent implements OnInit, OnDestroy {
  @Input({ required: true }) campaign!: Campaign;

  now = signal(Date.now());
  private timer: any;

  // Computed values
  formattedGoal = computed(() => formatEther(this.campaign.goal));
  formattedRaised = computed(() => formatEther(this.campaign.raisedAmount));

  progress = computed(() => {
    const goal = Number(this.campaign.goal);
    const raised = Number(this.campaign.raisedAmount);
    return goal > 0 ? (raised / goal) * 100 : 0;
  });

  isExpired = computed(() => {
    return this.now() > Number(this.campaign.deadline) * 1000;
  });

  timeLeft = computed(() => {
    const deadlineMs = Number(this.campaign.deadline) * 1000;
    const diff = Math.max(0, deadlineMs - this.now());
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    return { days, hours };
  });

  ngOnInit() {
    this.timer = setInterval(() => {
      this.now.set(Date.now());
    }, 1000); // Internal timer likely fine even if not zone-optimized for this simple UI
  }

  ngOnDestroy() {
    if (this.timer) clearInterval(this.timer);
  }

  get truncatedAddress() {
    return `${this.campaign.address.slice(0, 10)}...${this.campaign.address.slice(-4)}`;
  }
}
