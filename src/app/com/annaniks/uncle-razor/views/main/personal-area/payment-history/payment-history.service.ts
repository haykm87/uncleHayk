import { Injectable } from "@angular/core";
import { HttpClient, HttpParams } from "@angular/common/http";

@Injectable()
export class PaymentHistoryService {
    constructor(private _httpClient: HttpClient) { }
    public getHistory() {
        let params = new HttpParams().set('isAuthorized', 'true');

        return this._httpClient.get('/history', { params })
    }
}