import { Injectable } from '@angular/core';
import { MenuItemsService } from '../../services';
import { Observable, of } from 'rxjs';
import { ServerResponse, CityCountry, Setting, User, SocialItem, Product, AllSettings } from '../../models/models';
import { Category, AttributeFilter, Brand, Reduction } from './catalog/catalog.models';
import { map } from 'rxjs/operators';
import { MessageService } from 'primeng/api';
import { MatDialog } from '@angular/material';
import { AddProductBasketModal } from '../../modals/add-product-basket/add-product-basket.modal';
import { CookieService } from '../../services/cookie.service';
import { HttpClient, HttpParams, HttpHeaders } from '@angular/common/http';
import { PlatformService } from '../../services/platform.service';

@Injectable()
export class MainService {
    private _user: User = new User();
    private _isAuthorized: boolean = false;

    constructor(
        private _httpClient: HttpClient,
        private _messageService: MessageService,
        private _cookieService: CookieService,
        private _menuItemsService: MenuItemsService,
        private _platformService: PlatformService,
        private _matDialog: MatDialog,
    ) { }

    public getCategories(): Observable<ServerResponse<Category[]>> {
        return this._httpClient.get<ServerResponse<Category[]>>('/category');
    }

    public getCategoriesMenu(): Observable<ServerResponse<Category[]>> {
        return this._httpClient.get<ServerResponse<Category[]>>('/category/menu')
    }

    public getCities(): Observable<ServerResponse<CityCountry[]>> {
        return this._httpClient.get<ServerResponse<CityCountry[]>>('/citycountry');
    }
    public getCountries(): Observable<ServerResponse<CityCountry[]>> {
        return this._httpClient.get<ServerResponse<CityCountry[]>>('/city');
    }
    public getSettingsAll(): Observable<ServerResponse<AllSettings>> {
        return this._httpClient.get<ServerResponse<AllSettings>>('/settings/all')
    }
    public getUser(): Observable<User> {
        let accessToken = this._cookieService.get('accessToken');
        if (accessToken) {
            let params = new HttpParams().set('isAuthorized', 'true');
            return this._httpClient.get('/me', { params }).pipe(
                map((data: any) => {
                    this._user = data.data[0];
                    this.checkUserBasketPrice();
                    this._isAuthorized = true;
                    return this._user;
                })
            );
        }
        else {
            return of()
        }
    }

    public checkUserBasketPrice(): void {
        this._user['basketPrice'] = 0;
        if (this._platformService.isBrowser) {
            let baskekProducts = localStorage.getItem('basket_products');
            if (baskekProducts) {
                let products: any[] = JSON.parse(baskekProducts)
                products.forEach((element) => {
                    this._user['basketPrice'] += element.count * ((element && element.specificPrice) ? +element.specificPrice : +element.price_with_vat);
                })
            }
        }
    }

    public changePassword(password: string, oldPassword: string): Observable<any> {
        let params = new HttpParams().set('isAuthorized', 'true');
        return this._httpClient.put('/password', {
            password: password,
            oldPassword: oldPassword
        }, { params })
    }

    public addProductBasket(product): void {
        let productsItems = [];
        if (this._platformService.isBrowser) {
            let products = localStorage.getItem('basket_products');
            if (products) {
                productsItems = JSON.parse(products);
                productsItems.forEach((data, index) => {
                    if (data.id == product.id) {
                        productsItems.splice(index, 1);
                    }
                })
            }
            productsItems.push(product);
            localStorage.setItem('basket_products', JSON.stringify(productsItems));
        }
        this.checkUserBasketPrice();
        this._openAddProductBasketModal(product);
    }

    private _openAddProductBasketModal(product): void {
        let matDialog = this._matDialog.open(AddProductBasketModal, {
            width: '500px',
            minHeight: '300px',
            data: {
                product: product
            }
        })
        matDialog.afterClosed().subscribe((data) => {
            this._messageService.add({ severity: 'success', summary: 'Сообщение', detail: 'Успешно добавлен в корзину' })
        })
    }

    public getUserInfo(): User {
        return this._user;
    }

    public isAuthorized(): boolean {
        return this._isAuthorized;
    }

    public changeIsAuthorized(bool: boolean): void {
        this._isAuthorized = bool;
    }

    public backCall(body): Observable<ServerResponse<any>> {
        return this._httpClient.post<ServerResponse<any>>('/backcall', body)
    }

    public getSettings(): Observable<ServerResponse<Setting[]>> {
        return this._httpClient.get('/settings').pipe(
            map((settings: ServerResponse<Setting[]>) => {
                let sett = settings.messages;
                let pageSettings: { label: string, routerLink: string }[] = [];
                sett.forEach((element, index) => {
                    if (element.isPage && element.isPage == '1') {
                        pageSettings.push({ label: element.name, routerLink: '/settings/' + element.key })
                    }
                })
                this._menuItemsService.setMenuItems(pageSettings);
                return settings
            })
        )
    }

    public getSocialItems(): Observable<ServerResponse<SocialItem[]>> {
        return this._httpClient.get<ServerResponse<SocialItem[]>>('/socialnetworks')
    }

    public setUserCity(citycountryname: string): void {
        this._user.cityCountriesName = citycountryname;
    }

    public getAnnouncmentType(): Observable<any> {
        return this._httpClient.get('/announcmenttype');
    }

    public setProductRating(starsCount: number, productId: string | number): Observable<ServerResponse<any>> {
        let params = new HttpParams().set('isAuthorized', 'true');

        return this._httpClient.post<ServerResponse<any>>('/productscore', {
            scores: starsCount,
            productId: productId
        }, { params })
    }

    public recoverPassword(email: string): Observable<any> {
        return this._httpClient.put('/password/reset', {
            email: email
        })
    }

    public getSimiliarProducts(name: string): Observable<ServerResponse<string[]>> {
        return this._httpClient.post<ServerResponse<string[]>>('/query/product/like', {
            name: name
        })
    }
    public getProducts(categoryId: number, isParent: boolean = false, search: string = ''): Observable<ServerResponse<Product[]>> {
        return this._httpClient.post<ServerResponse<Product[]>>(`/product/${categoryId}/${isParent}`, {
            name: search,
            isSearch: (search && search.length > 0) ? true : false
        });
    }

    public getCategoriesById(id: string): Observable<ServerResponse<Category[]>> {
        return this._httpClient.get<ServerResponse<Category[]>>(`/category/${id}`);
    }


    public getAttributes(): Observable<ServerResponse<AttributeFilter[]>> {
        return this._httpClient.get<ServerResponse<AttributeFilter[]>>(`/attribut`);
    }

    public getBrands(): Observable<ServerResponse<Brand[]>> {
        return this._httpClient.get<ServerResponse<Brand[]>>(`/brand`);
    }
    public getSales(): Observable<ServerResponse<Reduction[]>> {
        return this._httpClient.get<ServerResponse<Reduction[]>>(`/reduction`);
    }
    public getReview(productId: string | number) {
        return this._httpClient.get(`/product-comment/${productId}`)
    }
    public addReview(commentBody) {
        let params = new HttpParams().set('isAuthorized', 'true');
        return this._httpClient.post('/productscomment', commentBody, { params })
    }
    public addImage(formData: FormData) {
        let params = new HttpParams().set('isAuthorized', 'true')
        return this._httpClient.post('/set/image', formData, { params: params, observe: 'response', 'responseType': 'text' })
    }

}