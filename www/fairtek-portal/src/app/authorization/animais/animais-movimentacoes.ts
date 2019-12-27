/***********************************************************
COMPONENTS
***********************************************************/
import { Component, TemplateRef, Input, ViewChild, OnChanges, ViewEncapsulation } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { FormControl, FormGroup } from '@angular/forms';
import { BsModalService } from 'ngx-bootstrap/modal';
import { BsModalRef } from 'ngx-bootstrap/modal/bs-modal-ref.service';
import { BsDatepickerConfig, BsLocaleService } from 'ngx-bootstrap/datepicker';
import { defineLocale } from 'ngx-bootstrap';
import { listLocales } from 'ngx-bootstrap/chronos';
import { AnimaisComponent } from './animais';
import { ShowService } from '../../shared/app-show/show.service'
import * as _ from 'underscore';
import { ptBrLocale } from 'ngx-bootstrap/locale';
import * as moment from 'moment';
defineLocale('pt-br', ptBrLocale);

import * as crypto from 'crypto-js';

/**********************************************************
PROVIDERS
***********************************************************/
import { HttpService } from '../../globals/http';
import { GlobalService } from '../../globals/globals';

@Component({
  selector: 'app-animais-movimentacoes',
  templateUrl: 'animais-movimentacoes.html',
  styleUrls: ['animais-movimentacoes.scss'],
  providers: [ShowService],
  encapsulation: ViewEncapsulation.None
})
export class AnimaisMovimentacoesComponent {
  @ViewChild('template') template: any;
  dt_entrada: Date;
  dt_ia: Date;
  isBusyForm: boolean = false;
  isBusyList: boolean = false;
  exibeUpdate: boolean = false;
  itens = [];
  itensFilter = [];
  itemsPerPage = 10;
  tipoDieta_id;
  dietas = [];
  tatuagem;
  selectTipo = 0;
  locale = 'pt-br';
  filtro_listagem = 0;
  loading: boolean = true;
  maxDate: Date;
  data_inseminacao = null;
  dia_porco = null;
  tb_setorTeste = 0;
  permissoes;
  read: boolean = false;
  new: boolean = false;
  edit: boolean = false;
  delete: boolean = false;

  //SHOW
  listar: boolean = true;
  editar: boolean = false;
  inserir: boolean = false;
  grupo: boolean = false;
  dt_click: boolean = false;
  dt_click2: boolean = false;
  animal_teste: boolean = false;

  //COMBOS
  comboSetor = [];
  selectSetor = 0;
  tb_setor;
  comboEscores = [];
  selectEscores = 0;
  comboAnimais = [];
  selectAnimais = 0;
  comboBaias = [];
  comboBaiasSetor = [];
  selectBaias = 0;
  comboMotivo = [];
  selectMotivo = 0;
  comboChip = [];
  selectChip = 0;
  comboDietas = [];
  selectDieta = 0

  desativaDtInseminacao = true;
  comboGrupoBaia = [];
  grupoBaia;
  tb_baias_id = 0;
  grupoAnimais = []

  public datamask = [/[0-9]/, /[0-9]/, /[0-9]/, /[0-9]/, '/', /[0-9]/, /[0-9]/, '/', /[0-9]/, /[0-9]/];

  colorTheme = 'theme-default';
  modalRef: BsModalRef;
  bsConfig = {
    containerClass: 'theme-fairtek',
    dateInputFormat: 'DD-MM-YYYY'
  }

  inserirMovimentacoes = ShowService.inserirMovimentacoes;  //VARIAVEL AUXILIAR PARA ABRIR TELA DE INSERIR MOVIMENTAÇÃO
  editarMovimentacoes = false;   //VARIAVEL AUXILIAR PARA ABRIR TELA DE EDITAR MOVIMENTAÇÃO
  listarMovimentacoes = ShowService.listarMovimentacoes;  //VARIAVEL AUXILIAR PARA ABRIR TELA DE LISTAR MOVIMENTAÇÃO

