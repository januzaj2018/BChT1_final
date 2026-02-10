import { Routes } from '@angular/router';
import { HomeComponent } from './features/home/home.component';
import { CreateCampaignComponent } from './features/create-campaign/create-campaign.component';
import { CampaignDetailsComponent } from './features/campaign-details/campaign-details.component';
import { ProfileComponent } from './features/profile/profile.component';

export const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'create', component: CreateCampaignComponent },
  { path: 'campaign/:address', component: CampaignDetailsComponent },
  { path: 'profile', component: ProfileComponent },
  { path: '**', redirectTo: '' },
];
