import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ServerResponse, Product } from '../../../models/models';
import { HttpClient } from '@angular/common/http';

@Injectable()
export class SearchService {

    constructor(private _httpClient: HttpClient) { }

    public searchProduct(search: string): Observable<ServerResponse<Product[]>> {
        return this._httpClient.post<ServerResponse<Product[]>>('/query/product', { name: search })
    }
}