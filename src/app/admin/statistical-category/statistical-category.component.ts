import { Component, OnInit, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { Chart, registerables } from 'chart.js';
import { CategoryBestSeller } from 'src/app/common/CategoryBestSeller';
import { PageService } from 'src/app/services/page.service';
import { StatisticalService } from 'src/app/services/statistical.service';

@Component({
  selector: 'app-statistical-category',
  templateUrl: './statistical-category.component.html',
  styleUrls: ['./statistical-category.component.css']
})
export class StatisticalCategoryComponent implements OnInit {

  categoryBestSeller!:CategoryBestSeller[];
  listData!: MatTableDataSource<CategoryBestSeller>;
  lengthCategoryBestSeller!: number;
  columns: string[] = ['index', 'name', 'count', 'amount'];

  labelsCategory: any[] = [];
  dataMoney: number[] = [];

  myCharPie !: Chart;
  
  @ViewChild(MatSort) sort!: MatSort;
  @ViewChild(MatPaginator) paginator!: MatPaginator;

  constructor(private statisticalService: StatisticalService, private pageService: PageService) { }

  ngOnInit(): void {
    this.pageService.setPageActive('category-best-seller');
    this.getCategoryBestSeller();
    Chart.register(...registerables);
  }

  getCategoryBestSeller() {
    this.statisticalService.getStatisticalBestSeller().subscribe(data=>{
      this.categoryBestSeller = data as CategoryBestSeller[];

      this.listData = new MatTableDataSource(this.categoryBestSeller);
      this.listData.sort = this.sort;
      this.listData.paginator = this.paginator;
      this.lengthCategoryBestSeller = this.categoryBestSeller.length

      this.categoryBestSeller.forEach(item=>{
        this.dataMoney.push(item.amount);
        this.labelsCategory.push(item.name);
        console.log(item.name);
        
      })
      this.loadChartPie();
    })
  }

  getCatogoryIdName(name: string) : string {

    switch(name) {

      case 'Điện thoại': return 'DT';
      case 'Laptop': return 'LT';
      case 'Điện gia dụng': return 'DGD';
      case 'Đồng hồ': return 'DH';
      case 'Tivi': return 'TV';
      case 'Bàn phím': return 'BP';
      default: return name;
    }
  }

  search(event: any) {
    
    const fValue = (event.target as HTMLInputElement).value.trim().toLowerCase();
    this.listData.filterPredicate = (data: CategoryBestSeller, filter: string) => {

      return  data.name.toLowerCase().includes(filter) ||
               data.count.toString().includes(filter) || 
               data.amount.toString().includes(filter);
     }

     this.listData.filter = fValue;
  }

  loadChartPie() {
    this.myCharPie = new Chart('charCategory', {
      type: 'pie',
      data: {
        labels: this.labelsCategory,
        datasets: [{
          label: 'My First Dataset',
          data: this.dataMoney,
          backgroundColor: [
            'rgb(255, 99, 132)',
            'rgb(54, 162, 235)',
            'rgb(255, 205, 86)',
            'rgb(43, 99, 71)',
            'rgb(43, 255, 222)',
            'rgb(43, 113, 222)',
            'rgb(43, 13, 222)'
          ],
          hoverOffset: 4
        }]
      },
    });
  }

}
