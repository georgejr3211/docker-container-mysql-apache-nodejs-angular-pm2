
/***********************************************************
COMPONENTS
***********************************************************/
import { Component, OnInit, TemplateRef } from '@angular/core';
import { ToastrService } from 'ngx-toastr';

import { defineLocale } from 'ngx-bootstrap/chronos';
import { ptBrLocale } from 'ngx-bootstrap/locale';
import *  as moment from 'moment';
defineLocale('pt-br', ptBrLocale);

/**********************************************************
PROVIDERS
***********************************************************/
import { HttpService } from '../../../globals/http';
import { GlobalService } from '../../../globals/globals';
import { ShowService } from '../../../shared/app-show/show.service'
import { BsModalService } from 'ngx-bootstrap/modal';
import { BsModalRef } from 'ngx-bootstrap/modal/bs-modal-ref.service';
import { BsLocaleService } from 'ngx-bootstrap';

import * as crypto from 'crypto-js';
import * as _ from 'underscore';
@Component({
  selector: 'app-notificacoes',
  templateUrl: 'notificacoes.html',
  styleUrls: ['notificacoes.scss'],
  providers: [ShowService]
})
export class NotificacoesComponent implements OnInit {

  permissoes;
  read: boolean = false;
  edit: boolean = false;

  showNew: boolean = false;
  locale = 'pt-br';
  isBusyForm: boolean = false;
  isBusyList: boolean = false;
  exibeUpdate: boolean = false;
  itens = [];
  itensFilter = [];
  itemsPerPage = 10;
  modalRef: BsModalRef;
  filtro = 0;
  filtro_tipo = 0;
  dt_inicio;
  dt_final;
  //COMBOS
  comboTiposNotificacao = [];
  selectTiposNotificacao = 0;
  selectOrigem = 0;
  selectDestino = 0;

  bsConfig = {
    containerClass: 'theme-fairtek',
    dateInputFormat: 'DD-MM-YYYY'
  }

  loading: boolean = true;

  constructor(
    private _HttpService: HttpService,
    private _ToastrService: ToastrService,
    private GlobalService: GlobalService,
    private _ShowService: ShowService,
    private modalService: BsModalService,
    private localeService: BsLocaleService
  ) {

  }


  ngOnInit() {
    this.getItens();
    this.getTiposNotificacao();
    this.localeService.use(this.locale);
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
    //Permissões: read = 3, edit = 4
    //BLOQUEIA TUDO
    if (this.permissoes.includes(3, 4) == false) {
      this.read = false;
      this.edit = false;
    }

    //READ
    if (this.permissoes.includes(3)) {
      this.read = true;
    }
    //EDIT
    if (this.permissoes.includes(4)) {
      this.edit = true
    }
    //DEL
  }

  /************
  COMBOS
  *************/
  getTiposNotificacao() {
     
    this.isBusyList = true;
    this._HttpService.JSON_GET('/tipos-notificacao/extra/combo', false, true)
      .then(
        res => {
          this.loading = false;
          return this.comboTiposNotificacao = res.json();
        },
        error => {
          this.loading = false;
          return this._ToastrService.error(error.json().message);
        }
      )

  }

