import { VeterinariosComponent } from './../gestao/veterinarios/veterinarios';
/***********************************************************
COMPONENTS
***********************************************************/
import { Component } from '@angular/core';
import { ToastrService } from 'ngx-toastr';

/**********************************************************
PROVIDERS
***********************************************************/
import { HttpService } from '../../globals/http';
import { GlobalService } from '../../globals/globals';
import { ShowService } from '../../shared/app-show/show.service'

import * as crypto from 'crypto-js';
import * as _ from 'underscore';
@Component({
  selector: 'app-desativacao',
  templateUrl: 'desativacao.html',
  styleUrls: ['desativacao.scss'],
  providers: [ShowService]
})
export class DesativacaoComponent {

  permissoes;
  read: boolean = false;
  new: boolean = false;
  edit: boolean = false;
  delete: boolean = false;

  showNew: boolean = false;
  isBusyForm: boolean = false;
  isBusyList: boolean = false;
  exibeUpdate: boolean = false;
  itens = [];
  itensFilter = [];
  itemsPerPage = 10;

  loading: boolean = true;

  constructor(
    private _HttpService: HttpService,
    private _ToastrService: ToastrService,
    private GlobalService: GlobalService,
    private _ShowService: ShowService
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
    //Permissões: read = 25, new = 26, edit = 27, delete = 28
    //BLOQUEIA TUDO
    if (this.permissoes.includes(25, 26, 27, 28) == false) {
      this.read = false;
      this.new = false;
      this.edit = false;
      this.delete = false;
    }

    //READ
    if (this.permissoes.includes(25)) {
      this.read = true;
    }
    //NEW
    if (this.permissoes.includes(26)) {
      this.new = true;
    }
    //EDIT
    if (this.permissoes.includes(27)) {
      this.edit = true
    }
    //DELETE
    if (this.permissoes.includes(28)) {
      this.delete = true;
    }
  }

  /************
  POST
  *************/
  postForm(form) {

    //VERIFICA CAMPOS PREENCHIDOS
    if (form.value.motivo == null || form.value.motivo == '' ||
      form.value.observacao == null || form.value.observacao == '') {
      return this._ToastrService.error('Preencha todos os campos corretamente', 'Erro!');

    } else {

      //BLOQUEANDO BOTAO DURANTE REQUEST
      this.isBusyForm = true;
      this._HttpService.JSON_POST('/desativacao', form.value, false, true)
        .then(
          res => {
            this.getItens();
            this.isBusyForm = false;
            this._ShowService.showInserir();
            if (res.json().message === 'erro') return this._ToastrService.error('Já existe um motivo cadastrado com esses dados.', 'Erro!');
            else return this._ToastrService.success(res.json().message);
          },
          error => {
            this.isBusyForm = false;
            return this._ToastrService.error(error.json().message);
          }
        )
    }
  }

  /************
  PUT
  *************/
  putForm(form) {

    //VERIFICA CAMPOS PREENCHIDOS
    if (form.value.motivo == null || form.value.motivo == '' ||
      form.value.observacao == null || form.value.observacao == '') {
      return this._ToastrService.error('Preencha todos os campos corretamente teste', 'Erro!');

    } else {

      //BLOQUEANDO BOTAO DURANTE REQUEST
      this.isBusyForm = true;

      this._HttpService.JSON_PUT(`/desativacao/${this.GlobalService.getItem().id}`, form.value, false, true)
        .then(
          res => {
            this.getItens();
            this.isBusyForm = false;
            this.exibeUpdate = false;
            this._ShowService.showEditar();
            if (res.json().message === 'erro') return this._ToastrService.error('Já existe um motivo cadastrado com esses dados.', 'Erro!');
            else return this._ToastrService.success(res.json().message);
          },
          error => {
            this.isBusyForm = false;
            this.exibeUpdate = false;
            return this._ToastrService.error(error.json().message);
          }
        )
    }
  }

  /************
  GET
  *************/
  getItens() {
    this.loading = true;
    this.isBusyList = true;
    this._HttpService.JSON_GET('/desativacao', false, true)
      .then(
        res => {
          this.loading = false;
          this.itensFilter = res.json().data;
          this.isBusyList = false;
          return this.itens = res.json().data;
        },
        error => {
          this.loading = false;
          this.isBusyList = false;
          return this._ToastrService.error(error.json().message);
        }
      )

  }

  /************
  DELETE
  *************/
  deleteItem() {
    let res = confirm("Tem certeza que deseja excluir o motivo?");
    if (res) {

      this._HttpService.JSON_DELETE(`/desativacao/${this.GlobalService.getItem().id}`, false, true)
        .then(
          res => {
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
    let val = event.target.value;
    if (val.length === 0) {
      this.itensFilter = this.itens;

    } else {

      let filtro = this.itensFilter.filter(function (d) {
        return d.motivo.toLowerCase().indexOf(val) !== -1 || !val;
      });

      this.itensFilter = filtro;
    }
  }
}
