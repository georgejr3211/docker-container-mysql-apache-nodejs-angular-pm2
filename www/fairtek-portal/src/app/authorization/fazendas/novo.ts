/***********************************************************
COMPONENTS
***********************************************************/
import { Component, OnInit, ViewChild } from '@angular/core';
import { ToastrService } from 'ngx-toastr';


/**********************************************************
PROVIDERS
***********************************************************/
import { HttpService } from '../../globals/http';
import { GlobalService } from '../../globals/globals';
import { ShowService } from '../../shared/app-show/show.service';
import * as crypto from 'crypto-js';
import * as _ from 'underscore';

@Component({
  selector: 'app-novo-fazendas',
  templateUrl: 'novo.html',
  styleUrls: ['novo.scss'],
  providers: [ShowService]
})
export class FazendasNovoComponent implements OnInit {
  private gridApi;

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
  comboProdutor = [];
  selectProdutor = 0;

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

  public localmask = function (rawValue) {

    if (rawValue[0] == "-") {
      if (rawValue[12] == "-") {
        return [/\D/, /[0-9]/, /[0-9]/, ",", /[0-9]/, /[0-9]/, /[0-9]/, /[0-9]/, /[0-9]/, /[0-9]/, "°", "/", /\D/, /[0-9]/, /[0-9]/, /[0-9]/, ",", /[0-9]/, /[0-9]/, /[0-9]/, /[0-9]/, /[0-9]/, /[0-9]/, "°"];
      }
      else if (rawValue[12] != '-') {
        return [/\D/, /[0-9]/, /[0-9]/, ",", /[0-9]/, /[0-9]/, /[0-9]/, /[0-9]/, /[0-9]/, /[0-9]/, "°", "/", /[0-9]/, /[0-9]/, /[0-9]/, ",", /[0-9]/, /[0-9]/, /[0-9]/, /[0-9]/, /[0-9]/, /[0-9]/, "°"];
      }
    }

    else {
      if (rawValue[11] == "-") {
        return [/[0-9]/, /[0-9]/, ",", /[0-9]/, /[0-9]/, /[0-9]/, /[0-9]/, /[0-9]/, /[0-9]/, "°", "/", /\D/, /[0-9]/, /[0-9]/, /[0-9]/, ",", /[0-9]/, /[0-9]/, /[0-9]/, /[0-9]/, /[0-9]/, /[0-9]/, "°"];
      }
      else {
        return [/[0-9]/, /[0-9]/, ",", /[0-9]/, /[0-9]/, /[0-9]/, /[0-9]/, /[0-9]/, /[0-9]/, "°", "/", /[0-9]/, /[0-9]/, /[0-9]/, ",", /[0-9]/, /[0-9]/, /[0-9]/, /[0-9]/, /[0-9]/, /[0-9]/, "°"];

      }
    }
  };




  constructor(
    private _HttpService: HttpService,
    private _ToastrService: ToastrService,
    private GlobalService: GlobalService,
    private _ShowService: ShowService
  ) {
    this.getItens();
  }

  ngOnInit() {
    this.getComboProdutores();
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
    //Permissões: read = 85, new = 86, edit = 87, delete = 88
    //BLOQUEIA TUDO
    if (this.permissoes.includes(85, 86, 87, 88) == false) {
      this.read = false;
      this.new = false;
      this.edit = false;
      this.delete = false;
    }

    //READ
    if (this.permissoes.includes(85)) {
      this.read = true;
    }
    //NEW
    if (this.permissoes.includes(86)) {
      this.new = true;
    }
    //EDIT
    if (this.permissoes.includes(87)) {
      this.edit = true
    }
    //DELETE
    if (this.permissoes.includes(88)) {
      this.delete = true;
    }
  }

  /************
  COMBOS
  *************/
  getComboProdutores() {
    this.isBusyList = true;
    this._HttpService.JSON_GET('/produtores/extra/combo', false, true)
      .then(
        res => {
          return this.comboProdutor = res.json();
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
      form.value.produtores_id == null || form.value.produtores_id == 0 ||
      form.value.localizacao == null || form.value.localizacao == '' ||
      form.value.endereco == null || form.value.endereco == '' ||
      form.value.telefone == null || form.value.telefone == '') {
      return this._ToastrService.error('Preencha todos os campos corretamente', 'Erro!');

    } else {

      form.value.nome = form.value.nome.toUpperCase();
      form.value.localizacao = form.value.localizacao.toUpperCase();
      form.value.endereco = form.value.endereco.toUpperCase();
      form.value.email = form.value.email.toUpperCase();
      //BLOQUEANDO BOTAO DURANTE REQUEST
      this.isBusyForm = true;

      this._HttpService.JSON_POST('/fazendas', form.value, false, true)
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

    //VERIFICA CAMPOS PREENCHIDOS
    if (form.value.nome == null || form.value.nome == '' ||
      form.value.produtores_id == null || form.value.produtores_id == 0 ||
      form.value.localizacao == null || form.value.localizacao == '' ||
      form.value.endereco == null || form.value.endereco == '' ||
      form.value.telefone == null || form.value.telefone == '') {
      return this._ToastrService.error('Preencha todos os campos corretamente', 'Erro!');

    } else {

      form.value.nome = form.value.nome.toUpperCase();
      form.value.localizacao = form.value.localizacao.toUpperCase();
      form.value.endereco = form.value.endereco.toUpperCase();
      form.value.email = form.value.email.toUpperCase();

      //BLOQUEANDO BOTAO DURANTE REQUEST
      //BLOQUEANDO BOTAO DURANTE REQUEST
      this.isBusyForm = true;

      this._HttpService.JSON_PUT(`/fazendas/${this.GlobalService.getItem().id}`, form.value, false, true)
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
    this.isBusyList = true;
    this.loading = true;
    this._HttpService.JSON_GET('/fazendas', false, true)
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
    let res = confirm("Tem certeza que deseja excluir o fazenda?");

    if (res) {
      this._HttpService.JSON_DELETE(`/fazendas/${this.GlobalService.getItem().id}`, false, true)
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
