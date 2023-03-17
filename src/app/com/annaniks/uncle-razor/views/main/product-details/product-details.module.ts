import { NgModule } from '@angular/core';
import { ProductDetailsView } from './product-details.view';
import { ProductDetailsRoutingModule } from './product-details.routing.module';
import { SharedModule } from '../../../shared/shared.module';
import { FormsModule } from '@angular/forms';
import {
    DescriptionTabComponent,
    VerticalSliderComponent,
    CharacteristicTabComponent,
    ReviewsTabComponent,
    ProductAttributeComponent
} from '../../../components';
import { SwiperModule, SWIPER_CONFIG, SwiperConfigInterface } from 'ngx-swiper-wrapper';
import { MatDialogModule } from '@angular/material';
import { ProductDetailsService } from './product-details.service';
import { LightboxModule } from 'ngx-lightbox';
import {CrystalGalleryModule} from 'ngx-crystal-gallery';

const DEFAULT_SWIPER_CONFIG: SwiperConfigInterface = {
    direction: 'vertical',
    slidesPerView: 'auto'
};

@NgModule({
    declarations: [
        ProductDetailsView,
        DescriptionTabComponent,
        ReviewsTabComponent,
        CharacteristicTabComponent,
        VerticalSliderComponent,
        ProductAttributeComponent       
    ],
    imports: [
        ProductDetailsRoutingModule,
        SharedModule,
        FormsModule,
        SwiperModule,
        MatDialogModule,
        LightboxModule,
        CrystalGalleryModule
    ],
    providers: [
        {
            provide: SWIPER_CONFIG,
            useValue: DEFAULT_SWIPER_CONFIG
        },
        ProductDetailsService
    ],
    entryComponents:[],
    exports: []
})
export class ProductDetailsModule { }