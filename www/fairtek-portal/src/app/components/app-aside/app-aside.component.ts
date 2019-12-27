import { Component } from '@angular/core';
import { HttpService } from '../../globals/http';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-aside',
  templateUrl: './app-aside.component.html'
})
export class AppAsideComponent {

  public listaNofificacoes: any = [];

  constructor(
    private HttpService: HttpService,
    private _ToastrService: ToastrService
  ) {

    this.HttpService.JSON_GET('/notificacoes', false, true)
      .then(res => {
        return this.listaNofificacoes = res.json().length;
        },
        error => {
          return this._ToastrService.error(error.json().message);
        })

  }
}
