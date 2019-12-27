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
  selector: 'app-novo-granja',
  templateUrl: 'novo.html',
  styleUrls: ['novo.scss'],
  providers: [ShowService]
})
export class GranjasNovoComponent implements OnInit {


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
  comboFazendas = [];
  selectFazendas = 0;

  comboVeterinarios = [];
  selectVeterinarios = 0;

  comboNutricionistas = [];
  selectNutricionistas = 0;

  comboGerentes = [];
  selectGerentes = 0;

  comboOperadores = [];
  selectOperadores = 0;

  comboGeneticas = [];
  selectGeneticas = 0;

  comboProdutores = [];
  selectProdutores = 0;

  selectModulosDeProducao = 0;

  qtdCampos = 11;
  campoVazio = [];
  camposForm = [];

  selectPlanos = 0;

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
    this.getComboFazendas();
    this.getComboVeterinarios();
    this.getComboNutricionistas();
    this.getComboGerentes();
    this.getComboOperadores();
    this.getComboGeneticas();
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
    //Permissões: read = 29, new = 30, edit = 31, delete = 32
    //BLOQUEIA TUDO
    if (this.permissoes.includes(29, 30, 31, 32) == false) {
      this.read = false;
      this.new = false;
      this.edit = false;
      this.delete = false;
    }

