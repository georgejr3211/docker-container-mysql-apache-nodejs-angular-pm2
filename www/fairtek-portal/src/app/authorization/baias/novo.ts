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
import { UtilsService } from '../../globals/utils';
import * as crypto from 'crypto-js';
import * as _ from 'underscore';
@Component({
  selector: 'app-novo-baias',
  templateUrl: 'novo.html',
  styleUrls: ['novo.scss'],
  providers: [ShowService]
})
export class BaiasNovoComponent implements OnInit {

  loading: boolean = true;

  permissoes;
  read: boolean = false;
  new: boolean = false;
  edit: boolean = false;
  delete: boolean = false;

  isBusyForm: boolean = false;
  isBusyList: boolean = false;
  exibeUpdate: boolean = false;
  exibeInsere: boolean = false;
  exibeLista: boolean = true;
  itens = [];
  itensFilter = [];
  itemsPerPage = 10;
  total = 0;
  capacidade = 0;
  femea = 0;
  change: boolean = false;
  granjas_id = 0;

  //COMBOS
  comboGalpao = [];
  selectGalpao = 0;
  galpoes = [];
  comboGranjas = [];
  selectGranjas = 0;

  constructor(
    private _HttpService: HttpService,
    private _ToastrService: ToastrService,
    private GlobalService: GlobalService,
    private _ShowService: ShowService,
    private util: UtilsService
  ) {
    this.getItens();
  }

  ngOnInit() {
    this.getComboGalpao();
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
    //Permissões: read = 37, new = 38, edit = 39, delete = 40
    //BLOQUEIA TUDO
    if (this.permissoes.includes(37, 38, 39, 40) == false) {
      this.read = false;
      this.new = false;
      this.edit = false;
      this.delete = false;
    }

    //READ
    if (this.permissoes.includes(37)) {
      this.read = true;
    }
    //NEW
    if (this.permissoes.includes(38)) {
      this.new = true;
    }
    //EDIT
    if (this.permissoes.includes(39)) {
      this.edit = true
    }
    //DELETE
    if (this.permissoes.includes(40)) {
      this.delete = true;
    }
  }

  femeaChangedTot(event) {
    this.femea = event / this.GlobalService.getItem().capacidade;
    this.femea = Math.floor(this.femea);
    this.change = true;
    return this.femea;
  }

  femeaChangedCap(event) {
    this.femea = this.GlobalService.getItem().total / event;
    this.femea = Math.floor(this.femea);
    this.change = true;
    return this.femea;
  }
  femeaChanged(event) {
    this.femea = this.total / this.capacidade;
    this.femea = Math.floor(this.femea);
    this.change = true;
    return this.femea;
  }

  limpaCampo() {
    this.femea = 0
    this.capacidade = 0;
    this.total = 0;
  }

  /************
  COMBOS
  *************/
  getComboGalpao() {
    this.isBusyList = true;
    this._HttpService.JSON_GET('/galpoes/extra/combo', false, true)
      .then(
        res => {
          return this.comboGalpao = res.json();
        },
        error => {
          return this._ToastrService.error(error.json().message);
        }
      )

  }
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

  selectGranja() {
    this.galpoesGranja(this.granjas_id);
  }
  galpoesGranja(granja_id) {
    this._HttpService.JSON_GET(`/galpoes/granja/${granja_id}`, false, true)
      .then(
        res => {
          this.util.returnToastArrVazio(res.json(), 'Galpões');
          this.isBusyList = true;
          this.galpoes = res.json();


        },
        error => {
          return this._ToastrService.error(error.json().message);
        });
  }


  itemValue() {
  }

  /************
  POST
  *************/
  postForm(form) {

    form.value.femea = this.femea;
    //VERIFICA CAMPOS PREENCHIDOS
    if (form.value.nome == null || form.value.nome == '' || form.value.nome == 0 ||
      form.value.galpoes_id == null || form.value.galpoes_id == '' || form.value.galpoes_id == 0 ||
      form.value.capacidade == null || form.value.capacidade == '' || form.value.capacidade == 0 ||
      form.value.total == null || form.value.total == '' || form.value.total == 0 ||
      /*form.value.espaco == null || form.value.espaco == '' || form.value.espaco == 0 ||
      form.value.largura == null || form.value.largura == '' || form.value.largura == 0 ||
      form.value.comprimento == null || form.value.comprimento == '' || form.value.comprimento == 0 || 
      form.value.tamanho == null || form.value.tamanho == '' || form.value.tamanho == 0 || 
      form.value.sugerido == null || form.value.sugerido == '' || form.value.sugerido == 0 || */
      form.value.femea == null || form.value.femea == '' || form.value.femea == 0) {
      return this._ToastrService.error('Preencha todos os campos corretamente', 'Erro!');

    } else {
      //Alterar pra service depois
      form.value.nome = form.value.nome.toUpperCase();

      //BLOQUEANDO BOTAO DURANTE REQUEST
      this.isBusyForm = true;

      this._HttpService.JSON_POST('/baias', form.value, false, true)
        .then(
          res => {
            this.getItens();
            this.isBusyForm = false;
            this._ShowService.showInserir();
            this.limpaCampo();
            if (res.json().message === 'erro') return this._ToastrService.error('A baia com este nome já foi cadastrada!', 'Erro!');
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
    if (form.value.nome == null || form.value.nome == '' || form.value.nome == 0 ||
      form.value.galpoes_id == null || form.value.galpoes_id == '' || form.value.galpoes_id == 0 ||
      form.value.capacidade == null || form.value.capacidade == '' || form.value.capacidade == 0 ||
      form.value.total == null || form.value.total == '' || form.value.total == 0 ||
      /*form.value.espaco == null || form.value.espaco == '' || form.value.espaco == 0 ||
      form.value.largura == null || form.value.largura == '' || form.value.largura == 0 ||
      form.value.comprimento == null || form.value.comprimento == '' || form.value.comprimento == 0 || 
      form.value.tamanho == null || form.value.tamanho == '' || form.value.tamanho == 0 || 
      form.value.sugerido == null || form.value.sugerido == '' || form.value.sugerido == 0 || */
      form.value.femea == null || form.value.femea == '' || form.value.femea == 0) {
      return this._ToastrService.error('Preencha todos os campos corretamente', 'Erro!');

    } else {
      //Alterar pra service depois
      form.value.nome = form.value.nome.toUpperCase();

      //BLOQUEANDO BOTAO DURANTE REQUEST
      this.isBusyForm = true;

      this._HttpService.JSON_PUT(`/baias/${this.GlobalService.getItem().id}`, form.value, false, true)
        .then(
          res => {
            this.getItens();
            this.isBusyForm = false;
            this.exibeUpdate = false;
            this.change = false;
            this._ShowService.showEditar();
            this.limpaCampo();
            if (res.json().message === 'erro') return this._ToastrService.error('A baia com este nome já foi cadastrada!', 'Erro!');
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
    this._HttpService.JSON_GET('/baias', false, true)
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
    let res = confirm("Tem certeza que deseja excluir a baia?");
    if (res) {

      this._HttpService.JSON_DELETE(`/baias/${this.GlobalService.getItem().id}`, false, true)
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
