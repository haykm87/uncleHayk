import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ServerResponse, Announcement, AnnouncementType } from '../../../models/models';
import { HttpClient } from '@angular/common/http';

@Injectable()
export class NewsService {

    constructor(private _httpClient: HttpClient) { }

    public getAnnouncmentType(): Observable<ServerResponse<AnnouncementType[]>> {
        return this._httpClient.get<ServerResponse<AnnouncementType[]>>('/announcmenttype');
    }

    public getNews(id: number): Observable<ServerResponse<Announcement[]>> {
        return this._httpClient.get<ServerResponse<Announcement[]>>(`/announcment/${id}`)
    }

    public getNewsById(id: number) {
        return this._httpClient.get(`/current/announcment/${id}`)
    }
}