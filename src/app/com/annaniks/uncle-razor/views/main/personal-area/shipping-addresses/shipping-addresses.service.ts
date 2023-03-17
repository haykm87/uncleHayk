import { Injectable } from "@angular/core";
import { HttpClient, HttpParams } from "@angular/common/http";

@Injectable()
export class ShippingAddressesServices {
    constructor(private _httpClient: HttpClient) { }
    public getAddresses() {
        let params = new HttpParams().set('isAuthorized', 'true');
        return this._httpClient.get('/address', { params })
    }
    /**
     * 
     * @param name 
     * @param fullName 
     * @param phone 
     * @param index 
     * @param address 
     * @param countryId 
     */
    public addAddresses(name: string, fullName: string, phone: string, index: string, address: string, countryId: number) {
        let params = new HttpParams().set('isAuthorized', 'true');

        return this._httpClient.post('/address', {
            "name": name,
            "fullName": fullName,
            "phone": phone,
            "index": index,
            "address": address,
            "cityCountryId": countryId
        }, { params })
    }
    public changeAddresses(name: string, fullName: string, phone: string, index: string, address: string, countryId: number, status: boolean, id: number) {
        let params = new HttpParams().set('isAuthorized', 'true');

        return this._httpClient.put('/address', {
            "name": name,
            "fullName": fullName,
            "phone": phone,
            "index": index,
            "address": address,
            "cityCountryId": countryId,
            "status": status,
            "id": id
        }, { params })
    }
    /**
     * 
     * @param id 
     */
    public deleteAddress(id: number) {
        let params = new HttpParams().set('isAuthorized', 'true');

        return this._httpClient.delete(`/address/${id}`, { params })
    }
}