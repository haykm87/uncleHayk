import { Component, OnInit, OnDestroy, Inject } from '@angular/core';
import { BuyOneClickModal } from '../../../modals';
import { MatDialog } from '@angular/material';
import { ActivatedRoute, Router } from '@angular/router';
import {
    ServerResponse,
    ProductFull,
    CombinedProduct,
    CombinedAttribute,
    LikeProduct,
    AttributeProductValue,
    AttributeSet,
    Path,
    ProductScore,
    Reviews,
    PositionStatusType,
    StatusType,
    CombineStatus
} from '../../../models/models';
import { Subscription } from 'rxjs';
import { Title, Meta } from '@angular/platform-browser';
import { AppService, ProductStatusService } from '../../../services';
import { MainService } from '../main.service';
import { LoadingService } from '../../../services/loading.service';
import { ProductDetailsService } from './product-details.service';
import { Lightbox, LightboxEvent, LIGHTBOX_EVENT } from 'ngx-lightbox';
import { PlatformService } from '../../../services/platform.service';
import { Location } from '@angular/common';
import { CrystalLightbox } from 'ngx-crystal-gallery';

@Component({
    selector: 'product-details-view',
    templateUrl: 'product-details.view.html',
    styleUrls: ['product-details.view.scss']
})
export class ProductDetailsView implements OnInit, OnDestroy {
    public salePrice: number = 0
    public reviews: Reviews[] = []
    public activeSizeItem: number = 0;
    public activeTabItem: string = 'description';
    public count: number = 1;
    public isSale: boolean = false
    private _product: ProductFull = new ProductFull();
    private _subscription: Subscription = new Subscription();
    private _paramsSubscription: Subscription = new Subscription();
    public mainImage: string = '';
    public routeSteps = [
        { label: 'Главная', url: '/', queryParams: {}, status: '' },
    ];
    public statusArray: StatusType[] = []
    public position: PositionStatusType[] = []
    private _combinedProducts: CombinedProduct[] = [];
    private _selectedAttributse: { id: string; value: string }[] = []
    private _combinedAttributes: CombinedAttribute[] = [];
    private _productRating: number = 0;
    public activeIcon: string;
    public isBrowser: boolean = false;
    public isActive: boolean = false;
    private _isFavorite: boolean;
    private _id: string | number;
    private _existStatusArray: CombineStatus[] = []
    constructor(
        @Inject('FILE_URL') public fileUrl: string,
        private _matDialog: MatDialog,
        private _activatedRoute: ActivatedRoute,
        private _titleService: Title,
        private _appService: AppService,
        private _mainService: MainService,
        private _metaService: Meta,
        private _loadingService: LoadingService,
        private _productDetailsService: ProductDetailsService,
        private _lightbox: Lightbox,
        private _lightboxEvent: LightboxEvent,
        private _platformService: PlatformService,
        private _location: Location,
        private _router: Router,
        private _productStatusService: ProductStatusService,
        private _crystalLightbox: CrystalLightbox
    ) {
        this.position = this._productStatusService.getPositionStatus();
        this.statusArray = this._productStatusService.getStatusArray()
        this.isBrowser = this._platformService.isBrowser;
        this._checkProductId();

    }

    ngOnInit() { }

