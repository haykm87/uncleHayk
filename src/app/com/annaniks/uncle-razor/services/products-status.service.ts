import { Injectable } from "@angular/core";
import { StatusType, PositionStatusType } from "../models/models";

@Injectable()
export class ProductStatusService{
    public statusArray: StatusType[] = [
        {
            status: 'Популярные',
            id: 1,
            icon: 'assets/images/hit.png'
        },
        {
            status: 'Новинки',
            id: 2,
            icon: 'assets/images/new.png'
        },
        {
            status: 'Спецпредложения',
            id: 3,
            icon: 'assets/images/sale.png'
        },
        {
            status: 'Must Have',
            id: 4,
            icon: 'assets/images/musthave.png'
        },
        {
            status: 'Barber Size',
            id: 5,
            icon: 'assets/images/barbersize.png'
        },
        {
            status: 'Мы рекомендуем',
            id: 6,
            icon: ''
        },
    ]
    public position: PositionStatusType[] = [
        {
            verticalPos: 'top',
            horizontalPos: 'left',
            verticalPosVal:'7px',
            horizontalPosVal:'0'

        },
        {
            verticalPos: 'top',
            horizontalPos: 'right',
            verticalPosVal:'7px',
            horizontalPosVal:'0'
        },
        {
            verticalPos: 'bottom',
            horizontalPos: 'left',
            verticalPosVal:'7px',
            horizontalPosVal:'0'

        },
        {
            verticalPos: 'bottom',
            horizontalPos: 'right',
            verticalPosVal:'7px',
            horizontalPosVal:'0'
        },
        {
            verticalPos: 'top',
            horizontalPos: 'left',
            verticalPosVal:'calc(50% - 55px/2)',
            horizontalPosVal:'0'
        },
        {
            verticalPos: 'top',
            horizontalPos: 'right',
            verticalPosVal:'calc(50% - 55px/2)',
            horizontalPosVal:'0'
        },
    ]
    public getPositionStatus():PositionStatusType[]{
        return this.position
    }
    public getStatusArray():StatusType[]{
        return this.statusArray
    }
}