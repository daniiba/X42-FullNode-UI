import { NgModule } from '@angular/core';
import { SharedModule } from '../shared/shared.module';
import { WalletRoutingModule } from './wallet-routing.module';
import { ColdStakingModule } from './cold-staking/cold-staking.module';
import { SmartContractsModule } from './smart-contracts/smart-contracts.module';

import { WalletComponent } from './wallet.component';
import { MenuComponent } from './menu/menu.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { HistoryComponent } from './history/history.component';
import { StatusBarComponent } from './status-bar/status-bar.component';
import { AdvancedComponent } from './advanced/advanced.component';
import { AddressBookComponent } from './address-book/address-book.component';
import { AddNewAddressComponent } from './address-book/modals/add-new-address/add-new-address.component';
import { ExtPubkeyComponent } from './advanced/components/ext-pubkey/ext-pubkey.component';
import { AboutComponent } from './advanced/components/about/about.component';
import { GenerateAddressesComponent } from './advanced/components/generate-addresses/generate-addresses.component';
import { ResyncComponent } from './advanced/components/resync/resync.component';
import { SendComponent } from './send/send.component';
import { ReceiveComponent } from './receive/receive.component';
import { SendConfirmationComponent } from './send/send-confirmation/send-confirmation.component';
import { TransactionDetailsComponent } from './transaction-details/transaction-details.component';
import { LogoutConfirmationComponent } from './logout-confirmation/logout-confirmation.component';
import { BsDatepickerModule } from 'ngx-bootstrap';
import { AnalyticsComponent } from './analytics/analytics.component';
import { ChartsModule } from 'ng2-charts';
import { LineChartComponent } from './analytics/charts/line-chart/line-chart.component';
import { PortfolioComponent } from './analytics/charts/portfolio/portfolio.component';
import { PricesComponent } from './analytics/charts/prices/prices.component';
import { PieChartComponent } from './analytics/charts/pie-chart/pie-chart.component';
import {ChartModule} from 'primeng/chart';

@NgModule({
  imports: [
    SharedModule,
    ChartModule,
    WalletRoutingModule,
    ColdStakingModule,
    SmartContractsModule,
    BsDatepickerModule.forRoot(),
    ChartsModule
  ],
  declarations: [
    WalletComponent,
    MenuComponent,
    DashboardComponent,
    SendComponent,
    ReceiveComponent,
    SendConfirmationComponent,
    TransactionDetailsComponent,
    LogoutConfirmationComponent,
    HistoryComponent,
    StatusBarComponent,
    AdvancedComponent,
    AddressBookComponent,
    AddNewAddressComponent,
    ExtPubkeyComponent,
    AboutComponent,
    GenerateAddressesComponent,
    ResyncComponent,
    AnalyticsComponent,
    LineChartComponent,
    PortfolioComponent,
    PricesComponent,
    PieChartComponent
  ],
  entryComponents: [
    SendComponent,
    SendConfirmationComponent,
    ReceiveComponent,
    TransactionDetailsComponent,
    LogoutConfirmationComponent
  ]
})

export class WalletModule { }
