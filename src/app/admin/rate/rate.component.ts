import { Component, OnInit, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { ToastrService } from 'ngx-toastr';
import { Rate } from 'src/app/common/Rate';
import { PageService } from 'src/app/services/page.service';
import { RateService } from 'src/app/services/rate.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-rate',
  templateUrl: './rate.component.html',
  styleUrls: ['./rate.component.css']
})
export class RateComponent implements OnInit {

  rates!: Rate[];
  listData!: MatTableDataSource<Rate>;
  ratesLength!: number;
  columns: string[] = ['index', 'name', 'product', 'rating', 'comment', 'rateDate'];

  @ViewChild(MatSort) sort!: MatSort;
  @ViewChild(MatPaginator) paginator!: MatPaginator;

  constructor(private pageService: PageService, private rateService: RateService, private toastr: ToastrService) { }

  ngOnInit(): void {
    this.pageService.setPageActive('rate');
    this.getAll();
  }

  getAll() {
    this.rateService.getAll().subscribe(data => {
      this.rates = data as Rate[];
      this.listData = new MatTableDataSource(this.rates);
      this.listData.sort = this.sort;
      this.listData.paginator = this.paginator;
      this.ratesLength = this.rates.length;
    }, error => {
      this.toastr.error('Lỗi! ' + error.status, 'Hệ thống');
    })
  }

  search(event: any) {
    const fValue = (event.target as HTMLInputElement).value.trim().toLowerCase();
    this.listData.filterPredicate = (data: Rate, filter: string) => {

      if (filter.toLowerCase() === "1sao") {

        filter = "1";
      } else if (filter.toLowerCase() === "2sao") {

        filter = "2";
      } else if (filter.toLowerCase() === "3sao") {

        filter = "3";
      } else if (filter.toLowerCase() === "4sao") {

        filter = "4";
      } else if(filter.toLowerCase() === "5sao") {

        filter = "5";
      }

      return data.id.toString().includes(filter) ||
              data.rating.toString().includes(filter) ||
              data.user.name.toLowerCase().includes(filter) ||
              data.comment.toLowerCase().includes(filter) || 
              this.formatDate(data.rateDate).includes(filter);
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

}
