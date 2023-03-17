import { Component, OnInit, ViewChild, ElementRef, Inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { MainService } from '../main.service';
import { Setting, ServerResponse, AnnouncementType, Announcement } from '../../../models/models';
import { AppService } from '../../../services';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { SettingsService } from './settings.service';
import { MessageService } from 'primeng/api';
import { Title, Meta } from '@angular/platform-browser';
import { PlatformService } from '../../../services/platform.service';


@Component({
    selector: 'settings-view',
    templateUrl: 'settings.view.html',
    styleUrls: ['settings.view.scss']
})
export class SettingsView implements OnInit {
    private _news: Announcement[] = [];
    private _settingName: string = '';
    private _settings: Setting[] = [];
    private _setting: Setting = {} as Setting;
    private _visibleContent: boolean = false;
    private _feedbackForm: FormGroup;
    private _loading: boolean = false;
    private _error: string;
    @ViewChild('iframe', { static: false }) private _iframeContent: ElementRef<HTMLElement>;

    constructor(
        private _activatedRoute: ActivatedRoute,
        private _router: Router,
        private _mainService: MainService,
        private _appService: AppService,
        private _fb: FormBuilder,
        private _settingService: SettingsService,
        private _messageService: MessageService,
        private _metaService: Meta,
        private _title: Title,
        @Inject('FILE_URL') private _fileUrl: string,
        private _platformService: PlatformService
    ) {
        this._checkQueryParams();
    }

    ngOnInit() {
        this._formBuilder();
        this._getSettings();
    }

    private _getAnnouncmentType(): void {
        this._settingService.getAnnouncmentType().subscribe((data: ServerResponse<AnnouncementType[]>) => {
            let id: number = this._appService.checkPropertyValue(this._appService.checkPropertyValue(this._appService.filterArray(data.messages, 'name', 'Новости'), 0), 'id');
            this._getNews(id);
        })
    }

    private _getNews(id: number): void {
        this._settingService.getNews(id).subscribe((data: ServerResponse<Announcement[]>) => {
            this._news = data.messages;
        })
    }

    private _checkQueryParams(): void {
        this._activatedRoute.params.subscribe((params) => {
            if (params && params.settingname) {
                this._settingName = params.settingname;
                if (this._settings && this._settings.length > 0)
                    this._findSetting();
            }
            else {
                this._router.navigate(['/']);
            }
        })
    }

    private _formBuilder(): void {
        this._feedbackForm = this._fb.group({
            name: [null, Validators.required],
            phone: [null, [Validators.required, Validators.minLength(10)]],
            email: [null, [Validators.required, Validators.pattern(/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-z]{2,4}$/)]],
            message: [null, Validators.required]
        })
    }

    private _getSettings(): void {
        this._mainService.getSettings().subscribe((data) => {
            this._settings = data.messages;
            this._findSetting();
        })
    }

    private _findSetting(): void {
        let setting: Setting = this._appService.checkPropertyValue(this._appService.filterArray(this._settings, 'key', this._settingName), 0);
        if (setting) {
            this._setting = setting;
            this._title.setTitle(setting.value);
            this._metaService.updateTag({ name: 'description', content: this._setting.metaDescription });
            if (this._setting.key.toLowerCase() === 'contacts') {
                let mapSetting: Setting = this._appService.checkPropertyValue(this._appService.filterArray(this._settings, 'key', 'maps'), 0);
                this._setting.map = mapSetting;
                this._visibleContent = true;
                setTimeout(() => {
                    if (this._platformService.isBrowser) {
                        this._iframeContent.nativeElement.innerHTML = mapSetting.description;
                    }
                }, 10)
            }
            else {
                if (this._setting.key.toLowerCase() === 'news') {
                    this._getAnnouncmentType();
                }
                this._visibleContent = false;
            }
        }
        else {
            this._router.navigate(['/not-found']);
        }
    }

    private _sendFeedback(): void {
        this._settingService.sendFeedback({
            phone: '+7' + this._feedbackForm.get('phone').value,
            email: this._feedbackForm.get('email').value,
            name: this._feedbackForm.get('name').value,
            message: this._feedbackForm.get('message').value
        })
            .subscribe((data) => {
                this._messageService.add({ severity: 'success', summary: 'Сообщение', detail: 'Ваше сообщение успешно отправлено ' })
                this._loading = false;
            },
                (error) => {
                    this._error = 'Ошибка';
                })
    }

    public onClickSendFeedBack(): void {
        if (this._feedbackForm.valid) {
            this._loading = true;
            this._sendFeedback();
        }
    }

    get setting(): Setting {
        return this._setting;
    }

    get visibleContent(): boolean {
        return this._visibleContent;
    }

    get feedBackForm(): FormGroup {
        return this._feedbackForm;
    }

    get loading(): boolean {
        return this._loading;
    }

    get error(): string {
        return this._error;
    }
    get fileUrl(): string {
        return this._fileUrl;
    }

    get news() {
        return this._news;
    }
    ngOnDestroy() {
        this._metaService.updateTag({ name: 'description', content: '' });
    }
}