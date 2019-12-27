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
  selector: 'app-novo',
  templateUrl: 'novo.html',
  styleUrls: ['novo.scss'],
  providers: [ShowService]
})
export class DosadoresComponent implements OnInit {

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
  validaPut = this.GlobalService.getItem().pTi;

  //COMBOS
  comboBaia = [];
  selectBaia = 0;

  loading: boolean = true;

  constructor(
    private _HttpService: HttpService,
    private _ToastrService: ToastrService,
    private GlobalService: GlobalService,
    private _ShowService: ShowService
  ) {
    
  }

  ngOnInit() {
    this.getComboBaia();
    this.getItens();
    //console.log("pti: ", this.GlobalService.getItem().pTi)
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
    //Permissões: read = 77, new = 78, edit = 79, delete = 80
    //BLOQUEIA TUDO
    if (this.permissoes.includes(77, 78, 79, 80) == false) {
      this.read = false;
      this.new = false;
      this.edit = false;
      this.delete = false;
    }

    //READ
    if (this.permissoes.includes(77)) {
      this.read = true;
    }
    //NEW
    if (this.permissoes.includes(78)) {
      this.new = true;
    }
    //EDIT
    if (this.permissoes.includes(79)) {
      this.edit = true
    }
    //DELETE
    if (this.permissoes.includes(80)) {
      this.delete = true;
    }
  }

  /************
  COMBOS
  *************/
  getComboBaia() {
    this.isBusyList = true;
    this._HttpService.JSON_GET('/baias/extra/combo', false, true)
      .then(
        res => {
          return this.comboBaia = res.json();
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
    if (/* form.value.codigo == null || form.value.codigo == '' || */
      form.value.baias_id == null || form.value.baias_id == 0) {
      return this._ToastrService.error('Preencha todos os campos corretamente', 'Erro!');

    } else {

      //BLOQUEANDO BOTAO DURANTE REQUEST
      this.isBusyForm = true;

      this._HttpService.JSON_POST('/dosadores', form.value, false, true)
        .then(
          res => {
            this.getItens();
            this.isBusyForm = false;
            this._ShowService.showInserir();
            return this._ToastrService.success(res.json().message);
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
    if (this.validaPut != null) {

      this.putFormParametros(
        {
          value: {
            pTi: form.value.pTi.value,
            pTa: form.value.pTa.value,
            pTp: form.value.pTp.value,
            pTr: form.value.pTr.value,
            pTs: form.value.pTs.value
          }
        }
      );
    }
    //VERIFICA CAMPOS PREENCHIDOS
    if (/* form.value.codigo == null || form.value.codigo == '' || */
      form.value.baias_id == null || form.value.baias_id == 0) {
      return this._ToastrService.error('Preencha todos os campos corretamente', 'Erro!');

    } else {

      //BLOQUEANDO BOTAO DURANTE REQUEST
      this.isBusyForm = true;

      this._HttpService.JSON_PUT(`/dosadores/${this.GlobalService.getItem().id}`, form.value, false, true)
        .then(
          res => {
            this.getItens();
            this.isBusyForm = false;
            this.exibeUpdate = false;
            this._ShowService.showEditar();
            return this._ToastrService.success(res.json().message);
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
    this._HttpService.JSON_GET('/dosadores', false, true)
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
    let res = confirm("Tem certeza que deseja excluir o dosador?");
    if (res) {

      this._HttpService.JSON_DELETE(`/dosadores/${this.GlobalService.getItem().id}`, false, true)
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
        return d.codigo.toLowerCase().indexOf(val) !== -1 || !val;
      });

      this.itensFilter = filtro;
    }

  }

  /************
  SETANDO PARAMETROS PRE DEFINIDOS
  *************/
  setDefautParametros($event) {
    if (this.GlobalService.getItem().pTi === null || this.GlobalService.getItem().pTi === 0 || this.GlobalService.getItem().pTi === '') {
      //VALORES PREDEFINIDOS
      let pTi = 3000;
      //let pTd = 1080;
      let pTa = 3000;
      let pTp = 1080;
      let pTr = 3000;
      let pTs = 2000;
      //let pTar = 60000;
      this.GlobalService.getItem().pTi = pTi;
      //this.GlobalService.getItem().pTd = pTd;
      this.GlobalService.getItem().pTa = pTa;
      this.GlobalService.getItem().pTp = pTp;
      this.GlobalService.getItem().pTr = pTr;
      this.GlobalService.getItem().pTs = pTs;
      //this.GlobalService.getItem().pTar = pTar;
    }
  }

  /************
  PUT
  *************/
  putFormParametros(form) {

    if (typeof form.value.pTi != 'number') {
      form.value.pTi = form.value.pTi.value
      form.value.pTa = form.value.pTa.value
      form.value.pTp = form.value.pTp.value
      form.value.pTr = form.value.pTr.value
      form.value.pTs = form.value.pTs.value
    }

    //VERIFICA CAMPOS PREENCHIDOS
    if (form.value.pTi == null || form.value.pTi == 0
      //|| form.value.pTd == null || form.value.pTd == 0
      || form.value.pTa == null || form.value.pTa == 0
      || form.value.pTp == null || form.value.pTp == 0
      || form.value.pTr == null || form.value.pTr == 0
      || form.value.pTs == null || form.value.pTs == 0) {
      //|| form.value.pTar == null || form.value.pTar == 0) {
      return this._ToastrService.error('Preencha todos os campos corretamente', 'Erro!');

    } else {
      form.value.pTd = 0;
      form.value.pTar = 0;

      //REGRA DE PARAMETROS
      // if (form.value.pTd < (form.value.pTa + form.value.pTr + form.value.pTs)) {
      //   return this._ToastrService.error('O valor de pTd necessita ser maior que (pTa+pTr+pTs)', 'Erro!');

      // } else {

      //BLOQUEANDO BOTAO DURANTE REQUEST
      this.isBusyForm = true;

      this._HttpService.JSON_PUT(`/dosadores/getid/${this.GlobalService.getItem().id}/parametros/edit`, form.value, false, true)
        .then(
          res => {
            this.getItens();
            this.isBusyForm = false;
            this.exibeUpdate = false;
            this._ShowService.showEditar();
            return this._ToastrService.success(res.json().message);
          },
          error => {
            this.isBusyForm = false;
            this.exibeUpdate = false;
            return this._ToastrService.error(error.json().message);
          }
        )

      //}

    }
  }

  /************
  PUT
  *************/
  abrirRede() {

    let res = confirm("Tem certeza que abrir a rede?");
    if (res) {
      return this._HttpService.JSON_GET('/abrir-rede', false, true)
        .then(
          res => {
            this._ToastrService.success(res.json().message);
          },
          error => {
            this._ToastrService.success(error.json().message);
          }
        )
    }

  }

}