import { Component, OnInit, OnDestroy, Inject } from '@angular/core';
import { NewsService } from './news.service';
import { AppService } from '../../../services';
import { Announcement, ServerResponse, AnnouncementType } from '../../../models/models';
import { Title } from '@angular/platform-browser';

@Component({
    selector: 'news-view',
    templateUrl: 'news.view.html',
    styleUrls: ['news.view.scss']
})
export class NewsView implements OnInit, OnDestroy {
    private _news: Announcement[] = [];

    constructor(
        @Inject('FILE_URL') private _fileUrl: string,
        private _newsService: NewsService,
        private _appService: AppService,
        private _title: Title
    ) { }

    ngOnInit() {
        this._title.setTitle('Новости');
        this._getAnnouncmentType();
    }

    private _getAnnouncmentType(): void {
        this._newsService.getAnnouncmentType().subscribe((data: ServerResponse<AnnouncementType[]>) => {
            let id: number = this._appService.checkPropertyValue(this._appService.checkPropertyValue(this._appService.filterArray(data.messages, 'name', 'Новости'), 0), 'id');
            this._getNews(id);
        })
    }

    private _getNews(id: number): void {
        this._newsService.getNews(id).subscribe((data: ServerResponse<Announcement[]>) => {
            this._news = data.messages;
        })
    }


    get fileUrl(): string {
        return this._fileUrl;
    }

    get news() {
        return this._news;
    }

    ngOnDestroy() { }


}