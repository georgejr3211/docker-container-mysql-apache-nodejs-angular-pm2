/***********************************************************
COMPONENTS
***********************************************************/
import { Component, OnInit } from '@angular/core';
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
  selector: 'app-novo-galpoes',
  templateUrl: 'novo.html',
  styleUrls: ['novo.scss'],
  providers: [ShowService]
})
export class GalpoesNovoComponent implements OnInit {

  loading: boolean = true;

  permissoes;
  read: boolean = false;
  new: boolean = false;
  edit: boolean = false;
  delete: boolean = false;

  isBusyForm: boolean = false;
  isBusyList: boolean = false;
  exibeUpdate: boolean = false;
  itens = [];
  itensFilter = [];
  itemsPerPage = 10;

  //COMBOS
  comboGranjas = [];
  selectGranjas = 0;

  constructor(
    private _HttpService: HttpService,
    private _ToastrService: ToastrService,
    private GlobalService: GlobalService,
    private _ShowService: ShowService
  ) {
    this.getItens();
  }

  ngOnInit() {
    this.getComboGranjas();
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
    //Permissões: read = 33, new = 34, edit = 35, delete = 36
    //BLOQUEIA TUDO
    if (this.permissoes.includes(33, 34, 35, 36) == false) {
      this.read = false;
      this.new = false;
      this.edit = false;
      this.delete = false;
    }

    //READ
    if (this.permissoes.includes(33)) {
      this.read = true;
    }
    //NEW
    if (this.permissoes.includes(34)) {
      this.new = true;
    }
    //EDIT
    if (this.permissoes.includes(35)) {
      this.edit = true
    }
    //DELETE
    if (this.permissoes.includes(36)) {
      this.delete = true;
    }
  }

  /************
  COMBOS
  *************/
  getComboGranjas() {
    this.isBusyList = true;
    this._HttpService.JSON_GET('/granjas/extra/combo', false, true)
      .then(
        res => {
          return this.comboGranjas = res.json();
        },
        error => {
          return this._ToastrService.error(error.json().message);
        }
      )

  }

  /************
  POST
  *************/
  postForm(form) {

    //VERIFICA CAMPOS PREENCHIDOS
    if (form.value.nome == null || form.value.nome == '' ||
      form.value.granjas_id == null || form.value.granjas_id == 0 ||
      form.value.largura == null || form.value.largura == '' ||
      form.value.comprimento == null || form.value.comprimento == '') {
      return this._ToastrService.error('Preencha todos os campos corretamente', 'Erro!');

    } else {

      //Alterar pra service depois
      form.value.nome = form.value.nome.toUpperCase();

      //BLOQUEANDO BOTAO DURANTE REQUEST
      this.isBusyForm = true;

      this._HttpService.JSON_POST('/galpoes', form.value, false, true)
        .then(
          res => {
            this.getItens();
            this.isBusyForm = false;
            this._ShowService.showInserir();
            if (res.json().message === 'erro') return this._ToastrService.error('O galpão com este nome já foi cadastrado!', 'Erro!');
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
    if (form.value.nome == null || form.value.nome == '' ||
      form.value.granjas_id == null || form.value.granjas_id == 0 ||
      form.value.largura == null || form.value.largura == '' ||
      form.value.comprimento == null || form.value.comprimento == '') {
      return this._ToastrService.error('Preencha todos os campos corretamente', 'Erro!');

    } else {

      //Alterar pra service depois
      form.value.nome = form.value.nome.toUpperCase();

      //BLOQUEANDO BOTAO DURANTE REQUEST
      this.isBusyForm = true;

      this._HttpService.JSON_PUT(`/galpoes/${this.GlobalService.getItem().id}`, form.value, false, true)
        .then(
          res => {
            this.getItens();
            this.isBusyForm = false;
            this.exibeUpdate = false;
            this._ShowService.showEditar();
            if (res.json().message === 'erro') return this._ToastrService.error('O galpão com este nome já foi cadastrado!', 'Erro!');
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
    this.isBusyList = true;
    this.loading = true;
    this._HttpService.JSON_GET('/galpoes', false, true)
      .then(
        res => {

          this.itensFilter = res.json().data;
          this.isBusyList = false;
          this.loading = false;
          return this.itens = res.json().data;

        },
        error => {
          this.isBusyList = false;
          this.loading = false;
          return this._ToastrService.error(error.json().message);
        }
      )

  }

  /************
  DELETE
  *************/
  deleteItem() {
    let res = confirm("Tem certeza que deseja excluir o galpao?");
    if (res) {

      this._HttpService.JSON_DELETE(`/galpoes/${this.GlobalService.getItem().id}`, false, true)
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
    let val = event.target.value.toLowerCase();

    if (val.length === 0) {
      this.itensFilter = this.itens;

    } else {

      let filtro = this.itensFilter.filter(function (d) {
        return d.nome.toLowerCase().indexOf(val) !== -1 || !val;
      });

      this.itensFilter = filtro;
    }

  }

}
