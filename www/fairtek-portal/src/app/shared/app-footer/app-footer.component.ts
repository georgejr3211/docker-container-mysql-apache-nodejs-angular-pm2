import { Component } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { HttpService } from '../../globals/http';

@Component({
  selector: 'app-footer',
  templateUrl: './app-footer.component.html'
})
export class AppFooterComponent {

  usuario: any;
  version: any;
  show: boolean = false;

  constructor(
    private _HttpService: HttpService,
    private _ToastrService: ToastrService
  ) { }

  ngOnInit() {
    this.usuario = JSON.parse(localStorage.getItem('user'));
    this.usuario = this.usuario.nome.toLowerCase();
    this.getVersion();
  }

  getVersion() {
    this._HttpService.JSON_GET(`/utils/version/system`, false, true)
      .then(
        res => {
          this.version = res.json();
          this.show = true;
          console.log("VERSÃO DO BANCO: ", this.version.version)
          return this.version;
        },
        error => {
          return this._ToastrService.error(error.json().message);
        }
      )
  }

}
