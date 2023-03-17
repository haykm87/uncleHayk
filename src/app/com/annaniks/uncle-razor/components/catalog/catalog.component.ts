import { Component, OnInit, Input, Inject } from '@angular/core';
import { MenuItemsService } from '../../services';
import { Category } from '../../views/main/catalog/catalog.models';
import { Router, ActivatedRoute, NavigationEnd, RoutesRecognized } from '@angular/router';
import { takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';
import { PlatformService } from '../../services/platform.service';

@Component({
    selector: 'app-catalog',
    templateUrl: 'catalog.component.html',
    styleUrls: ['catalog.component.scss'],
})
export class CatalogComponent implements OnInit {
    private _catalogItems: Array<Category> = [];
    @Input('catalogItems')
    set catalogItems($event) {
        this._catalogItems = $event;
    }
    private _activeTab: string = 'catalog';
    private _isSmallDisplay: boolean = false;
    private _scroll: boolean = false;
    private _parentId: string;
    private _unsubscribe$: Subject<void> = new Subject<void>();

    constructor(
        private _activatedRoute: ActivatedRoute,
        private _menuItemsService: MenuItemsService,
        private _router: Router,
        private _platformService: PlatformService
    ) {
    }

    ngOnInit() {
        this._checkRouteParams();
        this._checkwindowSize();
        if (this._platformService.isBrowser) {
            window.addEventListener('scroll', () => {
                let y = window.pageYOffset;
                if (y >= 180) {
                    if (!this._scroll)
                        this._scroll = true;
                } else {
                    if (this._scroll)
                        this._scroll = false;
                }
            })
        }
    }

    private _checkwindowSize(): void {
        if (window.innerWidth <= 920) {
            this._isSmallDisplay = true;
            this._menuItemsService.openMenu();
        }
    }

    public isLinkActive(item): boolean {
        let isActive = false;
        if (+this._parentId === item.id || this._parentId === item.slug) {
            isActive = true;
        }
        return isActive
    }

    private _checkRouteParams(): void {
        this._router.events
            .pipe(takeUntil(this._unsubscribe$))
            .subscribe((event) => {
                let params: string[] = this._getRouteParams();
                this._parentId = (params && params.length > 0) ? params[0] : '';
                if (event instanceof NavigationEnd) {
                    if (this._router.url.includes('/catalog')) {
                        this._parentId = this._activatedRoute.snapshot.queryParamMap.get('parentcategoryid');
                        return;
                    }
                }
            })
    }

    private _getRouteParams(): string[] {
        let splittedUrl: string[] = this._router.url.split('/');
        splittedUrl.splice(0, 2);
        return splittedUrl;
    }

    public getQuerySendObject(itemName, itemId, subItemName, subItemId) {
        return {
            parentcategoryname: itemName, parentcategoryid: itemId,
            categoryname: subItemName, categoryid: subItemId,
            filter: JSON.stringify({ categoryId: subItemId.toString() })
        }
    }
    public onClickHeader(tabName: string): void {
        this._activeTab = tabName;
    }

    public onClickItem(): void {
        if (this._isSmallDisplay) {
            this._menuItemsService.openMenu();
        }
    }

    get catalogItems(): Category[] {
        if (this._activeTab == 'catalog') {
            return this._catalogItems;
        }

    }

    get activeTab(): string {
        return this._activeTab;
    }

    get isSmallDisplay(): boolean {
        return this._isSmallDisplay;
    }

    get scroll(): boolean {
        return this._scroll;
    }

    ngOnDestroy() {
        this._unsubscribe$.next();
        this._unsubscribe$.complete();
    }

}