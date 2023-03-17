import { Component, OnInit, Input, Output, EventEmitter, OnDestroy } from '@angular/core';
import { Category } from '../../../views/main/catalog/catalog.models';
import { Router, ActivatedRoute } from '@angular/router';
import { MenuItemsService } from '../../../services';
import { Subject } from 'rxjs';

@Component({
    selector: 'app-category',
    templateUrl: 'category.component.html',
    styleUrls: ['category.component.scss'],

})
export class CategoryComponent implements OnInit, OnDestroy {
    private _params: { categoryId: string } = {} as { categoryId: string };
    public selectedArray: number[] = [];
    private _isMain: boolean = false;
    private _multiSelect: boolean;
    @Input('index') private _index: number;
    @Input('queryParamid')
    set queryParamid($event) {
        if ($event) {
            this._params = { categoryId: $event };
            this._setActiveFlag({ categoryId: $event });
        }
    }
    @Input('params')
    set params($event: { categoryId: string }) {
        if ($event && $event.categoryId) {
            this._params = $event;
            this._setActiveFlag($event)
        }
    }
    @Input('category')
    set category($event) {
        this._category = $event;
        this._setActiveFlag(this._params);
    }
    private _category: Category = {} as Category;
    @Input('isCloseMenu') private _isCloseMenu: boolean = false;
    @Input('isParent') private _isParent: boolean = false;
    @Input('isSlideNav') private _isSlideNav: boolean = false;
    @Input('multiSelect')
    set setMultiselectValue($event) {
        this._multiSelect = $event;
    }
    @Input('isMain')
    set setMainValue($event) {
        this._isMain = $event;
    }
    @Output('getSelectsArray') private _selectArr = new EventEmitter;
    private _activeCategory: boolean = false;
    private _unsubscribe: Subject<void> = new Subject<void>();

    constructor(private _router: Router,
        private _activatedRoute: ActivatedRoute,
        private _menuItemsService: MenuItemsService
    ) { }

    ngOnInit() {
        this._setIsActiveValue();
    }

    private _setIsActiveValue(): void {
        if (this._category && this._category.subCategory && this._category.subCategory.length) {
            for (let category of this._category.subCategory) {
                category['isActive'] = false;
            }
        }
    }

    public onClickSubcategoryButton(item) {
        item.isActive = !item.isActive
    }

    private _setActiveFlag(params: { categoryId: string }): void {
        let flag: boolean = false;
        this._checkMultyQueryParams();
        if (params && params.categoryId) {
            if (params.categoryId === this._category.self_slug || params.categoryId == String(this._category.id)) {
                flag = true;
            }
        }
        if (params && params.categoryId) {
            if (params.categoryId === this._category.self_slug || params.categoryId == String(this._category.id)) {
                if (this._multiSelect) {
                    if (!(this._category.subCategory && this._category.subCategory.length)) {
                        flag = false
                    } else {
                        flag = true;
                    }
                } else {
                    flag = true;
                }
            }
            else {
                if (this.category && this.category.subCategory) {
                    this.category.subCategory.forEach((element) => {
                        if (element.self_slug === params.categoryId || String(element.id) === params.categoryId) {
                            flag = true;
                            element.isActive = true;
                        } else {
                            element.isActive = false
                        }
                        if (element.subCategory) {
                            element.subCategory.forEach((subcategory) => {
                                if (subcategory.self_slug === params.categoryId || String(subcategory.id) === params.categoryId) {
                                    flag = true;
                                    element.isActive = true;
                                }
                            })
                        }
                    })
                }
            }
        }
        this._activeCategory = flag;
    }

    public onClickButton(): void {
        this._activeCategory = !this._activeCategory;
    }
    private _checkMultyQueryParams() {
        let queryParams = this._activatedRoute.snapshot.queryParams;
        if (queryParams && queryParams.filter) {
            let filter = JSON.parse(queryParams.filter)
            if (filter && filter["categoryId"]) {
                let queryArr = filter["categoryId"].split(',');
                if (this._category && this._category.subCategory && this._category.subCategory.length) {
                    for (let subcategory of this._category.subCategory) {
                        for (let arr of queryArr) {
                            if (subcategory.id == arr) {
                                this.selectedArray.push(parseInt(arr));
                                this._selectArr.emit(this.selectedArray)
                            }
                        }
                    }
                } else {
                    for (let arr of queryArr) {
                        if (this._category.id == arr) {
                            this.selectedArray.push(parseInt(arr));
                            this._selectArr.emit(this.selectedArray)
                        }
                    }
                }
            }
        }
    }
    public onClickCategory(category: Category, isParent?: boolean): void {
        if (this._multiSelect) {
            category.isSelect = !category.isSelect;
            if (category.isSelect) {
                this.selectedArray.push(category.id);
            } else {
                for (let i = 0; i < this.selectedArray.length; i++) {
                    if (this.selectedArray[i] == category.id) {
                        this.selectedArray.splice(i, 1)
                    }
                }
            }
            this._selectArr.emit(this.selectedArray)
        } else {
            if (this._isCloseMenu && this._menuItemsService.getOpenMenu()) {
                this._menuItemsService.openMenu();
            }
            let url: string = `/category/${category.self_slug}`;
            if (this._isSlideNav) [
                url = `/category/${category.slug}`
            ]
            this._router.navigate([url], { relativeTo: this._activatedRoute });
        }
    }

    get category(): Category {
        return this._category;
    }

    get isSlideNav(): boolean {
        return this._isSlideNav
    }

    get activeCategory(): boolean {
        return this._activeCategory;
    }

    get isParent(): boolean {
        return this._isParent;
    }

    get multiSelect(): boolean {
        return this._multiSelect
    }

    get isMain(): boolean {
        return this._isMain
    }

    ngOnDestroy() {
        this._unsubscribe.next();
        this._unsubscribe.complete();
    }

}