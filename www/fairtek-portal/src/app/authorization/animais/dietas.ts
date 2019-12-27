/***********************************************************
COMPONENTS
***********************************************************/
import { Component, TemplateRef, Output } from '@angular/core';
import { ToastrService } from 'ngx-toastr';

/**********************************************************
PROVIDERS
***********************************************************/
import { HttpService } from '../../globals/http';
import { GlobalService } from '../../globals/globals';
import { ShowService } from '../../shared/app-show/show.service'
import { BsModalService } from 'ngx-bootstrap/modal';
import { BsModalRef } from 'ngx-bootstrap/modal/bs-modal-ref.service';
import { BsDatepickerConfig, BsLocaleService } from 'ngx-bootstrap/datepicker';
import { ActivatedRoute } from '@angular/router';
import * as _ from 'underscore';
import * as crypto from 'crypto-js';

@Component({
  selector: 'app-dietas',
  templateUrl: 'dietas.html',
  styleUrls: ['dietas.scss'],
  providers: [ShowService]
})
export class DietasComponent {

  loading: boolean = true;

  permissoes;
  read: boolean = false;
  new: boolean = false;
  edit: boolean = false;
  delete: boolean = false;

  isBusyForm: boolean = false;
  isBusyList: boolean = false;
  isBusyAdd: boolean = false; //bloqueio de botão p/ add nova configuração de dieta
  isBusyConfig: boolean = false;
  exibeUpdate: boolean = false;

  itemCarregado = [];
  itens = [];
  itensFilter = [];
  itemsPerPage = 10;
  qtd_dias_default;
  posicao;
  //qtd_dias_default = 120;

  //COMBOS
  comboDietasTipos = [];
  selectDietasTipos = 0;


  config_dieta: any = [{
    inicio: 0,
    final: this.qtd_dias_default,
    qt_racao: ''
  }];

  item_id_tipo;

  modalRef: BsModalRef;
  bsConfig: Partial<BsDatepickerConfig>;

  constructor(
    private _HttpService: HttpService,
    private _ToastrService: ToastrService,
    private GlobalService: GlobalService,
    private _ShowService: ShowService,
    private modalService: BsModalService,
    private ActivatedRoute: ActivatedRoute

  ) {
    this.getItens();
  }

  ngOnInit() {
    this.getComboDietasTipos();
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
    //Permissões: read = 53, new = 54, edit = 55, delete = 56
    //BLOQUEIA TUDO
    if (this.permissoes.includes(53, 54, 55, 56) == false) {
      this.read = false;
      this.new = false;
      this.edit = false;
      this.delete = false;
    }

    //READ
    if (this.permissoes.includes(53)) {
      this.read = true;
    }
    //NEW
    if (this.permissoes.includes(54)) {
      this.new = true;
    }
    //EDIT
    if (this.permissoes.includes(55)) {
      this.edit = true
    }
    //DELETE
    if (this.permissoes.includes(56)) {
      this.delete = true;
    }
  }


  /************
    abrir modal de configuração da dieta
  *************/
  openModalWithClass(template: TemplateRef<any>) {
    this.modalRef = this.modalService.show(
      template,
      Object.assign({}, { class: 'gray modal-lg' })
    );
  }

  /************
      SALVAR CAMPOS DE CONFIGURAÇÃO DA DIETA
    *************/
  saveConfigs() {
    this.posicao = this.config_dieta.length - 1;

    if (this.config_dieta[this.posicao].final == null) {
      return this._ToastrService.error(`O dia final é inválido.`, 'Erro!');
    }

    else if (this.config_dieta[this.posicao].final < this.config_dieta[this.posicao].inicio) {
      return this._ToastrService.error(`O dia final não pode ser menor que o inicial.`, 'Erro!');
    }

    else if (this.config_dieta[this.posicao].qt_racao == null || this.config_dieta[this.posicao].qt_racao == '') {
      return this._ToastrService.error(`Informe a Quantidade de ração.`, 'Erro!');
    }

    else if (this.config_dieta[this.posicao].final != this.qtd_dias_default) {
      return this._ToastrService.error(`O tipo dessa dieta tem ${this.qtd_dias_default} dias.`, 'Erro!');
    }
    else if ((this.config_dieta[this.posicao].qt_racao % 100) != 0) {

      return this._ToastrService.error(`O peso da alimentação deve ser múltiplo de 100.`, 'Erro!');

    }
    else this.modalRef.hide();
  }

