import { Component, OnInit, Inject } from '@angular/core';
import { FormGroup, Validators, FormBuilder, FormControl } from '@angular/forms';
import { Product, ServerResponse, CityCountry, Addresses } from '../../../models/models';
import { MainService } from '../main.service';
import { BasketService } from './basket.service';
import { AppService } from '../../../services';
import { MessageService } from 'primeng/api';
import { ActivatedRoute, Router } from '@angular/router';
import { ShippingPrice, CarrierType, PromoCode } from './basket.models';
import { Title } from '@angular/platform-browser';
import { CookieService } from '../../../services/cookie.service';
import { PlatformService } from '../../../services/platform.service';
import { LoadingService } from '../../../services/loading.service';

@Component({
    selector: 'basket-view',
    templateUrl: 'basket.view.html',
    styleUrls: ['basket.view.scss']
})
export class BasketView implements OnInit {
    private _isGet: boolean = false
    private _orderForm: FormGroup;
    public basketProducts: Product[] = [];
    public routeSteps = [];
    public cities: CityCountry[] = [];
    public orderStep: number = 1;
    public carrierTypes: CarrierType[] = [];
    public message: string = '';
    public error: boolean = false;
    public loading: boolean = false;
    public promoCodeLoading: boolean = false;
    private _promoCodeFormControl = new FormControl(null, Validators.required);
    private _promoCode;
    public promoCodeMessage: string;
    public isPromocode: boolean = false;
    private _totalPrice: number;
    public shippingMessage: string = '';
    public isPaymentChecked: boolean = false;
    public shippingPrice: number = 0;
    private _fullPrice: number = 0;
    private _submited: boolean = false;
    public isPack: boolean = false;
    public isPayNow: boolean = false;
    public visibleCarrierTypes: CarrierType[] = [];
    public _currierInfo: any;
    public _localShippingInfo: ShippingPrice = {} as ShippingPrice
    public isFreeShipping: boolean = false;
    public codPrice: number = 0;
    public makeOrderError: string = 'Ошибка';
    public allAddresses: Addresses[];
    public isDiscount: boolean = false
    public isRegistration: boolean;
    private _isHasMainAddress: boolean = false;
    private _productIdArray: Array<number> = []
    private _type: number;
    public paymentMethods = [
        { id: 0, header: 'Оплатить сейчас', under: 'Банковскими картами', percent: 0 },
        { id: 1, header: 'При получении', under: 'Наличными или картой курьеру', percent: 0 },
        { id: 4, header: 'Почта России', under: 'НАЛОЖЕННЫЙ ПЛАТЕЖ 4,5%', percent: 4.5 },
        { id: 5, header: 'ТК «СДЭК»', under: 'НАЛОЖЕННЫЙ ПЛАТЕЖ 3%', percent: 3 }
    ]

    public visiblePaymentMethods = [];

    constructor(
        private _fb: FormBuilder,
        private _mainService: MainService,
        private _basketService: BasketService,
        private _appService: AppService,
        private _messageService: MessageService,
        private _activatedRoute: ActivatedRoute,
        private _router: Router,
        private _title: Title,
        private _cookieService: CookieService,
        private _platformService: PlatformService,
        private _loadingService: LoadingService,
        @Inject("FILE_URL") private _fileUrl: string
    ) {
        this._getBasketProducts();
        this._checkQueryParams();
        this.visiblePaymentMethods = this.paymentMethods;
    }

    ngOnInit() {
        this._formBuilder();
        this._setRouteSteps();
        this._setFormValues();
        this._getAllAddresses();
        this._getCities();
        this._getCarriers();
    }

    private _checkQueryParams(): void {
        let params = this._activatedRoute.snapshot.queryParams;
        if (params && params.orderId && params.lang) {
            this._checkPaymentVerification(params.orderId)
        }
        else {
            this.isPaymentChecked = true;
        }
    }

