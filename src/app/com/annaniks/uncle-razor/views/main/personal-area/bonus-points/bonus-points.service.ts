import { Injectable } from "@angular/core";
import { HttpClient, HttpParams } from "@angular/common/http";

@Injectable()
export class BonusPointsServices {
    constructor(private _httpClient: HttpClient) { }
    public getBonusPoints() {
        let params = new HttpParams().set('isAuthorized', 'true');

        return this._httpClient.get('/bonus', { params })
    }
}