/***********************************************************
COMPONENTS
***********************************************************/
import { Component, TemplateRef } from '@angular/core';
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
  selector: 'app-produtor',
  templateUrl: 'produtor.html',
  styleUrls: ['produtor.scss'],
  providers: [ShowService]
})
export class ProdutorComponent {

  permissoes;
  read: boolean = false;
  new: boolean = false;
  edit: boolean = false;
  delete: boolean = false;

  showNew: boolean = false;
  isBusyForm: boolean = false;
  isBusyList: boolean = false;
  exibeUpdate: boolean = false;
  listar: boolean = true;
  editar: boolean = false;
  inserir: boolean = false;
  reativar: boolean = false;
  itens = [];
  itensFilter = [];
  itemsPerPage = 10;
  selectPlanos = 0;
  validaEmail = [];
  validaCPFCNPJ;

  //REATIVAR
  email;
  cpf_cnpj;
  selectNome;
  selectEmail;
  selectCPF_CNPJ;
  selectEndereco;
  selectTelefone;
  replaceCNPJ;

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
    //Permissões: read = 81, new = 82, edit = 83, delete = 84
    //BLOQUEIA TUDO
    if (this.permissoes.includes(81, 82, 83, 84) == false) {
      this.read = false;
      this.new = false;
      this.edit = false;
      this.delete = false;
    }

