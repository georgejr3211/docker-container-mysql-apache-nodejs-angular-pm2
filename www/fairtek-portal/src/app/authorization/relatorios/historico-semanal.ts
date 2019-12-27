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
import *  as moment from 'moment';
import html2canvas from 'html2canvas';

/**********************************************************
SERVICES
***********************************************************/
import { PdfExcelService } from '../../shared/app-pdf-excel/pdf-excel.service'

@Component({
    selector: 'app-historico-semanal',
    templateUrl: 'historico-semanal.html',
    styleUrls: ['historico-semanal.scss']
})
export class HistoricoSemanal {
    loading: boolean = true;
    usuario;
    itens = [];
    itensFilter = [];
    filtro = 1;
    filtro_porcentagem = 1;
    filtro_porcentagem_atualiza = 1;
    hoje = moment().format('DD-MM-YYYY');
    dia = [];
    nomeGranja: any;

    constructor(
        private _HttpService: HttpService,
        private _ToastrService: ToastrService,
        private _pdfExcel: PdfExcelService,
        private GlobalService: GlobalService
    ) { }

    ngOnInit() {
        this.getHistoricoSemanal();
        this.usuario = JSON.parse(localStorage.getItem('user'));
        this.usuario = this.usuario.email.toLowerCase();
        this.getNomeGranja();
    }

    getHistoricoSemanal() {
        this.loading = true;
        this.calculaDias();
        this._HttpService.JSON_GET('/historico-semanal', false, true)
            .then(
                res => {
                    this.loading = false;
                    this.itensFilter = res.json();
                    return this.itens = res.json();
                },
                error => {
                    this.loading = false;
                    this._ToastrService.error(error.json().message);
                }
            )
    }

    getFiltroHistoricoSemanal() {
        this.loading = true;
        this._HttpService.JSON_GET(`/historico-semanal/filtro/${this.filtro}/${this.filtro_porcentagem}`, false, true)
            .then(
                res => {
                    this.loading = false;
                    this.itensFilter = res.json();
                    if (this.filtro_porcentagem_atualiza != 1) {
                        for (var i = 0; i < this.itensFilter.length; i++) {
                            this.itensFilter[i].dia0 = (this.itensFilter[i].dia0 / this.itensFilter[i].dia0_apto) * 100;
                            this.itensFilter[i].dia0 = Math.floor(this.itensFilter[i].dia0);
                            this.itensFilter[i].dia0 = this.itensFilter[i].dia0.toString();
                            this.itensFilter[i].dia0 = this.itensFilter[i].dia0 + "%";
                            this.itensFilter[i].dia0_apto = "100%";
                            if (this.itensFilter[i].dia0 == 'NaN%') {
                                this.itensFilter[i].dia0 = 0 + "%";
                            }

                            this.itensFilter[i].dia1 = (this.itensFilter[i].dia1 / this.itensFilter[i].dia1_apto) * 100;
                            this.itensFilter[i].dia1 = Math.floor(this.itensFilter[i].dia1);
                            this.itensFilter[i].dia1 = this.itensFilter[i].dia1.toString();
                            this.itensFilter[i].dia1 = this.itensFilter[i].dia1 + "%";
                            this.itensFilter[i].dia1_apto = "100%";
                            if (this.itensFilter[i].dia1 == 'NaN%') {
                                this.itensFilter[i].dia1 = 0 + "%";
                            }

                            this.itensFilter[i].dia2 = (this.itensFilter[i].dia2 / this.itensFilter[i].dia2_apto) * 100;
                            this.itensFilter[i].dia2 = Math.floor(this.itensFilter[i].dia2);
                            this.itensFilter[i].dia2 = this.itensFilter[i].dia2.toString();
                            this.itensFilter[i].dia2 = this.itensFilter[i].dia2 + "%";
                            this.itensFilter[i].dia2_apto = "100%";
                            if (this.itensFilter[i].dia2 == 'NaN%') {
                                this.itensFilter[i].dia2 = 0 + "%";
                            }

                            this.itensFilter[i].dia3 = (this.itensFilter[i].dia3 / this.itensFilter[i].dia3_apto) * 100;
                            this.itensFilter[i].dia3 = Math.floor(this.itensFilter[i].dia3);
                            this.itensFilter[i].dia3 = this.itensFilter[i].dia3.toString();
                            this.itensFilter[i].dia3 = this.itensFilter[i].dia3 + "%";
                            this.itensFilter[i].dia3_apto = "100%";
                            if (this.itensFilter[i].dia3 == 'NaN%') {
                                this.itensFilter[i].dia3 = 0 + "%";
                            }

                            this.itensFilter[i].dia4 = (this.itensFilter[i].dia4 / this.itensFilter[i].dia4_apto) * 100;
                            this.itensFilter[i].dia4 = Math.floor(this.itensFilter[i].dia4);
                            this.itensFilter[i].dia4 = this.itensFilter[i].dia4.toString();
                            this.itensFilter[i].dia4 = this.itensFilter[i].dia4 + "%";
                            this.itensFilter[i].dia4_apto = "100%";
                            if (this.itensFilter[i].dia4 == 'NaN%') {
                                this.itensFilter[i].dia4 = 0 + "%";
                            }

                            this.itensFilter[i].dia5 = (this.itensFilter[i].dia5 / this.itensFilter[i].dia5_apto) * 100;
                            this.itensFilter[i].dia5 = Math.floor(this.itensFilter[i].dia5);
                            this.itensFilter[i].dia5 = this.itensFilter[i].dia5.toString();
                            this.itensFilter[i].dia5 = this.itensFilter[i].dia5 + "%";
                            this.itensFilter[i].dia5_apto = "100%";
                            if (this.itensFilter[i].dia5 == 'NaN%') {
                                this.itensFilter[i].dia5 = 0 + "%";
                            }

                            this.itensFilter[i].dia6 = (this.itensFilter[i].dia6 / this.itensFilter[i].dia6_apto) * 100;
                            this.itensFilter[i].dia6 = Math.floor(this.itensFilter[i].dia6);
                            this.itensFilter[i].dia6 = this.itensFilter[i].dia6.toString();
                            this.itensFilter[i].dia6 = this.itensFilter[i].dia6 + "%";
                            this.itensFilter[i].dia6_apto = "100%";
                            if (this.itensFilter[i].dia6 == 'NaN%') {
                                this.itensFilter[i].dia6 = 0 + "%";
                            }
                        }
                    }
                    return this.itensFilter;
                },
                error => {
                    this.loading = false;
                    this._ToastrService.error(error.json().message);
                }
            )
    }

