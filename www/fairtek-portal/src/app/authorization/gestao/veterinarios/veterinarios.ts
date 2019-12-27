/***********************************************************
COMPONENTS
***********************************************************/
import { Component } from '@angular/core';
import { ToastrService } from 'ngx-toastr';

/**********************************************************
PROVIDERS
***********************************************************/
import { HttpService } from '../../../globals/http';
import { GlobalService } from '../../../globals/globals';
import { ShowService } from '../../../shared/app-show/show.service'

import * as crypto from 'crypto-js';
import * as _ from 'underscore';
@Component({
  selector: 'app-veterinarios',
  templateUrl: 'veterinarios.html',
  styleUrls: ['veterinarios.scss'],
  providers: [ShowService]
})
export class VeterinariosComponent {

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
  validaEmail = [];

  loading: boolean = true;

  public cpfcnpjmask = function (rawValue) {
    var numbers = rawValue.match(/\d/g);
    var numberLength = 0;

    if (numbers) {
      numberLength = numbers.join('').length;
    }

    if (numberLength <= 11) {
      return [/[0-9]/, /[0-9]/, /[0-9]/, '.', /[0-9]/, /[0-9]/, /[0-9]/, '.', /[0-9]/, /[0-9]/, /[0-9]/, '-', /[0-9]/, /[0-9]/];
    } else {
      return [/[0-9]/, /[0-9]/, '.', /[0-9]/, /[0-9]/, /[0-9]/, '.', /[0-9]/, /[0-9]/, /[0-9]/, '/', /[0-9]/, /[0-9]/, /[0-9]/, /[0-9]/, '-', /[0-9]/, /[0-9]/];
    }
  }

  public telefonemask = function (rawValue) {
    var numbers = rawValue.match(/\d/g);
    var numberLength = 0;

    if (numbers) {
      numberLength = numbers.join('').length;

    }

    if (numberLength <= 10) {
      return ['(', /[0-9]/, /[0-9]/, ')', ' ', /[0-9]/, /[0-9]/, /[0-9]/, /[0-9]/, '-', /[0-9]/, /[0-9]/, /[0-9]/, /[0-9]/];
    } else {
      return ['(', /[0-9]/, /[0-9]/, ')', ' ', /[0-9]/, /[0-9]/, /[0-9]/, /[0-9]/, /[0-9]/, '-', /[0-9]/, /[0-9]/, /[0-9]/, /[0-9]/];
    }
  }

  public datamask = [/[0-9]/, /[1-9]/, '/', /[0-9]/, /[1-9]/, '/', /[0-9]/, /[0-9]/, /[0-9]/, /[0-9]/];
  public cepmask = [/[0-9]/, /[0-9]/, /[0-9]/, /[0-9]/, /[0-9]/, '-', /[0-9]/, /[0-9]/, /[0-9]/];
  public crmv = [/[0-9]/, /[0-9]/, '-', /[0-9]/, /[0-9]/, /[0-9]/];

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
    //Permissões: read = 21, new = 22, edit = 23, delete = 24
    //BLOQUEIA TUDO
    if (this.permissoes.includes(21, 22, 23, 24) == false) {
      this.read = false;
      this.new = false;
      this.edit = false;
      this.delete = false;
    }

