import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ServerResponse, Product, ProductFull, CityCountry } from '../../../models/models';
import { Category, Brand, AttributeFilter } from './catalog.models';
import { HttpClient } from '@angular/common/http';


@Injectable()
export class CatalogService {

    constructor(private _httpClient: HttpClient) { }

    public getCategories(): Observable<ServerResponse<Category[]>> {
        return this._httpClient.get<ServerResponse<Category[]>>('/category');
    }

    public getProducts(categoryId: string, isParent: boolean = false, search: string = ''): Observable<ServerResponse<Product[]>> {
        return this._httpClient.post<ServerResponse<Product[]>>(`/product/${categoryId}/${isParent}`, {
            name: search,
            isSearch: (search && search.length > 0) ? true : false
        });
    }

    public getProductById(id: string): Observable<ServerResponse<ProductFull>> {
        return this._httpClient.get<ServerResponse<ProductFull>>(`/current/product/${id}`);
    }

    public getCategoriesById(id: string): Observable<ServerResponse<Category[]>> {
        return this._httpClient.get<ServerResponse<Category[]>>(`/category/${id}`);
    }

    public getCities(): Observable<ServerResponse<CityCountry[]>> {
        return this._httpClient.get<ServerResponse<CityCountry[]>>(`/city`);
    }

    public getAttributes(): Observable<ServerResponse<AttributeFilter[]>> {
        return this._httpClient.get<ServerResponse<AttributeFilter[]>>(`/attribut`);
    }

    public getBrands(): Observable<ServerResponse<Brand[]>> {
        return this._httpClient.get<ServerResponse<Brand[]>>(`/brand`);
    }
    public filterCategory(body) {
        return this._httpClient.post('/query/product/search', body)
    }
}