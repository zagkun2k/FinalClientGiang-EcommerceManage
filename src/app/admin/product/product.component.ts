import { Component, OnInit, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { ToastrService } from 'ngx-toastr';
import { Product } from 'src/app/common/Product';
import { PageService } from 'src/app/services/page.service';
import { ProductService } from 'src/app/services/product.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-product',
  templateUrl: './product.component.html',
  styleUrls: ['./product.component.css']
})
export class ProductComponent implements OnInit {

  listData!: MatTableDataSource<Product>;
  products!: Product[];
  productsLength!: number;
  columns: string[] = ['image', 'productId', 'name', 'price', 'discount', 'category', 'enteredDate', 'view', 'delete'];

  @ViewChild(MatSort) sort!: MatSort;
  @ViewChild(MatPaginator) paginator!: MatPaginator;

  constructor(private pageService: PageService, private productService: ProductService, private toastr: ToastrService) { }

  ngOnInit(): void {
    this.pageService.setPageActive('product');
    this.getAll();
  }

  getAll() {
    this.productService.getAll().subscribe(data => {
      this.products = data as Product[];
      this.listData = new MatTableDataSource(this.products);
      this.listData.sort = this.sort;
      this.listData.paginator = this.paginator;
    }, error => {
      console.log(error);
    })
  }

  delete(id: number, name: string) {
    Swal.fire({
      title: 'Bạn muốn xoá ' + name + ' ?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Xoá',
      cancelButtonText: 'Không'
    }).then((result) => {
      if (result.isConfirmed) {
        this.productService.delete(id).subscribe(data=>{
          this.ngOnInit();
          this.toastr.success('Xoá thành công!', 'Hệ thống');
        },error=>{
          this.toastr.error('Xoá thất bại, đã xảy ra lỗi!', 'Hệ thống');
        })
      }
    })
  }

  search(event: any) {
    
    const fValue = (event.target as HTMLInputElement).value.trim().toLowerCase();
    this.listData.filterPredicate = (data: Product, filter: string) => {

      return data.productId.toString().includes(filter) ||
              data.name.toLowerCase().includes(filter) ||
              //  data.email.toLowerCase().includes(filter) || 
               data.price.toString().includes(filter) || 
               data.discount.toString().includes(filter) || 
               data.category.categoryName.toLowerCase().includes(filter) || 
               this.formatDate(data.enteredDate).includes(filter) || 
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
}
