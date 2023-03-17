import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { CatalogView } from './catalog.view';

let catalogRoutes: Routes = [
    { path: '', component: CatalogView },
]
@NgModule({
    imports: [RouterModule.forChild(catalogRoutes)],
    exports: [RouterModule]
})
export class CatalogRoutingModule { }