import { Component, OnInit, OnDestroy, HostListener } from '@angular/core';
import { MainService } from './main.service';
import { ServerResponse, Setting, SocialItem, AllSettings } from '../../models/models';
import { Category } from './catalog/catalog.models';
import { MenuItemsService } from '../../services';
import { PlatformService } from '../../services/platform.service';

@Component({
    selector: 'main-view',
    templateUrl: 'main.view.html',
    styleUrls: ['main.view.scss']
})
export class MainView implements OnInit, OnDestroy {
    private _categories: Category[] = [];
    private _settings: Setting[] = [];
    private _socialItems: SocialItem[] = [];
    private _categoriesMenu: Category[] = [];
    public windowScrolled: boolean;
    constructor(
        private _mainService: MainService,
        private _menuItemsService: MenuItemsService,
        private _platformService: PlatformService) { }
    @HostListener("window:scroll", ['$event'])
    onWindowScroll() {
        if (this._platformService.isBrowser) {
            if (window.pageYOffset || document.documentElement.scrollTop || document.body.scrollTop > 100) {
                this.windowScrolled = true;
            }
            else if (this.windowScrolled && window.pageYOffset || document.documentElement.scrollTop || document.body.scrollTop < 10) {
                this.windowScrolled = false;
            }
        }
    }

    ngOnInit() {
        this._mainService.checkUserBasketPrice();
        this._getSettingsAll()
        this._getUser();
    }

    public scrollToTop(): void {
        if (this._platformService.isBrowser) {
            (function smoothscroll() {
                var currentScroll = document.documentElement.scrollTop || document.body.scrollTop;
                if (currentScroll > 0) {
                    window.requestAnimationFrame(smoothscroll);
                    window.scrollTo(0, currentScroll - (currentScroll / 8));
                }
            })();
        }
    }
    private _getSettingsAll(): void {
        this._mainService.getSettingsAll().subscribe((data: ServerResponse<AllSettings>) => {
            this._categories = data.messages.category;
            this._categoriesMenu = data.messages.menu;
            this._settings = data.messages.settings;
            this._setSettingsLink(this._settings)
            this._socialItems = data.messages.socialNetworks;
        })
    }
    private _setSettingsLink(settings: Setting[]) {
        let pageSettings: { label: string, routerLink: string }[] = [];
        settings.forEach((element, index) => {
            if (element.isPage && element.isPage == '1') {
                pageSettings.push({ label: element.name, routerLink: '/settings/' + element.key })
            }
        })
        this._menuItemsService.setMenuItems(pageSettings);
    }

    private _getUser(): void {
        this._mainService.getUser().subscribe((data) => { })
    }

    get categories(): Category[] {
        return this._categories;
    }

    get settings(): Setting[] {
        return this._settings;
    }

    get socialItems() {
        return this._socialItems;
    }

    get categoriesMenu(): Category[] {
        return this._categoriesMenu;
    }

    ngOnDestroy() { }


}