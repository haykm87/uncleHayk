import { Component, OnInit, OnDestroy, Inject } from '@angular/core';
import { BrandsService } from './brands.service';
import { ServerResponse } from '../../../models/models';
import { Brand } from './brands.models';
import { Subscription } from 'rxjs';
import { Title, Meta } from '@angular/platform-browser';
import { LoadingService } from '../../../services/loading.service';

@Component({
    selector: 'brands-veiw',
    templateUrl: 'brands.view.html',
    styleUrls: ['brands.view.scss']
})
export class BrandsView implements OnInit, OnDestroy {
    private _subscription: Subscription = new Subscription();
    private _brands: Brand[] = [];
    private _routeSteps = [];

    constructor(
        @Inject('FILE_URL') private _fileUrl: string,
        private _brandsService: BrandsService,
        private _title: Title,
        private _loadingService: LoadingService,
        private _metaService: Meta
    ) { }

    ngOnInit() {
        this._metaService.updateTag({ name: 'description', content: 'В Интернет магазине дядя бритва можно приобрести товары для бритья и мужскую косметику разных брендов. Купить в Москве по выгодной цене. Быстрая доставка. Скидки и акции на сайте.Тел. +7 929 500 50 50' });
        this._setRouteSteps();
        this._getBrands();
    }

    private _getBrands(): void {
        this._loadingService.showLoading()
        this._brandsService.getBrands().subscribe((data: ServerResponse<Brand[]>) => {
            this._brands = data.messages;
            this._loadingService.hideLoading()
        })
    }

    private _setRouteSteps(): void {
        this._title.setTitle('Бренды');
        this._routeSteps.push(
            { label: 'Главная', url: '/', queryParams: {}, status: '' },
            { label: 'Бренды', url: '/brands', queryParams: {}, status: '' }
        )
    }

    get brands(): Brand[] {
        return this._brands;
    }

    get fileUrl(): string {
        return this._fileUrl;
    }

    get routeSteps() {
        return this._routeSteps;
    }

    ngOnDestroy() {
        this._subscription.unsubscribe();
        this._metaService.updateTag({ name: 'description', content: '' });
    }
}