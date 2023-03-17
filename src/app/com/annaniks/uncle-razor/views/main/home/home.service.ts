import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ServerResponse, ParfumeInfo, Product, SocialItem } from '../../../models/models';
import { Banner, Partner } from './home.models';
import { HttpClient } from '@angular/common/http';

@Injectable()
export class HomeService {

    constructor(private _httpClient: HttpClient) { }

    public getBanners(): Observable<ServerResponse<Banner[]>> {
        return this._httpClient.get<ServerResponse<Banner[]>>('/banner');
    }

    public getProductVideos(): Observable<ServerResponse<any>> {
        return this._httpClient.get<ServerResponse<any>>('/productvideos');
    }

    public getPartners(): Observable<ServerResponse<Partner[]>> {
        return this._httpClient.get<ServerResponse<Partner[]>>('/partners');
    }

    public getMagazineInfo(): Observable<ServerResponse<ParfumeInfo[]>> {
        return this._httpClient.get<ServerResponse<ParfumeInfo[]>>('/perfumes');
    }

    public getProductsByStatus(status: string): Observable<ServerResponse<Product[]>> {
        return this._httpClient.post<ServerResponse<Product[]>>('/status/product', {
            status: status
        })
    }

    public getSocialItems(): Observable<ServerResponse<SocialItem[]>> {
        return this._httpClient.get<ServerResponse<SocialItem[]>>('/socialnetworks')
    }

    public subscribeEmail(body): Observable<ServerResponse<any>> {
        return this._httpClient.post<ServerResponse<any>>('/subscriber', body)
    }
}