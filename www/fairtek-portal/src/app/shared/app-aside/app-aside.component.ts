

import { Component } from '@angular/core';
import { GlobalService } from '../../globals/globals';

import { HttpService } from './../../globals/http';
import { ToastrService } from 'ngx-toastr';
@Component({
  selector: 'app-aside',
  templateUrl: './app-aside.component.html'
})
export class AppAsideComponent {

  public listaNofificacoes: any = [];

  constructor(
    private GlobalService: GlobalService,
    private _HttpService: HttpService,
    private _ToastrService: ToastrService
  ) {
  }

  cleanNotificacoes() {
    let resp = confirm('Tem certeza que deseja marcar todas as notificações como visualizada?');

    if (resp) {
      this._HttpService.JSON_PUT(`/notificacoes/filtro/visualizar`, null, false, true)
        .then(
          res => {
            if (res.json().message == 'error') return this._ToastrService.error('Houve um erro ao marcar as notificações como visualizada.');

            else {
              this.GlobalService.listNotificacoes = [];
              this.GlobalService.qtdNotificacoes = 0;
              return this._ToastrService.success('As Notificações foram visualizadas.')
            }
          })
    }
  }

  setVisualizar(id_not) {
    this._HttpService.JSON_PUT(`/notificacoes/visualizar/${id_not}`, null, false, true)
      .then(
        res => {
          if (res.json().message == 'error') return this._ToastrService.error('Houve um erro ao marcar a notificação como visualizada.');
          else {
            this._HttpService.JSON_GET(`/notificacoes/filtro/visualizar`, false, true).then(
              res2 => {
                this.GlobalService.listNotificacoes = res2.json();
                this.GlobalService.qtdNotificacoes = res2.json().length;
              }
            )
            return this._ToastrService.success('A Notificação foi Visualizada.')
          }
        }
      )
  }
}