  animal_brinco = ShowService.animalMovimentacao.brinco;
  animal_tatuagem = ShowService.animalMovimentacao.tatuagem;
  animal_id = ShowService.animalMovimentacao.id_animal;

  hoje = moment().format('YYYY-MM-DD 00:00:00');

  constructor(
    private _HttpService: HttpService,
    private _ToastrService: ToastrService,
    private GlobalService: GlobalService,
    private modalService: BsModalService,
    private _ShowService: ShowService,
    private localeService: BsLocaleService
  ) {

    this.getItens();
    this.maxDate = new Date();
    this.maxDate.setDate(this.maxDate.getDate());

  }

  openModalWithClass(template: TemplateRef<any>) {
    this.modalRef = this.modalService.show(
      template,
      Object.assign({}, { class: 'gray modal-lg' })
    );
  }

  configureDates(event) {
    console.log('event configure dates', event)
    this.data_inseminacao = event.dt_inseminacao;
    // form.value.dt_inseminacao = event.dt_inseminacao;
    this.dia_porco = event.pigDay;
  }

  ngOnInit() {
    //this.getComboAnimal()
    this.getComboBaias();
    this.getComboDietas();
    this.getComboEscores();
    this.localeService.use(this.locale);

    /*******
    * DESCRIPTANDO E OBTENDO AS PERMISSÕES DO USUÁRIO
    * ******* */
    let decrypt = "myencrypttext"
    let user_data = localStorage.getItem('r');
    let user_decrypt = crypto.AES.decrypt(user_data, decrypt)
    let user_data_decrypt = user_decrypt.toString(crypto.enc.Utf8);

    let group = user_data_decrypt.split("|/|");
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
    //Permissões: read = 61, new = 62, edit = 63, delete = 64

    //BLOQUEIA TUDO
    if (this.permissoes.includes(61, 62, 63, 64) == false) {
      this.read = false;
      this.new = false;
      this.edit = false;
      this.delete = false;
    }

    //READ
    if (this.permissoes.includes(61)) {
      this.read = true;
    }
    //NEW
    if (this.permissoes.includes(62)) {
      this.new = true;
    }
    //EDIT
    if (this.permissoes.includes(63)) {
      this.edit = true
    }
    //DELETE
    if (this.permissoes.includes(64)) {
      this.delete = true;
    }
  }

  /************
  COMBOS
  *************/
  getComboAnimal($event) {
    console.log('getComboAnimal', $event);
    this.tb_setor = $event;
    this.getComboBaiasSetor();
    this.tb_setorTeste = $event;
    console.log('tb_setor', this.tb_setor);
    console.log('tb_setorTeste', this.tb_setorTeste);
    this.isBusyForm = true;
    if (this.tb_setor === 3) {
      this.desativaDtInseminacao = false;
    } else {
      this.desativaDtInseminacao = true;
    }
    this._HttpService.JSON_GET(`/animais/movimentacao/extra/combo/${this.tb_setor}`, false, true)
      .then(
        res => {
          if (res) {
            this.comboAnimais = res.json();
          } else {
            this.comboAnimais = []
          }
        },
        error => {
          var erro = error.json();
          if (error.status == 400) {
            this.comboAnimais = [];
          } else {
            return this._ToastrService.error(error.json().message);
          }
        }
      )
  }

