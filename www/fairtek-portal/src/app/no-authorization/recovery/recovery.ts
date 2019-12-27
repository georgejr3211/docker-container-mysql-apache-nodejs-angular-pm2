/***********************************************************
COMPONENTS
***********************************************************/
import { Component } from '@angular/core';
import { ToastrService } from 'ngx-toastr';

/**********************************************************
PROVIDERS
***********************************************************/
import { HttpService } from '../../globals/http';

@Component({
  selector: 'app-recovery',
  templateUrl: 'recovery.html',
  styleUrls: ['recovery.scss']
})
export class RecoveryComponent {

  validaEmail = [];

  constructor(
    private _ToastrService: ToastrService,
    private _HttpService: HttpService
  ) { }

  /************
 PUT
 *************/
  putForm(form) {


    //VERIFICA CAMPOS PREENCHIDOS
    if (form.value.email == null || form.value.nome == '') {
      return this._ToastrService.error('Informe o e-mail para recuperar a senha!', 'Erro!');

    } else {

      //VALIDA EMAIL
      if (form.value.email.indexOf('@') == -1) {
        return this._ToastrService.error('E-mail invalido', 'Erro!');

      } else {
        this.validaEmail = form.value.email.split('@');
        if (this.validaEmail[0] == null || this.validaEmail[0] == '' || this.validaEmail[1] == null || this.validaEmail[1] == '') {
          return this._ToastrService.error('Email invalido', 'Erro!');

        } else {
          form.value.email = form.value.email.toUpperCase();
          this._HttpService.JSON_PUT('/login/reseta/senha', form.value, false, true).then(
            res => {
              if (res.json() === 'erro busca email') {
                return this._ToastrService.error("Erro na solicitação! Verifique se o e-mail foi informado corretamente.");
              } else if (res.json() === 'erro envio notificação') {
                return this._ToastrService.error("Erro na solicitação!")
              } else {
                return this._ToastrService.success("A solicitação do reset da senha foi enviada!")
              }
            },
            error => {
              return this._ToastrService.error(error.json().message);
            }
          )
        }
      }
    }
  }


}
