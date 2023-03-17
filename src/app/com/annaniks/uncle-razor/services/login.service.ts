import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { LoginResponse } from '../models/models';
import { HttpClient } from '@angular/common/http';

@Injectable()
export class LoginService {

    constructor(private _httpClient: HttpClient) { }

    public userLogin(body): Observable<LoginResponse> {
        return this._httpClient.post<LoginResponse>('/login', body)
    }

    public registerUser(body): Observable<LoginResponse> {
        return this._httpClient.post<LoginResponse>('/register', body)
    }

}