  getComboDietas() {
    this.isBusyForm = true;
    this._HttpService.JSON_GET('/dietas/extra/extra/combo', false, true)
      .then(
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

  getComboBaiasSetor() {
    this.isBusyList = true;
    this._HttpService.JSON_GET(`/baias/extra/combo/setor/${this.tb_setor}`, false, true)
      .then(
        res => {
          let comboSetor = this.comboBaiasSetor = res.json();
          return this.comboBaiasSetor = res.json();
        },
        error => {
          return this._ToastrService.error(error.json().message);
        }
      )
  }

  getComboGrupoBaias() {
    this.isBusyList = true;
    console.log('grupoBaia', this.grupoBaia);
    this._HttpService.JSON_GET(`/animais-movimentacoes/extra/combo/grupo/${this.grupoBaia}`, false, true)
      .then(
        res => {
          console.log(res.json().length);
          if (res.json().length > 0) {
            this.comboGrupoBaia = res.json();
          } else {
            this.comboGrupoBaia = res.json([]);
          }
          return this.comboGrupoBaia;
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
          return this.comboEscores = res.json();
        },
        error => {
          return this._ToastrService.error(error.json().message);
        }
      )
  }

  getNomeBaia(idBaia) {
    this.getComboBaiasSetor();
    console.log('comboBaiasSetor', this.comboBaiasSetor);
    this.comboBaiasSetor.filter(
      (baia) => {
        if (baia.id == idBaia) {
          return baia;
        }
      }
    );
  }

  getNomeDieta($event) {
    let nomeDieta = this.comboDietas.filter(
      function (d) {
        if (d.id == $event.target.value) {
          return d;

        }
      }
    );
  }

  getComboSetor($event) {
    console.log("getComboSetor id_animal: ", $event)
    var id_animal = $event;
    this.isBusyList = true;
    this._HttpService.JSON_GET(`/animais/setor/${id_animal}`, false, true)
      .then(
        res => {
          this.comboSetor = res.json();
          this.mostrarSetor();
          this.tatuagemChanged();
        },
        error => {
          return this._ToastrService.error(error.json().message);
        }
      );
  }

  /************************************************
  FUNÇÕES PARA NAVEGAR NAS TELAS DE EDIÇÃO E INSERÇÃO DE ANIMAL
  ************************************************/
  telaEditarMovimentacoes() {
    console.log("item: ", this.GlobalService.getItem());

    this.editarMovimentacoes = !this.editarMovimentacoes;
    this.listarMovimentacoes = !this.listarMovimentacoes;
  }

  telaInserirMovimentacoes() {
    this.tb_setorTeste = 0;
    this.desativaDtInseminacao = true;
    this.animal_brinco = '';
    this.animal_tatuagem = '';
    this.animal_id = 0;
    this.selectSetor = 1;
    this.selectTipo = 0;
    this.selectAnimais = 0;
    this.tatuagem = '';
    this.inserirMovimentacoes = !this.inserirMovimentacoes;
    this.listarMovimentacoes = !this.listarMovimentacoes;
    this.animal_teste = false;
    this.comboBaiasSetor = [];
  }

  /*SHOW formulário Grupo */
  showGrupo() {
    this.listarMovimentacoes = false;
    this.editarMovimentacoes = false;
    this.inserirMovimentacoes = false;
    this.grupo = true;
    this.comboGrupoBaia = [];
  }

  hideGrupo() {
    this.listarMovimentacoes = true;
    this.editarMovimentacoes = false;
    this.inserirMovimentacoes = false;
    this.grupo = false;
  }

  mostrarSetor() {
    this.selectSetor = this.comboSetor[0].tb_setor_tipo_id;
  }

  tatuagemChanged() {
    this.tatuagem = this.comboSetor[0].tatuagem
    return this.tatuagem;
  }

  moverAnimalTeste($event) {
    console.log($event);
    if ($event === false) {
      this.animal_teste = false;
    } else {
      this.animal_teste = true;
    }
  }

  //FUNÇÃO P/ OBTER O ID DA BAIA E CHAMAR O COMBO
  getBaiaId($event) {
    console.log($event);
    let idBaia = this.comboBaias.filter((d) => {
      if (d.id == $event) {
        return d;
      }
    });
    this.grupoBaia = idBaia[0].id;
    this.getComboGrupoBaias();
  }

  //REMOVER ANIMAL DA LISTA
  removerAnimal(x) {
    console.log("id do animal a ser removido da lista:", this.GlobalService.getItem().id)
    let index = _.findLastIndex(this.comboGrupoBaia, {
      'id': this.GlobalService.getItem().id
    });
    this.comboGrupoBaia.splice(index, 1);
  }

  change_click1($event) {
    this.dt_click = true;
  }

  change_click2($event) {
    this.dt_click2 = true;
  }

  change_click3($event) {
    console.log('event', $event);
    this.dt_click = false;
    this.dt_click2 = false;
    this.tatuagem = '';
  }

  /**********************************************************************************************************************
  POST ANIMAL TESTE
  **********************************************************************************************************************/
  postAnimalTeste(form) {
    console.log('form animal test', form.value);
    if (form.value.tb_setor_tipo_id == 2 && (form.value.animal == null || form.value.animal == '' ||
      form.value.tb_baias_id == null || form.value.tb_baias_id == '' || form.value.tb_escore_id == null || form.value.tb_escore_id == '' ||
      form.value.tb_tempo_dosagem == null || form.value.tb_tempo_dosagem == '' || form.value.tb_dieta_id == null || form.value.tb_dieta_id == '' ||
      this.data_inseminacao == null || this.data_inseminacao == '')) {
      return this._ToastrService.error('Preencha todos os campos corretamente', 'Erro!')
    } else {
      //BLOQUEANDO BOTAO DURANTE REQUEST
      this.isBusyForm = !this.isBusyForm;
      this._HttpService.JSON_POST('/animais-movimentacoes/post/animal_teste', form.value, false, true)
        .then(
          res => {
            this.getItens();
            this.isBusyForm = !this.isBusyForm;
            this.telaInserirMovimentacoes();
            ShowService.inserirMovimentacoes = false;
            ShowService.listarMovimentacoes = true;
            return this._ToastrService.success(res.json().message);
          },
          error => {
            this.isBusyForm = false;
            return this._ToastrService.error(error.json().message);
          }
        )
    }
  }

  /**********************************************************************************************************************
  POST GERAL
  **********************************************************************************************************************/
  postForm(form) {
    console.log("form enviado para o back", form.value);
    if (this.animal_teste == true) {
      return this.postAnimalTeste(form);
    }
    //VERIFICA CAMPOS PREENCHIDOS
    if (form.value.tb_setor_tipo_id == 1 && (form.value.animal == null)) {
      return this._ToastrService.error('Preencha todos os campos corretamente', 'Erro!')
    }
    else if (form.value.tb_setor_tipo_id == 2 && (form.value.animal == null || form.value.animal == '' ||
      form.value.tb_baias_id == null || form.value.tb_baias_id == '' || form.value.tb_escore_id == null || form.value.tb_escore_id == '' ||
      form.value.tb_tempo_dosagem == null || form.value.tb_tempo_dosagem == '' || form.value.tb_dieta_id == null || form.value.tb_dieta_id == '' ||
      this.data_inseminacao == null || this.data_inseminacao == '')) {
      return this._ToastrService.error('Preencha todos os campos corretamente', 'Erro!')
    }
    else if (form.value.tb_setor_tipo_id == 3 && (form.value.animal == null || form.value.animal == '' ||
      form.value.tb_baias_id == null || form.value.tb_baias_id == '' || form.value.tb_escore_id == null || form.value.tb_escore_id == '' ||
      form.value.tb_tempo_dosagem == null || form.value.tb_tempo_dosagem == '' || form.value.tb_dieta_id == null || form.value.tb_dieta_id == '')) {
      return this._ToastrService.error('Preencha todos os campos corretamente', 'Erro!')
    }
    // else if (form.value.tb_setor_tipo_id == null || form.value.tb_setor_tipo_id == '' ||
    //   form.value.animal == null || form.value.animal == '' || form.value.tb_baias_id == null || form.value.tb_baias_id == '' ||
    //   form.value.tb_escore_id == null || form.value.tb_escore_id == '' || form.value.tb_tempo_dosagem == null || form.value.tb_tempo_dosagem == '' ||
    //   form.value.tb_dieta_id == null || form.value.tb_dieta_id == '') {
    //   return this._ToastrService.error('Preencha todos os campos corretamente', 'Erro!');
    // }
    else {
      if (this.data_inseminacao != null && this.dia_porco != null) {
        form.value.dt_inseminacao = this.data_inseminacao;
        form.value.dia_porco = this.dia_porco;
      } else {
        form.value.dt_inseminacao = this.hoje;
        form.value.dia_porco = this.dia_porco;
      }
      //BLOQUEANDO BOTAO DURANTE REQUEST
      this.isBusyForm = !this.isBusyForm;
      console.log('form enviado para o back', form.value);
      this._HttpService.JSON_POST(`/animais-movimentacoes/${this.filtro_listagem}`, form.value, false, true)
        .then(
          res => {
            this.getItens();
            this.isBusyForm = !this.isBusyForm;
            this.telaInserirMovimentacoes();
            // this.getComboChip();
            ShowService.inserirMovimentacoes = false;
            ShowService.listarMovimentacoes = true;
            this.data_inseminacao = null;
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
  POST GRUPO
  *************/
  postGrupoForm(form) {
    console.log('form', form.value);
    form.value.comboGrupoBaia = this.comboGrupoBaia;
    console.log('comboGrupoBaia', this.comboGrupoBaia);
    //VERIFICA SE O ARRAY NÃO ESTÁ VAZIO
    if (form.value.comboGrupoBaia == null || form.value.comboGrupoBaia == '') {
      return this._ToastrService.error('Não existe animais selecionados', 'Erro!');
    } else {
      //BLOQUEANDO BOTAO DURANTE REQUEST
      this.isBusyForm = !this.isBusyForm;
      this._HttpService.JSON_POST('/animais-movimentacoes/extra/combo/cadastra/grupo', form.value, false, true)
        .then(
          res => {
            this.getItens();
            this.isBusyForm = !this.isBusyForm;
            this.hideGrupo()
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
    if (form.value.tb_dieta_id == null || form.value.tb_dieta_id == '' ||
      //form.value.tb_baias_id == null || form.value.tb_baias_id == '' ||
      form.value.tb_escore_id == null || form.value.tb_escore_id == '' ||
      form.value.tb_tempo_dosagem == null || form.value.tb_tempo_dosagem == '') {
      return this._ToastrService.error('Preencha todos os campos corretamente', 'Erro!');

    } else {
      //BLOQUEANDO BOTAO DURANTE REQUEST

      this.isBusyForm = !this.isBusyForm;

      this._HttpService.JSON_PUT(`/animais-movimentacoes/${this.GlobalService.getItem().id}`, form.value, false, true)
        .then(
          res => {
            this.getItens();
            this.isBusyForm = !this.isBusyForm;
            this.exibeUpdate = false;
            this.hideGrupo()
            // this.getComboChip();
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
    console.log('filtro_listagem:', this.filtro_listagem);
    this._HttpService.JSON_GET(`/animais-movimentacoes/${this.filtro_listagem}`, false, true)
      .then(
        res => {
          if (res.json().data) {
            this.itensFilter = res.json().data;
          } else {
            this.itensFilter = [];
          }
          console.log('GET ANIMAIS MOVIMENTACOES', this.itensFilter);
          this.isBusyList = false;
          this.loading = false;
          return this.itens = res.json().data;
        },
        error => {
          this.isBusyList = false;
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
      this._HttpService.JSON_DELETE(`/animais-gestacao/getid/${this.GlobalService.getItem().id}/${this.GlobalService.getItem().id_rede}`, false, true)
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
        if (d.nome_baia) {
          return (d.brinco.toLowerCase().indexOf(val) !== -1 || !val) || (d.nome_baia.toLowerCase().indexOf(val) !== -1 || !val)
        }
        else {
          return (d.brinco.toLowerCase().indexOf(val) !== -1 || !val)
        }
      });
      this.itensFilter = filtro;
    }
  }
}
