/***********************************************************
COMPONENTS
***********************************************************/
import { Component, OnInit } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { ActivatedRoute } from '@angular/router';

/**********************************************************
PROVIDERS
***********************************************************/
import { HttpService } from '../../globals/http';
import { GlobalService } from '../../globals/globals';

@Component({
    selector: 'app-dieta-historico',
    templateUrl: 'dieta-historico.html',
    styleUrls: ['dieta-historico.scss']
})
export class DietasHistoricosComponent implements OnInit{

    itens = [];
    itensFilter = [];
    itemsPerPage = 10;
    
    itemCarregado = [];
    
    //COMBOS
    comboNomeDieta = [];
    selectNomeDieta = 0;

    constructor(
        private _HttpService: HttpService,
        private _ToastrService: ToastrService,
        private GlobalService: GlobalService,
        private ActivatedRoute: ActivatedRoute
    ){}

    ngOnInit(){

        this.ActivatedRoute.params.subscribe(params => {
            this._HttpService.JSON_GET(`/dietas/${params.id}`, false, true)
            .then(
              res => {
                
                this.itemCarregado = res.json();
                return this.getItens();
                
              },
              error => {
                return this._ToastrService.error(error.json().message);
              }
            )
        })
        
    }

    getNomeDieta(){

    }

/************
  GET
  *************/
  getItens() {
    //this.isBusyList = true;
    
    this._HttpService.JSON_GET(`/dietas-historico/historico/list/${this.itemCarregado[0].id}`, false, true)
    .then(
        res => {
          this.itensFilter = res.json();
          //this.isBusyList = false;
          return this.itens = res.json();
        },
        error =>{
          //this.isBusyList = false;
          return this._ToastrService.error(error.json().message);
        }
      )

  }

   /************
  COMBOS
  *************/
 getComboNomeDieta() {

    this._HttpService.JSON_GET('/dietas/extra/combo', false, true)
      .then(
        res => {
          return this.comboNomeDieta = res.json();
        },
        error => {
          return this._ToastrService.error(error.json().message);
        }
      )
  }
}