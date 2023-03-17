import { Injectable } from "@angular/core";
import { HttpClient, HttpParams } from "@angular/common/http";
import { ServerResponse, ProductFull } from "../../../models/models";
import { Observable } from "rxjs";

@Injectable()
export class ProductDetailsService {
    constructor(private _httpClient: HttpClient) { }
    /**
     * 
     * @param id 
     */
    public getFavoriteBookmark(id: string | number) {
        let params = new HttpParams().set('isAuthorized', 'true');
        return this._httpClient.get(`/favorite/bookmark/${id}`, { params })
    }

    public getProductById(id: string): Observable<ServerResponse<ProductFull>> {
        return this._httpClient.get<ServerResponse<ProductFull>>(`/current/product/${id}`);
    }
    /**
     * 
     * @param id 
     */
    public deleteBookmark(id: string | number) {
        let params = new HttpParams().set('isAuthorized', 'true');

        return this._httpClient.delete(`/bookmark/${id}`, { params })
    }
    public addBookmark(id: string | number) {
        let params = new HttpParams().set('isAuthorized', 'true');

        return this._httpClient.post('/bookmark', { productId: id }, { params })
    }
}