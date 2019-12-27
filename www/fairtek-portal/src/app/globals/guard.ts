/*--------------
V 0.0.1 - Criado por Larner Diogo

DESCRICAO:
Serviço de Guarda de Rotas


COMPONENTS
***********************************************************/
import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router } from '@angular/router';
import { Observable } from 'rxjs/Rx';
import { HttpService } from './http';

/**********************************************************
PROVIDERS
***********************************************************/
import { SessionService } from './session';
import { Menu } from './../_nav';
import { menuComplete } from './menu';
import { importType } from '@angular/compiler/src/output/output_ast';
import * as crypto from 'crypto-js';
import * as _ from 'underscore';

@Injectable()
export class GuardService implements CanActivate {

  public menu = menuComplete;
  constructor(
    private _SessionService: SessionService,
    private _Router: Router,
    private _Menu: Menu,
    private _HttpService: HttpService,
  ) { }
  
  /************
  GUARDA DE ROTAS
  *************/
  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<boolean> | boolean {

    if (this._SessionService.getIsLogged()) {
      var decrypt = "myencrypttext"
        var user_data = localStorage.getItem('r');
        var user_decrypt = crypto.AES.decrypt(user_data, decrypt)
        var user_data_decrypt = user_decrypt.toString(crypto.enc.Utf8);
        
        var group = user_data_decrypt.split("|/|");
        group = group[1];

      this._HttpService.JSON_GET(`/grupo-usuarios/busca/permissions/${group}`, false, true)
            .then(
                res => {
                    var permissao_user = _.pluck(res.json(), 'tb_acl_regras_id');
                    this._Menu.addMenu(menuComplete, permissao_user );

                }
            )
      return true
    } else {
      this._Router.navigate(['/no-auth/login']);
      return false;
    }

  }

}