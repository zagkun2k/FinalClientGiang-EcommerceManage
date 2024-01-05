import { Component, EventEmitter, Input, OnInit, Output, TemplateRef } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ToastrService } from 'ngx-toastr';
import { District } from 'src/app/common/District';
import { ExpressChoice } from 'src/app/common/ExpressChoice';
import { ExpressFee } from 'src/app/common/ExpressFee';
import { Order } from 'src/app/common/Order';
import { OrderDetail } from 'src/app/common/OrderDetail';
import { Province } from 'src/app/common/Province';
import { Ward } from 'src/app/common/Ward';
import { ExpressApiService } from 'src/app/services/express-api.service';
import { OrderService } from 'src/app/services/order.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-order-detail',
  templateUrl: './order-detail.component.html',
  styleUrls: ['./order-detail.component.css']
})
export class OrderDetailComponent implements OnInit {

  orderDetails!: OrderDetail[];
  order!: Order;
  listData!: MatTableDataSource<OrderDetail>;
  orderDetailLength!: number;

  columns: string[] = ['index', 'image', 'product', 'quantity', 'price'];

  provinces!: Province[];
  districts!: District[];
  wards!: Ward[];
  expressChoice!: ExpressChoice[];
  expressFee!: ExpressFee;
  expressServiceType!: number[];
  expressFeeAmount!: number[];

  expressChoiceCode!: number;
  
  warName!: string;
  provinceName!: string;
  districtName!: string;
  orderAddress!: string;
  orderPhone!: string;
  orderUserName!: string;
  itemOrder!: Object[];
  orderCODAmount!: number;
  orderAmount!: number;
  typeService!: number[];
  typeExpress!: number;

  districtCode!: number;
  provinceCode!: number;
  wardCode!: number;

  @Output()
  updateFinish: EventEmitter<any> = new EventEmitter<any>();
  @Input() orderId!: number;

  constructor(private modalService: NgbModal, private orderService: OrderService, private toastr: ToastrService, private location: ExpressApiService) { }

  ngOnInit(): void {
    this.getOrder();
    this.getDetail();
    // this.getProvinces();
    this.typeService = [];
    // this.doInitValue();
  }

  getProvinces() {
    this.location.getAllProvinces().subscribe(data => {
      this.provinces = data.data as Province[];
    })
  }

  getOrder() {
    this.orderService.getById(this.orderId).subscribe(data => {
      this.order = data as Order;
    }, error => {
      this.toastr.error('Lỗi! ' + error.status, 'Hệ thống');
    })
  }

  getDetail() {
    this.orderService.getByOrder(this.orderId).subscribe(data => {
      this.orderDetails = data as OrderDetail[];
      this.listData = new MatTableDataSource(this.orderDetails);
      this.orderDetailLength = this.orderDetails.length;
    }, error => {
      this.toastr.error('Lỗi! ' + error.status, 'Hệ thống');
    })
  }

  open(content: TemplateRef<any>) {
    this.modalService.open(content, { centered: true, size: 'lg' });
  }