    private _formBuilder(): void {
        this._orderForm = this._fb.group({
            allAddress: [''],
            name: ['', Validators.required],
            phone: ['', [Validators.required, Validators.minLength(10)]],
            email: ['', [Validators.required, Validators.pattern(/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-z]{2,4}$/)]],
            comment: [''],
            city: [null, Validators.required],
            address: ['', Validators.required],
            index: ['', Validators.required],
            shipping_method: [null, Validators.required],
            payment_method: [null, Validators.required],
            isBonuce: [null],
            isBalance: [null]
        })
        this._orderForm.get('allAddress').valueChanges.subscribe((value: Addresses) => {
            this._setValueAfterSelectAddress(value)

        })
        this._orderForm.controls.shipping_method.valueChanges.subscribe((data) => {
            this._orderForm.get('payment_method').reset();
            if (data == 4 || data == 5) {
                //this._orderForm.get('payment_method').setValue(data);
                //this._orderForm.get('payment_method').disable();
            }
            else {
                this._orderForm.get('payment_method').enable();
            }
            this._checkShippingPrice(this._appService.checkPropertyValue(this._orderForm.get('city').value, 'id'), data)
        })


        this._orderForm.controls.city.valueChanges.subscribe((data) => {
            if (this._orderForm.get('shipping_method').value) {
                this._checkShippingPrice(this._appService.checkPropertyValue(data, 'id'), this._orderForm.get('shipping_method').value);
            }
            this._setVisibleCarriers(data);
            this._setVisiblePayMethods(data);
        })

        this._orderForm.get('payment_method').valueChanges.subscribe((data) => {
            if (data == 4 || data == 5) {
                let currer = this.paymentMethods.filter((element) => element.id === data)[0];
                if (currer) {
                    this._currierInfo = currer;
                    this.codPrice = this._totalPrice * currer.percent / 100
                }
            }
            else {
                this.codPrice = 0;
            }
            if (data == 0 && this._orderForm.get('shipping_method').value == 4 || this._orderForm.get('shipping_method').value == 5)
                this._checkShippingPrice(this._appService.checkPropertyValue(this._orderForm.get('city').value, 'id'), this._orderForm.get('shipping_method').value);
        })

