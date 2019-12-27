/***********************************************************
COMPONENTS
***********************************************************/
import { Component, OnInit } from '@angular/core';
import { ToastrService } from 'ngx-toastr';

/**********************************************************
PROVIDERS
***********************************************************/
import { HttpService } from '../../../globals/http';
import { GlobalService } from '../../../globals/globals';
import { ShowService } from '../../../shared/app-show/show.service'

@Component({
  selector: 'app-registros',
  templateUrl: 'registros.html',
  styleUrls: ['registros.scss'],
  providers: [ShowService]
})
export class RegistrosComponent implements OnInit {


  showNew: boolean = false;
  isBusyForm: boolean = false;
  isBusyList: boolean = false;
  exibeUpdate: boolean = false;
  itens = [];
  itensFilter = [];
  itemsPerPage = 10;

  //COMBOS
  comboBaias = [];
  selectBaias = 0;

  comboDosadores = [];
  selectDosadores = 0;

  comboAnimais = [];
  selectAnimais = 0;

  comboDietas = [];
  selectDietas = 0;

  constructor(
    private _HttpService: HttpService,
    private _ToastrService: ToastrService,
    private GlobalService: GlobalService,
    private _ShowService: ShowService
  ) {
    this.getItens();
  }


  ngOnInit() {

    this.getBaias();
    this.getDosadores();
    this.getAnimais();
    this.getDietas();

  }

  /************
  COMBOS
  *************/
  getBaias() {
    this.isBusyList = true;
    this._HttpService.JSON_GET('/baias/extra/combo', false, true).then(
        res => {
          this.comboBaias = res.json();
        },
        error => {
          this._ToastrService.error(error.json().message);
        }
      )
  }

  getDosadores() {
    this.isBusyList = true;
    this._HttpService.JSON_GET('/dosadores/extra/combo', false, true).then(
        res => {
          this.comboDosadores = res.json();
        },
        error => {
          this._ToastrService.error(error.json().message);
        }
      )
  }
  getAnimais() {
    this.isBusyList = true;
    this._HttpService.JSON_GET('/animais/extra/combo', false, true).then(
        res => {
          this.comboAnimais = res.json();
        },
        error => {
          this._ToastrService.error(error.json().message);
        }
      )
  }

  getDietas() {
    this.isBusyList = true;
    this._HttpService.JSON_GET('/dietas/extra/combo', false, true).then(
        res => {
          this.comboDietas = res.json();
        },
        error => {
          this._ToastrService.error(error.json().message);

        }
      )
  }

  /************
  POST
  *************/
  postForm(form) {

    //VERIFICA CAMPOS PREENCHIDOS
    if (form.value.baias_id == null || form.value.baias_id == 0 ||
      form.value.dosadores_id == null || form.value.dosadores_id == 0 ||
      form.value.animais_id == null || form.value.animais_id == 0 ||
      form.value.dietas_id == null || form.value.dietas_id == 0 ||
      form.value.qa == null || form.value.qa == '' ||
      form.value.dia_animal == null || form.value.dia_animal == '') {

      return this._ToastrService.error('Preencha todos os campos corretamente', 'Erro!');

    } else {

      //BLOQUEANDO BOTAO DURANTE REQUEST
      this.isBusyForm = true;

      this._HttpService.JSON_POST('/registros', form.value, false, true).then(
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
    if (form.value.baias_id == null || form.value.baias_id == 0 ||
      form.value.dosadores_id == null || form.value.dosadores_id == 0 ||
      form.value.animais_id == null || form.value.animais_id == 0 ||
      form.value.dietas_id == null || form.value.dietas_id == 0 ||
      form.value.qa == null || form.value.qa == '' ||
      form.value.dia_animal == null || form.value.dia_animal == '') {

      return this._ToastrService.error('Preencha todos os campos corretamente', 'Erro!');

    } else {

      //BLOQUEANDO BOTAO DURANTE REQUEST
      this.isBusyForm = true;


      this._HttpService.JSON_PUT(`/registros/${this.GlobalService.getItem().id}`, form.value, false, true).then(
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
    this.isBusyList = true;
    this._HttpService.JSON_GET('/registros', false, true).then(
        res => {
          this.itensFilter = res.json().data;
          this.isBusyList = false;
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
    let res = confirm("Tem certeza que deseja excluir o registro?");
    if (res) {

      this._HttpService.JSON_DELETE(`/registros/${this.GlobalService.getItem().id}`, false, true)
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
        return d.dia_animal.toLowerCase().indexOf(val) !== -1 || !val;
      });

      this.itensFilter = filtro;
    }

  }

}
