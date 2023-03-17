import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { MainView } from './main.view';

let mainRoutes: Routes = [
    {
        path: '', component: MainView, data: { title: 'Главная' }, children: [
            { path: 'home', redirectTo: '', pathMatch: 'full' },
            { path: '', loadChildren: () => import('src/app/com/annaniks/uncle-razor/views/main/home/home.module').then(m => m.HomeModule) },
            { path: 'contacts', loadChildren: () => import('src/app/com/annaniks/uncle-razor/views/main/contacts/contacts.module').then(m => m.ContactsModule), data: { title: 'Контакты' } },
            { path: 'reviews', loadChildren: () => import('src/app/com/annaniks/uncle-razor/views/main/reviews/reviews.module').then(m => m.ReviewsModule), data: { title: 'Отзыв' } },
            { path: 'category/:categoryId', loadChildren: () => import('src/app/com/annaniks/uncle-razor/views/main/catalog/catalog.module').then(m => m.CatalogModule), data: { title: 'Каталог товаров' } },
            { path: 'product/:productId', loadChildren: () => import('src/app/com/annaniks/uncle-razor/views/main/product-details/product-details.module').then(m => m.ProductDetailsModule) },
            { path: 'catalog/:productId', loadChildren: () => import('src/app/com/annaniks/uncle-razor/views/main/product-details/product-details.module').then(m => m.ProductDetailsModule) },
            { path: 'catalog', loadChildren: () => import('src/app/com/annaniks/uncle-razor/views/main/catalog/catalog.module').then(m => m.CatalogModule), data: { title: 'Каталог товаров' } },
            { path: 'personal-area', loadChildren: () => import('src/app/com/annaniks/uncle-razor/views/main/personal-area/personal-area.module').then(m => m.PersonalAreaModule), data: { title: 'Личный кабинет' } },
            { path: 'basket', loadChildren: () => import('src/app/com/annaniks/uncle-razor/views/main/basket/basket.module').then(m => m.BasketModule), data: { title: 'Корзина' } },
            { path: 'brands', loadChildren: () => import('src/app/com/annaniks/uncle-razor/views/main/brands/brands.module').then(m => m.BrandsModule), data: { title: 'Бренды' } },
            { path: 'search', loadChildren: () => import('src/app/com/annaniks/uncle-razor/views/main/search/search.module').then(m => m.SearchModule), data: { title: 'Поиск' } },
            { path: 'discounts', loadChildren: () => import('src/app/com/annaniks/uncle-razor/views/main/discount/discount.module').then(m => m.DiscountModule) },
            { path: 'settings/:settingname', loadChildren: () => import('src/app/com/annaniks/uncle-razor/views/main/settings/settings.module').then(m => m.SettingsModule) },
            { path: '**', redirectTo: 'not-found', pathMatch: 'full' },
            { path: 'not-found', loadChildren: () => import('src/app/com/annaniks/uncle-razor/views/not-found/not-found.module').then(m => m.NotFoundModule) },
        ]
    },
]

@NgModule({
    imports: [RouterModule.forChild(mainRoutes)],
    exports: [RouterModule]
})
export class MainRoutingModule { }