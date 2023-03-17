import { Injectable } from '@angular/core';
import { MenuItem } from '../models/models';
import { PlatformService } from './platform.service';

const MENUITEMS: MenuItem[] = []

const CATALOGITEMS: MenuItem[] = []

@Injectable()
export class MenuItemsService {
    private _menuItems: MenuItem[] = MENUITEMS;
    private _catalogItems: MenuItem[] = CATALOGITEMS;
    private _openMenu: boolean = true;

    constructor(private _platformService: PlatformService) { }

    public getMenuItems(): MenuItem[] {
        return this._menuItems;
    }

    public setMenuItems(menuItems: MenuItem[]) {
        this._menuItems = menuItems;
    }

    public getCatalogItems(): MenuItem[] {
        return this._catalogItems;
    }

    public openMenu(): void {
        this._openMenu = !this._openMenu;
        if (this._platformService.isBrowser)
            document.body.style.overflow = (this._openMenu) ? 'hidden' : 'auto';
    }
    public closeMenu() {
        this._openMenu = false;
        if (this._platformService.isBrowser)
            document.body.style.overflow = 'auto';
    }

    public getOpenMenu(): boolean {
        return this._openMenu;
    }

}