  deliver() {
    Swal.fire({
      title: 'Bạn muốn xác nhận đơn hàng này và chuyển cho bộ phận giao hàng ?',
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Xác nhận',
      cancelButtonText: 'Không'
    }).then((result) => {
      if (result.isConfirmed) {

        this.orderAddress = this.orderDetails[0].order.address;
        this.orderPhone = this.orderDetails[0].order.phone;
        this.orderUserName = this.orderDetails[0].order.user.name;
        this.orderCODAmount = this.orderDetails[0].order.amount;
        let tempArray = this.orderDetails.map(item => {

          return {
            "name": `${item.product.name}`,
            "quantity": item.quantity,
            "weight": 1200,
          }
        });
       

        this.warName = this.orderAddress.split(', ')[1];
        this.districtName = this.orderAddress.split(', ')[2];
        this.provinceName = this.orderAddress.split(', ')[3];
        this.location.getAllProvinces().subscribe(data => {
          this.provinces = data.data as Province[];
          this.provinceCode = this.provinces.find(item => item.ProvinceName === this.provinceName)?.ProvinceID || -1;
          this.location.getDistricts(this.provinceCode).subscribe(data => {
            this.districts = data.data as District[];
            this.districtCode = this.districts.find(item => item.DistrictName === this.districtName)?.DistrictID || -1;
            this.location.getWards(this.districtCode).subscribe(data => {
              this.wards = data.data as Ward[];
              this.wardCode = this.wards.find(item => item.WardName === this.warName)?.WardCode || -1;

              this.location.getExpress(this.districtCode).subscribe(data => {
                this.expressChoice = data.data as ExpressChoice[];
                this.expressChoice.forEach(item => {

                  this.location.getExpressFee(item.service_type_id, this.wardCode, this.districtCode, 10000, "", this.orderAddress, this.orderPhone, this.orderUserName).subscribe(data => {
                    this.expressFee = data.data as ExpressFee;
                    this.location.cancelOrder([this.expressFee.order_code]).subscribe(data =>{});
                    this.typeService.push(this.expressFee.total_fee);

                    if (this.typeService.length >= 2) {

                      let sum = 0;
                      this.orderDetails.forEach(item => {
    
                        sum += item.price;
                      })
                      this.orderAmount = sum;
    
                      this.typeService.forEach((item, index) => {
    
                        if (this.orderCODAmount - item === this.orderAmount) {
    
                          this.typeExpress = index === 0 ? 2 : 5;
                          this.location.getExpressFee(this.typeExpress, this.wardCode, this.districtCode, this.orderAmount, tempArray, this.orderAddress, this.orderPhone, this.orderUserName).subscribe(data => {

                            if (data.code === 200) {

                              // this.toastr.success('Đã liên hệ bộ phận chuyển giao hàng!', 'Hệ thống');
                              console.log("ok!!!");
                            } else {
                              console.log("not working!!!");
                              // this.toastr.success('Xác nhận thành công và đã liên hệ bộ phận chuyển giao hàng!', 'Hệ thống');
                            }
                          });
                        }
                      })
                    }
                  })
                })
              })
            })
          })
        })

        this.orderService.deliver(this.orderId).subscribe(data => {

          setTimeout(() => {

            this.toastr.success('Xác nhận thành công và đã liên hệ bộ phận chuyển giao hàng!', 'Hệ thống');
          }, 1000)        
          this.updateFinish.emit('done');
          this.modalService.dismissAll();
        }, error => {
          this.toastr.error('Lỗi! ' + error.status, 'Hệ thống');
        })
      }
    })
  }

  cancel() {
    Swal.fire({
      title: 'Bạn muốn huỷ đơn hàng này ?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Huỷ',
      cancelButtonText: 'Không'
    }).then((result) => {
      if (result.isConfirmed) {
        this.orderService.cancel(this.orderId).subscribe(data => {
          this.toastr.success('Huỷ thành công!', 'Hệ thống');
          this.updateFinish.emit('done');
          this.modalService.dismissAll();
        }, error => {
          this.toastr.error('Lỗi! ' + error.status, 'Hệ thống');
        })
      }
    })
  }

  confirm() {
    Swal.fire({
      title: 'Bạn muốn xác nhận đơn hàng này đã thanh toán?',
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Xác nhận',
      cancelButtonText: 'Không'
    }).then((result) => {
      if (result.isConfirmed) {
        this.orderService.success(this.orderId).subscribe(data => {
          this.toastr.success('Xác nhận thành công!', 'Hệ thống');
          this.updateFinish.emit('done');
          this.modalService.dismissAll();
        }, error => {
          this.toastr.error('Lỗi! ' + error.status, 'Hệ thống');
        })
      }
    })
  }

}
