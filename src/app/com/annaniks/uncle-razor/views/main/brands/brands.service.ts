import { Injectable } from '@angular/core';
import { ServerResponse } from '../../../models/models';
import { Observable } from 'rxjs';
import { Brand } from './brands.models';
import { HttpClient } from '@angular/common/http';

@Injectable()
export class BrandsService {

    constructor(private _httpClient: HttpClient) { }

    public getBrands(): Observable<ServerResponse<Brand[]>> {
        return this._httpClient.get<ServerResponse<Brand[]>>('/brand');
    }

    public getBrandById(id: number, page: number, count: number, max, min) {
        return this._httpClient.get(`/brand/${id}/${page}/${count}/${max}/${min}`)
    }
}