import { Component, OnInit, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { ToastrService } from 'ngx-toastr';
import { Customer } from 'src/app/common/Customer';
import { CustomerService } from 'src/app/services/customer.service';
import { PageService } from 'src/app/services/page.service';
import { SessionService } from 'src/app/services/session.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-customer',
  templateUrl: './customer.component.html',
  styleUrls: ['./customer.component.css']
})
export class CustomerComponent implements OnInit {

  listData!: MatTableDataSource<Customer>;
  customers!: Customer[];
  customerLength!: number;
  columns: string[] = ['image', 'userId', 'name', 'email','address', 'phone', 'gender', 'registerDate', 'view', 'delete'];

  @ViewChild(MatSort) sort!: MatSort;
  @ViewChild(MatPaginator) paginator!: MatPaginator;

  emailAdmin!:string;

  constructor(private pageService: PageService, private customerService: CustomerService, private toastr: ToastrService, private sessionService: SessionService) { }

  ngOnInit(): void {
    this.emailAdmin = this.sessionService.getUser();
    this.pageService.setPageActive('customer');
    this.getAll();
  }

  getAll() {
    this.customerService.getAll().subscribe(data => {
      this.customers = data as Customer[];
      this.customers = this.customers.filter(c=>c.email!=this.emailAdmin);
      this.listData = new MatTableDataSource(this.customers);
      this.listData.sort = this.sort;
      this.listData.paginator = this.paginator;
    }, error => {
      console.log(error);
    })
  }

  delete(id: number, name: String) {
    Swal.fire({
      title: 'Bạn muốn xoá người dùng có tên ' + name + ' ?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Xoá',
      cancelButtonText: 'Không'
    }).then((result) => {
      if (result.isConfirmed) {
        this.customerService.delete(id).subscribe(data => {
          this.ngOnInit();
          this.toastr.success('Thông báo xoá thành công!', 'Hệ thống');
        }, error => {
          this.toastr.error('Thông báo xoá thất bại, đã xảy ra lỗi!', 'Hệ thống');
        })
      }
    })
  }

  search(event: any) {
    const fValue = (event.target as HTMLInputElement).value.trim().toLowerCase();
    this.listData.filterPredicate = (data: Customer, filter: string) => {

      if (filter.toLowerCase() === "nam") {

        filter = "true";
      } else if (filter.toLowerCase() === "nữ") {

        filter = "false";
      }
      return data.userId.toString().includes(filter) ||
              data.name.toLowerCase().includes(filter) ||
               data.email.toLowerCase().includes(filter) || 
               data.address.toLowerCase().includes(filter) || 
               data.phone.toLowerCase().includes(filter) || 
               this.formatDate(data.registerDate).includes(filter) ||
               data.gender.toString().toLowerCase().includes(filter);
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

}
