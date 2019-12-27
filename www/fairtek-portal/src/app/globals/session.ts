/*--------------
V 0.0.1 - Criado por Larner Diogo

DESCRICAO:
Serviço de autenticação de usuário


COMPONENTS
***********************************************************/
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';

/**********************************************************
PROVIDERS
***********************************************************/
import { StorageService } from './storage';
import { GlobalService } from './globals';


@Injectable()
export class SessionService {

  seg = 1800;

  private _isLogged: boolean = false;
  public nomeUserLogado: string;

  constructor(
    private _Router: Router,
    private _StorageService: StorageService,
    private _GlobalService: GlobalService
  ) {

    //verificando se user esta logado no storage
    if (this._StorageService.getItem('isLogged') == 'true') {
      this.setIsLogged(true);
      var usuario = JSON.parse(this._StorageService.getItem('user'));
      this.nomeUserLogado = usuario.nome;
    }

  }

  //RETORNA SE USUARIO ESTÁ LOGADO
  getIsLogged() {
    return this._isLogged;
  }

  //RETORNA SE USUARIO ESTÁ LOGADO
  setIsLogged(value) {
    if (value == true) {
      this.countTime();
      this.isAtive();
    }
    return this._isLogged = value;
  }

  countTime() {

    let interval = setInterval(() => {
      if (this.seg != 0) {
        this.seg = this.seg - 1;
      } else {
        clearInterval(interval);
        this._GlobalService.getLogout();
      }
    }, 1000)
  }

  isAtive() {
    document.onmousemove = () => {
      if (this.seg != 0) {
        this.seg = 1800;
      }
    }
  }
}
