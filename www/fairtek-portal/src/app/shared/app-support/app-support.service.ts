import { Injectable } from '@angular/core';
import { HttpService } from './../../globals/http';
import * as Rx from "rxjs";

@Injectable()
export class AppSupportService {

  troca_senha = 0;
  value = new Rx.Subject();
  existe = 0;
  constructor(
    private HttpService: HttpService,
  ) {
    this.busca_troca()
   }
  busca_troca() {
    this.HttpService.JSON_GET(`/usuarios/extra/combo/reset`, false, true)
      .then(
        res => {
          this.existe = 0;
          this.troca_senha = 0;
            for (var i = 0; i < res.json().length; i++) {
              if (res.json()[i].esqueceu_senha == 1) {
                this.troca_senha = this.troca_senha + 1
                this.existe = 1;
              }
            }
            if(this.existe == 0){
              this.troca_senha = 0
            }
            this.value.subscribe((data) => {
              this.troca_senha = this.troca_senha
            });
            return this.troca_senha;
        }
      )
  }

}
