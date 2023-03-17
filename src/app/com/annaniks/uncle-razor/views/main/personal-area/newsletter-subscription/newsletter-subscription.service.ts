import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";

@Injectable()
export class NewsletterSubscriptionService {
    
    constructor(private _httpClient: HttpClient) { }
}