import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { Web3Service } from '../../../core/services/web3.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css'],
})
export class NavbarComponent {
  web3Service = inject(Web3Service);

  account = this.web3Service.account;

  connect() {
    this.web3Service.connectWallet();
  }

  shortenAddress(address: string | null): string {
    if (!address) return ''; // Safely handle null
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  }
}
