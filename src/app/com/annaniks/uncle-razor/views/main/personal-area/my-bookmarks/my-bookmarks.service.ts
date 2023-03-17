import { Injectable } from "@angular/core";
import { HttpClient, HttpParams } from "@angular/common/http";

@Injectable()
export class MyBookmarksService {
    constructor(private _httpClient: HttpClient) { }
    public getBookmarks() {
        let params = new HttpParams().set('isAuthorized', 'true');

        return this._httpClient.get('/bookmark', { params })
    }

}