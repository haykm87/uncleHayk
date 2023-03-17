import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { UserInfoView } from './user-info.view';

let userInfoRoutes: Routes = [
    { path: '', component: UserInfoView, data: { title: 'Личный кабинет' } }
]

@NgModule({
    imports: [RouterModule.forChild(userInfoRoutes)],
    exports: [RouterModule]
})
export class UserInfoRoutingModule { }