        this._orderForm.get('payment_method').valueChanges.subscribe((data) => {
            if (data == '0') {
                this.isPayNow = true;
            }
            else {
                this.isPayNow = false;
            }
        })
    }
    private _setValueAfterSelectAddress(value: Addresses): void {
        this._orderForm.patchValue({
            address: value.address,
            index: value.index
        })
    }
    private _setFormValues(): void {
        if (this._mainService.isAuthorized) {
            this._mainService.getUser().subscribe((data) => {
                this._orderForm.patchValue({
                    name: data.name,
                    phone: data.phone,
                    email: data.email
                })
            })
        }
    }
    private _getBasketProductsByRequest(productIds: string): void {
        this._loadingService.showLoading()
        this._basketService.getBasketProducts(productIds).subscribe((data: ServerResponse<Product[]>) => {
            this.basketProducts = data.messages;
            this._setBasketProductCount()
            this._loadingService.hideLoading();
            this._isGet = true;
        },
            () => {
                this._isGet = true
                this._loadingService.hideLoading()
            })
    }
    private _checkBasketProducts(): void {
        if (this._platformService.isBrowser) {
            if (JSON.parse(localStorage.getItem('basket_products'))) {
                let basket = JSON.parse(localStorage.getItem('basket_products'))
                if ((this.basketProducts.length !== basket.length)) {
                    if (this.basketProducts.length > basket.length) {
                        this.basketProducts.forEach((data, i) => {
                            let index = basket.indexOf(data);
                            if (index == -1) {
                                this.basketProducts.splice(i, 1)
                            }
                        })
                    }
                }
            }
        }
    }
    private _setBasketProductCount(): void {
        let basket = JSON.parse(localStorage.getItem('basket_products'));
        basket.forEach((data: Product) => {
            this.basketProducts.forEach((product) => {
                if (data.id == product.id) {
                    product['count'] = data.count
                }
            })
        })
    }
    private _getBasketProducts(): void {
        if (this._platformService.isBrowser) {
            if (JSON.parse(localStorage.getItem('basket_products'))) {
                let idArray: Array<number> = []
                let basket = JSON.parse(localStorage.getItem('basket_products'))
                basket.forEach((data: Product) => {
                    idArray.push(data.id)
                })
                this._getBasketProductsByRequest(idArray.join())
            } else {
                this._isGet = true
            }
        }
    }

    private _getCities() {
        this._mainService.getCities().subscribe((data: ServerResponse<CityCountry[]>) => {
            this.cities = data.messages;
            this._setUserCity();
        })
    }
    private _getAllAddresses() {
        if (this._cookieService.get('accessToken')) {
            this._basketService.getAllAddresses().subscribe((data: ServerResponse<Addresses[]>) => {
                this.allAddresses = data.messages;
                for (let address of this.allAddresses) {
                    if (address.status == '1') {
                        this._isHasMainAddress = true
                    }
                }
                this._setMainAddress();
            })
        }
    }
    private _setMainAddress(): void {
        if (this._isHasMainAddress) {
            let mainAddress = this.allAddresses.filter((data) => {
                return data.status == "1"
            })[0]
            this._orderForm.patchValue({
                allAddress: mainAddress
            })
            this._setValueAfterSelectAddress(this._orderForm.get('allAddress').value)
        }
    }
    private _setUserCity(): void {
        let city: CityCountry = this._appService.checkPropertyValue(this.cities.filter((element) => element.id === this._mainService.getUserInfo().cityCountryId), 0);
        this._orderForm.patchValue({
            city: city
        })
        
    }

    private _setRouteSteps(): void {
        this._title.setTitle('Корзина');
        this.routeSteps.push(
            { label: 'Главная', url: '/', queryParams: {}, status: '' },
            { label: 'Корзина', url: '/basket', queryParams: {}, status: '' }
        )
    }

    private _getCarriers(): void {
        this._basketService.getCarriers().subscribe((data) => {
            this.carrierTypes = data.messages;
            this._setVisibleCarriers(this.orderForm.get('city').value);
        })
    }

    private _checkPaymentVerification(orderId: string): void {
        this.isPaymentChecked = false;
        this._basketService.checkVerifyPayment(orderId).subscribe(
            (data) => {
                if (this._platformService.isBrowser)
                    localStorage.removeItem('basket_products')
                this.basketProducts = [];
                this._mainService.checkUserBasketPrice();
                this.message = `Спасибо Ваш платеж успешно совершен! (Номер заказа - ${data.orderId})`
                this.isPaymentChecked = true;
            },
            (error) => {
                this.message = `Ваш платеж НЕ совершен! (${error.error.data.ErrorMessage})`;
                this.isPaymentChecked = true;
            })
    }

    private _checkShippingPrice(cityId, currerId: number): void {
        if (currerId)
            this._basketService.checkShippingPrice(cityId, currerId).subscribe((data: ServerResponse<ShippingPrice>) => {
                this._localShippingInfo = data.messages;
                let shippingPrice: ShippingPrice = data.messages;
                if (shippingPrice.priceForFree && this._totalPrice >= +shippingPrice.priceForFree) {
                    this.shippingMessage = 'Бесплатная доставка';
                    this.shippingPrice = 0;
                    return;
                }
                else if (shippingPrice.price == '0.00') {
                    this.shippingMessage = 'Бесплатная доставка';
                    this.shippingPrice = 0;
                    return;
                }
                else {
                    this.shippingMessage = `Доставка +${+shippingPrice.price} ₽`;
                    this.shippingPrice = +shippingPrice.price;

                }
                return;
            })
    }

    public handleDeleteEvent(index: number): void {
        let deletedProductId = this.basketProducts[index]['id'];
        if (this._promoCode) {
            delete this._promoCode[deletedProductId];
        }
        this.basketProducts.splice(index, 1);
        this._productIdArray.splice(index, 1)
        if (this._platformService.isBrowser) {
            let product = JSON.parse(localStorage.getItem('basket_products'));
            let deletedProduct: Product = product.filter((data) => {
                return data.id == deletedProductId
            })[0]
            let index: number = product.indexOf(deletedProduct);
            if (index > -1) {
                product.splice(index, 1);
                localStorage.setItem('basket_products', JSON.stringify(product));
            }
        }

        if (this.isPromocode) {
            this._calculatePromocodeDiscountPrice()
        }
        this._mainService.checkUserBasketPrice();
    }

    public onClickMakeOrder(): void {
        if (this.orderStep == 1) {
            this._submited = true;
            this.orderStep = 2;
            this._router.navigate([], { relativeTo: this._activatedRoute })
        }
        if (this.orderStep == 2) {
            if (this._orderForm.valid) {
                this._makeOrder();
            }
        }
    }

    public onClickisPack() {
        this.isPack = !this.isPack;
    }

    public onClickPayNow(event) {
        if (event && this._orderForm.get('payment_method').disabled) {
            if (event.id == 0 || event.id === this._orderForm.get('shipping_method').value) {
                this._orderForm.get('payment_method').setValue(event.id);
            }
        }
    }

    private _makeOrder(): void {
        this.loading = true;
        let cartRuleId = '0';
        for (let id of this._productIdArray) {
            cartRuleId = this._type == 1 ? (this._promoCode['id'] ? this._promoCode['id'] : '0') : (this._promoCode[id] ? this._promoCode[id]['id'] : '0');
            if (cartRuleId !== '0') {
                break
            }
        }
        this._basketService.makeOrder({
            fullName: this._orderForm.get('name').value,
            email: this._orderForm.get('email').value,
            phone: this._orderForm.get('phone').value.startsWith('+7') ? this._orderForm.get('phone').value : '+7' + this._orderForm.get('phone').value,
            cityCountryId: this._appService.checkPropertyValue(this._orderForm.get('city').value, 'id'),
            address: this._orderForm.get('address').value,
            index: this._orderForm.get('index').value,
            carrier_id: this._orderForm.get('shipping_method').value,
            isCash: this._orderForm.get('payment_method').value,
            total: this._mainService.getUserInfo().basketPrice,
            products: this.basketProducts,
            comment: this._orderForm.get('comment').value,
            packeting: (this.isPack) ? '1' : '0',
            cartRuleId: cartRuleId,
            user_id: (this._mainService.isAuthorized) ? this._mainService.getUserInfo().id : null,
            isBonus: (this._orderForm.get('isBonuce').value) ? this._orderForm.get('isBonuce').value : false,
            isBalance: (this._orderForm.get('isBalance').value) ? this._orderForm.get('isBalance').value : false
        }, this._mainService.isAuthorized()).subscribe(
            (data) => {
                this.loading = false;
                if (data.error) {
                    this.error = true;
                    //this.makeOrderError = data.message;
                    this.makeOrderError = `Введите правильный email`
                    return;
                }
                this.error = false;
                this._messageService.add({ severity: 'success', summary: 'Сообщение', detail: 'Спасибо! Ваш заказ успешно принят' })
                if (data && data.orderId) {
                    if (data.isCash == 0 || data.isCash == 4 || data.isCash == 5) {
                        if (data.paymant) {
                            let responseData = JSON.parse(data.paymant);
                            if (responseData.orderId && data.pay) {
                                window.location.href = responseData.formUrl;
                            }
                            else {
                                if (this._platformService.isBrowser)
                                    localStorage.removeItem('basket_products');
                                this._mainService.checkUserBasketPrice();
                                this.basketProducts = [];
                                this.orderStep = 1;
                                this.message = `Спасибо! Ваш заказ успешно принят (Номер заказа - ${data.orderId})`
                            }
                        }
                        else {
                            if (this._platformService.isBrowser)
                                localStorage.removeItem('basket_products');
                            this._mainService.checkUserBasketPrice();
                            this.basketProducts = [];
                            this.orderStep = 1;
                            this.message = `Спасибо! Ваш заказ успешно принят (Номер заказа - ${data.orderId})`
                        }
                    }
                    else {
                        if (this._platformService.isBrowser)
                            localStorage.removeItem('basket_products');
                        this._mainService.checkUserBasketPrice();
                        this.basketProducts = [];
                        this.orderStep = 1;
                        this.message = `Спасибо! Ваш заказ успешно принят (Номер заказа - ${data.orderId})`
                    }
                }

            },
            (error) => {
                this.error = true;
                this.loading = false;
            })
    }



    private _setVisibleCarriers(city: CityCountry): void {
        if (city) {
            if (city.region === 3) {
                this.visibleCarrierTypes = this.carrierTypes.filter((element) => element.id === 4 || element.id === 5);
            }
            if (city.region === 2) {
                this.visibleCarrierTypes = this.carrierTypes;
            }
            if (city.region === 1) {
                this.visibleCarrierTypes = this.carrierTypes.filter((element) => element.id === 2 || element.id === 3);
            }
            if (city.region === 4) {
                this.visibleCarrierTypes = this.carrierTypes.filter((element) => element.id === 2 || element.id === 4 || element.id === 5)
            }
        }
        let filteredArr = this.visibleCarrierTypes.filter((element) => element.id == this._orderForm.get('shipping_method').value)
        if (filteredArr.length == 0) {
            this._orderForm.get('shipping_method').reset();
        }
    }

    private _setVisiblePayMethods(city: CityCountry): void {
        if (city) {
            if (city.region === 3 || city.region === 4) {
                this.visiblePaymentMethods = this.paymentMethods.filter((element) => element.id === 0 || element.id === 4 || element.id === 5);
            }
            if (city.region === 2) {
                this.visiblePaymentMethods = this.paymentMethods;
            }
            if (city.region === 1) {
                this.visiblePaymentMethods = this.paymentMethods.filter((element) => element.id === 0 || element.id === 1);
            }
        }
        let filteredArr = this.visiblePaymentMethods.filter((element) => element.id == this._orderForm.get('payment_method').value)
        if (filteredArr.length == 0) {
            this._orderForm.get('payment_method').reset();
        }
    }

    private _checkBasketPrice(): number {
        let price: number = 0;
        this.basketProducts.forEach((element) => {
            if (!this.isPromocode) {
                price += element.count * ((element.specificPrice) ? element.specificPrice : +element.price_with_vat);
            } else {
                price += element.count * +element.price_with_vat;
            }

        })
        return price;
    }
    private _checkDiscountPrice(): number {
        let price: number = 0;
        let discountPrice = 0;
        let promoPrice: number = 0;
        this.basketProducts.forEach((element) => {
            price = element.count * ((element && element.specificPrice) ? +element.specificPrice : 0);
            promoPrice = element.count * (element.promoDiscount ? element.discountType == 'Percent - order' ?
                (+element.price_with_vat - +element.price_with_vat * +element.promoDiscount) :
                +element.price_with_vat - +element.promoDiscount : +element.price_with_vat)
            if (price) {
                if ((element.both == 0 || element.both == null) && element.isHaveBoth) {
                    discountPrice += price < promoPrice ? price : promoPrice
                } else {
                    if (element.both == 1) {

                        discountPrice += element.count * (element.promoDiscount ? element.discountType == 'Percent - order' ?
                            (+element.specificPrice - +element.specificPrice * +element.promoDiscount) :
                            +element.specificPrice - +element.promoDiscount : +element.specificPrice);

                    } else {
                        discountPrice += price
                    }
                }
            } else {
                discountPrice += promoPrice
            }

        })
        return +discountPrice.toFixed(2)
    }
    public onClickGetDiscount(): void {
        if (this._promoCodeFormControl.valid && !this.promoCodeLoading && !this.isPromocode) {
            this._checkPromoCode();
        }
    }

    public checkUserBalance(type: string, text: string): string {
        if (this._mainService.isAuthorized && this.orderStep == 2) {
            return (+this._mainService.getUserInfo()[type] < this._fullPrice) ? `Ваш  ${text} не достаточно для оплаты` : null;
        }
    }

    public setDisabledPaymentMethods(paymethod): string {
        let shipMethod = this._orderForm.get('shipping_method').value;
        if (!shipMethod) {
            return 'disabled';
        }
        if (shipMethod == 4 && (paymethod.id !== 4 && paymethod.id !== 0)) {
            return 'disabled';
        }
        if (shipMethod == 5 && (paymethod.id !== 5 && paymethod.id !== 0)) {
            return 'disabled';
        }
        if ((shipMethod == 3 || shipMethod == 2) && (paymethod.id !== 0 && paymethod.id !== 1)) {
            return 'disabled';
        }
        return ''
    }
    private _checkPromoCode(): void {
        this._productIdArray = []
        this.promoCodeLoading = true;
        if (this._platformService.isBrowser) {
            if (localStorage.getItem('basket_products')) {
                let basket = JSON.parse(localStorage.getItem('basket_products'))
                if (this.basketProducts.length !== basket.length) {
                    if (this.basketProducts.length > basket.length) {
                        this.basketProducts.forEach((data, i) => {
                            let index = basket.indexOf(data);
                            if (index == -1) {
                                this.basketProducts.splice(i, 1)
                            }
                        })
                    }
                }
            }
        }
        if (this.basketProducts) {
            for (let product of this.basketProducts) {
                this._productIdArray.push(product['id'])
            }
        }
        this._basketService.checkPromoCode(this._promoCodeFormControl.value, this._productIdArray).subscribe(
            (data: ServerResponse<PromoCode>) => {
                this._promoCode = data.messages;
                this._type = data.type
                this.isPromocode = true;
                this.promoCodeMessage = `Успешно активирован промокод`;
                this.promoCodeLoading = false;
                this.isDiscount = true
                this._calculatePromocodeDiscountPrice()
            },
            (error) => {
                this.promoCodeMessage = 'Неправильный промокод';
                this.promoCodeLoading = false;
            })
    }

    private _calculatePromocodeDiscountPrice() {
        this._checkBasketProducts()
        let promoCodeLength: number = this.basketProducts.length;
        let count: number = 0;
        let salePrice;
        let discountType: string;
        if (this._type == 1) {
            for (let id of this._productIdArray) {
                if (this._promoCode['reduction_amount'] !== 0) {
                    if (this._promoCode['discount_type'] == "Percent - order") {
                        salePrice = +this._promoCode['reduction_amount'] / 100;
                        discountType = "Percent - order"
                    } else {
                        salePrice = +this._promoCode['reduction_amount'];
                        discountType = "Amount - order"
                    }
                }
                if (salePrice)
                    this.basketProducts.forEach((data) => {
                        if (data['id'] == id) {
                            data['promoDiscount'] = +salePrice;
                            data['discountType'] = discountType;
                            data['both'] = this._promoCode['both'];
                            data['isHaveBoth'] = true
                        }
                    })
            }
        } else {
            for (let id of this._productIdArray) {
                if (this._promoCode[id] == 0) {
                    count++
                }
            }
            if (count == promoCodeLength) {
                this.isDiscount = false
            } else {
                this.isDiscount = true;
                for (let id of this._productIdArray) {
                    let salePrice;
                    let discountType: string;
                    if (this._promoCode[id] !== 0) {
                        if (this._promoCode[id]['discount_type'] == "Percent - order") {
                            salePrice = +this._promoCode[id]['reduction_amount'] / 100;
                            discountType = "Percent - order"
                        } else {
                            salePrice = +this._promoCode[id]['reduction_amount'];
                            discountType = "Amount - order"
                        }
                    }

                    if (salePrice)
                        this.basketProducts.forEach((data) => {
                            if (data['id'] == id) {
                                data['promoDiscount'] = +salePrice;
                                data['discountType'] = discountType;
                                data['both'] = this._promoCode[id]['both'];
                                data['isHaveBoth'] = true
                            }
                        })
                }
            }
        }
    }
    get discountPrice(): number {
        let totalPrice: number = this._checkBasketPrice();
        if (this.isPromocode) {
            totalPrice = this._checkDiscountPrice()
        }
        if (this.isPack) {
            totalPrice += 150;
        }
        this._totalPrice = totalPrice;
        return totalPrice;
    }
    get orderForm(): FormGroup {
        return this._orderForm;
    }

    get totalPrice(): number {
        let totalPrice: number = this._checkBasketPrice();
        if ((this.isPack && !this.isPromocode) || (this.isPack && !this.isDiscount && this.isPromocode)) {
            totalPrice = totalPrice + 150;
        }
        if (!this.isPromocode || (!this.isDiscount && this.isPromocode)) {
            this._totalPrice = totalPrice;
            if (this._totalPrice < +this._localShippingInfo.priceForFree) {
                this.shippingPrice = +this._localShippingInfo.price;
                this.shippingMessage = `Доставка +${this.shippingPrice} ₽`;
            }
            else {
                this.shippingPrice = 0;
                this.shippingMessage = `Бесплатная доставка`;
            }
        }
        return +totalPrice.toFixed(2);
    }



    get promoCodeFormControl(): FormControl {
        return this._promoCodeFormControl;
    }

    get fileUrl(): string {
        return this._fileUrl;
    }

    get isAuthorized(): boolean {
        return this._mainService.isAuthorized();
    }

    get fullPrice(): string {
        let price = `${this._totalPrice} ₽`;
        let total = this._totalPrice + this.shippingPrice + this.codPrice;
        if ((this._orderForm.get('payment_method').value == 4 || this._orderForm.get('payment_method').value === 5) && (this._orderForm.get('shipping_method').value == 4 || this._orderForm.get('shipping_method').value == 5) && this._currierInfo) {
            this.codPrice = this._checkBasketPrice() * this._currierInfo.percent / 100;
        }
        if (this.codPrice != 0) {
            price += ` + ${this.codPrice} ₽`
        }
        if (this.shippingPrice != 0) {
            price += ` + ${this.shippingPrice} ₽`;
        }
        price += ` = ${total} ₽`
        this._fullPrice = this._totalPrice + this.shippingPrice + this.codPrice;
        return price;
    }

    get bonusPrice(): string {
        let message: string;
        let bonusPrice: number = 0;
        if (this._mainService.isAuthorized()) {
            if (this._mainService.getUserInfo().percent) {
                bonusPrice = ((this._fullPrice - this.shippingPrice) * +this._mainService.getUserInfo().percent) / 100;
                message = `Ваш бонус: ${bonusPrice} ₽`;
            }
        }
        return message;
    }

    get userBalance(): string {
        return this._mainService.getUserInfo().balance;
    }

    get userBonuce(): string {
        return this._mainService.getUserInfo().priceWithBonus;
    }

    get payNowPrice(): number {
        let paym = this.orderForm.get('payment_method').value;
        if (paym == 0) {
            return (this.isPromocode ? this.discountPrice + this.shippingPrice + this.codPrice : this.totalPrice + this.shippingPrice + this.codPrice);
        }
        else {
            if (paym == 4 || paym == 5) {
                if (this.shippingPrice == 0) {
                    return this.shippingPrice + this.codPrice + 300;
                }
                return this.shippingPrice + this.codPrice;
            }
        }
        return 0;
    }

    get payLaterPrice(): number {
        let paym = this.orderForm.get('payment_method').value;
        if (paym == 0) {
            return 0;
        }
        if (paym == 1) {
            return this.isPromocode ? this.discountPrice + this.shippingPrice : this.totalPrice + this.shippingPrice;
        }
        else {
            if (paym == 4 || paym == 5) {
                if (this.shippingPrice == 0) {
                    return this.isPromocode ? this.discountPrice - 300 : this.totalPrice - 300;
                }
                return this.isPromocode ? this.discountPrice : this.totalPrice;
            }
        }
        return 0;
    }
    get discountPayLaterPrice(): number {
        let laterPrice: number = this.payLaterPrice;

        if (this.isPromocode) {
            laterPrice = laterPrice - ((laterPrice * this._appService.checkPropertyValue(this._promoCode, 'reduction_amount')) / 100);
        }
        return laterPrice;
    }
    get isGet(): boolean {
        return this._isGet
    }
}