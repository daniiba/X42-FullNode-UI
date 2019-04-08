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
var moment = require('moment');
@Component({
  selector: 'app-line-chart',
  templateUrl: './line-chart.component.html',
  styleUrls: ['./line-chart.component.css']
})

//ToDo: Get Full history, Create Balance Graph ( Copy array without reference!)
export class LineChartComponent  implements OnInit {
  public sync = [];

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
          data: [],
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
            //Checking if there was a new Transaction, if not don't call getTransactionInfo
            if(historyResponse!=undefined) {
              if(historyResponse[0].id!=response.history[0].transactionsHistory[0].id &&historyResponse[0].type!=response.history[0].transactionsHistory[0].type) {
                historyResponse = response.history[0].transactionsHistory;   
                this.getTransactionInfo(historyResponse);
              }
            } else {
              historyResponse = response.history[0].transactionsHistory;   
              this.getTransactionInfo(historyResponse);
            }
          console.log(this.sync)
           
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
    let stakes =[];
    let outgoing =[];
    let received=[];
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
        this.sync.push({type:transactionType,id:transactionId, amount:transactionAmount, time:transactionTimestamp})
        outgoing.push({id:transactionId, amount:transactionAmount, time:transactionTimestamp});
        balance-=transactionAmount;
        
      } else if (transaction.type === "received") {
        transactionType = "received";
        this.sync.push({type:transactionType,id:transactionId, amount:transactionAmount, time:transactionTimestamp})
        received.push({id:transactionId, amount:transactionAmount, time:transactionTimestamp});
        balance+=transactionAmount;
        
      } else if (transaction.type === "staked") {
        transactionType = "staked";
        this.sync.push({type:transactionType,id:transactionId, amount:transactionAmount, time:transactionTimestamp})
        stakes.push({id:transactionId, amount:transactionAmount, time:transactionTimestamp});
        balance+=transactionAmount;
        
      }
      this.transactions.push(new TransactionInfo(transactionType, transactionId, transactionAmount, transactionFee, transactionConfirmedInBlock, transactionTimestamp));
    }
      console.log(outgoing, received, stakes)
      this.addData(balance, outgoing, received, stakes)
     
    
   
  }

  private cancelSubscriptions() {
    if(this.walletHistorySubscription) {
      this.walletHistorySubscription.unsubscribe();
    }
  };

  private startSubscriptions() {
    this.getHistory();
  }


  private addData( balance, outgoing, received, stakes){
   
      let outgoingData;
      let receivedData;
      let stakesData;
      let balanceData;
      for(let t of outgoing) {
        if(t.amount!=undefined && t.time!=undefined){
          let date= new Date(t.time*1000);
          let convertedDate = String(date.getFullYear()+"-"+Number(date.getMonth()+1)+"-"+date.getDate())
          let amount = t.amount/100000000
          if(outgoingData!=undefined) {
              loop1:
              for(let data of outgoingData){
                if(data.x==convertedDate){
                  data.y+=amount
                  break loop1;
                }
                else if(data==outgoingData[outgoingData.length-1]) {
                  outgoingData.push({x:convertedDate,y:amount})
                  break loop1;
                }
              }
            }
          else {
            outgoingData=[{x:convertedDate,y:amount}]
          }
        }
      }   
      
      for(let t of received) {
        if(t.amount!=undefined && t.time!=undefined){
          let date= new Date(t.time*1000);
          let convertedDate = String(date.getFullYear()+"-"+Number(date.getMonth()+1)+"-"+date.getDate())
          let amount = t.amount/100000000
          if(receivedData!=undefined) {
              loop1:
              for(let data of receivedData){
                if(data.x==convertedDate){
                  data.y+=amount
                  break loop1;
                }
                else if(data==receivedData[receivedData.length-1]) {
                  receivedData.push({x:convertedDate,y:amount})
                  break loop1;
                }
              }
            }
          else {
            receivedData=[{x:convertedDate,y:amount}]
          }
        }
      }   
   
      for(let t of stakes) {
        if(t.amount!=undefined && t.time!=undefined){
          let date= new Date(t.time*1000);
          let convertedDate = String(date.getFullYear()+"-"+Number(date.getMonth()+1)+"-"+date.getDate())
          let amount = t.amount/100000000
          if(stakesData!=undefined) {
              loop1:
              for(let data of stakesData){
                if(data.x==convertedDate){
                  data.y+=amount
                  break loop1;
                }
                else if(data==stakesData[stakesData.length-1]) {
                  stakesData.push({x:convertedDate,y:amount})
                  break loop1;
                }
              }
            }
          else {
            stakesData=[{x:convertedDate,y:amount}]
          }
        }
      
  }
  
  
  this.lineChartData[2].data=outgoingData;     
  this.lineChartData[1].data=receivedData;
  this.lineChartData[0].data=stakesData;
  this.chart.update()
  this.fillMissingData(stakesData,outgoingData,receivedData)
  
  
}