  /************
    ADICIONA/REMOVER CAMPOS DE CONFIGURAÇÃO DA DIETA
  *************/
  addConfig() {
    this.posicao = this.config_dieta.length - 1;

    if (this.config_dieta[this.posicao].final != null) {
      //VALIDAÇÃO DE VALOR FINAL MAIOR QUE MAXIMO DE DIAS
      if (this.config_dieta[this.posicao].final > this.qtd_dias_default) {
        return this._ToastrService.error(`O tipo dessa dieta tem apenas ${this.qtd_dias_default} dias.`, 'Erro!');
      }
      //VALIDAÇÃO DE VALOR FINAL IGUAL A MAXIMO DE DIAS
      else if (this.config_dieta[this.posicao].final === this.qtd_dias_default) {
        return this._ToastrService.error(`Não é possível inserir mais divisões.`, 'Erro!');
      }
      else if (this.config_dieta[this.posicao].final < this.config_dieta[this.posicao].inicio) {
        return this._ToastrService.error(`O dia final não pode ser menor que o inicial.`, 'Erro!');
      }
      else if (this.config_dieta[this.posicao].qt_racao == null || this.config_dieta[this.posicao].qt_racao == '') {
        return this._ToastrService.error(`Informe a Quantidade de ração.`, 'Erro!');
      }
      else if ((this.config_dieta[this.posicao].qt_racao % 100) != 0) {

        return this._ToastrService.error(`O peso da alimentação deve ser múltiplo de 100.`, 'Erro!');

      }
      else {
        this.config_dieta.push(
          {
            inicio: this.config_dieta[this.posicao].final + 1,
            final: null,
            qt_racao: ''
          });
      }
    }
    else {
      return this._ToastrService.error(`O valor final não pode ser vazio.`, 'Erro!');
    }
  }
  teste(event) {
    if (event < (this.config_dieta.length - 1)) {
      var param = event + 1;
      this.config_dieta[param].inicio = this.config_dieta[event].final + 1;
    }
  }
  removerConfig(x) {
    this.config_dieta.splice(x, 1);
  }
  cleanConfig() {
    this.config_dieta = [{
      inicio: 0,
      final: this.qtd_dias_default,
      qt_racao: ''
    }];
  }

  //FUNÇÃO P/ OBTER OS DIAS DE CADA TIPO DE DIETA
  getDiasTipo(event: any) {
    let tipoDietaSelectionada = this.comboDietasTipos.filter(
      function (d) {
        if (event.target) {
          if (d.id == event.target.value) {
            return d;
          }
        }
        else {
          if (d.id == event) {
            return d;
          }
        }
      }
    );
    this.qtd_dias_default = (tipoDietaSelectionada[0].qtd_dias);
    this.isBusyConfig = (this.qtd_dias_default > 0) ? true : false;
  }


  /************
  POST
  *************/
  postForm(form) {

    form.qtd_dias = this.qtd_dias_default;

    //VERIFICA CAMPOS PREENCHIDOS
    if (form.value.nome == null || form.value.nome == ''
      //|| form.value.qtd_dias == null || form.value.qtd_dias == ''
      //|| form.value.codigo == null || form.value.codigo == ''
    ) {
      return this._ToastrService.error('Preencha todos os campos corretamente', 'Erro!');

    } else {

      //Alterar pra service depois
      form.value.nome = form.value.nome.toUpperCase();

      //BLOQUEANDO BOTAO DURANTE REQUEST
      this.isBusyForm = true;

      this._HttpService.JSON_POST('/dietas', form.value, false, true)
        .then(
          res => {
            this.getItens();
            this.isBusyForm = false;
            this._ShowService.showInserir();
            if (res.json().cod === 500) return this._ToastrService.error(res.json().message, 'Erro!');
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
    if (form.value.nome == null || form.value.nome == ''
      || form.value.dietas_tipos == null || form.value.dietas_tipos == ''
      || form.value.motivo_ed == null || form.value.motivo_ed == ''
      //|| form.value.qtd_dias == null || form.value.qtd_dias == ''
      //|| form.value.codigo == null || form.value.codigo == ''
    ) {
      return this._ToastrService.error('Preencha todos os campos corretamente', 'Erro!');

    } else {

      //Alterar pra service depois
      form.value.nome = form.value.nome.toUpperCase();

      //BLOQUEANDO BOTAO DURANTE REQUEST
      this.isBusyForm = true;

      this._HttpService.JSON_PUT(`/dietas/${this.GlobalService.getItem().id}/${this.GlobalService.getItem().id_rede}`, form.value, false, true)
        .then(
          res => {
            this.getItens();
            this.isBusyForm = false;
            this.exibeUpdate = false;
            this._ShowService.showEditar();
            if (res.json().message === 'erro') return this._ToastrService.error('A dieta com este nome já foi cadastrada!', 'Erro!');
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
    this._HttpService.JSON_GET(`/dietas`, false, true)
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
    let res = confirm("Tem certeza que deseja excluir a dieta?");
    if (res) {

      this._HttpService.JSON_DELETE(`/dietas/${this.GlobalService.getItem().id}/${this.GlobalService.getItem().id_rede}`, false, true)
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
  COMBOS
  *************/
  getComboDietasTipos() {
    this.isBusyList = true;
    this.loading = true;
    this._HttpService.JSON_GET('/tipos-dietas/extra/combo', false, true)
      .then(
        res => {
          this.loading = false;
          return this.comboDietasTipos = res.json();
        },
        error => {
          this.loading = false;
          return this._ToastrService.error(error.json().message);
        }
      )
  }

  /************
  COMBOS - DIETA CONFIG
  *************/

  getConfigDieta() {
    this._HttpService.JSON_GET(`/dietas/dieta/combo/${this.GlobalService.getItem().id}`, false, true)
      .then(
        res => {
          return this.config_dieta = res.json();
        },
        error => {
          return this._ToastrService.error(error.json().message);
        }
      );
  }

}
