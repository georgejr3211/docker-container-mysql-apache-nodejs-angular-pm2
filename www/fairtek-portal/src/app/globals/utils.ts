import { Injectable } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { ToastrService } from 'ngx-toastr';
import { Http, Response, Headers, RequestOptions } from '@angular/http';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/map';
import 'rxjs/Rx';
import 'rxjs/add/operator/toPromise';
import { StorageService } from './storage';
import * as $ from 'jquery';

@Injectable()
export class UtilsService {

    constructor(
        private toast: ToastrService,
        private StorageService: StorageService
    ) {

    }

    returnToastArrVazio(data, nomeObjeto) {
        if (Array.isArray(data) && data.length <= 0) {
            this.toast.info('Nenhum registro de ' + nomeObjeto + ' encontrado.');
        }
    }

    async error(data) {
        if (data.status == 401) {
            this.toast.error('Acesso negado, entre novamente no sistema.')
            this.StorageService.removeItem('isLogged');
            this.StorageService.removeItem('user');
            setTimeout(() => {
                location.reload();
            }, 1000)

        }
        return await data;
    }

    loadShow() {
        $('.page-loading').css('opacity', '0.9');
        $('.page-loading').css('z-index', '9999');
    }

    loadHide() {    
        $('.page-loading').css('opacity', '0');
        $('.page-loading').css('z-index', '-1');
    }
}