private fillMissingData(stakesData,outgoingData,receivedData) {
  let allData=[stakesData,receivedData,outgoingData];
  let minDate;
  let maxDate;

  //Getting first and currentday
  for(let k=0; k<allData.length; k++){
    if(allData[k]!=undefined){
      for(let i=0; i<allData[k].length; i++) {
        if(minDate==undefined) {
         minDate=moment(allData[k][i].x).format("x")
         maxDate=moment(allData[k][i].x).format("x")
        }
        else {
          if(moment(allData[k][i].x).format("x")<minDate){
            minDate=moment(allData[k][i].x).format("x")
          }
          else if(moment(allData[k][i].x).format("x")>maxDate){
            maxDate=moment(allData[k][i].x).format("x")
          }
        }     
      }
    }
  }

  //Filling all missing values with 0   
  let newData =[[],[],[]]
  for(let k=0; k<allData.length; k++){    
    if(allData[k]!=undefined){    
    let currentLenght = allData[k].length
    for(let day=new Date(Number(minDate)); day<=new Date(); day.setDate(day.getDate() + 1)){
    
      loop1:
      for(let i=0; i<currentLenght; i++) {
        //console.log(moment(allData[k][i].x).format("x"),day)
        if(moment(allData[k][i].x).format("x")==moment(day).format("x")) {
          if(allData[k][i].y!=undefined) {
           newData[k].push(allData[k][i])
            break loop1;
          }
        }
        else if(i==allData[k].length-1){
          let date = new Date(day)
          let convertedDate =String(date.getFullYear()+"-"+Number(date.getMonth()+1)+"-"+date.getDate())
          newData[k].push({x:convertedDate,y:0})
         
          currentLenght = allData[k].length
        }
      }
    }
 
    this.lineChartData[k].data=newData[k];   
  }
  }
  
  this.chart.update()
  //this.addBalanceGraph(newData)
  


}

//Not working yet
  private addBalanceGraph(newData) {
    let balance = [];
    var hasData =false;
    for(let datasets of newData) {
      if(datasets.length!=0 && !hasData){
        balance=datasets
        hasData=true;
      }
      else if(datasets.length!=0) {
        for(let k=0; k<balance.length; k++){
          balance[k].y+=datasets[k].y
        }
      }
    
    }
    this.lineChartData[3].data=balance;
    console.log(balance)
    this.chart.update()
    /*let data:any= Array.from(newData);
    console.log(data)
    //Creating balance chart
    let balance = [];
    var hasData =false;

    for(let i=0; i<data.length; i++) {    
      if(data[i].length!=0 && !hasData) {
        balance=data[i];
        hasData=true;
      }
      else if(data[i].length!=0) {
        for(let k=0; k<balance.length; k++){
          balance[k].y+=data[i][k].y
        }
      }
    }
    this.lineChartData[3].data=balance;
    console.log(balance)
    this.chart.update()*/
}
}



  
  



  