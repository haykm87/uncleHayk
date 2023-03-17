import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ServerResponse, AnnouncementType, Announcement } from '../../../models/models';
import { HttpClient } from '@angular/common/http';

@Injectable()
export class DiscountService {

    constructor(private _httpClient: HttpClient) { }

    public getAnnouncmentType(): Observable<ServerResponse<AnnouncementType[]>> {
        return this._httpClient.get<ServerResponse<AnnouncementType[]>>('/announcmenttype');
    }

    public getDiscountInfo(id: number): Observable<ServerResponse<Announcement[]>> {
        return this._httpClient.get<ServerResponse<Announcement[]>>(`/announcment/${id}`)
    }
}