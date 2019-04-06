import { Component, OnInit, Input, ViewChild } from '@angular/core';
import { ChartDataSets, ChartOptions } from 'chart.js';
import { NgbModal, NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { Router } from '@angular/router';
import { ApiService } from '../../../../shared/services/api.service';
import { GlobalService } from '../../../../shared/services/global.service';
import { ModalService } from '../../../../shared/services/modal.service';
import { WalletInfo } from '../../../../shared/models/wallet-info';
import { TransactionInfo } from '../../../../shared/models/transaction-info';
import { Subscription, from } from 'rxjs';
import { TransactionDetailsComponent } from '../../../transaction-details/transaction-details.component';
import { Color, BaseChartDirective, Label } from 'ng2-charts';
import { fillProperties } from '@angular/core/src/util/property';

@Component({
  selector: 'app-line-chart',
  templateUrl: './line-chart.component.html',
  styleUrls: ['./line-chart.component.css']
})

export class LineChartComponent  implements OnInit {


  public transactions: TransactionInfo[];
  public coinUnit: string;
  public pageNumber: number = 1;
  private errorMessage: string;
  private walletHistorySubscription: Subscription;

  public data: any;
  public options: any;
  
  public lineChartData: ChartDataSets[] = [
  
      {
          label: 'Stakes',
          data: [ ],
          borderColor: "#8dc8b7",
          backgroundColor: "rgba(141, 200, 183, 0.6)",
          pointBackgroundColor: "#8dc8b7",
          spanGaps: true
          
      },
      {
          label: 'Received',
          data: [],
          borderColor: "#1abeff",
          backgroundColor: "rgba(26, 190, 255, 0.6)",
          spanGaps: true
      }
      ,
      {
        label: 'Sent',
        data: [],
        borderColor: "#e36a68",
        backgroundColor: "rgba(227, 106, 104, 0.6)",
        spanGaps: true
      }
      ,
      {
      label: 'Balance',
      data: [],
      borderColor: "#000000",
      spanGaps: true
      }
  ];
  public lineChartType = 'line';
  public lineChartLabels: Label[] = [];
  public lineChartOptions: (ChartOptions ) = {
    
    responsive: true,
    legend: {
      position: 'bottom'
  },
  animation: {
    duration: 0
  },
  scales: {
    yAxes: [      
      {
        stacked: false,
        gridLines: {
          display: false
      },
      ticks: {
        display:false,
        
    }
      }
    ],
    xAxes: [{
      stacked: true,
      type: 'time',
      time: {
        unit: 'day'
    },
    
    }]
  }
  };
  @ViewChild(BaseChartDirective) chart: BaseChartDirective;
  constructor(private apiService: ApiService, private globalService: GlobalService, private modalService: NgbModal, private genericModalService: ModalService, private router: Router) {}

  ngOnInit() {
    this.startSubscriptions();
    this.coinUnit = this.globalService.getCoinUnit();
 
  }

  ngOnDestroy() {
    this.cancelSubscriptions();
  }

  onDashboardClicked() {
    this.router.navigate(['/wallet']);
  }


  private openTransactionDetailDialog(transaction: any) {
    const modalRef = this.modalService.open(TransactionDetailsComponent, { backdrop: "static" });
    modalRef.componentInstance.transaction = transaction;
  }

    // todo: add history in seperate service to make it reusable
  private getHistory() {
    let walletInfo = new WalletInfo(this.globalService.getWalletName())
    let historyResponse;
    this.walletHistorySubscription = this.apiService.getWalletHistory(walletInfo)
      .subscribe(
        response => {
          //TO DO - add account feature instead of using first entry in array
          if (!!response.history && response.history[0].transactionsHistory.length > 0) {
            historyResponse = response.history[0].transactionsHistory;
            this.getTransactionInfo(historyResponse);
          }
        },
        error => {
          if (error.status === 0) {
            this.cancelSubscriptions();
          } else if (error.status >= 400) {
            if (!error.error.errors[0].message) {
              this.cancelSubscriptions();
              this.startSubscriptions();
            }
          }
        }
      )
    ;
  };

  private getTransactionInfo(transactions: any) {
    this.transactions = [];
    let stakes = [{}];
    let outgoing =[{}];
    let received =[{}];
    let balance=0;
    for (let transaction of transactions) {
      
      let transactionType;
      let transactionId = transaction.id;
      let transactionAmount = transaction.amount;
      let transactionFee;
      let transactionConfirmedInBlock = transaction.confirmedInBlock;
      let transactionTimestamp = transaction.timestamp;
      let transactionConfirmed;

      if (transaction.fee) {
        transactionFee = transaction.fee;
      } else {
        transactionFee = 0;
      }

      if (transaction.type === "send") {
        transactionType = "sent";
        outgoing.push({id:transactionId, amount:transactionAmount, time:transactionTimestamp});
        balance-=transactionAmount;
        
      } else if (transaction.type === "received") {
        transactionType = "received";
        received.push({id:transactionId, amount:transactionAmount, time:transactionTimestamp});
        balance+=transactionAmount;
        
      } else if (transaction.type === "staked") {
        transactionType = "staked";
        stakes.push({id:transactionId, amount:transactionAmount, time:transactionTimestamp});
        balance+=transactionAmount;
        
      }
      this.transactions.push(new TransactionInfo(transactionType, transactionId, transactionAmount, transactionFee, transactionConfirmedInBlock, transactionTimestamp));
    }
    
      this.addData("outgoing", balance, outgoing)
      this.addData("received", balance, received)
      this.addData("stake", balance, stakes)
    
   
  }

  private cancelSubscriptions() {
    if(this.walletHistorySubscription) {
      this.walletHistorySubscription.unsubscribe();
    }
  };

  private startSubscriptions() {
    this.getHistory();
  }
  public addData(type, balance, transaction){

    if(type==="stake") {
    
    let finalData; 
      for(let t of transaction) {
        if(t.amount!=undefined && t.time!=undefined){
          let date= new Date(t.time*1000);
          let convertedDate = String(date.getFullYear()+"-"+Number(date.getMonth()+1)+"-"+date.getDate())
          let amount = t.amount/100000000
          if(finalData!=undefined) {
              loop1:
              for(let data of finalData){
                if(data.x==convertedDate){
                  data.y+=amount
                  break loop1;
                }
                else if(data==finalData[finalData.length-1]) {
                  finalData.push({x:convertedDate,y:amount})
                  break loop1;
                }
              }
            }
          else {
            finalData=[{x:convertedDate,y:amount}]
          }
        }
      }   
      this.lineChartData[0].data=finalData;
      this.chart.update()
    } else if(type==="received") {
      let finalData; 
      for(let t of transaction) {
        if(t.amount!=undefined && t.time!=undefined){
          let date= new Date(t.time*1000);
          let convertedDate = String(date.getFullYear()+"-"+Number(date.getMonth()+1)+"-"+date.getDate())
          let amount = t.amount/100000000
          if(finalData!=undefined) {
              loop1:
              for(let data of finalData){
                if(data.x==convertedDate){
                  data.y+=amount
                  break loop1;
                }
                else if(data==finalData[finalData.length-1]) {
                  finalData.push({x:convertedDate,y:amount})
                  break loop1;
                }
              }
            }
          else {
            finalData=[{x:convertedDate,y:amount}]
          }
        }
      }   
      this.lineChartData[1].data=finalData;
      this.chart.update()
    } else if(type==="outgoing") {
      let finalData; 
      for(let t of transaction) {
        if(t.amount!=undefined && t.time!=undefined){
          let date= new Date(t.time*1000);
          let convertedDate = String(date.getFullYear()+"-"+Number(date.getMonth()+1)+"-"+date.getDate())
          let amount = t.amount/100000000
          if(finalData!=undefined) {
              loop1:
              for(let data of finalData){
                if(data.x==convertedDate){
                  data.y+=amount
                  break loop1;
                }
                else if(data==finalData[finalData.length-1]) {
                  finalData.push({x:convertedDate,y:amount})
                  break loop1;
                }
              }
            }
          else {
            finalData=[{x:convertedDate,y:amount}]
          }
        }
      }   
      this.lineChartData[2].data=finalData;
      this.chart.update()
     };
    
}
public sumValuesUp() {
  let date;
  for(let stakes of this.lineChartData[0].data) { 
  
    console.log(stakes)   
   if(date!=undefined) {
     loop1:
     for(let dates of date){
       if(dates.x==stakes[1]){
         dates.y+=stakes[0]
         break loop1;
       }
       else if(dates==date[date.length-1]) {
        date.push({x:stakes[1],y:stakes[0]})
       }
     }
   }
   else {
     date=[{x:stakes[1],y:stakes[0]}]
   }
  }
 
  //this.lineChartData[0].data=date;
  this.chart.update()
}

}


  
  



  