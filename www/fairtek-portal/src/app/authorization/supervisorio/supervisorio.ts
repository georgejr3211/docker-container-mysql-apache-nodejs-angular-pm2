/***********************************************************
COMPONENTS
***********************************************************/
import { Component, OnInit } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { UtilsService } from '../../globals/utils';
import { Router, NavigationExtras, ActivatedRoute } from '@angular/router';

/**********************************************************
PROVIDERS
***********************************************************/
import { HttpService } from '../../globals/http';
import { GlobalService } from '../../globals/globals';

import { SessionService } from '../../globals/session';
import { StorageService } from '../../globals/storage';
import * as crypto from 'crypto-js';
import * as _ from 'underscore';

@Component({
  selector: 'app-supervisorio',
  templateUrl: 'supervisorio.html',
  styleUrls: ['supervisorio.scss']
})

export class SupervisorioComponent implements OnInit {
  loading: boolean = true;
  permissoes;
  read: boolean = false;

  user: any;
  isBusyList: boolean = false;
  fazendas = [];
  granjas = [];
  galpoes = [];
  baias = [];
  dosadores = [];
  fazenda_id = 0;
  granja_id = 0;
  galpao_id = 0;
  baia_id = 0;

  constructor(
    private _HttpService: HttpService,
    private _StorageService: StorageService,
    private _ToastrService: ToastrService,
    private router: Router,
    private util: UtilsService,
    private _router: ActivatedRoute
  ) {

    //this.refresh();
    setInterval(() => {

      if (this.baia_id !== 0) {
        this.dosadoresBaia(this.baia_id);
      }
    }, 60000);
  }

  ngOnInit(): void {

    this.user = JSON.parse(this._StorageService.getItem('user'));
    //this.fazendaGranja();
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

    var idGranja = this.user.tb_granja_id;
    this._HttpService.JSON_GET(`/granjas/fazenda/data/${idGranja}`, false, true)
      .then(
        data => {
          this.fazenda_id = data.json()[0].tb_fazendas_id
          this.fazendas = data.json();
          this.granja_id = data.json()[0].id;
          this.granjas = data.json();
          this.galpoesGranja(this.granja_id);
          this.baiasGeral(this.granja_id);
        }
      )
  }

  fACL() {
    //Permissões: read = 2
    //READ
    if (this.permissoes.includes(2)) {
      this.read = true;
    }
  }

  selectFazenda() {
    this.granjasFanzenda(this.fazenda_id);
  }

  selectGranja() {
    this.galpoesGranja(this.granja_id);
    this.baiasGeral(this.granja_id);
  }

  selectGalpao() {
    this.baiasGalpao(this.galpao_id);
  }

  selectBaia() {
    this.dosadoresBaia(this.baia_id);
  }

  fazendasProdutor() {
    this.loading = true;
    this._HttpService.JSON_GET(`/fazendas/produtor/${this.user.tb_produtores_id}`, false, true)
      .then(
        res => {
          this.loading = false;
          this.util.returnToastArrVazio(res.json(), 'Fazendas')
          this.isBusyList = true;
          this.fazendas = res.json();
        },
        error => {
          this.loading = false;
          return this._ToastrService.error(error.json().message);
        });
  }

  granjasFanzenda(fazenda_id) {
    this.loading = true;
    this._HttpService.JSON_GET(`/granjas/fazenda/${fazenda_id}`, false, true)
      .then(
        res => {
          this.loading = false;
          this.util.returnToastArrVazio(res.json(), 'Granjas')
          this.isBusyList = true;
          this.granjas = res.json();
        },
        error => {
          this.loading = false;
          return this._ToastrService.error(error.json().message);
        });
  }

  galpoesGranja(granja_id) {
    this.loading = true;
    this._HttpService.JSON_GET(`/galpoes/granja/${granja_id}`, false, true)
      .then(
        res => {
          this.loading = false;
          this.util.returnToastArrVazio(res.json(), 'Galpões')
          this.isBusyList = true;
          this.galpoes = res.json();
        },
        error => {
          this.loading = false;
          return this._ToastrService.error(error.json().message);
        });
  }

  baiasGeral(id_granja) {
    this.loading = true;
    this._HttpService.JSON_GET(`/baias/granja/extra/combo/${id_granja}`, false, true)
      .then(
        res => {
          this.loading = false;
          this.isBusyList = true;
          this.baias = res.json();
        },
        error => {
          this.loading = false;
          return this._ToastrService.error(error.json().message);
        });
  }

  baiasGalpao(galpao_id) {
    this.loading = true;
    this._HttpService.JSON_GET(`/baias/galpao/${galpao_id}`, false, true)
      .then(
        res => {
          this.loading = false;
          this.util.returnToastArrVazio(res.json(), 'Baias')
          this.isBusyList = true;
          this.baias = res.json();
        },
        error => {
          this.loading = false;
          return this._ToastrService.error(error.json().message);
        });
  }

  dosadoresBaia(baia_id) {
    this.loading = true;
    this._HttpService.JSON_GET(`/dosadores/baia/${baia_id}`, false, true)
      .then(
        res => {
          this.loading = false;
          this.isBusyList = true;
          this.dosadores = res.json();
        },
        error => {
          this.loading = false;
          return this._ToastrService.error(error.json().message);
        });
  }

  getAnimaisBaiaId(baia_id) {

    let navigationExtras: NavigationExtras = {
      queryParams: { 'baia_id': baia_id, read: this.read }
    };

    this.router.navigate(['/animais-baia'], navigationExtras);
  }
}