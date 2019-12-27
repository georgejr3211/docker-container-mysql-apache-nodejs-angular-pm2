import { Component } from '@angular/core';
import * as screenfull from 'screenfull';

import { GlobalService } from '../../globals/globals';
import { AppSupportService } from '../app-support/app-support.service'
import { AppVerifyRouteService } from '../app-verify-route/app-verify-route.service';
import * as Rx from "rxjs";

import { HttpService } from './../../globals/http';
import { ToastrService } from 'ngx-toastr';
import * as crypto from 'crypto-js';
import * as _ from 'underscore';
import { Router, NavigationEnd } from '@angular/router';
import { SessionService } from '../../globals/session';

var moment = require('moment');
// import { moment } from 'ngx-bootstrap/chronos/test/chain';


@Component({
  selector: 'app-header',
  templateUrl: './app-header.component.html'
})
export class AppHeaderComponent {

  permissoes;
  usuario;
  read_hardware: boolean = false;
  read_sistema: boolean = false;
  read_tiposNotificacao: boolean = false;
  read_dosadores: boolean = false;
  read_calibracao: boolean = false;
  read_produtor: boolean = false;
  read_usuarios: boolean = false;
  read_grupoUsuarios: boolean = false;
  read_suporte: boolean = false;
  nomeGranja: any;
  support = new Rx.Subject();
  value = 0;

  timer = new Date().getTime();
  seg: number = 1800;
  countDownDate;
  duration;

  constructor(
    private GlobalService: GlobalService,
    private HttpService: HttpService,
    private _ToastrService: ToastrService,
    private _support: AppSupportService,
    private _history: AppVerifyRouteService,
    private _router: Router,
    private _session: SessionService
  ) {

    this._router.events.subscribe(val => {

      if (val instanceof NavigationEnd) {
        this._history.setHistoryRoutes(val);
      }

    })

    this.support.subscribe((data) => {
      this.value = _support.troca_senha
    });
  }


  ngOnInit() {

    this.usuario = JSON.parse(localStorage.getItem('user'));
    this.usuario = this.usuario.nome.toLowerCase();
    /*******
    * DESCRIPTANDO E OBTENDO AS PERMISSÕES DO USUÁRIO
    * ******* */
    var decrypt = "myencrypttext"
    var user_data = localStorage.getItem('r');
    var user_decrypt = crypto.AES.decrypt(user_data, decrypt)
    var user_data_decrypt = user_decrypt.toString(crypto.enc.Utf8);

    var group = user_data_decrypt.split("|/|");
    group = group[1];

    this.HttpService.JSON_GET(`/grupo-usuarios/busca/permissions/${group}`, false, true)
      .then(
        res => {
          this.permissoes = _.pluck(res.json(), 'tb_acl_regras_id');
          this.fACL();
        }
      )
    this.getNomeGranja();
    this._support.busca_troca();
    // Intervalo de 10 min
    setInterval(() => {
      this._support.busca_troca();
      this.support.subscribe((data) => {
        this.value = this._support.troca_senha
      });
    }, 600000);

  }

  fACL() {
    /*Permissão de read: 
    * Tipos Notificações: 73;
    * Dosadores: 77;
    * Calibração: 71;
    * Produtor: 81;
    * Usuários: 89;
    * Grupo de Usuários: 93;
    * Suporte: 97;
    */

    //BLOQUEIA HARDWARE
    if (this.permissoes.includes(73 || 77 || 71) == false) {
      this.read_hardware = false;
    }
    //BLOQUEIA SISTEMA
    if (this.permissoes.includes(81 || 89 || 93 || 97) == false) {
      this.read_sistema = false;
    }
    //READ Tipos Notificações
    if (this.permissoes.includes(73)) {
      this.read_tiposNotificacao = true;
      this.read_hardware = true;
    }
    //READ Dosadores
    if (this.permissoes.includes(77)) {
      this.read_dosadores = true;
      this.read_hardware = true;
    }
    //READ Calibração
    if (this.permissoes.includes(71)) {
      this.read_calibracao = true;
      this.read_hardware = true;
    }
    //READ Produtor
    if (this.permissoes.includes(81)) {
      this.read_produtor = true;
      this.read_sistema = true;
    }
    //READ Usuários
    if (this.permissoes.includes(89)) {
      this.read_usuarios = true;
      this.read_sistema = true;
    }
    //READ Grupo de Usuários
    if (this.permissoes.includes(93)) {
      this.read_grupoUsuarios = true;
      this.read_sistema = true;
    }
    //READ Suporte
    if (this.permissoes.includes(97)) {
      this.read_suporte = true;
      this.read_sistema = true;
    }
  }

  show: boolean = false;

  showOnOff() {
    this.show = !this.show;
  }

  fullscreen() {
    if (screenfull.enabled) {
      screenfull.toggle();
    }
  }

  getNomeGranja() {
    var id_granja = JSON.parse(localStorage.getItem('user'));
    id_granja = id_granja.tb_granja_id;

    this.HttpService.JSON_GET(`/granjas/${id_granja}`, false, true)
      .then(
        res => {
          this.nomeGranja = res.json()[0].nome;
        }
      )
  }

}
