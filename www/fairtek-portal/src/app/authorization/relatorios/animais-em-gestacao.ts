/***********************************************************
COMPONENTS
***********************************************************/
import { Component, TemplateRef, Input, ViewChild } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { defineLocale } from 'ngx-bootstrap/chronos';
import { ptBrLocale } from 'ngx-bootstrap/locale';
import *  as moment from 'moment';
defineLocale('pt-br', ptBrLocale);
import html2canvas from 'html2canvas';

/**********************************************************
SERVICES
***********************************************************/
import { PdfExcelService } from '../../shared/app-pdf-excel/pdf-excel.service'

/**********************************************************
PROVIDERS
***********************************************************/
import { HttpService } from '../../globals/http';
import { GlobalService } from '../../globals/globals';
import { BsLocaleService } from 'ngx-bootstrap';

@Component({
    selector: 'app-animais-em-gestacao',
    templateUrl: 'animais-em-gestacao.html',
    styleUrls: ['animais-em-gestacao.scss'],
})

export class AnimaisEmGestacao {
    loading: boolean = true;
    isBusyList: boolean = false;
    usuario: any;
    nomeGranja: any;
    itens = [];
    itensFilter = [];
    itemsPerPage = 10;
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
        private localeService: BsLocaleService
    ) { }

    ngOnInit() {
        this.getAnimaisGestacao();
        this.localeService.use(this.locale);
        this.usuario = JSON.parse(localStorage.getItem('user'));
        this.usuario = this.usuario.email.toLowerCase();
    }

    getAnimaisGestacao() {
        this.loading = true;
        this._HttpService.JSON_GET('/animais-em-gestacao', false, true)
            .then(
                res => {
                    this.loading = false;
                    this.itens = res.json();
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
        this._HttpService.JSON_GET(`/animais-em-gestacao/filtro/periodo/'${this.dt_inicio}'/'${this.dt_final}'`, false, true)
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
        this.itens = this.GlobalService.orderByColumn(column, this.itens)
    }
    searchFilter(event) {
        let val = event.target.value.toLowerCase();
        if (val.length == 0) {
            this.getAnimaisGestacao();
            this.itens = this.itensFilter;
        } else {
            let filtro = this.itens.filter((d) => {
                d.dia_atual = d.dia_atual.toString();
                d.qt_animal = d.qt_animal.toString();
                return (d.brinco.toLowerCase().indexOf(val) !== -1 || !val) || (d.chip_num.toLowerCase().indexOf(val) !== -1 || !val) || (d.tatuagem.toLowerCase().indexOf(val) !== -1 || !val) || (d.baia.toLowerCase().indexOf(val) !== -1 || !val) || (d.tatuagem.toLowerCase().indexOf(val) !== -1 || !val) || (d.dt_inseminacao.toLowerCase().indexOf(val) !== -1 || !val)
                    || (d.baia.toLowerCase().indexOf(val) !== -1 || !val) || (d.tatuagem.toLowerCase().indexOf(val) !== -1 || !val) || (d.dt_inseminacao.toLowerCase().indexOf(val) !== -1 || !val) || (d.dt_movimentacao.toLowerCase().indexOf(val) !== -1 || !val)
                    || (d.dia_atual.indexOf(val) !== -1 || !val) || (d.dieta.toLowerCase().indexOf(val) !== -1 || !val) || (d.escore.toLowerCase().indexOf(val) !== -1 || !val) || (d.qt_animal.toLowerCase().indexOf(val) !== -1 || !val)
            });
            this.itens = filtro;
        }
    }

    /*************
       PDF
    *************/
    //BUSCA O NOME DA GRANJA
    getNomeGranja() {
        this.isBusyList = true;
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
            { title: "Baia", dataKey: "baia" },
            { title: "Data de Movimentação", dataKey: "data_movimentacao" },
            { title: "Data da Inseminação", dataKey: "data_inseminacao" },
            { title: "Dia da Gestacção", dataKey: "dia_gestacao" },
            { title: "Dieta", dataKey: "dieta" },
            { title: "Escore", dataKey: "escore" },
            { title: "QT.", dataKey: "qt" },
        ];

        var rows = [];
        for (var i = 0; i < this.itens.length; i++) {
            var obj = {
                brinco: this.itens[i].brinco,
                tatuagem: this.itens[i].tatuagem,
                chip: this.itens[i].chip_num,
                baia: this.itens[i].baia,
                data_movimentacao: this.itens[i].dt_movimentacao,
                data_inseminacao: this.itens[i].dt_inseminacao,
                dia_gestacao: this.itens[i].dia_atual,
                dieta: this.itens[i].dieta,
                escore: this.itens[i].escore,
                qt: this.itens[i].qt_animal + 'g.'
            };
            rows.push(obj);
        }
        this.isBusyList = false; 
        return this._pdfExcel.exportAsPDF("Animais na Gestação", "Animais na Gestação", columns, rows, this.nomeGranja, this.usuario);
    }

}