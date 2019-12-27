

/***********************************************************
COMPONENTS
***********************************************************/
import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { HttpService } from '../../globals/http';
import { aclService } from './../../globals/acl';
import * as crypto from 'crypto-js';

/**********************************************************
PROVIDERS
***********************************************************/
import { SessionService } from '../../globals/session';
import { StorageService } from '../../globals/storage';



@Component({
  selector: 'app-login',
  templateUrl: 'login.html',
  styleUrls: ['login.scss']
})
export class LoginComponent {


  constructor(
    private _Router: Router,
    private _ToastrService: ToastrService,
    private _SessionService: SessionService,
    private _StorageService: StorageService,
    private _HttpService: HttpService,
    private _AclService: aclService,
  ) { }

  /************
  GET LOGIN
  *************/
  getLogin(form) {

    //VERIFICA CAMPOS PREENCHIDOS
    if (form.value.email == null || form.value.email == '' ||
      form.value.senha == null || form.value.senha == '') {
      return this._ToastrService.error('Preencha todos os campos corretamente', 'Erro!');

    } else {

      //OBTEM DADOS DO USER
      this._HttpService.JSON_POST('/login', form.value, false, true)
        .then(
          res => {
            if (res != undefined && res != 'null') {
              var login_dt = res.json().last_login;
              if (login_dt == null || login_dt == undefined) {
                this._StorageService.setUser('email', res.json().email);
                return this._Router.navigate(['/no-auth/reset-senha']);
              }
              else {
                var user = res.json().email;
                var grupo = res.json().tb_acl_grupos_id;

                var user_data = user + "|/|" + grupo;
                var encrypt = "myencrypttext"
                var user_encrypt = crypto.AES.encrypt(user_data, encrypt)
                user_encrypt = user_encrypt.toString()
                localStorage.setItem('r', user_encrypt);

                this._SessionService.setIsLogged(true);
                this._StorageService.setItem('isLogged', 'true');
                var user = res.json();
                delete user["tb_acl_grupos_id"];
                delete user["id"];
                user = JSON.stringify(user)


                this._StorageService.setItem('user', user);
                this._AclService.loadUserPermissions();
                return this._Router.navigate(['/']);
              }
            }

          },
          (error) => {
            error = JSON.parse(error._body);
            return this._ToastrService.error(error.message);
          }
        )

    }
  }

}


