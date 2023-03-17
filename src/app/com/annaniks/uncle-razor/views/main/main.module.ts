import { NgModule } from '@angular/core';
import { MainRoutingModule } from './main.routing.module';
import { MainView } from './main.view';
import { TopbarComponent, FooterComponent, CatalogComponent, LoadingComponent, SlideNavComponent } from '../../components';
import { MenuItemsService, LoginService } from '../../services';
import { CommonModule } from '@angular/common';
import {
    LoginModal,
    RegistrationModal,
    BackCallModal,
    BuyOneClickModal,
    SelectCityModal,
    AddProductBasketModal,
    RecoverPasswordModal,
    SearchModal,
    FilterCategoryListModal
} from '../../modals';
import { MatDialogModule, MatProgressBarModule } from '@angular/material';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { MainService } from './main.service';
import { SharedModule } from '../../shared/shared.module';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { DropdownModule } from 'primeng/primeng';
import { HttpClientModule } from '@angular/common/http';
import { CookieService } from '../../services/cookie.service';
import { CheckboxModule } from 'primeng/checkbox';


@NgModule({
    declarations: [
        MainView,
        TopbarComponent,
        FooterComponent,
        CatalogComponent,
        LoginModal,
        RegistrationModal,
        BackCallModal,
        BuyOneClickModal,
        SelectCityModal,
        AddProductBasketModal,
        LoadingComponent,
        RecoverPasswordModal,
        SlideNavComponent,
        SearchModal,
        FilterCategoryListModal
    ],
    imports: [
        MainRoutingModule,
        CommonModule,
        MatDialogModule,
        ReactiveFormsModule,
        SharedModule,
        ToastModule,
        DropdownModule,
        FormsModule,
        CheckboxModule,
        MatProgressBarModule
    ],
    providers: [
        MenuItemsService,
        MainService,
        LoginService,
        MessageService,
        CookieService,
    ],
    entryComponents: [
        LoginModal,
        RegistrationModal,
        BackCallModal,
        BuyOneClickModal,
        SelectCityModal,
        AddProductBasketModal,
        RecoverPasswordModal,
        SearchModal,
        FilterCategoryListModal
    ]
})
export class MainModule { }