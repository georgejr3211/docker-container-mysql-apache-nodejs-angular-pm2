/***********************************************************
COMPONENTS
***********************************************************/
import { Component, OnInit } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { Router, NavigationExtras } from '@angular/router';

/**********************************************************
PROVIDERS
***********************************************************/
import { HttpService } from '../../globals/http';
import { GlobalService } from '../../globals/globals';

import { SessionService } from '../../globals/session';
import { StorageService } from '../../globals/storage';


@Component({
  selector: 'app-registros-alimenticios',
  templateUrl: 'registros-alimenticios.html',
  styleUrls: ['registros-alimenticios.scss']
})
export class RegistrosAlimenticiosComponent implements OnInit {

  user: any;
  isBusyList: boolean = false;

  registros: any = [];

  constructor(
    private _HttpService: HttpService,
    private _StorageService: StorageService,
    private _ToastrService: ToastrService,
    private router: Router,
  ) {

  }

  ngOnInit(): void {
    this.user = JSON.parse(this._StorageService.getItem('user'));
    this.getRegistrosAlimenticios();

  }

  getRegistrosAlimenticios() {
    this._HttpService.JSON_GET('/registros-alimenticios', false, true)
      .then(
        res => {
          return this.registros = res.json();
        },
        error => {
          return this._ToastrService.error(error.json().message);
        }
      )
  }


}
