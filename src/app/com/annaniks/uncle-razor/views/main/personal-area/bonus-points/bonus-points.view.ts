import { Component, OnInit } from "@angular/core";
import { BonusPointsServices } from "./bonus-points.service";
import { Title } from "@angular/platform-browser";
import { ActivatedRoute } from "@angular/router";
import { LoadingService } from "../../../../services/loading.service";
import { BonusPoint, ServerResponse } from "../../../../models/models";

@Component({
    selector: 'bonus-points-view',
    templateUrl: 'bonus-points.view.html',
    styleUrls: ['bonus-points.view.scss']
})
export class BonusPointsView implements OnInit {
    public bonusPoint: BonusPoint[] = [];
    public isGet: boolean = false
    constructor(private _bonusPointservice: BonusPointsServices,
        private _title: Title,
        private _loadingService: LoadingService,
        private _activatedRoute: ActivatedRoute,
    ) {
        this._title.setTitle(this._activatedRoute.data['_value'].title);
    }
    ngOnInit() {
        this._getBonusPoints()
    }
    private _getBonusPoints(): void {
        this._loadingService.showLoading()
        this._bonusPointservice.getBonusPoints().subscribe((data: ServerResponse<BonusPoint[]>) => {
            this.bonusPoint = data.messages;
            this.isGet = true
            this._loadingService.hideLoading()
        },
            () => {
                this._loadingService.hideLoading()
            })
    }
}