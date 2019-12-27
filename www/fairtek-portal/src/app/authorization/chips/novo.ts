
/***********************************************************
COMPONENTS
***********************************************************/
import { Component, OnInit, TemplateRef } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { BsModalService } from 'ngx-bootstrap/modal';
import { BsModalRef } from 'ngx-bootstrap/modal/bs-modal-ref.service';
import { Router } from '@angular/router';
/**********************************************************
PROVIDERS
***********************************************************/
import { HttpService } from '../../globals/http';
import { GlobalService } from '../../globals/globals';
import { ShowService } from '../../shared/app-show/show.service'

import * as crypto from 'crypto-js';
import * as _ from 'underscore';

@Component({
  selector: 'app-novo-chips',
  templateUrl: 'novo.html',
  styleUrls: ['novo.scss'],
  providers: [ShowService]
})
export class ChipsNovoComponent implements OnInit {

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
  modalRef: BsModalRef;

  //Combos
  comboChips = [];
  selectChip = 0;
  comboAnimal = [{ id: '', tatuagem: '', brinco: '' }];
  animalChip = 0;
  comboMotivo = [];
  selectMotivo = 0;
  chipNum = '';
  batchInsert = false;
  loading: boolean = true;

  /*********
    VARIAVEIS AUXILIARES PARA  ABERTURA DE JANELA DE NOVO CHIP 
  * ********* */
  inserirChip = ShowService.inserirChip;
  updateNotification = ShowService.updateNotification;
  listarChip = ShowService.listarChip;
  editarChip = false;
  chipRecebido = ShowService.chip_num;


  constructor(
    private _HttpService: HttpService,
    private GlobalService: GlobalService,
    private _ToastrService: ToastrService,
    private _ShowService: ShowService,
    private modalService: BsModalService,
    private route: Router
  ) { }

  openModalWithClass(template: TemplateRef<any>) {
    this.modalRef = this.modalService.show(
      template,
      Object.assign({}, { class: 'gray modal-lg' })
    );
  }

  ngOnInit() {
    this.getItens();
    this.getComboMotivo();
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
    //Permissões: read = 41, new = 42, edit = 43, delete = 44
    //BLOQUEIA TUDO
    if (this.permissoes.includes(41, 42, 43, 44) == false) {
      this.read = false;
      this.new = false;
      this.edit = false;
      this.delete = false;
    }

    //READ
    if (this.permissoes.includes(41)) {
      this.read = true;
    }
    //NEW
    if (this.permissoes.includes(42)) {
      this.new = true;
    }
    //EDIT
    if (this.permissoes.includes(43)) {
      this.edit = true
    }
    //DELETE
    if (this.permissoes.includes(44)) {
      this.delete = true;
    }
  }

  /**********
    COMBOS
  **********/

  getComboChip() {
    this.isBusyList = true;
    this._HttpService.JSON_GET(`/chips/extra/combo`, false, true)
      .then(
        res => {
          return this.comboChips = res.json();
        },
        error => {
          return this._ToastrService.error(error.json().message);
        }
      )
  }

  getComboAnimal_Chip() {
    this.isBusyList = true;
    this._HttpService.JSON_GET(`/animais/animal/${this.GlobalService.getItem().id}`, false, true)
      .then(
        res => {
          return this.comboAnimal = res.json();
        },
        error => {

          return this._ToastrService.error(error.json().message);
        }
      )
  }

  getComboMotivo() {
    this.isBusyList = true;
    this._HttpService.JSON_GET('/desativacao/extra/combo', false, true)
      .then(
        res => {
          return this.comboMotivo = res.json();
        },
        error => {
          return this._ToastrService.error(error.json().message);
        }
      )
  }
  /***********
    Eventos
  ***********/
  // pegaAnimalChip(event){
  //   this.animalChip = this.GlobalService.getItem().chip;
  // }

