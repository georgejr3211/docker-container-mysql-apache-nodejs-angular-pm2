/*--------------
V 0.0.1 - Criado por Larner Diogo

DESCRICAO:
Serviço de requisições http


COMPONENTS
***********************************************************/
import { Injectable } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { Http, Response, Headers, RequestOptions } from '@angular/http';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/map';
import 'rxjs/Rx';
import 'rxjs/add/operator/toPromise';
import { StorageService } from './storage';
import { UtilsService } from './utils';
import { AppVerifyRouteService } from '../shared/app-verify-route/app-verify-route.service';
@Injectable()
export class HttpService {
    //private _URL_api: string='http://192.168.1.48:3000';
    //private _URL_api: string='https://fairtek-server-dev.herokuapp.com' ;

    private _URL_api;
    private _URL_REQUEST: string;

    constructor(
        private _http: Http,
        private _StorageService: StorageService,
        private _utils: UtilsService,
        private _history: AppVerifyRouteService
    ) {

        this.getUrlApi().subscribe(
            data => {
                this._URL_api = data.URL_API;
            },
            error => {
                console.log(error);
            }
        )
    }


    getUrlApi() {
        return this._http.get("../../assets/env.json").map((res: any) => res.json());
    }
    /************
    HEADER
    *************/
    getHeader(auth: boolean) {
        let headers = new Headers();
        var user = JSON.parse(this._StorageService.getItem('user'));
        //HEADER COM AUTHORIZATION
        if (auth == true && user != null && user != '') {
            headers.append('Authorization', 'Bearer ' + user.token);
        }
        return headers
    }

    /************
    POST
    *************/
    JSON_POST(url, fields, auth: boolean, use_url_api: boolean, storeFIlter: boolean = false): Promise<any> {
        if(storeFIlter) this._history.storeLastFilter(url);
        if (use_url_api) { this._URL_REQUEST = this._URL_api + url } else { this._URL_REQUEST = url }
        return this._http.post(this._URL_REQUEST, fields, { headers: this.getHeader(true) }).toPromise().catch((err) => {
            this._utils.error(err);
        });
    }

    /************
    GET
    *************/
    JSON_GET(url, auth: boolean, use_url_api: boolean, storeFIlter: boolean = false): Promise<any> {
        if(storeFIlter) this._history.storeLastFilter(url);
        if (use_url_api) { this._URL_REQUEST = this._URL_api + url } else { this._URL_REQUEST = url }
        return this._http.get(this._URL_REQUEST, { headers: this.getHeader(true) }).toPromise().catch((err) => {
            this._utils.error(err);
        });

    }

    /************
    PUT
    *************/
    JSON_PUT(url, fields, auth: boolean, use_url_api: boolean, storeFIlter: boolean = false): Promise<any> {  
        if(storeFIlter) this._history.storeLastFilter(url);      
        if (use_url_api) { this._URL_REQUEST = this._URL_api + url } else { this._URL_REQUEST = url }
        return this._http.put(this._URL_REQUEST, fields, { headers: this.getHeader(true) }).toPromise().catch((err) => {
            this._utils.error(err);
        });
    }

    /************
    DELETE
    *************/
    JSON_DELETE(url, auth: boolean, use_url_api: boolean, storeFIlter: boolean = false): Promise<any> {
        if(storeFIlter) this._history.storeLastFilter(url);
        if (use_url_api) { this._URL_REQUEST = this._URL_api + url } else { this._URL_REQUEST = url }
        return this._http.delete(this._URL_REQUEST, { headers: this.getHeader(true) }).toPromise().catch((err) => {
            this._utils.error(err);
        });
    }

    /************
    UPLOAD

    *************/
    JSON_UPLOAD_POST(url, fields, auth: boolean, use_url_api: boolean, storeFIlter: boolean = false): Promise<any> {
        if(storeFIlter) this._history.storeLastFilter(url);
        if (use_url_api) { this._URL_REQUEST = this._URL_api + url } else { this._URL_REQUEST = url }
        return this._http.post(this._URL_REQUEST, fields).toPromise().catch((err) => {
            this._utils.error(err);
        });
    }

    JSON_UPLOAD_PUT(url, fields, auth: boolean, use_url_api: boolean, storeFIlter: boolean = false): Promise<any> {
        if (use_url_api) { this._URL_REQUEST = this._URL_api + url } else { this._URL_REQUEST = url }
        return this._http.put(this._URL_REQUEST, fields).toPromise().catch((err) => {
            this._utils.error(err);
        });
    }

}
