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

@Component({
  selector: 'app-novo-brincos',
  templateUrl: 'novo.html',
  styleUrls: ['novo.scss']
})
export class BrincosNovoComponent implements OnInit {

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

  constructor(
    private _HttpService: HttpService,
    private _ToastrService: ToastrService,
    private GlobalService: GlobalService
  ) {
    this.getItens();
  }

  ngOnInit(){
    this.getComboFazendas();
    this.getComboVeterinarios();
    this.getComboNutricionistas();
    this.getComboGerentes();
    this.getComboOperadores();
    this.getComboGeneticas();
    this.getComboProdutores();
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
        error =>{
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
        error =>{
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
        error =>{
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
        error =>{
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
        error =>{
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
        error =>{
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
        error =>{
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
        return this._ToastrService.error('Preencha todos os campos corretamente', 'Erro!');

    } else {

      //BLOQUEANDO BOTAO DURANTE REQUEST
      this.isBusyForm = true;

      this._HttpService.JSON_POST('/granjas', form.value, false, true)
      .then(
        res => {
          this.getItens();
          this.isBusyForm = false;
          return this._ToastrService.success(res.json().message);
        },
        error =>{
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
        return this._ToastrService.error('Preencha todos os campos corretamente', 'Erro!');

    } else {

      //BLOQUEANDO BOTAO DURANTE REQUEST
      this.isBusyForm = true;

      this._HttpService.JSON_PUT(`/granjas/${this.GlobalService.getItem().id}`, form.value, false, true)
      .then(
        res => {
          this.getItens();
          this.isBusyForm = false;
          this.exibeUpdate = false;
          return this._ToastrService.success(res.json().message);
        },
        error =>{
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
    this._HttpService.JSON_GET('/granjas', false, true)
    .then(
        res => {
          this.itensFilter = res.json().data;
          this.isBusyList = false;
          return this.itens = res.json().data;
        },
        error =>{
          this.isBusyList = false;
          return this._ToastrService.error(error.json().message);
        }
      )

  }

  /************
  DELETE
  *************/
  deleteItem() {
    let res = confirm("Tem certeza que deseja excluir a granja?");
    if(res){

      this._HttpService.JSON_DELETE(`/granjas/${this.GlobalService.getItem().id}`, false, true)
      .then(
        res => {
          this.getItens();
          return this._ToastrService.success(res.json().message);
        },
        error =>{
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

    if(val.length === 0){
      this.itensFilter = this.itens;

    }else{

      let filtro = this.itensFilter.filter(function(d) {
        return d.nome.toLowerCase().indexOf(val) !== -1 || !val;
      });

      this.itensFilter = filtro;
    }

  }

}