    public getPosition(status: CombineStatus) {
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
            this.isSale = true;
            this._existStatusArray.push({ name: 'Спецпредложения' })
            let specificPrice = +this._product.specificPrice;
            let realPrice = +this._product.price_with_vat;
            this.salePrice = +(100 * (realPrice - specificPrice) / realPrice).toFixed(2)
        }
        this._complateArray()

    }
    private _checkIsFavorite(id: string | number): void {
        if (this._mainService.isAuthorized) {
            this.activeIcon = '';
            this._productDetailsService.getFavoriteBookmark(id).subscribe((data: ServerResponse<boolean>) => {
                this._isFavorite = data.messages;
                this.activeIcon = this._isFavorite ? 'favorite' : 'favorite_border'
            })
        }
    }
    private _openBuyOneClickModal(): void {
        let matDialog = this._matDialog.open(BuyOneClickModal, {
            width: '504px',
            minHeight: '231px',
            maxHeight: '80vh'
        })
    }

    private _checkProductId(): void {
        this._paramsSubscription = this._activatedRoute.params.subscribe((params) => {
            if (params && params.productId && (params.productId.toLowerCase() != 'undefined' && params.productId.toLowerCase() != 'null')) {
                this._id = params.productId;
                this._getProduct(params.productId);
                this._getProductReviews(this._id);
                this._checkIsFavorite(this._id);
            }
            else {
                this._router.navigate(['/not-found'])
            }
        })
    }

    private _setProductToBasket(): void {
        this._product['count'] = this.count;
        this._mainService.addProductBasket(this._product);
    }

    private _setRouteSteps(step: { label: string, url: string, queryParams: object, status: string }): void {
        this.routeSteps.push(step);
    }
    private _getProductReviews(productId: string | number) {
        this._loadingService.showLoading();
        this._mainService.getReview(productId).subscribe((data: ServerResponse<Reviews[]>) => {
            this.reviews = data.messages;
        })
    }
    private _getProduct(id: string): void {
        this._subscription.unsubscribe();
        this._loadingService.showLoading();
        this.routeSteps = [{ label: 'Главная', url: '/', queryParams: {}, status: '' }];
        this._combinedAttributes = [];

        this._subscription = this._productDetailsService.getProductById(id).subscribe((data: ServerResponse<ProductFull>) => {
            this._product = data.messages;
            if (this._id !== this._product.alias) {
                this._location.go(`/product/${this._product.alias}`)
            }
            let isPerviousVersion: boolean = this._checkIsPerviousVersion();
            if (isPerviousVersion)
                this._location.go(`/product/${this._product.alias}`);
            this._getStatusProducts()
            this._calcProductRating(this._product.productScore);
            this._metaService.updateTag(
                { name: 'description', content: this._product.description },
            )
            this._metaService.addTag({ name: 'keywords', content: this._product.keywords })
            this.mainImage = window.innerWidth > 920 ?
                this._appService.checkPropertyValue(data.messages, 'smallImage') : this._appService.checkPropertyValue(data.messages, 'image');
            let paths: Path[] = this._product.path.reverse();
            paths.forEach((element, index) => {
                if (index == 0) {
                    this._setRouteSteps({ label: element.name, url: `/catalog`, queryParams: { parentcategoryname: paths[0].name, parentcategoryid: paths[0].categoryId }, status: '' });
                }
                else {
                    this._setRouteSteps({ label: element.name, url: `/catalog`, queryParams: { parentcategoryname: paths[0].name, parentcategoryid: paths[0].categoryId, categoryname: element.name, categoryid: element.categoryId }, status: '' });
                }
            })
            this._setRouteSteps({ label: this._product.name, url: `/catalog/${this._product.alias}`, queryParams: {}, status: '' });
            this._titleService.setTitle(this._product.title);

            this._product.combineAttribute.forEach((item: AttributeSet) => {
                this._combinedAttributes.push({ attribute_id: item.attribute_id, values: [], name: item.name })
            })
            let main: CombinedProduct = { product_id: this._product.id.toString(), values: [] }
            this._product.attributeSet.forEach(((item: AttributeSet, index: number) => {
                item.AttributeProductValue.forEach((attributePvalue: AttributeProductValue) => {
                    this._combinedAttribute(attributePvalue)
                    this._selectedAttributse.push({ id: attributePvalue.attribute_id, value: attributePvalue.value })
                    main.values.push({ id: attributePvalue.attribute_id, value: attributePvalue.value })
                })
            }))
            this._combinedProducts.push(main);
            this._product.likeProduct.forEach((item: LikeProduct, index) => {
                let combineP: CombinedProduct = { product_id: item.productId, values: [] }
                if (item.CombineProductAttribute && item.CombineProductAttribute.length > 0) {
                    item.CombineProductAttribute[0].ProductAttribute.forEach((pAttribute: AttributeProductValue, index) => {
                        this._combinedAttribute(pAttribute)
                        combineP.values.push({ id: pAttribute.attribute_id, value: pAttribute.value });
                    })
                }
                this._combinedProducts.push(combineP);
            })
            this._loadingService.hideLoading();
        },
            (err) => {
                this._router.navigate(['/not-found'])
            },
            () => {
                this._loadingService.hideLoading()
            })
    }

    // Redirect url from /catalog/:productId to /product/:productId
    private _checkIsPerviousVersion(): boolean {
        return this._router.url.includes(`/catalog/${this._product.alias}`)
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

    public handleSetRating($event): void {
        this._setProductRating($event);
    }

    public handleSelectedAttribute(attributeValue, attribute: CombinedAttribute) {
        this.changeSelectAttribute(attribute.attribute_id, attributeValue.value);
    }

    public changeSelectAttribute(id, value) {
        for (let k = 0; k < this._selectedAttributse.length; k++) {
            if (this._selectedAttributse[k].id == id) {
                this._selectedAttributse[k].value = value;
                this._findLikeProduct();
            }
        }
    }
    private _findLikeProduct() {
        for (let i = 0; i < this._combinedProducts.length; i++) {
            const product = this._combinedProducts[i];
            let like = true;
            for (let j = 0; j < product.values.length; j++) {
                const value = product.values[j];
                for (let k = 0; k < this._selectedAttributse.length; k++) {
                    const selected = this._selectedAttributse[k];
                    if (selected.id == value.id) {
                        if (selected.value != value.value) {
                            like = false;
                            break;
                        }
                    }
                }
                if (!like) break;
            }
            if (like) {
                this._getLikeProduct(product.product_id)
            }

        }

    }

    private _getLikeProduct(product_id) {
        this._loadingService.showLoading();
        this._product.productImages = [];
        this._subscription = this._productDetailsService.getProductById(product_id).subscribe((data: ServerResponse<ProductFull>) => {
            this._product = data.messages;
            this._calcProductRating(this._product.productScore);
            this.mainImage = this._appService.checkPropertyValue(data.messages, 'image');
            this._loadingService.hideLoading();
        },
            () => {
                this._loadingService.hideLoading()
            })
    }

    private _indexOf(array, value) {
        for (let index = 0; index < array.length; index++) {
            const element = array[index];
            if (element.value == value) return index;
        }
        return -1;
    }

    private _combinedAttribute(pAttribute: AttributeProductValue) {
        for (let index = 0; index < this._combinedAttributes.length; index++) {
            if (this._combinedAttributes[index].attribute_id == pAttribute.attribute_id) {
                if (this._indexOf(this._combinedAttributes[index].values, pAttribute.value) == -1) {
                    this._combinedAttributes[index].values.push({ value: pAttribute.value, available: true });
                }
                break;
            }
        }
    }


    public onClickMainImage(): void {
        let imageIndex: number = 0;
        let images = [];
        this._product.productImages.forEach((element, index) => {
            if (element.name === this.mainImage) {
                imageIndex = index;
            }
            images.push({ image: element.name })
        })
        let sm_albums = []
        let _albums = [];
        for (let img of images) {
            const src = this.fileUrl + 'products/' + img.image;
            const caption = this.fileUrl + 'products/' + img.image
            const thumb = this.fileUrl + 'products/' + img.image;
            const album = {
                src: src,
                caption: caption,
                thumb: thumb
            };
            sm_albums.push({
                preview: src,
                full: src,
            })
            _albums.push(album);
        }
        if (window.innerWidth > 920) {
            this._lightbox.open(_albums, imageIndex, { centerVertically: true });
            this._subscription = this._lightboxEvent.lightboxEvent$
                .subscribe(event => {
                    this._onReceivedEvent(event)
                });
            if (this._platformService.isBrowser)
                document.body.style.overflow = 'hidden';
        } else {
            this._crystalLightbox.open(sm_albums, { index: imageIndex,manasory:false, counter: true })
        }
    }
    private _onReceivedEvent(event: any): void {
        if (event.id === LIGHTBOX_EVENT.CLOSE) {
            if (this._platformService.isBrowser) {
                document.body.style.overflow = 'auto';
                document.body.style.paddingRight = "0px"
            }
            this._subscription.unsubscribe();
        }
    }

    public handleMainImageEvent(event: number) {
        this.mainImage = this._product.productImages[event].name;
    }

    public addOrRemoveBookmark(): void {
        this._loadingService.showLoading()

        if (this._isFavorite && this.activeIcon == 'favorite') {

            this._productDetailsService.deleteBookmark(this._id).subscribe(() => {
                this.activeIcon = 'favorite_border';
                this._isFavorite = false;
                this._loadingService.hideLoading()
            },
                () => {
                    this._loadingService.hideLoading()
                })
        } else {
            if (!this._isFavorite && this.activeIcon == 'favorite_border') {
                this._productDetailsService.addBookmark(this._id).subscribe(() => {
                    this.activeIcon = 'favorite';
                    this._isFavorite = true;
                    this._loadingService.hideLoading()
                },
                    () => {
                        this._loadingService.hideLoading()
                    })
            }
        }
    }
    public onClickTabItem(itemType: string): void {
        this.activeTabItem = itemType;
    }

    public onClickIncrement(): void {
        this.count++;
    }

    public onClickDecrement(): void {
        if (this.count == 1) {
            return;
        }
        this.count--;
    }

    public onClickBuyOneClick(): void {
        this._openBuyOneClickModal();
    }

    public onClickAddBasket(): void {
        this._setProductToBasket();
    }

    get product(): ProductFull {
        return this._product;
    }

    get combinedAttributes(): CombinedAttribute[] {
        return this._combinedAttributes
    }

    get productRating(): number {
        return this._productRating;
    }

    get isAuthorized(): boolean {
        return this._mainService.isAuthorized();
    }

    get bonusPrice(): number {
        let bonusPrice = 0;
        if (this._mainService.isAuthorized) {
            bonusPrice = (+this._product.price_with_vat * +this._mainService.getUserInfo().percent) / 100;
        }
        return bonusPrice;
    }

    get id(): number | string {
        return this._id
    }

    get existStatusArray(): CombineStatus[] {
        return this._existStatusArray
    }

    ngOnDestroy() {
        this._subscription.unsubscribe();
        this._paramsSubscription.unsubscribe();
        this._metaService.updateTag({ name: 'description', content: '' });
        this._metaService.updateTag({ name: 'keywords', content: '' });
    }
}