    //READ
    if (this.permissoes.includes(21)) {
      this.read = true;
    }
    //NEW
    if (this.permissoes.includes(22)) {
      this.new = true;
    }
    //EDIT
    if (this.permissoes.includes(23)) {
      this.edit = true
    }
    //DELETE
    if (this.permissoes.includes(24)) {
      this.delete = true;
    }
  }


  /************
  POST
  *************/
  postForm(form) {

    //VERIFICA CAMPOS PREENCHIDOS
    if (form.value.nome == null || form.value.nome == '' ||
      /* form.value.codigo == null || form.value.codigo == '' || */
      form.value.crmv == null || form.value.crmv == '' ||
      form.value.email == null || form.value.email == '' ||
      form.value.telefone == null || form.value.telefone == '') {
      return this._ToastrService.error('Preencha todos os campos corretamente', 'Erro!');

    } else {
      //VALIDA CRMV
      if (form.value.crmv.indexOf('_') != -1) {
        return this._ToastrService.error('CRMV invalido', 'Erro!');
      }

      //VALIDA EMAIL
      if (form.value.email.indexOf('@') == -1) {
        return this._ToastrService.error('Email invalido', 'Erro!');

      } else {
        this.validaEmail = form.value.email.split('@');
        if (this.validaEmail[0] == null || this.validaEmail[0] == '' || this.validaEmail[1] == null || this.validaEmail[1] == '') {
          return this._ToastrService.error('Email invalido', 'Erro!');

        } else {

          //VALIDA TELEFONE
          if (form.value.telefone.indexOf('_') != -1) {
            return this._ToastrService.error('Telefone invalido', 'Erro!');
          } else {

            //Alterar pra service depois
            form.value.nome = form.value.nome.toUpperCase();
            form.value.email = form.value.email.toUpperCase();

            //BLOQUEANDO BOTAO DURANTE REQUEST
            this.isBusyForm = true;

            this._HttpService.JSON_POST('/veterinarios', form.value, false, true)
              .then(
                res => {
                  this.getItens();
                  this.isBusyForm = false;
                  this._ShowService.showInserir();
                  if (res.json().message === 'erro') return this._ToastrService.error('Já existe um veterinário cadastrado com esses dados.', 'Erro!');
                  else return this._ToastrService.success(res.json().message);
                },
                error => {
                  this.isBusyForm = false;
                  return this._ToastrService.error(error.json().message);
                }
              )
          }
        }
      }
    }
  }

  /************
  PUT
  *************/
  putForm(form) {

    //VERIFICA CAMPOS PREENCHIDOS
    if (form.value.nome == null || form.value.nome == '' ||
      /* form.value.codigo == null || form.value.codigo == '' || */
      form.value.crmv == null || form.value.crmv == '' ||
      form.value.email == null || form.value.email == '' ||
      form.value.telefone == null || form.value.telefone == '') {
      return this._ToastrService.error('Preencha todos os campos corretamente', 'Erro!');

    } else {
      //VALIDA CRMV
      if (form.value.crmv.indexOf('_') != -1) {
        return this._ToastrService.error('CRMV invalido', 'Erro!');
      }
      //VALIDA EMAIL
      if (form.value.email.indexOf('@') == -1) {
        return this._ToastrService.error('Email invalido', 'Erro!');

      } else {
        this.validaEmail = form.value.email.split('@');
        if (this.validaEmail[0] == null || this.validaEmail[0] == '' || this.validaEmail[1] == null || this.validaEmail[1] == '') {
          return this._ToastrService.error('Email invalido', 'Erro!');

        } else {

          //VALIDA TELEFONE
          if (form.value.telefone.indexOf('_') != -1) {
            return this._ToastrService.error('Telefone invalido', 'Erro!');
          } else {

            //Alterar pra service depois
            form.value.nome = form.value.nome.toUpperCase();
            form.value.email = form.value.email.toUpperCase();

            //BLOQUEANDO BOTAO DURANTE REQUEST
            this.isBusyForm = true;

            this._HttpService.JSON_PUT(`/veterinarios/${this.GlobalService.getItem().id}`, form.value, false, true)
              .then(
                res => {
                  this.getItens();
                  this.isBusyForm = false;
                  this.exibeUpdate = false;
                  this._ShowService.showEditar();
                  if (res.json().message === 'erro') return this._ToastrService.error('Já existe um veterinário cadastrado com esses dados.', 'Erro!');
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
      }
    }
  }

  /************
  GET
  *************/
  getItens() {
    this.loading = true;
    this.isBusyList = true;
    this._HttpService.JSON_GET('/veterinarios', false, true)
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
    let res = confirm("Tem certeza que deseja excluir o veterinario?");
    if (res) {

      this._HttpService.JSON_DELETE(`/veterinarios/${this.GlobalService.getItem().id}`, false, true)
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
