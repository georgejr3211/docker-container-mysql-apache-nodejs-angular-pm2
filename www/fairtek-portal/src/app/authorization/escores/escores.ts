/***********************************************************
COMPONENTS
***********************************************************/
import { Component, OnInit } from '@angular/core';

/**********************************************************
PROVIDERS
***********************************************************/
import { HttpService } from '../../globals/http';
import { GlobalService } from '../../globals/globals';

/***********************************************************
SERVICE
***********************************************************/
import { ToastrService } from 'ngx-toastr';
import { ShowService } from '../../shared/app-show/show.service'

import * as crypto from 'crypto-js';
import * as _ from 'underscore';
@Component({
  selector: 'app-escores',
  templateUrl: './escores.html',
  styleUrls: ['./escores.css'],
  providers: [ShowService]
})
export class EscoresComponent implements OnInit {

  loading: boolean = true;

  permissoes;
  read: boolean = false;
  new: boolean = false;
  edit: boolean = false;
  delete: boolean = false;

  isBusyForm: boolean = false;
  isBusyList: boolean = false;

  medida: string = 'gramas';

  exibeUpdate: boolean = false;
  itens = [];
  itensFilter = [];
  itemsPerPage = 10;
  comboDietas = [];

  constructor(
    private _HttpService: HttpService,
    private GlobalService: GlobalService,
    private _ToastrService: ToastrService,
    private _ShowService: ShowService
  ) { }

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
    //Permissões: read = 45, new = 46, edit = 47, delete = 48
    //BLOQUEIA TUDO
    if (this.permissoes.includes(45, 46, 47, 48) == false) {
      this.read = false;
      this.new = false;
      this.edit = false;
      this.delete = false;
    }

    //READ
    if (this.permissoes.includes(45)) {
      this.read = true;
    }
    //NEW
    if (this.permissoes.includes(46)) {
      this.new = true;
    }
    //EDIT
    if (this.permissoes.includes(47)) {
      this.edit = true
    }
    //DELETE
    if (this.permissoes.includes(48)) {
      this.delete = true;
    }
  }

  /************
    POST
    *************/
  postForm(form) {

    form.value.medida = this.medida;

    //VERIFICA CAMPOS PREENCHIDOS
    if (form.value.nome == null || form.value.nome == '' ||
      form.value.peso == null || form.value.peso === '' ||
      form.value.medida == null || form.value.medida == '') {

      return this._ToastrService.warning('Preencha todos os campos corretamente', 'Erro!');

    } else {

      //Alterar pra service depois
      form.value.nome = form.value.nome.toUpperCase();
      form.value.medida = form.value.medida.toUpperCase();

      //BLOQUEANDO BOTAO DURANTE REQUEST
      this.isBusyForm = true;

      this._HttpService.JSON_POST('/escores', form.value, false, true)
        .then(
          res => {
            this.isBusyForm = false;
            this.getItens();
            if (res.json().id === 1) {
              return this._ToastrService.warning(res.json().message);
            } else if (res.json().id === 2) {
              this._ShowService.showInserir();
              return this._ToastrService.success(res.json().message);
            } else {
              return this._ToastrService.error(res.json().message);
            }
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

    form.value.medida = this.medida;

    //VERIFICA CAMPOS PREENCHIDOS
    if (form.value.nome == null || form.value.nome == '' ||
      form.value.peso == null || form.value.peso === '' ||
      form.value.medida == null || form.value.medida == '') {
      return this._ToastrService.error('Preencha todos os campos corretamente', 'Erro!');

    } else {

      //Alterar pra service depois
      form.value.nome = form.value.nome.toUpperCase();
      form.value.medida = form.value.medida.toUpperCase();

      //BLOQUEANDO BOTAO DURANTE REQUEST
      this.isBusyForm = true;

      this._HttpService.JSON_PUT(`/escores/${this.GlobalService.getItem().id}`, form.value, false, true)
        .then(
          res => {
            this.getItens();
            this.isBusyForm = false;
            this.exibeUpdate = false;
            this._ShowService.showEditar();
            if (res.json().message === 'erro') return this._ToastrService.error('O escore com estes dados já foi cadastrado!', 'Erro!');
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
    this._HttpService.JSON_GET('/escores', false, true)
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
    let res = confirm("Tem certeza que deseja excluir o animal?");
    if (res) {

      this._HttpService.JSON_DELETE(`/escores/${this.GlobalService.getItem().id}`, false, true)
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
