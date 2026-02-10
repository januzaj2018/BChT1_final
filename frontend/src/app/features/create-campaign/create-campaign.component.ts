import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Web3Service } from '../../core/services/web3.service';

@Component({
  selector: 'app-create-campaign',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './create-campaign.component.html',
  styleUrls: ['./create-campaign.component.css'],
})
export class CreateCampaignComponent {
  web3Service = inject(Web3Service);
  router = inject(Router);

  title = '';
  description = '';
  goal = '';
  duration = '30';
  loading = signal(false);

  async onSubmit() {
    if (!this.web3Service.account()) {
      alert('Please connect your wallet first');
      return;
    }

    this.loading.set(true);
    try {
      await this.web3Service.createCampaign(this.goal, this.duration, this.title, this.description);
      this.router.navigate(['/']);
    } catch (error: any) {
      console.error('Creation failed', error);
      alert('Failed: ' + (error.reason || error.message));
    } finally {
      this.loading.set(false);
    }
  }
}
