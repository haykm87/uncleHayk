import { Injectable } from '@angular/core';
import { ServerResponse, Announcement, AnnouncementType } from '../../../models/models';
import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';

@Injectable()
export class SettingsService {

    constructor(private _httpClient: HttpClient) { }

    public sendFeedback(body: { phone: string, email: string, message: string, name: string }): Observable<ServerResponse<any>> {
        return this._httpClient.post<ServerResponse<any>>('/feedback', body);
    }
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