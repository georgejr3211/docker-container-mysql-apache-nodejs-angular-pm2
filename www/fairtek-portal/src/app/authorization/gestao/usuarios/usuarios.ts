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
  selector: 'app-usuarios',
  templateUrl: 'usuarios.html',
  styleUrls: ['usuarios.scss'],
  providers: [ShowService]
})
export class UsuariosComponent {

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

  comboGranjas = [];
  selectGranjas = 0;

  comboGrupo = [];
  selectGrupo = 0;

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
    this.getComboGranjas();
    this.getComboGrupo();
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
    //Permissões: read = 89, new = 90, edit = 91, delete = 92
    //BLOQUEIA TUDO
    if (this.permissoes.includes(89, 90, 91, 92) == false) {
      this.read = false;
      this.new = false;
      this.edit = false;
      this.delete = false;
    }

    //READ
    if (this.permissoes.includes(89)) {
      this.read = true;
    }
    //NEW
    if (this.permissoes.includes(90)) {
      this.new = true;
    }
    //EDIT
    if (this.permissoes.includes(91)) {
      this.edit = true
    }
    //DELETE
    if (this.permissoes.includes(92)) {
      this.delete = true;
    }
  }

  /************
  POST
  *************/
  postForm(form) {

    //VERIFICA CAMPOS PREENCHIDOS
    if (form.value.nome == null || form.value.nome == '' ||
      form.value.email == null || form.value.email == '' ||
      form.value.senha == null || form.value.senha == '' ||
      form.value.granja_id == 0 || form.value.grupo_id == 0) {
      return this._ToastrService.error('Preencha todos os campos corretamente', 'Erro!');

    } else {

      //VALIDA EMAIL
      if (form.value.email.indexOf('@') == -1) {
        return this._ToastrService.error('Email invalido', 'Erro!');

      } else {
        this.validaEmail = form.value.email.split('@');
        if (this.validaEmail[0] == null || this.validaEmail[0] == '' || this.validaEmail[1] == null || this.validaEmail[1] == '') {
          return this._ToastrService.error('Email invalido', 'Erro!');

        } else {

          //Alterar pra service depois
          form.value.nome = form.value.nome.toUpperCase();
          form.value.email = form.value.email.toUpperCase();

          //BLOQUEANDO BOTAO DURANTE REQUEST
          this.isBusyForm = true;

          this._HttpService.JSON_POST('/usuarios', form.value, false, true).then(
            res => {
              this.getItens();
              this.isBusyForm = false;
              this._ShowService.showInserir();
              if (!res.json().erro) return this._ToastrService.success(res.json().message);
              else return this._ToastrService.error(res.json().message);

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

  /************
  PUT
  *************/
  putForm(form) {


    //VERIFICA CAMPOS PREENCHIDOS
    if (form.value.nome == null || form.value.nome == '' ||
      form.value.email == null || form.value.email == '') {
      return this._ToastrService.error('Preencha todos os campos corretamente', 'Erro!');

    } else {

      //VALIDA EMAIL
      if (form.value.email.indexOf('@') == -1) {
        return this._ToastrService.error('Email invalido', 'Erro!');

      } else {
        this.validaEmail = form.value.email.split('@');
        if (this.validaEmail[0] == null || this.validaEmail[0] == '' || this.validaEmail[1] == null || this.validaEmail[1] == '') {
          return this._ToastrService.error('Email invalido', 'Erro!');

        } else {

          //Alterar pra service depois
          form.value.nome = form.value.nome.toUpperCase();
          form.value.email = form.value.email.toUpperCase();

          //BLOQUEANDO BOTAO DURANTE REQUEST
          this.isBusyForm = true;

          if (form.value.admin === true) { form.value.admin = 1 } else { form.value.admin = 0 }

          this._HttpService.JSON_PUT(`/usuarios/${this.GlobalService.getItem().id}`, form.value, false, true).then(
            res => {
              this.getItens();
              this.isBusyForm = false;
              this.exibeUpdate = false;
              this._ShowService.showEditar();
              if (!res.json().erro) return this._ToastrService.success(res.json().message);
              else return this._ToastrService.error(res.json().message);
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

  /************
  GET
  *************/
  getItens() {
    this.loading = true;
    this.isBusyList = true;
    this._HttpService.JSON_GET('/usuarios', false, true).then(
      res => {
        this.itensFilter = res.json().data;
        this.isBusyList = false;
        this.loading = false;
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
    let res = confirm("Tem certeza que deseja excluir o usuário?");
    if (res) {

      this._HttpService.JSON_DELETE(`/usuarios/${this.GlobalService.getItem().id}`, false, true)
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

  /************
  RESETA SENHA
  *************/
  resetaSenha() {
    let res = confirm("Tem certeza que deseja resetar a senha do usuário?");
    if (res) {

      this._HttpService.JSON_GET(`/usuarios/reseta-senha/${this.GlobalService.getItem().id}`, false, true)
        .then(
          res => {
            return this._ToastrService.success(res.json().message);
          },
          error => {
            return this._ToastrService.error(error.json().message);
          }
        )

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
  getComboGrupo() {
    this.isBusyList = true;
    this._HttpService.JSON_GET('/grupo-usuarios/extra/combo', false, true)
      .then(
        res => {
          return this.comboGrupo = res.json();
        },
        error => {
          return this._ToastrService.error(error.json().message);
        }
      )

  }

}
