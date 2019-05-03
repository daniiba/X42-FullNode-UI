import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-portfolio',
  templateUrl: './portfolio.component.html',
  styleUrls: ['./portfolio.component.css']
})
export class PortfolioComponent implements OnInit {

  public doughnutChartLabels = ['x42', 'BTC', 'ETC', 'Bitconnect'];
  public doughnutChartType = 'doughnut';
  public doughnutChartData = [
  [50,10,15,25]
    
  ];
  constructor() { }

  ngOnInit() {
  }

}
