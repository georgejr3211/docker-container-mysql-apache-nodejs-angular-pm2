
/***********************************************************
COMPONENTS
***********************************************************/
import { Component, TemplateRef, Input, ViewChild, ViewEncapsulation } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { FormControl, FormGroup } from '@angular/forms';
import { BsModalService } from 'ngx-bootstrap/modal';
import { BsModalRef } from 'ngx-bootstrap/modal/bs-modal-ref.service';
import { BsDatepickerConfig, BsLocaleService } from 'ngx-bootstrap/datepicker';
import { defineLocale } from 'ngx-bootstrap';
import { listLocales } from 'ngx-bootstrap/chronos';
import { ActivatedRoute } from '@angular/router';
import { Router } from '@angular/router';;
/**********************************************************
PROVIDERS
***********************************************************/
import { HttpService } from '../../globals/http';
import { GlobalService } from '../../globals/globals';
import { ShowService } from '../../shared/app-show/show.service'
import * as crypto from 'crypto-js';
import * as _ from 'underscore';

@Component({
  selector: 'app-animais',
  templateUrl: 'animais.html',
  styleUrls: ['animais.scss'],
  providers: [ShowService],
  encapsulation: ViewEncapsulation.None
})
export class AnimaisComponent {
  @ViewChild('template') template: any;
  dt_entrada: Date;
  dt_ia: Date;

  usuario: any;

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
  nomeBaia: any;
  itemsPerPage = 10;
  tipoDieta_id;
  dietas = [];
  //COMBOS
  selectTempoEntreDosagem = 0;

  comboBaias: any = [];
  selectBaias = 0;
  comboMotivo = [];
  selectMotivo = 0;
  comboChip = [];
  selectChip = 0;
  comboChipEditar = [];
  selectChipEditar = 0;
  comboDietas = [];
  selectDieta = 0
  comboEscore = [];
  selectEscore = 0;

  selectDosagem = 0;

  inserirAnimal = ShowService.inserirAnimal;  //VARIAVEL AUXILIAR PARA ABRIR TELA DE INSERIR ANIMAL
  editarAnimal = ShowService.editarAnimal;;   //VARIAVEL AUXILIAR PARA ABRIR TELA DE EDITAR ANIMAL
  listarAnimal = ShowService.listarAnimal;  //VARIAVEL AUXILIAR PARA ABRIR TELA DE LISTAR ANIMAL
  chipAnimal = ShowService.chipAnimal;

  BusySelectChip: boolean = false;

  colorTheme = 'theme-default';
  modalRef: BsModalRef;
  bsConfig = {
    containerClass: 'theme-fairtek',
    dateInputFormat: 'DD-MM-YYYY'
  }

  constructor(
    private _HttpService: HttpService,
    private _ToastrService: ToastrService,
    private GlobalService: GlobalService,
    private _ShowService: ShowService,
    private modalService: BsModalService,
    private _ActivatedRoute: ActivatedRoute,
    private route: Router
  ) {
    this.getItens();
  }

  openModalWithClass(template: TemplateRef<any>) {
    this.modalRef = this.modalService.show(template, Object.assign({}, { class: ' ' }));
  }

  ngOnInit() {
    this.getComboBaias();
    this.getComboDietas();
    this.getComboMotivo();
    this.getComboChip();
    this.getComboEscores();
    this.usuario = JSON.parse(localStorage.getItem('user'));

    /************************************************
    * DESCRIPTANDO E OBTENDO AS PERMISSÕES DO USUÁRIO
    * ***********************************************/
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
    //Permissões: read = 57, new = 58, edit = 59, delete = 60
    //BLOQUEIA TUDO
    if (this.permissoes.includes(57, 58, 59, 60) == false) {
      this.read = false;
      this.new = false;
      this.edit = false;
      this.delete = false;
    }
    //READ
    if (this.permissoes.includes(57)) {
      this.read = true;
    }
    //NEW
    if (this.permissoes.includes(58)) {
      this.new = true;
    }
    //EDIT
    if (this.permissoes.includes(59)) {
      this.edit = true
    }
    //DELETE
    if (this.permissoes.includes(60)) {
      this.delete = true;
    }
  }

  /************************************************************
  FUNÇÕES PARA NAVEGAR NAS TELAS DE EDIÇÃO E INSERÇÃO DE ANIMAL
  *************************************************************/
  telaEditarAnimal() {
    this.editarAnimal = !this.editarAnimal;
    this.listarAnimal = !this.listarAnimal;
  }
  telaNewEditarAnimal() {
    (this.GlobalService.getItem())
    ShowService.editarAnimal = false;
    ShowService.listarAnimal = true;
    this.editarAnimal = !this.editarAnimal;
    this.listarAnimal = !this.listarAnimal;
  }
  telaInserirAnimal() {
    this.chipAnimal.num_chip = 0;
    this.inserirAnimal = !this.inserirAnimal;
    this.listarAnimal = !this.listarAnimal;
  };

