import { Component, OnInit } from '@angular/core';
import { StorageService } from '../../globals/storage';
import { HttpService } from '../../globals/http';
import { ToastrService } from 'ngx-toastr';
import { Router } from '@angular/router';

@Component({
  selector: 'app-resetSenha',
  templateUrl: 'reset-senha.html',
  styleUrls: ['reset-senha.scss']
})

export class ResetSenhaComponent {

  user;

  constructor(
    private _StorageService: StorageService,
    private _HttpService: HttpService,
    private _ToastrService: ToastrService,
    private _Router: Router

  ) {

  }
  ngOnInit() {

  }

  putPass(form) {
    this.user = this._StorageService.getItem('email');
    this._StorageService.removeItem('email');
    if (form.value.passwd == null || form.value.passwd == '' ||
      form.value.conf_passwd == null || form.value.conf_passwd == '') {
      return this._ToastrService.error('Preencha todos os campos corretamente', 'Erro!');
    }
    else {
      if (form.value.passwd !== form.value.conf_passwd) {
        return this._ToastrService.error('As senhas digitadas não conferem!', 'Erro!');
      }
      else {
        this._HttpService.JSON_PUT(`/login/reset-senha/${this.user}`, form.value, false, true)
          .then(
            res => {
              if (res.status === 200) {
                this._Router.navigate(['/']);
                return this._ToastrService.success('Senha alterada com sucesso!', 'Login Liberado!');
              }
              else {
                console.log(res)

              }
            }
          )
      }


    }


  }


}