  /************
  POST
  *************/
  postForm(form) {

    //VERIFICA CAMPOS PREENCHIDOS
    if (form.value.notificacoes_tipos_id == null || form.value.nome == 0 ||
      form.value.origem == null || form.value.origem == 0 ||
      form.value.destino == null || form.value.destino == 0 ||
      form.value.valor == null || form.value.valor == '') {

      return this._ToastrService.error('Preencha todos os campos corretamente', 'Erro!');

    } else {

      //BLOQUEANDO BOTAO DURANTE REQUEST
      this.isBusyForm = true;


      this._HttpService.JSON_POST('/notificacoes', form.value, false, true)
        .then(
          res => {
            this.getItens();
            this.isBusyForm = false;
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
    if (form.value.notificacoes_tipos_id == null || form.value.nome == 0 ||
      form.value.origem == null || form.value.origem == 0 ||
      form.value.destino == null || form.value.destino == 0 ||
      form.value.valor == null || form.value.valor == '') {

      return this._ToastrService.error('Preencha todos os campos corretamente', 'Erro!');


    } else {

      //BLOQUEANDO BOTAO DURANTE REQUEST
      this.isBusyForm = true;


      this._HttpService.JSON_PUT(`/notificacoes/${this.GlobalService.getItem().id}`, form.value, false, true)
        .then(
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
    this._HttpService.JSON_GET('/notificacoes', false, true)

      .then(
        res => {
          this.loading = false;
          this.itensFilter = res.json();
          this.isBusyList = false;
          return this.itens = res.json();
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
    let res = confirm("Tem certeza que deseja excluir a notificação?");

    if (res) {

      this._HttpService.JSON_DELETE(`/notificacoes/${this.GlobalService.getItem().id}`, false, true)
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

        return d.destino.toLowerCase().indexOf(val) !== -1 || !val;
      });

      this.itensFilter = filtro;
    }

  }

  /************
  MODAL
  *************/

  openModalWithClass(template: TemplateRef<any>) {
    this.modalRef = this.modalService.show(
      template,
      Object.assign({}, { class: 'gray modal-lg' })
    );
  }

  /************
  MARCA AS NOTIFICAÇÕES COMO LIDA
  *************/

  marcarLida() {
    let id = this.GlobalService.getItem().id;
    this._HttpService.JSON_PUT(`/notificacoes/lida/${id}`, null, false, true).
      then(
        res => {
          if (res.json().message == 'error') return this._ToastrService.error('Houve um erro ao marcar a notificação como lida.');
          else {
            this.getItens();
            this._HttpService.JSON_GET(`/notificacoes/filtro/visualizar`, false, true).then(
              res2 => {
                this.GlobalService.listNotificacoes = res2.json();
                this.GlobalService.qtdNotificacoes = res2.json().length;
              }
            )
            return this._ToastrService.success('A Notificação foi marcada como lida.');
          }
        },
        error => {
          return this._ToastrService.error(error.json().message);
        })

  }
  /************
  MARCA TODAS NOTIFICAÇÕES COMO LIDA
  *************/
  marcarTodas() {

    let resp = confirm('Tem certeza que deseja marcar todas como lida?');

    if (resp) {
      this._HttpService.JSON_PUT(`/notificacoes/marcar/lida/todas`, null, false, true)
        .then(
          res => {
            if (res.json().message == 'error') return this._ToastrService.error('Houve um erro ao marcar todas a notificação como lida.');
            else {
              this.getItens();
              this._HttpService.JSON_GET(`/notificacoes/filtro/visualizar`, false, true).then(
                res2 => {
                  this.GlobalService.listNotificacoes = res2.json();
                  this.GlobalService.qtdNotificacoes = res2.json().length;
                }
              )
              return this._ToastrService.success('As Notificações foram marcadas como lida.');
            }
          }
        );
    }
  }
  /************
  BUSCA AS NOTIFICAÇÕES PELA DATA
  *************/

  getNotificacaoPeriodo() {
     
    this.dt_inicio = moment(this.dt_inicio).format('YYYY-MM-DD 00:00:00');
    this.dt_final = moment(this.dt_final).format('YYYY-MM-DD 23:59:59');
    this._HttpService.JSON_GET(`/notificacoes/filtro/data/${this.dt_inicio}/${this.dt_final}`, false, true)
      .then(
        res => {
          this.loading = false;
          this.itensFilter = res.json();
          this.isBusyList = false;
          return this.itens = res.json();
        },
        error => {
          this.loading = false;
          this.isBusyList = false;
          return this._ToastrService.error(error.json().message);
        }

      );
    this.dt_inicio = '';
    this.dt_final = '';

  }
  /************
    BUSCA AS NOTIFICAÇÕES PELO TIPO
    *************/
  getNotificacaoTipo() {
     
    this._HttpService.JSON_GET(`/notificacoes/filtro/tipo/${this.filtro_tipo}`, false, true)
      .then(
        res => {
          this.loading = false;
          this.itensFilter = res.json();
          this.isBusyList = false;
          return this.itens = res.json();
        },
        error => {
          this.loading = false;
          this.isBusyList = false;
          return this._ToastrService.error(error.json().message);
        }

      );
    this.dt_inicio = '';
    this.dt_final = '';

  }
  /************
  CADASTRAR CHIP 
  *************/


}


