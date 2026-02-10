import { Component, inject, computed } from '@angular/core';
import { CommonModule, DecimalPipe } from '@angular/common';
import { Web3Service } from '../../core/services/web3.service';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, DecimalPipe],
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css'],
})
export class ProfileComponent {
  web3Service = inject(Web3Service);

  networkName = computed(() => {
    const chainId = this.web3Service.chainId();
    switch (Number(chainId)) {
      case 31337:
      case 1337:
        return 'Localhost';
      case 11155111:
        return 'Sepolia';
      case 1:
        return 'Mainnet';
      default:
        return 'Unknown Network';
    }
  });

  isConnected = computed(() => !!this.web3Service.account());
}