  /**************************************************************************************
  COMBOS
  **************************************************************************************/

  /************
  GET
  *************/
  getComboChip() {
    this.isBusyList = true;
    this._HttpService.JSON_GET('/chips/extra/combo', false, true)
      .then(
        res => {
          return this.comboChip = res.json();
        },
        error => {
          return this._ToastrService.error(error.json().message);
        }
      )
  }

  getComboChipEditar() {
    this.isBusyList = true;
    this._HttpService.JSON_GET('/chips/extra/combo/editar', false, true)
      .then(
        res => {
          return this.comboChipEditar = res.json();
        },
        error => {
          return this._ToastrService.error(error.json().message);
        }
      )
  }

  getComboEscores() {
    this.isBusyList = true;
    this._HttpService.JSON_GET('/escores/extra/combo', false, true)
      .then(
        res => {
          return this.comboEscore = res.json();
        },
        error => {
          return this._ToastrService.error(error.json().message);
        }
      )
  }

  getComboDietas() {
    this.isBusyForm = true;
    this._HttpService.JSON_GET('/dietas/extra/extra/combo', false, true).then(
      res => {
        return this.comboDietas = res.json();
      },
      error => {
        return this._ToastrService.error(error.json().message);
      }
    )
  }

  getComboBaias() {
    this.isBusyList = true;
    this._HttpService.JSON_GET('/baias/extra/combo', false, true)
      .then(
        res => {
          return this.comboBaias = res.json();
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

  getNomeDieta($event) {
    let nomeDieta = this.comboDietas.filter(
      function (d) {
        if (d.id == $event.target.value) {
          return d;

        }
      }
    );
    nomeDieta = (nomeDieta[0].chip);
  }

  /************
  POST
  *************/
  postForm(form) {
    //VERIFICA CAMPOS PREENCHIDOS
    if (form.value.tatuagem == null || form.value.tatuagem == '' ||
      form.value.brinco == null || form.value.brinco == '' ||
      form.value.chip == null || form.value.chip == '') {

      return this._ToastrService.error('Preencha todos os campos corretamente', 'Erro!');

    } else {
      form.value.rfid = form.value.chip;

      //Alterar pra service depois
      form.value.tatuagem = form.value.tatuagem.toUpperCase();
      form.value.brinco = form.value.brinco.toUpperCase();

      //BLOQUEANDO BOTAO DURANTE REQUEST
      this.isBusyForm = !this.isBusyForm;

      this._HttpService.JSON_POST('/animais', form.value, false, true)
        .then(
          res => {
            this.getItens();
            this.isBusyForm = !this.isBusyForm;
            this.telaInserirAnimal();
            this.getComboChip();
            if (res.json().message === 'erro') {
              return this._ToastrService.error('Estes dados já foram cadastrados em outro animal!', 'Erro!');
            } else {
              return this._ToastrService.success(res.json().message);
            }
          },
          error => {

            this.isBusyForm = !this.isBusyForm;
            return this._ToastrService.error(error.json().message);
          }
        )
    }
  }

  /************
  PUT
  *************/
  putForm(form) {
    if (form.value.chip == 0) {
      form.value.chip = this.GlobalService.getItem().id_chip
    }
    //VERIFICA CAMPOS PREENCHIDOS
    if (form.value.tatuagem == null || form.value.tatuagem == '' || form.value.tatuagem == 0 ||
      form.value.brinco == null || form.value.brinco == '' || form.value.brinco == 0 ||
      form.value.chip == null || form.value.chip == '' || form.value.chip == 0
    ) {
      return this._ToastrService.error(form.value.chip, 'Erro!');

    } else {
      //Alterar pra service depois
      form.value.tatuagem = form.value.tatuagem.toUpperCase();
      form.value.brinco = form.value.brinco.toUpperCase();
      //BLOQUEANDO BOTAO DURANTE REQUEST
      this.isBusyForm = !this.isBusyForm;
      this._HttpService.JSON_PUT(`/animais/atualiza/animal/chip/${this.GlobalService.getItem().id}`, form.value, false, true)
        .then(
          res => {
            this.getItens();
            this.isBusyForm = !this.isBusyForm;
            this.exibeUpdate = false;
            this.telaEditarAnimal();
            this.getComboChip();
            if (res.json().message === 'erro') {
              return this._ToastrService.error('Estes dados já foram cadastrados em outro animal!', 'Erro!');
            } else {
              return this._ToastrService.success(res.json().message);
            }
          },
          error => {
            this.isBusyForm = !this.isBusyForm;
            this.exibeUpdate = false;
            return this._ToastrService.error(error.json().message);
          }
        )
    }
  }

  /************
  PUT DESATIVA
  *************/
  putFormDesativa(form) {
    console.log('form', form.value);
    //VERIFICA CAMPOS PREENCHIDOS
    if (//form.value.rfid == null || form.value.rfid == '' ||
      form.value.dt_de == null || form.value.dt_de == '' ||
      form.value.motivo == null || form.value.motivo == '' ||
      form.value.chip == null || form.value.chip == '') {
      return this._ToastrService.error('Preencha todos os campos corretamente', 'Erro!');
    } else {
      //form.value.rfid = form.value.chip
      //BLOQUEANDO BOTAO DURANTE REQUEST
      this.isBusyForm = !this.isBusyForm;
      this._HttpService.JSON_PUT(`/animais/desativar/${this.GlobalService.getItem().id}/${this.GlobalService.getItem().id_rede}`, form.value, false, true)
        .then(
          res => {
            this.getItens();
            this.isBusyForm = !this.isBusyForm;
            this.exibeUpdate = false;
            this.getComboChip();
            return this._ToastrService.success(res.json().message);
          },
          error => {
            this.isBusyForm = !this.isBusyForm;
            this.exibeUpdate = false;
            return this._ToastrService.error(error.json().message);
          }
        )
    }
  }

  /************
  GET
  *************/
  getBaia() {
    this.isBusyList = true;
    this.loading = true;
    this._HttpService.JSON_GET('/baias', false, true)
      .then(
        res => {
          this.nomeBaia = res.json().data;
          console.log(this.nomeBaia);
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
  GET
  *************/
  getItens() {
    this.isBusyList = true;
    this.loading = true;
    this._HttpService.JSON_GET('/animais', false, true)
      .then(
        res => {
          this.itensFilter = res.json().data;
          console.log('itensFilter Animais', this.itensFilter);
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

  buscaItem(param) {
  }

  /************
  DELETE
  *************/
  deleteItem() {
    let res = confirm("Tem certeza que deseja excluir o animal?");
    if (res) {
      this._HttpService.JSON_DELETE(`/animais/getid/${this.GlobalService.getItem().id}/${this.GlobalService.getItem().id_rede}`, false, true)
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
  CADASTRA O ANIMAL E REDIRECIONA PARA MOVIMENTAÇÃO DE ANIMAIS
  *************/
  cadAnimalMovimentacao(form) {
    console.log('form para cadastrar animal', form.value);
    //VERIFICA CAMPOS PREENCHIDOS
    if (//form.value.rfid == null || form.value.rfid == '' ||
      form.value.tatuagem == null || form.value.tatuagem == '' ||
      form.value.brinco == null || form.value.brinco == '' ||
      form.value.chip == null || form.value.chip == '') {
      return this._ToastrService.error('Preencha todos os campos corretamente', 'Erro!');
    }
    else {
      form.value.rfid = form.value.chip;
      //Alterar pra service depois
      form.value.tatuagem = form.value.tatuagem.toUpperCase();
      form.value.brinco = form.value.brinco.toUpperCase();

      //BLOQUEANDO BOTAO DURANTE REQUEST
      this.isBusyForm = true;

      this._HttpService.JSON_POST('/animais', form.value, false, true)
        .then(
          res => {
            this.getItens();
            this.isBusyForm = false;
            var animal = { brinco: form.value.brinco, tatuagem: form.value.tatuagem, id_animal: res.json().id_animal };
            if (res.json().message === 'erro') {
              return this._ToastrService.error('Estes dados já foram cadastrados em outro animal!', 'Erro!');
            } else {
              this._ShowService.showInserirMovimentacoes(animal);
              this.route.navigate(['/animais-movimentacoes/']);
              return this._ToastrService.success(res.json().message);
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
  FILTRA
  *************/
  searchFilter(event) {
    let val = event.target.value.toLowerCase();

    if (val.length === 0) {
      this.itensFilter = this.itens;
    } else {
      let filtro = this.itensFilter.filter(function (d) {
        return (d.brinco.toLowerCase().indexOf(val) !== -1 || !val) || (d.chip.toLowerCase().indexOf(val) !== -1 || !val)
      });
      this.itensFilter = filtro;
    }
  }
}
