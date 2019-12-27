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
import { Router } from '@angular/router';
import { ShowService } from '../../shared/app-show/show.service';

@Component({
  selector: 'app-animais-baia',
  templateUrl: 'animais-baia.html',
  styleUrls: ['animais-baia.scss']
})
export class AnimaisBaiaComponent implements OnInit {

  isBusyList: boolean = false;
  loading: boolean = true;
  baia_id: any;
  animais: any = [];
  itensFilter: any = [];
  isBusyForm: boolean;
  comboBaias: any;
  selectBaia;
  constructor(
    private route: ActivatedRoute,
    private _HttpService: HttpService,
    private _ToastrService: ToastrService,
    private GlobalService: GlobalService,
    private _Rota: Router,
    private _ShowService: ShowService,
  ) { }


  ngOnInit(): void {
    this.route.queryParams
      .filter(params => params.baia_id)
      .subscribe(params => {
        this.baia_id = params.baia_id;
        this.selectBaia = params.baia_id;

      });

    this.getAnimaisBaia();
    this.getComboBaias();
  }

  /***
   * Função redireciona para a tela de edição do ANIMAL clicado
   * * */
  editAnimal(animal) {
    animal.chip = animal.chip_num;
    this.GlobalService.marcaItem(animal);
    this._ShowService.showEditAnimalFromSuper();
    this._Rota.navigate(['/animais']);
  }

  /***
   * Função redireciona para a tela de edição do DIETA clicado
   * * */
  editDieta(animal) {
    this._Rota.navigate(['/dietas']);
  }

  /***
   * Função redireciona para a tela de edição do ESCORE clicado
   * * */
  editEscore(animal) {
    this._Rota.navigate(['/animais-movimentacoes']);
  }

  getAnimaisBaia() {
    this.loading = true;
    this._HttpService.JSON_GET(`/animais-supervisorio/baia/${this.baia_id}`, false, true)
      .then(
        res => {
          this.isBusyList = true;
          this.loading = false;
          this.animais = res.json();
          this.itensFilter = this.animais;
        },
        error => {
          this.loading = false;
          return this._ToastrService.error(error.json().message);
        });
  }

  /************
  FILTRA
  *************/
  searchFilter(event) {
    let val = event.target.value.toLowerCase();

    if (val.length === 0) {
      this.itensFilter = this.animais;


    } else {

      let filtro = this.itensFilter.filter(function (d) {
        return (d.brinco.toLowerCase().indexOf(val) !== -1 || !val) || (d.chip_num.toLowerCase().indexOf(val) !== -1 || !val)
      });

      this.itensFilter = filtro;
    }

  }

  changeBaia() {
    this._Rota.navigate(['/animais-baia'], { queryParams: { baia_id: this.selectBaia } })
      .then(
        res => {
          this.getAnimaisBaia()
          this.getComboBaias()
        }

      )
  }
  /************
    COMBOS
    *************/
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

}
