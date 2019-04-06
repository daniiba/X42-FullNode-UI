import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AnalyticsComponent } from './analytics.component';
import { LineChartComponent } from './charts/line-chart/line-chart.component';
import { DoughnutChartComponent } from './charts/doughnut-chart/doughnut-chart.component';
import { RadarChartComponent } from './charts/radar-chart/radar-chart.component';
import { PieChartComponent } from './charts/pie-chart/pie-chart.component';

const routes: Routes = [
 
    { path: 'analytics', component:AnalyticsComponent, 
      children: [
        { path: '', redirectTo: 'bar-chart', pathMatch: 'full'},
        { path: '**', redirectTo: 'bar-chart', pathMatch: 'full'},
        { path: 'bar-chart', component: LineChartComponent},
        { path: 'doughnut-chart', component: DoughnutChartComponent},
        { path: 'radar-chart', component: RadarChartComponent},
        { path: 'pie-chart', component: PieChartComponent},
      ]
    }
];

@NgModule({
  imports: [ RouterModule.forChild(routes) ],
  exports: [ RouterModule ]
})

export class WalletRoutingModule {}
