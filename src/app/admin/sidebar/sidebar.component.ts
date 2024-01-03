import { Component, OnInit } from '@angular/core';
import { PageService } from 'src/app/services/page.service';
import { Router, NavigationEnd } from '@angular/router';

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.css']
})
export class SidebarComponent implements OnInit {

  pageActive!: string;

  constructor(private pageService: PageService, private router: Router) { }

  ngOnInit(): void {
    this.pageService.$dataPageActive.subscribe(data => {
      this.pageActive = data;
    })
  }


}
