import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ServerResponse } from '../../../models/models';
import { HttpClient, HttpParams } from '@angular/common/http';

@Injectable()
export class PersonalAreaService {

    constructor(private _httpClient: HttpClient) { }

    public getUser(): Observable<ServerResponse<any>> {
        let params = new HttpParams().set('isAuthorized', 'true');
        return this._httpClient.get<ServerResponse<any>>('/me', { params })
    }

    public getUserOrders(): Observable<ServerResponse<any>> {
        let params = new HttpParams().set('isAuthorized', 'true');
        return this._httpClient.get<ServerResponse<any>>('/user/order', { params });
    }

    public changeUser(body): Observable<ServerResponse<any>> {
        let params = new HttpParams().set('isAuthorized', 'true');
        return this._httpClient.put<ServerResponse<any>>('', body, { params });
    }

    public activateGiftCertificate(code: string): Observable<ServerResponse<any>> {
        let params = new HttpParams().set('isAuthorized', 'true');
        return this._httpClient.get<ServerResponse<any>>(`/giftcertificate/${code}`, { params });
    }
}