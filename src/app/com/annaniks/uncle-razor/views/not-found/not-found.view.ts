import { Component, OnInit, OnDestroy, Optional, Inject } from '@angular/core';
import { RESPONSE } from '@nguniversal/express-engine/tokens';
import { PlatformService } from '../../services/platform.service';

@Component({
    selector: 'not-found-view',
    templateUrl: 'not-found.view.html',
    styleUrls: ['not-found.view.scss']
})
export class NotFoundView implements OnInit, OnDestroy {

    constructor(
        @Optional() @Inject(RESPONSE) private response: any,
        private _platformService: PlatformService
    ) { }

    ngOnInit() {
        if (this._platformService.isServer) {
            this.response.statusCode = 404;
            this.response.statusMessage = '404 - Page Not Found';
        }
    }

    ngOnDestroy() { }
}