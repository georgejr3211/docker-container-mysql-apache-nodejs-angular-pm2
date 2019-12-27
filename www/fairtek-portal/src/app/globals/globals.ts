/*--------------
V 0.0.1 - Criado por Larner Diogo

DESCRICAO:
Serviço de requisições http


COMPONENTS
***********************************************************/
import { Injectable } from '@angular/core';
import { HttpService } from './http';
import { StorageService } from './storage';

@Injectable()
export class GlobalService {

  // private _itemSelecionado: any = [];
  // public qtdNotificacoes: number = 0;
  // public listNotificacoes: any = [];

  // constructor(
  //   private HttpService: HttpService,
  //   private StorageService: StorageService
  // ) { }

  // /************
  // MARCA ITEM
  // *************/
  // marcaItem(item) {
  //   return this._itemSelecionado = item;
  // }

  // /************
  // MARCA ITEM
  // *************/
  // getItem() {
  //   let item = this._itemSelecionado;
  //   return item;
  // }

  // getLogout() {
  //   this.StorageService.removeItem('isLogged');
  //   this.StorageService.removeItem('user');
  //   localStorage.removeItem('r');
  //   location.reload();
  // }

    private _itemSelecionado: any = [];
    public qtdNotificacoes: number = 0;
    public listNotificacoes: any = [];

    constructor(
        private HttpService: HttpService,
        private StorageService: StorageService
    ){}

    /************
    MARCA ITEM
    *************/
    marcaItem(item) {

        return this._itemSelecionado = item;
    }

    /************
    MARCA ITEM
    *************/
    getItem() {
        let item = this._itemSelecionado;
        return item;
    }

    getLogout(){
        this.StorageService.removeItem('isLogged');
        this.StorageService.removeItem('user');
        localStorage.removeItem('r');
        location.reload();
    }
    orderByColumn (coluna, array){
        array.sort((x, y) => {
            debugger
           return x[coluna] < y[coluna] ? -1 : 1;
        })
        return array
    }
}
