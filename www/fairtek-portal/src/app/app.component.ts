/*--------------
V 1.0.0 - Criado por Larner Diogo

DESCIÇÃO:
Componente geral da aplicação


COMPONENTS
***********************************************************/
import { Component } from '@angular/core';
import { HttpService } from './globals/http';
import { GlobalService } from './globals/globals';
import { ToastrService, Toast } from 'ngx-toastr';

import "ag-grid-enterprise";

@Component({
  selector: 'body',
  template: '<router-outlet></router-outlet>'
})
export class AppComponent {

  user = localStorage.getItem('user');

  constructor(
    private HttpService: HttpService,
    private GlobalService: GlobalService,
    private _ToastrService: ToastrService
  ) {
    setInterval(() => {
      if (this.user != '' && this.user != null) {
        this.HttpService.JSON_GET('/notificacoes/filtro/visualizar', false, true)
          .then(
            res => {

              if (res.json().length > 0) {
                this.GlobalService.listNotificacoes = res.json();
                this.GlobalService.qtdNotificacoes = res.json().length;

                /*for (let i = 0; i < res.json().length; i++) {

                  if (res.json()[i].st_toast !== 1) {

                    if (res.json()[i].status_noficiacao === 'danger') {
                      this._ToastrService.error(`${res.json()[i].valor.estado} ${res.json()[i].tipo}`);
                    }
                    else if (res.json()[i].status_noficiacao === 'success') {
                      this._ToastrService.success(`${res.json()[i].valor.estado} ${res.json()[i].tipo}`);
                    } else {
                      this._ToastrService.info(`${res.json()[i].valor.estado} ${res.json()[i].tipo}`);
                    }
                  }
                }*/

              } else {
                this.GlobalService.qtdNotificacoes = 0;
              }
            },
            error => {
              this._ToastrService.error(error.json().message);
            }
          )
      }
    }, 30000);
  }
}
