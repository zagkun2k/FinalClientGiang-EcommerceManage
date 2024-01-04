import { Component, OnInit, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { ActivatedRoute } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { ChatMessage } from 'src/app/common/ChatMessage';
import { Order } from 'src/app/common/Order';
import { OrderService } from 'src/app/services/order.service';
import { PageService } from 'src/app/services/page.service';

@Component({
  selector: 'app-order',
  templateUrl: './order.component.html',
  styleUrls: ['./order.component.css']
})
export class OrderComponent implements OnInit {

  listData!: MatTableDataSource<Order>;
  orders!: Order[];
  orderLength!: number;
  columns: string[] = ['id', 'user', 'address', 'phone', 'amount', 'orderDate', 'status', 'view'];

  
  webSocket!: WebSocket;
  chatMessages: ChatMessage[] = [];

  @ViewChild(MatSort) sort!: MatSort;
  @ViewChild(MatPaginator) paginator!: MatPaginator;

  constructor(private pageService: PageService, private toastr: ToastrService, private orderService: OrderService, private route: ActivatedRoute) { 
    route.params.subscribe(val => {
      this.ngOnInit();
    })
  }

  ngOnInit(): void {
    this.openWebSocket();
    this.pageService.setPageActive('order');
    this.getAllOrder();
  }

  ngOnDestroy(): void {
    this.closeWebSocket();
  }

  getAllOrder() {
    this.orderService.get().subscribe(data => {
      this.orders = data as Order[];
      this.listData = new MatTableDataSource(this.orders);
      this.orderLength = this.orders.length;
      this.listData.sort = this.sort;
      this.listData.paginator = this.paginator;
    }, error => {
      this.toastr.error('Lỗi! ' + error.status, 'Hệ thống');
    })
  }

  search(event: any) {
    // const fValue = (event.target as HTMLInputElement).value;
    // this.orderService.get().subscribe(data => {
    //   this.orders = data as Order[];
    //   this.orders = this.orders.filter(o => o.user.name.toLowerCase().includes(fValue.toLowerCase()) || o.ordersId===Number(fValue) || o.address.toLowerCase().includes(fValue.toLowerCase()) || o.phone.includes(fValue.toLowerCase()));
    //   this.listData = new MatTableDataSource(this.orders);
    //   this.orderLength = this.orders.length;
    //   this.listData.sort = this.sort;
    //   this.listData.paginator = this.paginator;
    // })
    const fValue = (event.target as HTMLInputElement).value.trim().toLowerCase();
    this.listData.filterPredicate = (data: Order, filter: string) => {

      if (filter.toLowerCase() === "đợi shop xử lí đơn") {

        filter = "0";
      } else if (filter.toLowerCase() === "đã giao thành công") {

        filter = "1";
      } else if (filter.toLowerCase() === "đang giao hàng") {

        filter = "2";
      } else if (filter.toLowerCase() === "đã hủy") {

        filter = "3";
      } 

      return data.ordersId.toString().includes(filter) ||
              data.user.name.toLowerCase().includes(filter) ||
              //  data.email.toLowerCase().includes(filter) || 
               data.address.toLowerCase().includes(filter) || 
               data.phone.toLowerCase().includes(filter) || 
               data.amount.toString().includes(filter) || 
               this.formatDate(data.orderDate).includes(filter) || 
               data.status.toString().includes(filter)
              //  data.gender.toString().toLowerCase().includes(filter);
    };
    this.listData.filter = fValue;
    
  }

  formatDate(date: Date | string): string {
    if (typeof date === 'string') {
        date = new Date(date);
    }

    if (date instanceof Date && !isNaN(date.getTime())) {
        const day = date.getDate().toString().padStart(2, '0');
        const month = (date.getMonth() + 1).toString().padStart(2, '0');
        const year = date.getFullYear().toString();
        return `${day}-${month}-${year}`;
    } else {
        return '';
    }
  }

  finish() {
    this.ngOnInit();
  }

  openWebSocket() {
    this.webSocket = new WebSocket('ws://localhost:8080/notification');

    this.webSocket.onopen = (event) => {
      // console.log('Open: ', event);
    };

    this.webSocket.onmessage = (event) => {
      this.getAllOrder();
    };

    this.webSocket.onclose = (event) => {
      // console.log('Close: ', event);
    };
  }

  closeWebSocket() {
    this.webSocket.close();
  }

}