    calculaDias() {
        var j = 1
        for (let i = 0; i < 7; i++) {
            this.dia[i] = moment().subtract(j, 'days').format('DD-MM-YYYY');
            j++;
        }
    }

    atualizaFiltro() {
        this.filtro_porcentagem_atualiza = this.filtro_porcentagem;
        this.getFiltroHistoricoSemanal();
    }

    /************
    FILTRA
    *************/
    searchFilter(event) {
        var valor = event.target.value.toLowerCase();
        if (valor.length === 0) {
            this.itensFilter = this.itens;
        } else {
            let filtro = this.itens.filter((d) => {
                (d.nome_baia.toLowerCase().indexOf(valor) !== -1 || !valor);
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
                    this.nomeGranja = this.nomeGranja.charAt(0).toUpperCase() + this.nomeGranja.slice(1);
                }
            )
    }

    exportAsPDF() {
        var columns = [
            { title: "Baia", dataKey: "baia" },
            { title: "Data Entrada", dataKey: "data_entrada" },
            { title: this.dia[0], dataKey: "dia0" },
            { title: this.dia[1], dataKey: "dia1" },
            { title: this.dia[2], dataKey: "dia2" },
            { title: this.dia[3], dataKey: "dia3" },
            { title: this.dia[4], dataKey: "dia4" },
            { title: this.dia[5], dataKey: "dia5" },
            { title: this.dia[6], dataKey: "dia6" },
        ];

        var titulo = '';
        if (this.filtro == 2) {
            titulo = 'Histórico Semanal - Alimentados parcialmente'
        } else if (this.filtro == 3) {
            titulo = 'Histórico Semanal - Não Alimentados'
        } else {
            titulo = 'Histórico Semanal - Alimentados 100%'
        }
        var rows = [];

        for (var i = 0; i < this.itensFilter.length; i++) {
            var obj = {
                baia: this.itensFilter[i].nome_baia,
                data_entrada: this.itensFilter[i].data_entrada,
                dia0: this.itensFilter[i].dia0 + " / " + this.itensFilter[i].dia0_apto,
                dia1: this.itensFilter[i].dia1 + " / " + this.itensFilter[i].dia1_apto,
                dia2: this.itensFilter[i].dia2 + " / " + this.itensFilter[i].dia2_apto,
                dia3: this.itensFilter[i].dia3 + " / " + this.itensFilter[i].dia3_apto,
                dia4: this.itensFilter[i].dia4 + " / " + this.itensFilter[i].dia4_apto,
                dia5: this.itensFilter[i].dia5 + " / " + this.itensFilter[i].dia5_apto,
                dia6: this.itensFilter[i].dia6 + " / " + this.itensFilter[i].dia6_apto,
            };
            rows.push(obj);
        }

        return this._pdfExcel.exportAsPDF("Histórico Semanal", titulo, columns, rows, this.nomeGranja, this.usuario);
    }
}