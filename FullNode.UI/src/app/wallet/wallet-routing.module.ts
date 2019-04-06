import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { WalletComponent }   from './wallet.component';
import { HistoryComponent } from './history/history.component';
import { AnalyticsComponent } from './analytics/analytics.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { ColdStakingOverviewComponent } from './cold-staking/components/overview/overview.component';
import { AdvancedComponent } from './advanced/advanced.component';
import { SmartContractsComponent } from './smart-contracts/components/smart-contracts.component';
import { AddressBookComponent } from './address-book/address-book.component';
import { ExtPubkeyComponent } from './advanced/components/ext-pubkey/ext-pubkey.component';
import { AboutComponent } from './advanced/components/about/about.component';
import { GenerateAddressesComponent } from './advanced/components/generate-addresses/generate-addresses.component';
import { ResyncComponent } from './advanced/components/resync/resync.component';
import { LineChartComponent } from './analytics/charts/line-chart/line-chart.component';
import { DoughnutChartComponent } from './analytics/charts/doughnut-chart/doughnut-chart.component';
import { RadarChartComponent } from './analytics/charts/radar-chart/radar-chart.component';
import { PieChartComponent } from './analytics/charts/pie-chart/pie-chart.component';

const routes: Routes = [
  { path: 'wallet', component: WalletComponent, children: [
    { path: '', redirectTo: 'dashboard', pathMatch: 'full'},
    { path: 'dashboard', component: DashboardComponent},
    { path: 'history', component: HistoryComponent},
    { path: 'analytics', component:AnalyticsComponent, 
      children: [
        { path: '', redirectTo: 'bar-chart', pathMatch: 'full'},
        { path: 'bar-chart', component: LineChartComponent},
        { path: 'doughnut-chart', component: DoughnutChartComponent},
        { path: 'radar-chart', component: RadarChartComponent},
        { path: 'pie-chart', component: PieChartComponent},
      ]
    },
    { path: 'staking', component: ColdStakingOverviewComponent },
    { path: 'advanced', component: AdvancedComponent,
      children: [
        { path: '', redirectTo: 'about', pathMatch: 'full'},
        { path: 'about', component: AboutComponent},
        { path: 'extpubkey', component: ExtPubkeyComponent},
        { path: 'generate-addresses', component: GenerateAddressesComponent},
        { path: 'resync', component: ResyncComponent}
      ]
    },
    { path: 'smart-contracts', component: SmartContractsComponent },
    { path: 'address-book', component: AddressBookComponent }
  ]},
];

@NgModule({
  imports: [ RouterModule.forChild(routes) ],
  exports: [ RouterModule ]
})

export class WalletRoutingModule {}
