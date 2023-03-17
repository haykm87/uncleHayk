import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ServerResponse, Product } from '../../../models/models';
import { ShippingPrice, CarrierType, PromoCode } from './basket.models';
import { HttpClient, HttpParams } from '@angular/common/http';

@Injectable()
export class BasketService {

    constructor(private _httpClient: HttpClient) { }

    public getCarriers(): Observable<ServerResponse<CarrierType[]>> {
        return this._httpClient.get<ServerResponse<CarrierType[]>>('/carrier');
    }

    public makeOrder(body, isAuthorized: boolean): Observable<any> {
        let params = new HttpParams().set('isAuthorized', isAuthorized.toString());
        return this._httpClient.post('/order', body, { params });
    }

    public checkVerifyPayment(orderId: string): Observable<any> {
        return this._httpClient.get(`/order/${orderId}`)
    }

    public checkPromoCode(promocode: string, idsArray: Array<number>): Observable<ServerResponse<PromoCode>> {
        return this._httpClient.get<ServerResponse<PromoCode>>(`/cartrule/${promocode}?ids=${idsArray}`)
    }

    public checkShippingPrice(cityId: number, currerId: number): Observable<ServerResponse<ShippingPrice>> {
        return this._httpClient.get<ServerResponse<ShippingPrice>>(`/checkshippingprice/${cityId}/${currerId}`)
    }
    public getAddress() {
        let params = new HttpParams().set('isAuthorized', 'true');
        return this._httpClient.get('/me/address', { params })
    }
    public getAllAddresses() {
        let params = new HttpParams().set('isAuthorized', 'true');
        return this._httpClient.get('/address', { params })
    }
    public getBasketProducts(productIds:string){
        return this._httpClient.post<ServerResponse<Product[]>>(`/query/id/list`,{"name": productIds})
    }
}