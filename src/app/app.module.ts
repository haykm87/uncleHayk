import { CommonModule, registerLocaleData } from '@angular/common';
import { BrowserModule } from '@angular/platform-browser';
import { NgModule, LOCALE_ID } from '@angular/core';
import { AppRoutingModule } from './app.routing.module';
import { AppComponent } from './app.component';
import { httpParams } from './com/annaniks/uncle-razor/params/httpParams';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { AppService, ProductStatusService } from './com/annaniks/uncle-razor/services';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { LoadingService } from './com/annaniks/uncle-razor/services/loading.service';
import { CookieService } from './com/annaniks/uncle-razor/services/cookie.service';
import { PlatformService } from './com/annaniks/uncle-razor/services/platform.service';
import localeRu from '@angular/common/locales/ru';
import { ApiInterceptor } from './com/annaniks/uncle-razor/interceptors/api.interceptor';
import { MetrikaModule } from 'ng-yandex-metrika';
import { TransferHttpCacheModule } from '@nguniversal/common';

registerLocaleData(localeRu)
@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    CommonModule,
    HttpClientModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    TransferHttpCacheModule,
    BrowserModule.withServerTransition({ appId: 'app-root' }),
    MetrikaModule.forRoot(
      { id: 56102548, webvisor: true }
    ),
  ],
  providers: [
    AppService,
    CookieService,
    ProductStatusService,
    PlatformService,
    LoadingService,
    {
      provide: 'req',
      useValue: null
    },
    {
      provide: 'BASE_URL',
      useValue: httpParams.baseUrl
    },
    {
      provide: 'FILE_URL',
      useValue: httpParams.fileUrl
    },
    { provide: LOCALE_ID, useValue: "ru" },

    {
      provide: HTTP_INTERCEPTORS,
      useClass: ApiInterceptor,
      multi: true
    },
  ],
})
export class AppModule { }