import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-doughnut-chart',
  templateUrl: './doughnut-chart.component.html',
  styleUrls: ['./doughnut-chart.component.css']
})
export class DoughnutChartComponent implements OnInit {

  public doughnutChartLabels = ['x42', 'BTC', 'ETC', 'Bitconnect'];
  public doughnutChartType = 'doughnut';
  public doughnutChartData = [
  [50,10,15,25]
    
  ];
  constructor() { }

  ngOnInit() {
  }

}