    //READ
    if (this.permissoes.includes(29)) {
      this.read = true;
    }
    //NEW
    if (this.permissoes.includes(30)) {
      this.new = true;
    }
    //EDIT
    if (this.permissoes.includes(31)) {
      this.edit = true
    }
    //DELETE
    if (this.permissoes.includes(32)) {
      this.delete = true;
    }
  }

  /************
  COMBOS
  *************/
  getComboFazendas() {
    this.isBusyList = true;
    this._HttpService.JSON_GET('/fazendas/extra/combo', false, true)
      .then(
        res => {
          return this.comboFazendas = res.json();
        },
        error => {
          return this._ToastrService.error(error.json().message);
        }
      )
  }

  getComboVeterinarios() {
    this.isBusyList = true;
    this._HttpService.JSON_GET('/veterinarios/extra/combo', false, true)
      .then(
        res => {
          return this.comboVeterinarios = res.json();
        },
        error => {
          return this._ToastrService.error(error.json().message);
        }
      )
  }

  getComboNutricionistas() {
    this.isBusyList = true;
    this._HttpService.JSON_GET('/nutricionistas/extra/combo', false, true)
      .then(
        res => {
          return this.comboNutricionistas = res.json();
        },
        error => {
          return this._ToastrService.error(error.json().message);
        }
      )
  }

  getComboGerentes() {
    this.isBusyList = true;
    this._HttpService.JSON_GET('/gerentes/extra/combo', false, true)
      .then(
        res => {
          return this.comboGerentes = res.json();
        },
        error => {
          return this._ToastrService.error(error.json().message);
        }
      )
  }

  getComboOperadores() {
    this.isBusyList = true;
    this._HttpService.JSON_GET('/operadores/extra/combo', false, true)
      .then(
        res => {
          return this.comboOperadores = res.json();
        },
        error => {
          return this._ToastrService.error(error.json().message);
        }
      )
  }

  getComboGeneticas() {
    this.isBusyList = true;
    this._HttpService.JSON_GET('/geneticas/extra/combo', false, true)
      .then(
        res => {
          return this.comboGeneticas = res.json();
        },
        error => {
          return this._ToastrService.error(error.json().message);
        }
      )
  }

  getComboProdutores() {
    this.isBusyList = true;
    this._HttpService.JSON_GET('/produtores/extra/combo', false, true)
      .then(
        res => {
          return this.comboProdutores = res.json();
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
      /* form.value.codigo == null || form.value.codigo == '' || */
      form.value.fazendas_id == null || form.value.fazendas_id == 0 ||
      form.value.veterinarios_id == null || form.value.veterinarios_id == 0 ||
      form.value.nutricionistas_id == null || form.value.nutricionistas_id == 0 ||
      form.value.produtores_id == null || form.value.produtores_id == 0 ||
      form.value.gerentes_id == null || form.value.gerentes_id == 0 ||
      form.value.operadores_id == null || form.value.operadores_id == 0 ||
      form.value.geneticas_id == null || form.value.geneticas_id == 0 ||
      form.value.localizacao == null || form.value.localizacao == '' ||
      form.value.endereco == null || form.value.endereco == '' ||
      form.value.modulo_de_producao == null || form.value.modulo_de_producao == 0) {

      this.camposForm =
        [form.value.nome, form.value.fazendas_id, form.value.veterinarios_id, form.value.nutricionistas_id, form.value.produtores_id, form.value.gerentes_id
          , form.value.operadores_id, form.value.geneticas_id, form.value.localizacao, form.value.endereco, form.value.modulo_de_producao]

      this.campoVazio = [];

      if (form.value.nome == null || form.value.nome == '') {
        this.campoVazio.push(' Nome');
      }
      if (form.value.fazendas_id == null || form.value.fazendas_id == '') {
        this.campoVazio.push(' Fazenda');
      }
      if (form.value.localizacao == null || form.value.localizacao == '') {
        this.campoVazio.push(' Localização');
      }
      if (form.value.endereco == null || form.value.endereco == '') {
        this.campoVazio.push(' Endereço');
      }
      if (form.value.produtores_id == null || form.value.produtores_id == 0) {
        this.campoVazio.push(' Produtor');
      }
      if (form.value.veterinarios_id == null || form.value.veterinarios_id == 0) {
        this.campoVazio.push(' Veterinario');
      }
      if (form.value.nutricionistas_id == null || form.value.nutricionistas_id == 0) {
        this.campoVazio.push(' Nutricionista');
      }
      if (form.value.gerentes_id == null || form.value.gerentes_id == 0) {
        this.campoVazio.push(' Gerente');
      }
      if (form.value.operadores_id == null || form.value.operadores_id == 0) {
        this.campoVazio.push(' Operador');
      }
      if (form.value.modulo_de_producao == null || form.value.modulo_de_producao == 0) {
        this.campoVazio.push(' Módulo de Produção');
      }
      if (form.value.geneticas_id == null || form.value.geneticas_id == 0) {
        this.campoVazio.push(' Geneticas');
      }




      // for ( let i = 0; i <= this.qtdCampos; i++){
      //   if (this.camposForm[i] == null || this.camposForm[i] == '' || this.camposForm[i] == 0){
      //     switch (this.camposForm[i]) {
      //       case form.value.nome :
      //           this.campoVazio.push(' Nome');
      //       break;
      //       case form.value.fazendas_id :
      //         this.campoVazio.push(' Fazenda');
      //       break;
      //       case form.value.veterinarios_id :
      //         this.campoVazio.push(' Veterinario');
      //       break;
      //       case form.value.nutricionistas_id :
      //         this.campoVazio.push(' Nutricionista');
      //       break;
      //       case form.value.produtores_id :
      //         this.campoVazio.push(' Produtor');
      //       break;
      //       case form.value.gerentes_id :
      //         this.campoVazio.push(' Gerente');
      //       break;
      //       case form.value.operadores_id :
      //         this.campoVazio.push(' Operador');
      //       break;
      //       case form.value.geneticas_id :
      //         this.campoVazio.push(' Genética');
      //       break;
      //       case form.value.localizacao :
      //         this.campoVazio.push(' Localização');
      //       break;
      //       case form.value.endereco :
      //         this.campoVazio.push(' Endereço');
      //       break;
      //       case form.value.modulo_de_producao :
      //         this.campoVazio.push(' Módulo de produção');
      //       break;
      //       default:
      //       console.log('aqui: ',i)

      //     }
      //   }
      // }

      if (this.campoVazio != null) {
        return this._ToastrService.error(`O(s) campo(s) ${this.campoVazio} não estão preenchidos corretamente'`, 'Erro!');

      }
    } else {

      //Alterar pra service depois
      form.value.nome = form.value.nome.toUpperCase();
      form.value.endereco = form.value.endereco.toUpperCase();
      form.value.modulo_de_producao = form.value.modulo_de_producao.toUpperCase();

      //BLOQUEANDO BOTAO DURANTE REQUEST
      this.isBusyForm = true;

      this._HttpService.JSON_POST('/granjas', form.value, false, true)
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
      /* form.value.codigo == null || form.value.codigo == '' || */
      form.value.fazendas_id == null || form.value.fazendas_id == 0 ||
      form.value.veterinarios_id == null || form.value.veterinarios_id == 0 ||
      form.value.nutricionistas_id == null || form.value.nutricionistas_id == 0 ||
      form.value.produtores_id == null || form.value.produtores_id == 0 ||
      form.value.gerentes_id == null || form.value.gerentes_id == 0 ||
      form.value.operadores_id == null || form.value.operadores_id == 0 ||
      form.value.geneticas_id == null || form.value.geneticas_id == 0 ||
      form.value.localizacao == null || form.value.localizacao == '' ||
      form.value.endereco == null || form.value.endereco == '' ||
      form.value.modulo_de_producao == null || form.value.modulo_de_producao == 0) {

      this.camposForm =
        [form.value.nome, form.value.fazendas_id, form.value.veterinarios_id, form.value.nutricionistas_id, form.value.produtores_id, form.value.gerentes_id
          , form.value.operadores_id, form.value.geneticas_id, form.value.localizacao, form.value.endereco, form.value.modulo_de_producao]

      this.campoVazio = [];

      if (form.value.nome == null || form.value.nome == '') {
        this.campoVazio.push(' Nome');
      }
      if (form.value.fazendas_id == null || form.value.fazendas_id == '') {
        this.campoVazio.push(' Fazenda');
      }
      if (form.value.localizacao == null || form.value.localizacao == '') {
        this.campoVazio.push(' Localização');
      }
      if (form.value.endereco == null || form.value.endereco == '') {
        this.campoVazio.push(' Endereço');
      }
      if (form.value.produtores_id == null || form.value.produtores_id == 0) {
        this.campoVazio.push(' Produtor');
      }
      if (form.value.veterinarios_id == null || form.value.veterinarios_id == 0) {
        this.campoVazio.push(' Veterinario');
      }
      if (form.value.nutricionistas_id == null || form.value.nutricionistas_id == 0) {
        this.campoVazio.push(' Nutricionista');
      }
      if (form.value.gerentes_id == null || form.value.gerentes_id == 0) {
        this.campoVazio.push(' Gerente');
      }
      if (form.value.operadores_id == null || form.value.operadores_id == 0) {
        this.campoVazio.push(' Operador');
      }
      if (form.value.modulo_de_producao == null || form.value.modulo_de_producao == 0) {
        this.campoVazio.push(' Módulo de Produção');
      }
      if (form.value.geneticas_id == null || form.value.geneticas_id == 0) {
        this.campoVazio.push(' Geneticas');
      }

      if (this.campoVazio != null) {
        return this._ToastrService.error(`O(s) campo(s) ${this.campoVazio} não estão preenchidos corretamente'`, 'Erro!');

      }

    } else {

      //Alterar pra service depois
      form.value.nome = form.value.nome.toUpperCase();
      form.value.endereco = form.value.endereco.toUpperCase();
      form.value.modulo_de_producao = form.value.modulo_de_producao.toUpperCase();

      //BLOQUEANDO BOTAO DURANTE REQUEST
      this.isBusyForm = true;

      this._HttpService.JSON_PUT(`/granjas/${this.GlobalService.getItem().id}`, form.value, false, true)
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
    this._HttpService.JSON_GET('/granjas', false, true)
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
    let res = confirm("Tem certeza que deseja excluir a granja?");
    if (res) {

      this._HttpService.JSON_DELETE(`/granjas/${this.GlobalService.getItem().id}`, false, true)
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
