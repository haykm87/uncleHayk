import { Component, OnInit, Input, Inject, ViewEncapsulation } from '@angular/core';
import { Product, ProductScore, CombineStatus, PositionStatusType, StatusType } from '../../../models/models';
import { Router } from '@angular/router';
import { Title } from '@angular/platform-browser';
import { MainService } from '../../../views/main/main.service';
import { ProductStatusService } from '../../../services';

@Component({
    selector: 'app-goods-list-item',
    templateUrl: 'goods-list-item.component.html',
    styleUrls: ['goods-list-item.component.scss']
})
export class GoodsListItemComponent implements OnInit {
    private _productRating: number = 0;
    public salePrice: number = 0;
    private _existStatusArray: CombineStatus[] = []
    public statusArray: StatusType[] = []
    public position: PositionStatusType[] = []
    @Input('product') _product: Product = new Product();
    @Input('style') style;
    constructor(
        @Inject('FILE_URL') private _fileUrl: string,
        private _router: Router,
        private _titleService: Title,
        private _mainService: MainService,
        private _productStatusService:ProductStatusService
    ) { 
        this.position=this._productStatusService.getPositionStatus();
        this.statusArray=this._productStatusService.getStatusArray()
    }

    ngOnInit() {
        this._calcProductRating(this._product.productScore);
        this._getStatusProducts()
    }
    public getPosition(status) {
        let style = {};
        if (status.verticalPos && status.horizontalPos) {
            style[status.verticalPos] = status.verticalPosVal
            style[status.horizontalPos] = status.horizontalPosVal
        }
        return style
    }
    private _complateArray() {
        for (let status of this.statusArray) {
            for (let existStatus of this._existStatusArray) {
                if (status.status == existStatus.name) {
                    existStatus["icon"] = status.icon;
                    existStatus["id"] = status.id
                }
            }
        }
        if (this._existStatusArray && this._existStatusArray.length) {
            this._existStatusArray.sort((a, b) => { return a.id - b.id });
            for (let i = 0; i < this._existStatusArray.length; i++) {
                this._existStatusArray[i]['verticalPos'] = this.position[i].verticalPos;
                this._existStatusArray[i]['horizontalPos'] = this.position[i].horizontalPos;
                this._existStatusArray[i]['verticalPosVal'] = this.position[i].verticalPosVal;
                this._existStatusArray[i]['horizontalPosVal'] = this.position[i].horizontalPosVal
            }
        }
    }
    private _getStatusProducts() {
        if (this._product.status && this._product.status.length) {
            this._product.status.forEach((data) => {
                if (data.name !== 'Спецпредложения')
                    this._existStatusArray.push({ name: data.name })
            })
        }

        if (this._product.specificPrice) {
            this._existStatusArray.push({ name: 'Спецпредложения' })
            let specificPrice = +this._product.specificPrice;
            let realPrice = +this._product.price_with_vat;
            this.salePrice = +((100 * (realPrice - specificPrice)) / realPrice).toFixed(2)
        }
        this._complateArray()

    }
    private setProductToBasket(product): void {
        product['count'] = 1;
        this._mainService.addProductBasket(product)
    }

    private _calcProductRating(ratings: ProductScore[]): void {
        if (ratings) {
            ratings.forEach((element) => {
                this._productRating += +element.score
            })
            if (ratings.length > 0) {
                this._productRating = this._productRating / ratings.length;
            }
        }
    }

    private _setProductRating(starCount: number): void {
        this._mainService.setProductRating(starCount, this._product.id).subscribe((data) => { })
    }

    public onClickItem(): void {
        this._router.navigate([`/catalog/${this._product.id}`])
        this._titleService.setTitle(this._product.name);
    }

    public onClickAddBasket(): void {
        this.setProductToBasket(this._product);
    }

    public handleSetRating(event): void {
        this._setProductRating(event)
    }

    public onMouseEnter(): void {

    }

    get product(): Product {
        return this._product;
    }

    get fileUrl(): string {
        return this._fileUrl;
    }

    get productRating(): number {
        return this._productRating
    }
    get existStatusArray():CombineStatus[] {
        return this._existStatusArray
    }
}