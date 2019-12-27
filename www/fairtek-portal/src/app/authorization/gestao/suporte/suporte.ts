/***********************************************************
COMPONENTS
***********************************************************/
import { Component } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import * as _ from 'underscore';

/**********************************************************
PROVIDERS
***********************************************************/
import { HttpService } from '../../../globals/http';
import { GlobalService } from '../../../globals/globals';
import { ShowService } from '../../../shared/app-show/show.service'
import { IfObservable } from 'rxjs/observable/IfObservable';
import { AppSupportService } from '../../../shared/app-support/app-support.service'

import * as crypto from 'crypto-js';
import * as Rx from "rxjs";

@Component({
  selector: 'app-suporte',
  templateUrl: 'suporte.html',
  styleUrls: ['suporte.scss']
})

export class SuporteComponent {

  permissoes;
  read: boolean = false;
  edit: boolean = false;
  itensFilter = [];
  itens = [];
  btn_status: boolean = false;
  itemsPerPage = 10;
  support = new Rx.Subject();
  value = 0;

  loading: boolean = true;

  constructor(
    private _HttpService: HttpService,
    private _ToastrService: ToastrService,
    private GlobalService: GlobalService,
    private _ShowService: ShowService,
    private _support: AppSupportService
  ) {
  }

  ngOnInit() {
    this.getItens();

    /*******
     * DESCRIPTANDO E OBTENDO AS PERMISSÕES DO USUÁRIO
     * ******* */
    var decrypt = "myencrypttext"
    var user_data = localStorage.getItem('r');
    var user_decrypt = crypto.AES.decrypt(user_data, decrypt)
    var user_data_decrypt = user_decrypt.toString(crypto.enc.Utf8);

    var group = user_data_decrypt.split("|/|");
    group = group[1];

    this._HttpService.JSON_GET(`/grupo-usuarios/busca/permissions/${group}`, false, true)
      .then(
        res => {
          this.permissoes = _.pluck(res.json(), 'tb_acl_regras_id');
          this.fACL();
        }
      )
  }

  fACL() {
    //Permissões: read = 97, edit = 98, 
    //BLOQUEIA TUDO
    if (this.permissoes.includes(97, 98) == false) {
      this.read = false;
      this.edit = false;
    }

    //READ
    if (this.permissoes.includes(97)) {
      this.read = true;
    }
    //EDIT
    if (this.permissoes.includes(98)) {
      this.edit = true
    }

  }

  /************
 GET
 *************/
  getItens() {
    this.loading = true;
    this._HttpService.JSON_GET('/usuarios/extra/combo/reset', false, true).then(
      res => {
        this.itensFilter = res.json();
        this.loading = false;
        return this.itens = res.json();
      },
      error => {
        this.loading = false;
        return this._ToastrService.error(error.json().message);
      }
    )

  }

  callSubscribe() {
    this._support.busca_troca();
  }


  /************
  RESETA SENHA
  *************/
  resetaSenha() {
    let res = confirm("Tem certeza que deseja resetar a senha do usuário?");
    if (res) {

      this._HttpService.JSON_GET(`/usuarios/reseta-senha/${this.GlobalService.getItem().id}`, false, true)
        .then(
          res => {
            this.callSubscribe();
            this.getItens();
            return this._ToastrService.success(res.json().message);
          },
          error => {
            return this._ToastrService.error(error.json().message);
          }
        )

    }

  }

  /************
FILTRA
*************/
  searchFilter(event) {
    let val = event.target.value.toLowerCase();

    if (val.length === 0) {
      this.itensFilter = this.itens;

    } else {

      let filtro = this.itensFilter.filter(function (d) {
        return d.email.toLowerCase().indexOf(val) !== -1 || !val;
      });

      this.itensFilter = filtro;
    }

  }


}