/***********************************************************
COMPONENTS
***********************************************************/
import { Component, OnInit } from '@angular/core';
import { ToastrService } from 'ngx-toastr';


/**********************************************************
PROVIDERS
***********************************************************/
import { HttpService } from '../../globals/http';
import { GlobalService } from '../../globals/globals';
import { defineLocale } from 'ngx-bootstrap/chronos';
import { ptBrLocale } from 'ngx-bootstrap/locale';
import { BsLocaleService } from 'ngx-bootstrap';
import *  as moment from 'moment';
defineLocale('pt-br', ptBrLocale);
import html2canvas from 'html2canvas';

/**********************************************************
SERVICES
***********************************************************/
import { PdfExcelService } from '../../shared/app-pdf-excel/pdf-excel.service'
import { ActivatedRoute } from '@angular/router';

@Component({
    selector: 'app-animais-externa',
    templateUrl: 'animais-externa.html',
    styleUrls: ['animais-externa.scss']
})
export class AnimaisExterna {
    loading: boolean = true;
    usuario;
    nomeGranja: any;
    itens = [];
    itensFilter = [];
    filtro = 0;
    dt_inicio; //filtro de periodo
    dt_final;  // filtro de periodo
    locale = 'pt-br';
    bsConfig = {
        containerClass: 'theme-fairtek',
        dateInputFormat: 'DD-MM-YYYY'
    }

    constructor(
        private _HttpService: HttpService,
        private _ToastrService: ToastrService,
        private GlobalService: GlobalService,
        private _pdfExcel: PdfExcelService,
        private localeService: BsLocaleService,
    ) {


    }


    ngOnInit() {

        this.getAnimaisBaia();
        this.localeService.use(this.locale);
        this.usuario = JSON.parse(localStorage.getItem('user'));
        this.usuario = this.usuario.email.toLowerCase();
    }

    getAnimaisBaia() {
        this.loading = true;
        this._HttpService.JSON_GET('/animais-externa', false, true)
            .then(
                res => {
                    this.loading = false;
                    this.itensFilter = res.json();
                    this.itens = res.json();
                    console.log("itens: ", this.itensFilter)
                },
                error => {
                    this.loading = false;
                    this._ToastrService.error(error.json().message);
                }
            )
    }

    getFiltroPeriodo() {
        this.loading = true;
        this.dt_inicio = moment(this.dt_inicio).format('YYYY-MM-DD 00:00:00');
        this.dt_final = moment(this.dt_final).format('YYYY-MM-DD 23:59:59');
        this._HttpService.JSON_GET(`/animais-externa/filtro/periodo/'${this.dt_inicio}'/'${this.dt_final}'`, false, true)
            .then(
                res => {
                    this.loading = false;
                    this.itensFilter = res.json();
                    this.itens = res.json();
                    this.dt_inicio = '';
                    this.dt_final = '';
                },
                error => {
                    this.loading = false;
                    this._ToastrService.error(error.json().message);
                }
            )
    }

    /************
    FILTRA
    *************/
    orderByColumn(column){
        this.itensFilter = this.GlobalService.orderByColumn(column, this.itensFilter)
    }
    searchFilter(event) {
        var valor = event.target.value.toLowerCase();
        if (valor.length === 0) {
            this.itensFilter = this.itens;
        }
        else {
            let filtro = this.itensFilter.filter(function (d) {
                if (d != null) {
                    return ((d.brinco.toLowerCase().indexOf(valor) !== -1 || !valor) || (d.chip.toLowerCase().indexOf(valor) !== -1 || !valor) || (d.tatuagem.toLowerCase().indexOf(valor) !== -1 || !valor));
                }

            });
            this.itensFilter = filtro;
        }
    }

    /*************
     PDF
    *************/
     //BUSCA O NOME DA GRANJA
     getNomeGranja() {
        var id_granja = JSON.parse(localStorage.getItem('user'));
        id_granja = id_granja.tb_granja_id;
    
        this._HttpService.JSON_GET(`/granjas/${id_granja}`, false, true)
          .then(
            res => {
              this.nomeGranja = res.json()[0].nome;
              this.nomeGranja = this.nomeGranja.toLowerCase();
              this.nomeGranja =  this.nomeGranja.charAt(0).toUpperCase() + this.nomeGranja.slice(1)   
              this.exportAsPDF();
            }
          )
      }

    exportAsPDF() {
        var columns = [
            { title: "Brinco", dataKey: "brinco" },
            { title: "Tatuagem", dataKey: "tatuagem" },
            { title: "Chip", dataKey: "chip" },
            { title: "Data de movimentação", dataKey: "data_movimentacao" },
        ];

        var rows = [];
        for (var i = 0; i < this.itens.length; i++) {
            var obj = {
                brinco: this.itens[i].brinco,
                tatuagem: this.itens[i].tatuagem,
                chip: this.itens[i].chip,
                data_movimentacao: this.itens[i].movimentacao
            };
            rows.push(obj);
        }
        return this._pdfExcel.exportAsPDF("Animais Área Externa", "Animais na Área Externa", columns, rows, this.nomeGranja, this.usuario);
    }
}

