import { Component, OnInit, OnDestroy } from '@angular/core';
import { CatalogService } from './catalog.service';
import { Category, CategoryFilter } from './catalog.models';
import { ServerResponse, Product, Breadcrumbs, Path } from '../../../models/models';
import { ActivatedRoute, Router, NavigationEnd } from '@angular/router';
import { Title, Meta } from '@angular/platform-browser';
import { LoadingService } from '../../../services/loading.service';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { Location } from '@angular/common';
import { PlatformService } from '../../../services/platform.service';

@Component({
    selector: 'catalog-view',
    templateUrl: 'catalog.view.html',
    styleUrls: ['catalog.view.scss']
})
export class CatalogView implements OnInit, OnDestroy {
    public categories: Category[];
    public products: Product[];
    public label: string;
    public productsCount: number = 0;
    public pageLength: number = 12;
    private _filters: CategoryFilter = new CategoryFilter();
    public page: number = 1;
    private _sort: string = 'none';
    public isGet: boolean = false
    private _categoryId: number;
    private _parentId: string;
    private _previousParentId: string;
    private _isShowFilters: boolean = true;
    public isChangeCategory: boolean = false;
    private _isPerviousVersion: boolean = false;
    private _unsubscribe$: Subject<void> = new Subject<void>();
    private _urlParam: string = '';
    public routeSteps: Breadcrumbs[] = [
        { label: 'Главная', url: '/', status: '' }
    ];

    constructor(
        private _catalogService: CatalogService,
        private _activatedRoute: ActivatedRoute,
        private _titleService: Title,
        private _router: Router,
        private _loadingService: LoadingService,
        private _location: Location,
        private _platformService: PlatformService,
        private _metaService: Meta
    ) {
        this._checkRouteParams();
    }

    ngOnInit() {
        if (this._platformService.isBrowser) {
            if (window.innerWidth <= 973) {
                this._isShowFilters = false;
            }
        }
    }

    private _checkRouteParams(): void {
        this._router.events
            .pipe(takeUntil(this._unsubscribe$))
            .subscribe((event) => {
                if (event instanceof NavigationEnd) {
                    let params = this._activatedRoute.snapshot.params;                    
                    let queryParams = this._activatedRoute.snapshot.queryParams;
                    this._isPerviousVersion = this._checkIsPerviousVersion(queryParams);
                    if (this._isPerviousVersion) return;
                    let requestAlias = this._setRequestAlias(params);
                    if (!requestAlias) {
                        this._router.navigate(['/not-found']);
                        return;
                    }
                    this._getCategories(requestAlias);
                    if (params && params.categoryId) {
                        this._urlParam = params.categoryId;
                    }
                    else {
                        this._router.navigate(['/']);
                        return;
                    }
                    this._setSearchParams(queryParams, this._urlParam);
                    this._filterProducts();

                }
            })
    }

    private _setRequestAlias(params): string {
        let requestAlias: string;
        if (params) {
            if (params.categoryId) {
                requestAlias = params.categoryId;
            }
        }
        return requestAlias;
    }


    //Redirect url from /cagalog to /category/:childId
    private _checkIsPerviousVersion(params) {
        if (params && params.parentcategoryid && params.parentcategoryname && this._router.url.includes('/catalog')) {
            if (params.page) {
                this.page = +params.page;
            }
            else {
                this.page = 1;
            }
            if (params.sort) {
                this._sort = params.sort;
            }
            this._getCategories(params.parentcategoryid);
            this.label = (params.categoryname) ? params.categoryname : params.parentcategoryname;
            this._parentId = params.parentcategoryid;
            if (params && params.parentcategoryid) {
                if (params.categoryid) {
                    this._categoryId = params.categoryid
                } else {
                    if (params.categoryId) {
                        this._categoryId = params.categoryId
                    } else {
                        this._categoryId = params.parentcategoryid
                    }
                }
            }

            if (params.filter) {
                this._filters = JSON.parse(params.filter);
            } else {
                this._filters = new CategoryFilter()
            }
            if (this._previousParentId !== this._parentId) {
                this.isChangeCategory = true
            }
            this.isGet = false
            this._filters.min = this._sort == 'min' ? true : null;
            this._filters.max = this._sort == 'max' ? true : null;
            this._filters.page = this.page - 1
            this._filters.count = this.pageLength
            this._filters.parentId = params.parentcategoryid;
            if (this._filters && !this._filters.categoryId)
                this._filters.categoryId = (this._categoryId && this._categoryId !== params.parentcategoryid) ? this._categoryId : null
            this._filterProducts();
            this._previousParentId = params.parentcategoryid
            return true;
        }
        else {
            return false;
        }

    }

    private _setSearchParams(params, categoryId?: string) {
        if (params.page) {
            this.page = +params.page;
        }
        else {
            this.page = 1;
        }
        if (params.sort) {
            this._sort = params.sort;
        }
        if (params.filter) {
            this._filters = JSON.parse(params.filter);
        } else {
            this._filters = new CategoryFilter();
        }
        this.isGet = false;
        this._filters.min = this._sort == 'min' ? true : null;
        this._filters.max = this._sort == 'max' ? true : null;
        this._filters.page = this.page - 1
        this._filters.count = this.pageLength
        if (this._filters && !this._filters.categoryId)
            this._filters.categoryId = categoryId
    }

    private _getCategories(id: string): void {
        this._catalogService.getCategoriesById(id)
            .pipe(takeUntil(this._unsubscribe$))
            .subscribe((data: ServerResponse<Category[]>) => {
                this.categories = data.messages;
            })
    }

    private _getFiltersProduct(fil) {
        this._loadingService.showLoading()
        this._catalogService.filterCategory(fil)
            .pipe(takeUntil(this._unsubscribe$))
            .subscribe((data: any) => {
                this._titleService.setTitle(data.title);
                this._metaService.updateTag({ name: 'description', content: data.description });
                this.products = data.messages;
                if (this._isPerviousVersion || this._urlParam !== data.slug) {
                    this._location.go(`/category/${data.slug}`)
                }
                this.isGet = true;
                this.productsCount = data.count;
                this._resetProperties();
                let paths: Path[] = data.path.sort((a, b) => { return +a.categoryId - +b.categoryId });
                paths.forEach((element: Path, index: number) => {
                    this._setRouteSteps({
                        label: element.name, url: `/category/${element.slug}`, status: ''
                    });
                })
                this.isChangeCategory = false;
                this._loadingService.hideLoading();
            },
                () => {
                    this._loadingService.hideLoading();
                })
    }

    private _filterProducts(): void {
        let fil = this._filters;
        this._getFiltersProduct(fil)
    }
    private _resetProperties(): void {
        this.routeSteps = [
            { label: 'Главная', url: '/', status: '' }
        ];
        this.label = this.routeSteps[this.routeSteps.length - 1].label
    }

    private _setRouteSteps(routeStep: { label: string, url: string, status: string }): void {
        this.routeSteps.push(routeStep);
        this.label = this.routeSteps[this.routeSteps.length - 1].label
    }

    public onPageChange($event) {
        if ($event.isArrow)
            this._router.navigate([], { relativeTo: this._activatedRoute, queryParams: { page: $event.pageNumber }, queryParamsHandling: 'merge' })
    }

    public onClickShowFilters(): void {
        this._isShowFilters = !this._isShowFilters;
    }

    get showFilters(): boolean {
        return this._isShowFilters;
    }

    ngOnDestroy() {
        this._unsubscribe$.next();
        this._unsubscribe$.complete();
        this._metaService.updateTag({ name: 'description', content: '' });
    }
}