    //READ
    if (this.permissoes.includes(81)) {
      this.read = true;
    }
    //NEW
    if (this.permissoes.includes(82)) {
      this.new = true;
    }
    //EDIT
    if (this.permissoes.includes(83)) {
      this.edit = true
    }
    //DELETE
    if (this.permissoes.includes(84)) {
      this.delete = true;
    }
  }

  /************
  COMBOS
  *************/
  getComboProdutor() {
    this.isBusyList = true;

    //VERIFICA E TROCA A "/" DE CNPJ, PARA NÃO INTERFERIR NA ROTA
    if (this.cpf_cnpj.length >= 15) {
      this.replaceCNPJ = this.cpf_cnpj.replace("/", "_");
      this.cpf_cnpj = this.replaceCNPJ;
    }
    this._HttpService.JSON_GET(`/produtores/extra/combo/${this.email}/${this.cpf_cnpj}`, false, true)
      .then(
        res => {
          this.comboProdutor = res.json();
          this.selectNome = this.comboProdutor[0].nome;
          this.selectEmail = this.comboProdutor[0].email;
          this.selectCPF_CNPJ = this.comboProdutor[0].cpf_cnpj;
          this.selectEndereco = this.comboProdutor[0].endereco;
          this.selectTelefone = this.comboProdutor[0].telefone;
        },
        error => {
          return this._ToastrService.error(error.json().message);
        }
      )

  }

  mostrarProtudor($event) {
    this.selectNome = this.comboProdutor[0].nome;
    this.selectEmail = this.comboProdutor[0].email;
    this.selectCPF_CNPJ = this.comboProdutor[0].cpf_cnpj;
    this.selectEndereco = this.comboProdutor[0].endereco;
    this.selectTelefone = this.comboProdutor[0].telefone;
  }

  /*SHOW formulário Novo */
  showInserir() {
    this.listar = !this.listar;
    this.inserir = !this.inserir;
  }
  /*SHOW formulário Editar*/
  showEditar() {
    this.listar = !this.listar;
    this.editar = !this.editar;
  }
  /*SHOW formulário Reativar */
  showReativar() {
    this.listar = false;
    this.editar = false;
    this.inserir = false;
    this.reativar = true;
  }

  hideReativar() {
    this.listar = true;
    this.editar = false;
    this.inserir = false;
    this.reativar = false;
  }

  /************
  POST
  *************/
  postForm(form) {

    //VERIFICA CAMPOS PREENCHIDOS
    if (form.value.nome == null || form.value.nome == '' ||
      form.value.cpf_cnpj == null || form.value.cpf_cnpj == '' ||
      form.value.endereco == null || form.value.endereco == '' ||
      form.value.email == null || form.value.email == '' ||
      form.value.telefone == null || form.value.telefone == '')
    //form.value.plano == null || form.value.plano == '')
    {
      return this._ToastrService.error('Preencha todos os campos corretamente', 'Erro!');

    } else {

      //VERIFICA CPF 
      this.validaCPFCNPJ = form.value.cpf_cnpj.length;
      for (let i = 0; i < form.value.cpf_cnpj.length; i++) {
        if (form.value.cpf_cnpj[i] == '_') {
          this.validaCPFCNPJ = 1;
        }
      }
      if (this.validaCPFCNPJ == 1) {
        return this._ToastrService.error('CPF/CNPJ invalido', 'Erro!');
      } else {

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
              form.value.endereco = form.value.endereco.toUpperCase();
              this.email = form.value.email;
              this.cpf_cnpj = form.value.cpf_cnpj;

              //BLOQUEANDO BOTAO DURANTE REQUEST
              this.isBusyForm = true;

              this._HttpService.JSON_POST('/produtores', form.value, false, true)
                .then(
                  res => {
                    this.getItens();
                    this.isBusyForm = false;
                    this.showInserir();
                    if (res.json().message === 'erro') {
                      this.showReativar();
                      this.getComboProdutor();
                      return this._ToastrService.error('Já existe um produtor cadastrado com esses dados.', 'Erro!');
                    } else { return this._ToastrService.success(res.json().message); }
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
  }

  /************
  PUT
  *************/
  putForm(form) {

    //VERIFICA CAMPOS PREENCHIDOS
    if (form.value.nome == null || form.value.nome == '' ||
      form.value.cpf_cnpj == null || form.value.cpf_cnpj == '' ||
      form.value.endereco == null || form.value.endereco == '' ||
      form.value.email == null || form.value.email == '' ||
      form.value.telefone == null || form.value.telefone == '') {
      //form.value.plano == null || form.value.plano == ''
      return this._ToastrService.error('Preencha todos os campos corretamente', 'Erro!');

    } else {

      //VERIFICA CPF 
      this.validaCPFCNPJ = form.value.cpf_cnpj.length;
      for (let i = 0; i < form.value.cpf_cnpj.length; i++) {
        if (form.value.cpf_cnpj[i] == '_') {
          this.validaCPFCNPJ = 1;
        }
      }
      if (this.validaCPFCNPJ == 1) {
        return this._ToastrService.error('CPF/CNPJ invalido', 'Erro!');
      } else {

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
              form.value.endereco = form.value.endereco.toUpperCase();

              //BLOQUEANDO BOTAO DURANTE REQUEST
              this.isBusyForm = true;

              this._HttpService.JSON_PUT(`/produtores/${this.GlobalService.getItem().id}`, form.value, false, true).then(
                res => {
                  this.getItens();
                  this.isBusyForm = false;
                  this.exibeUpdate = false;
                  this.showEditar();
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
        }
      }
    }
  }


  /************
   PUT REATIVAÇÃO DO PRODUTOR
   *************/
  putFormReativar(form) {

    //VERIFICA CAMPOS PREENCHIDOS
    if (form.value.nome == null || form.value.nome == '' ||
      form.value.cpf_cnpj == null || form.value.cpf_cnpj == '' ||
      form.value.endereco == null || form.value.endereco == '' ||
      form.value.email == null || form.value.email == '' ||
      form.value.telefone == null || form.value.telefone == '') {
      //form.value.plano == null || form.value.plano == ''
      return this._ToastrService.error('Preencha todos os campos corretamente', 'Erro!');

    } else {

      //Alterar pra service depois
      form.value.nome = form.value.nome.toUpperCase();
      form.value.email = form.value.email.toUpperCase();
      form.value.endereco = form.value.endereco.toUpperCase();

      //BLOQUEANDO BOTAO DURANTE REQUEST
      this.isBusyForm = true;

      this._HttpService.JSON_PUT('/produtores/extra/reativar', form.value, false, true).then(
        res => {
          this.getItens();
          this.isBusyForm = false;
          this.exibeUpdate = false;
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
    this._HttpService.JSON_GET('/produtores', false, true).then(
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
    let res = confirm("Tem certeza que deseja excluir o produtor?");

    if (res) {
      this._HttpService.JSON_DELETE(`/produtores/${this.GlobalService.getItem().id}`, false, true)
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
