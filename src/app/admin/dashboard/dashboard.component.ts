import { Component, OnInit } from '@angular/core';
import { Chart, registerables } from 'chart.js';
import { ToastrService } from 'ngx-toastr';
import { ChatMessage } from 'src/app/common/ChatMessage';
import { Customer } from 'src/app/common/Customer';
import { Order } from 'src/app/common/Order';
import { Statistical } from 'src/app/common/Statistical';
import { CustomerService } from 'src/app/services/customer.service';
import { OrderService } from 'src/app/services/order.service';
import { PageService } from 'src/app/services/page.service';
import { StatisticalService } from 'src/app/services/statistical.service';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {

  orderHandle!: number;
  customerLength!: number;
  orders!: Order[];
  customers!: Customer[];

  statistical!: Statistical[];
  labels: string[] = [];
  data: number[] = [];
  year: number = 2021;
  myChartBar !: Chart;
  countYears!: number[];

  revenueYearNow!: number;
  revenueMonthNow!: number;
  
  webSocket!: WebSocket;
  chatMessages: ChatMessage[] = [];

  constructor(private pageService: PageService, private toastr: ToastrService, private orderService: OrderService, private customerService: CustomerService, private statisticalService: StatisticalService) { }

  ngOnInit(): void {
    this.openWebSocket();
    this.pageService.setPageActive('dashboard');
    this.orders = [];
    this.getAllOrder(0);
    this.getAllCustomer();
    this.getStatisticalYear();
    this.getCountYear();
    Chart.register(...registerables);
  }

  ngOnDestroy(): void {
    this.closeWebSocket();
  }

  getStatisticalYear() {
    this.statisticalService.getByMothOfYear(this.year).subscribe(data => {
      this.statistical = data as Statistical[];
      this.statistical.forEach(item => {
        this.labels.push('Tháng ' + item.month);
        this.data.push(item.amount);
      })
      this.loadChartBar();
    }, error => {
      this.toastr.error('Lỗi! ' + error.status, 'Hệ thống');
    })
  }

  getCountYear() {
    this.statisticalService.getCountYear().subscribe(data => {
      this.countYears = data as number[];
    }, error => {
      this.toastr.error('Lỗi! ' + error.status, 'Hệ thống');
    })
  }

  getRevenueYear(year: number): number {
    let revenue = 0
    for (const element of this.orders) {
      if (new Date(element.orderDate).getFullYear() == year && element.status == 2) {
        revenue += element.amount;
      }
    }
    return revenue;
  }

  getRevenueYearNow(year: number) {
    if (year === 0) {

      let revenue = 0
      for (const element of this.orders) {
        if (new Date(element.orderDate).getFullYear() == new Date().getFullYear() && element.status == 2) {
          revenue += element.amount;
        }
      }
      this.revenueYearNow = revenue;
    } else {

      let revenue = 0
      for (const element of this.orders) {
        if (new Date(element.orderDate).getFullYear() == year && element.status == 2) {
          revenue += element.amount;
        }
      }
      this.revenueYearNow = revenue;
    }
  }

  getRevenueMonthNow(year: number) {
    if (year === 0 || year === new Date().getFullYear()) {

      let revenue = 0;
        for (const element of this.orders) {
          if (new Date(element.orderDate).getMonth() == new Date().getMonth() && new Date(element.orderDate).getFullYear() == new Date().getFullYear() && element.status == 2) {
            revenue += element.amount;
          }
        }
        this.revenueMonthNow = revenue;
    } else {

      let revenue = 0;
      const monthsWithOrders: number[] = [];
        for (const element of this.orders) {
          if (new Date(element.orderDate).getFullYear() == year && element.status == 2) {

            revenue += element.amount;
            if (!monthsWithOrders.includes(new Date(element.orderDate).getMonth())) {
              monthsWithOrders.push(new Date(element.orderDate).getMonth());
            }
          }
        }
        this.revenueMonthNow = revenue / monthsWithOrders.length;
    }
  }

  getAllOrder(year: number) {
    this.orderService.get().subscribe(data => {
      this.orders = data as Order[];
      this.getRevenueMonthNow(year);
      this.getRevenueYearNow(year);
      this.orderHandle = 0;
      for (const element of this.orders) {
        if (element.status == 0) {
          this.orderHandle++;
        }
      }
    }, error => {
      this.toastr.error('Lỗi server', 'Hệ thống');
    })
  }

  getAllCustomer() {
    this.customerService.getAll().subscribe(data => {
      this.customers = data as Customer[];
      this.customerLength = this.customers.length;
    }, error => {
      this.toastr.error('Lỗi server', 'Hệ thống');
    })
  }

  setYear(year: number) {
    this.year = year;
    this.labels = [];
    this.data = [];
    this.myChartBar.destroy();
    this.ngOnInit();
    this.getAllOrder(year);
  }

  loadChartBar() {
    this.myChartBar = new Chart('chart', {
      type: 'bar',
      data: {
        labels: this.labels,
        datasets: [{
          // label: '# of Votes',
          data: this.data,
          // borderColor: 'rgb(75, 192, 192)',
          // pointBorderColor: 'rgba(54, 162, 235, 0.2)',
          // backgroundColor: 'rgba(255, 99, 132, 0.2)',
          backgroundColor: [
            'rgba(255, 99, 132, 0.2)',
            'rgba(54, 162, 235, 0.2)',
            'rgba(255, 206, 86, 0.2)',
            'rgba(75, 192, 192, 0.2)',
            'rgba(153, 102, 255, 0.2)',
            'rgba(255, 159, 64, 0.2)',
            'rgba(201, 203, 207, 0.2)',
            'rgba(0, 162, 71, 0.2)',
            'rgba(82, 0, 36, 0.2)',
            'rgba(82, 164, 36, 0.2)',
            'rgba(255, 158, 146, 0.2)',
            'rgba(123, 39, 56, 0.2)'
          ],
          borderColor: [
            'rgba(255, 99, 132, 1)',
            'rgba(54, 162, 235, 1)',
            'rgba(255, 206, 86, 1)',
            'rgba(75, 192, 192, 1)',
            'rgba(153, 102, 255, 1)',
            'rgba(255, 159, 64, 1)',
            'rgba(201, 203, 207, 1)',
            'rgba(0, 162, 71, 1)',
            'rgba(82, 0, 36, 1)',
            'rgba(82, 164, 36, 1)',
            'rgba(255, 158, 146, 1)',
            'rgba(123, 39, 56, 1)'
          ],
          borderWidth: 1
        }]
      },
      options: {
        scales: {
          y: {
            beginAtZero: true
          }
        },
        plugins: {
          legend: {
            display: false
          }
        }
      }
    });
  }

  openWebSocket() {
    this.webSocket = new WebSocket('ws://localhost:8080/notification');

    this.webSocket.onopen = (event) => {
      // console.log('Open: ', event);
    };

    this.webSocket.onmessage = (event) => {
      this.getAllOrder(0);
    };

    this.webSocket.onclose = (event) => {
      // console.log('Close: ', event);
    };
  }

  closeWebSocket() {
    this.webSocket.close();
  }

}
