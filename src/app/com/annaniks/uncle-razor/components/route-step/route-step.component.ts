import { Component, OnInit, OnDestroy, Input } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { Breadcrumbs } from '../../models/models';
import { PlatformService } from '../../services/platform.service';

@Component({
    selector: "app-route-step",
    templateUrl: 'route-step.component.html',
    styleUrls: ['route-step.component.scss']
})
export class RouteStepComponent implements OnInit, OnDestroy {
    tempState = [];
    public arrow_icon: string
    @Input('routes') breadcrumbs: Array<Breadcrumbs> = [];
    constructor(
        private router: Router,
        private _platformService: PlatformService
    ) {
        this.arrow_icon = window.innerWidth > 600 ? 'arrow_right_alt' : 'keyboard_arrow_right'
        this.router.events
            .subscribe((event) => {
                if (event instanceof NavigationEnd) {
                    if (this._platformService.isBrowser)
                        window.scrollTo(0, 0)
                }
            });
    }

    ngOnInit() { }

    ngOnDestroy() { }
}