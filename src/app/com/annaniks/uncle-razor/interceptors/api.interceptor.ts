
import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Inject } from '@angular/core';
import { CookieService } from '../services/cookie.service';

function checkIsRelativePath(path: string): boolean {
    return path.includes('assets');
}

export class ApiInterceptor implements HttpInterceptor {

    constructor(
        @Inject('BASE_URL') private _baseUrl: string,
        private _cookieService: CookieService
    ) { }

    intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {       
        if (!checkIsRelativePath(req.url)) {
            let httpHeaders: HttpHeaders = req.headers;
            let params: HttpParams = new HttpParams();
            params = req.params;
            if (req.params.get('isAuthorized') === 'true') {
                params = req.params.delete('isAuthorized');
                let token: string = this._cookieService.get('accessToken') || '';
                httpHeaders = httpHeaders.append('Authorization', 'Bearer ' + token)
            }
            const clonedRequest = req.clone({
                url: `${this._baseUrl}${req.url}`,
                headers: httpHeaders,
                params: params
            });                        
            return next.handle(clonedRequest)
        }
        else {            
            return next.handle(req);
        }

    }
}