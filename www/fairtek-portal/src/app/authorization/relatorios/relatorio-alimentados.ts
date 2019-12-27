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

/**********************************************************
SERVICES
***********************************************************/
import { PdfExcelService } from '../../shared/app-pdf-excel/pdf-excel.service'
import { AppVerifyRouteService } from '../../shared/app-verify-route/app-verify-route.service';

@Component({
    selector: 'app-relatorio-alimentados',
    templateUrl: 'relatorio-alimentados.html',
    styleUrls: ['relatorio-alimentados.scss']
})

export class RelatorioAlimentadosComponent implements OnInit {
    loading: boolean = true;
    nomeGranja: any;
    usuario: any;
    isBusyList: boolean = false;
    selectFiltro = 1;
    dashboard: any = {
        animais_nao_alimentados_16_hrs: [],
        animais_alimentados_24_hrs: [],

    };
    contentDataURL = '';


    constructor(
        private _HttpService: HttpService,
        private _ToastrService: ToastrService,
        private _pdfExcel: PdfExcelService,
        private GlobalService: GlobalService,
        private _history: AppVerifyRouteService

    ) { }

    ngOnInit() {
        debugger
        switch(this._history.lastFilter){
            case '/relatorio-alimentados/':
                this.selectFiltro = 1
                this.getFiltro({target: {value: 1}})
            break;
            case '/relatorio-alimentados/parcialmente':
                this.selectFiltro = 2
                this.getFiltro({target: {value: 2}})
            break;
            case '/relatorio-alimentados/completamente':
                this.selectFiltro = 3
                this.getFiltro({target: {value: 3}})
            break;
            default:
                this.selectFiltro = 1
                this.getFiltro({target: {value: 1}})
        }
        this.usuario = JSON.parse(localStorage.getItem('user'));
        this.usuario = this.usuario.email.toLowerCase();

    }

    //CARREGA TODOS OS ANIMAIS ALIMENTADOS 
    getDashboard() {
        this.loading = true;
        this.isBusyList = true;
        this._HttpService.JSON_GET('/relatorio-alimentados', false, true, true)
            .then(
                res => {
                    this.loading = false;
                    this.dashboard = res.json();
                },
                error => {
                    this.loading = false;
                    this._ToastrService.error(error.json().message);
                }
            )
    }

    orderByColumn(column){
        this.dashboard = this.GlobalService.orderByColumn(column, this.dashboard)
    }

    /************
      FILTRA ANIMAIS ALIMENTADOS COMPLETAMENTE/PARCIALMENTE
    *************/
    getFiltro(event) {

        var filtro = event.target.value;
        
        if (filtro == 1) {
            this.loading = true;
            this.isBusyList = true;
            this._HttpService.JSON_GET('/relatorio-alimentados', false, true, true)
                .then(
                    res => {
                        this.loading = false;
                        this.dashboard = res.json();
                    },
                    error => {
                        this.loading = false;
                        this._ToastrService.error(error.json().message);
                    }
                )
        }
        else if (filtro == 2) {
            this.loading = true;
            this._HttpService.JSON_GET('/relatorio-alimentados/parcialmente', false, true, true)
                .then(
                    res => {
                        this.loading = false;
                        this.dashboard = res.json();
                    },
                    error => {
                        this.loading = false;
                        this._ToastrService.error(error.json().message);
                    }
                )
        }
        else if (filtro == 3) {
            this.loading = true;
            this._HttpService.JSON_GET('/relatorio-alimentados/completamente', false, true, true)
                .then(
                    res => {
                        this.loading = false;
                        this.dashboard = res.json();
                    },
                    error => {
                        this.loading = false;
                        this._ToastrService.error(error.json().message);
                    }
                )
        }
    }

    /************
      FILTRA
      *************/
    searchFilter(event) {

        let val = event.target.value.toLowerCase();

        if (val.length === 0 || event.target.value == null) {
            this.getDashboard();
            this.dashboard.animais_nao_alimentados_24_hrs = this.dashboard;
        } else {
            let filtro = this.dashboard.filter(function (d) {
                return ((d.brinco.toLowerCase().indexOf(val) !== -1 || !val) || (d.chip_num.toLowerCase().indexOf(val) !== -1 || !val)
                    || (d.nome_baia.toLowerCase().indexOf(val) !== -1 || !val) || (d.dosador_num.toLowerCase().indexOf(val) !== -1 || !val));
            });
            this.dashboard = filtro;
        }
    }

    /*************
     PDF
    *************/
     //BUSCA O NOME DA GRANJA
     getNomeGranja() {
        this.isBusyList = false;
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
            { title: "Chip", dataKey: "chip" },
            { title: "Dia do Animal", dataKey: "dia_animal" },
            { title: "Dieta", dataKey: "dieta" },
            { title: "Baia", dataKey: "baia" },
            { title: "Hora Alim.", dataKey: "hora_alimentado_key" },
            { title: "Dosador", dataKey: "dosador_key" },
            { title: "QA", dataKey: "qa" },
            { title: "QT", dataKey: "qt" },
            { title: "QR", dataKey: "qr" },
            { title: "Status Alimentação", dataKey: "status_alimentado_key" },
        ];

        var rows = [];
        for (var i = 0; i < this.dashboard.length; i++) {
            var status_alimentado;
            if (this.dashboard[i].qa >= this.dashboard[i].qt) {
                status_alimentado = "Completamente Alimentado"
            } else if (this.dashboard[i].qa > 0 && this.dashboard[i].qa < this.dashboard[i].qt) {
                status_alimentado = "Parcialmente Alimentado"
            } else {
                status_alimentado = "Não Alimentado"
            }

            var obj = {
                brinco: this.dashboard[i].brinco,
                chip: this.dashboard[i].chip_num,
                dia_animal: this.dashboard[i].dia,
                dieta: this.dashboard[i].nome_dieta,
                baia: this.dashboard[i].nome_baia,
                hora_alimentado_key: this.dashboard[i].hora_alimentado,
                dosador_key: this.dashboard[i].dosador_num,
                qa: this.dashboard[i].qa * 100 + 'g.',
                qt: this.dashboard[i].qt * 100 + 'g.',
                qr: (this.dashboard[i].qt - this.dashboard[i].qa) * 100 + 'g.',
                status_alimentado_key: status_alimentado
            };
            rows.push(obj);
        }
        this.isBusyList = true;
        return this._pdfExcel.exportAsPDF("Alimentados", "Animais Alimentados(Parcial e Totalmente)", columns, rows, this.nomeGranja, this.usuario);
    }
}