  /************
  POST
  *************/
  postForm(form) {
    //VERIFICA CAMPOS PREENCHIDOS
    if (((form.value.chip == null || form.value.chip == '') && !this.batchInsert) || ((form.value.chipInit == null || form.value.chipInit == '' || form.value.chipFim == null || form.value.chipFim == '' )&& this.batchInsert)
    ) {
      return this._ToastrService.error('Preencha todos os campos corretamente', 'Erro!');
    } 
    else {
      form.value.ativo = 0;
      if(this.batchInsert){
        form.value.batchInsert
      }
      //BLOQUEANDO BOTAO DURANTE REQUEST
      this.isBusyForm = true;
      form.value.updateNotification = this.updateNotification ? this.updateNotification : false;
      this._HttpService.JSON_POST('/chips', form.value, false, true)
        .then(
          res => {
            this.getItens();
            this.isBusyForm = false;
            this.acaoTelaInserir();
            if (res.json().message === 'erro') return this._ToastrService.error('O chip com essa numeração já foi cadastrado!', 'Erro!');
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
    if (form.value.chip == null || form.value.chip == ''
      //form.value.dt_at == null || form.value.dt_at === ''
    ) {
      return this._ToastrService.error('Preencha todos os campos corretamente', 'Erro!');

    } else {

      //BLOQUEANDO BOTAO DURANTE REQUEST
      this.isBusyForm = true;

      this._HttpService.JSON_PUT(`/chips/${this.GlobalService.getItem().id}`, form.value, false, true)
        .then(
          res => {
            this.getItens();
            this.isBusyForm = false;
            this.exibeUpdate = false;
            this._ShowService.showEditar();
            if (res.json().message === 'erro') return this._ToastrService.error('O chip com essa numeração já foi cadastrado!', 'Erro!');
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
  PUT DESATIVA
  *************/
  putFormTrocaChipAnimal(form) {
    //VERIFICA CAMPOS PREENCHIDOS
    if (form.value.chip == null || form.value.chip == '') {
      return this._ToastrService.error('Preencha todos os campos corretamente', 'Erro!');

    } else {
      //BLOQUEANDO BOTAO DURANTE REQUEST
      this.isBusyForm = true;
      this._HttpService.JSON_PUT(`/animais/atualiza/animal/chip/${this.comboAnimal[0].id}`, form.value, false, true)
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
  PUT DESATIVA ANIMAL
  *************/
  putFormDesativaAnimal(form) {

    //VERIFICA CAMPOS PREENCHIDOS
    if (form.value.dt_de == null || form.value.dt_de == '' ||
      form.value.motivo == null || form.value.motivo == '' ||
      form.value.chip == null || form.value.chip == '') {

      return this._ToastrService.error('Preencha todos os campos corretamente', 'Erro!');

    } else {

      //BLOQUEANDO BOTAO DURANTE REQUEST
      this.isBusyForm = true;

      this._HttpService.JSON_PUT('/animais/desativa/animal/chip', form.value, false, true)
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
  FUNÇÕES PARA NAVEGAR NAS TELAS DE EDIÇÃO E INSERÇÃO DE CHIPS
  *************/
  acaotelaEditar() {
    this.editarChip = !this.editarChip;
    this.listarChip = !this.listarChip;
  }
  acaoTelaInserir() {
    this.chipRecebido = 0;
    this.inserirChip = !this.inserirChip;
    this.updateNotification != this.updateNotification;
    this.listarChip = !this.listarChip;
    ShowService.inserirChip = !ShowService.inserirChip;
    ShowService.updateNotification = !ShowService.updateNotification;
    ShowService.listarChip = !ShowService.listarChip;
  }


  /************
  GET
  *************/
  getItens() {
    this.loading = true;
    this.isBusyList = true;
    this._HttpService.JSON_GET('/chips', false, true)
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
    let res = confirm("Tem certeza que deseja desativar o chip?");
    if (res) {

      this._HttpService.JSON_DELETE(`/chips/${this.GlobalService.getItem().id}`, false, true)
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
  CADASTRA O CHIP E REDIRECIONA PARA INSERÇÃO DE ANIMAIS
  *************/
  cadChipAnimal(form) {
    //VERIFICA CAMPOS PREENCHIDOS
    if (form.value.chip == null || form.value.chip == ''
    ) {
      return this._ToastrService.error('Preencha todos os campos corretamente', 'Erro!');
    } else {
      form.value.ativo = 0;
      //BLOQUEANDO BOTAO DURANTE REQUEST
      this.isBusyForm = true;
      this._HttpService.JSON_POST('/chips', form.value, false, true)
        .then(
          res => {
            console.log("res", res);
            this.getItens();
            this.isBusyForm = false;
            if (res.json().message === 'erro')
              return this._ToastrService.error('O chip com essa numeração já foi cadastrado!', 'Erro!');
            var chip_dados = { chip_num: form.value.chip, id_chip: res.json().chip_id };
            this.chipNum = chip_dados.chip_num;
            this._ShowService.showInserirAnimal(chip_dados);
            this.route.navigate(["/animais/"]);
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
  FILTRA
  *************/
  searchFilter(event) {
    let val = event.target.value.toLowerCase();

    if (val.length === 0) {
      this.itensFilter = this.itens;

    } else {

      let filtro = this.itensFilter.filter(function (d) {
        return d.chip.toLowerCase().indexOf(val) !== -1 || !val;
      });

      this.itensFilter = filtro;
    }

  }


}