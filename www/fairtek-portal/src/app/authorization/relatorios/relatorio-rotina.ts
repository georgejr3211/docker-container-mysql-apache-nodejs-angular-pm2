import { debug } from 'util';
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
    selector: 'app-relatorio-rotina',
    templateUrl: 'relatorio-rotina.html',
    styleUrls: ['relatorio-rotina.scss']
})
export class RelatorioRotinaComponent implements OnInit {
    loading: boolean = true;
    nomeGranja: any;
    usuario: any;
    isBusyList: boolean = false;
    dashboard: any = {
        animais_nao_alimentados_48_hrs: [],
        animais_nao_alimentados_24_hrs: [],

    };
    dashboardFilter: any = {
        animais_nao_alimentados_48_hrs: [],
        animais_nao_alimentados_24_hrs: [],
    };
    selectFiltro = 2;
    filtro = 2;

    constructor(
        private _HttpService: HttpService,
        private _ToastrService: ToastrService,
        private _pdfExcel: PdfExcelService,
        private GlobalService: GlobalService,
        private _history: AppVerifyRouteService

    ) {
    }

    ngOnInit() {
        if(this._history.lastFilter == '/relatorio-rotina/'){
            this.selectFiltro = 1
            this.getFiltro({target:{value: 1}})
        }
        else{
            this.selectFiltro = 2
            this.getFiltro({target:{value: 2}})
        }
        this.usuario = JSON.parse(localStorage.getItem('user'));
        this.usuario = this.usuario.email.toLowerCase();

    }

    getDashboard() {
        this.loading = true;
        this.isBusyList = true;
        this._HttpService.JSON_GET('/relatorio-rotina/dois-dias', false, true)
            .then(
                res => {
                    this.dashboardFilter = res.json();
                    this.dashboard = res.json();
                    this.loading = false;
                },
                error => {
                    this.loading = false;
                    this._ToastrService.error(error.json().message);
                }
            )
    }

    /************
     FILTRA ANIMAIS ALIMENTADOS COMPLETAMENTE/PARCIALMENTE
   *************/
    getFiltro(event) {
        this.filtro = event.target.value;

        if (this.filtro == 1) {
            this.loading = true;
            this.isBusyList = true;
            this._HttpService.JSON_GET('/relatorio-rotina/', false, true, true)
                .then(
                    res => {
                        console.log('relato: ', this._history.lastFilter)
                        debugger
                        this.loading = false;
                        this.dashboardFilter = res.json();
                        this.dashboard = res.json();
                    },
                    error => {
                        this.loading = false;
                        this._ToastrService.error(error.json().message);
                    }
                )
        }
        else if (this.filtro == 2) {
            this.loading = true;
            this._HttpService.JSON_GET('/relatorio-rotina/dois-dias', false, true, true)
                .then(
                    res => {
                        this.loading = false;
                        this.dashboardFilter = res.json();
                        this.dashboard = res.json();
                    },
                    error => {
                        this.loading = false;
                        this._ToastrService.error(error.json().message);
                    }
                )
        }
    }
    orderByColumn(column){
        this.filtro == 1  
            ? this.dashboard.animais_nao_alimentados_48_hrs = this.GlobalService.orderByColumn(column, this.dashboard.animais_nao_alimentados_24_hrs)
            : this.dashboard.animais_nao_alimentados_24_hrs = this.GlobalService.orderByColumn(column, this.dashboard.animais_nao_alimentados_48_hrs)
    }
    /************
    FILTRA
    *************/
    searchFilter(event) {
        let val = event.target.value.toLowerCase();
        if (val.length === 0 || event.target.value == null) {
            if (this.selectFiltro == 1) {
                this.dashboard.animais_nao_alimentados_24_hrs = this.dashboardFilter.animais_nao_alimentados_24_hrs;
            }
            else if (this.selectFiltro == 2) {
                this.dashboard.animais_nao_alimentados_48_hrs = this.dashboardFilter.animais_nao_alimentados_48_hrs;
            }
        }
        else {
            if (this.selectFiltro == 1) {
                let filtro = this.dashboard.animais_nao_alimentados_24_hrs.filter(function (d) {

                    return ((d.brinco.toLowerCase().indexOf(val) !== -1 || !val) || (d.chip_num.toLowerCase().indexOf(val) !== -1 || !val) || (d.baia_nome.toLowerCase().indexOf(val) !== -1 || !val));
                });
                if (this.selectFiltro == 1) this.dashboard.animais_nao_alimentados_24_hrs = filtro;
                else if (this.selectFiltro == 2) this.dashboard.animais_nao_alimentados_48_hrs = filtro;
            }
            else if (this.selectFiltro == 2) {
                let filtro = this.dashboard.animais_nao_alimentados_48_hrs.filter(function (d) {

                    return ((d.brinco.toLowerCase().indexOf(val) !== -1 || !val) || (d.chip_num.toLowerCase().indexOf(val) !== -1 || !val) || (d.baia_nome.toLowerCase().indexOf(val) !== -1 || !val));

                });
                this.dashboard.animais_nao_alimentados_48_hrs = filtro;
            }
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
        var columns1dia = [
            { title: "Brinco", dataKey: "brinco" },
            { title: "Chip", dataKey: "chip" },
            { title: "Dia do Animal", dataKey: "dia_animal" },
            { title: "Dieta", dataKey: "dieta" },
            { title: "Baia Origem", dataKey: "baia_origem" },
            { title: "Temp. Dosagem", dataKey: "temp_dosagem" },
            { title: "Hoje", dataKey: "hoje_key" },
            { title: "Ontem", dataKey: "ontem_key" }           
        ];

        var columns2dia = [
            { title: "Brinco", dataKey: "brinco" },
            { title: "Chip", dataKey: "chip" },
            { title: "Dia do Animal", dataKey: "dia_animal" },
            { title: "Dieta", dataKey: "dieta" },
            { title: "Baia Origem", dataKey: "baia_origem" },
            { title: "Temp. Dosagem", dataKey: "temp_dosagem" },
            { title: "Hoje", dataKey: "hoje_key" },
            { title: "Ontem", dataKey: "ontem_key" },
            { title: "Anteontem", dataKey: "anteontem_key" }
        ];

        var rows = [];
        var titulo;
        if (this.filtro == 1) {
            titulo = "ANIMAIS NÃO ALIMENTADOS (1 DIA)"
            for (var i = 0; i < this.dashboard.animais_nao_alimentados_24_hrs.length; i++) {
                let status_hoje = this.dashboard.animais_nao_alimentados_24_hrs[i].hoje;
                let status_ontem = this.dashboard.animais_nao_alimentados_24_hrs[i].ontem;

                if (status_hoje === null) {
                    status_hoje = 'Não Alimentado'
                }
                if (status_ontem === null) {
                    status_ontem = 'Não Alimentado'
                }

                var obj = {
                    brinco: this.dashboard.animais_nao_alimentados_24_hrs[i].brinco,
                    chip: this.dashboard.animais_nao_alimentados_24_hrs[i].chip_num,
                    dia_animal: this.dashboard.animais_nao_alimentados_24_hrs[i].ultimo_dia,
                    dieta: this.dashboard.animais_nao_alimentados_24_hrs[i].nome_dieta,
                    baia_origem: this.dashboard.animais_nao_alimentados_24_hrs[i].baia_nome,
                    temp_dosagem: this.dashboard.animais_nao_alimentados_24_hrs[i].tempo_entre_dosagem,
                    hoje_key: status_hoje,
                    ontem_key: status_ontem
                };
                rows.push(obj);
            }
        } else if (this.filtro == 2) {
            titulo = "ANIMAIS NÃO ALIMENTADOS (2 DIA)"
            for (var i = 0; i < this.dashboard.animais_nao_alimentados_48_hrs.length; i++) {

                let status_hoje = this.dashboard.animais_nao_alimentados_48_hrs[i].hoje;
                let status_ontem = this.dashboard.animais_nao_alimentados_48_hrs[i].ontem;
                let status_anteontem = this.dashboard.animais_nao_alimentados_48_hrs[i].anteontem;

                if (status_hoje === null) {
                    status_hoje = 'Não Alimentado'
                }
                if (status_ontem === null) {
                    status_ontem = 'Não Alimentado'
                }
                if (status_anteontem === null) {
                    status_anteontem = 'Não Alimentado'
                }

                var obj2 = {
                    brinco: this.dashboard.animais_nao_alimentados_48_hrs[i].brinco,
                    chip: this.dashboard.animais_nao_alimentados_48_hrs[i].chip_num,
                    dia_animal: this.dashboard.animais_nao_alimentados_48_hrs[i].ultimo_dia,
                    dieta: this.dashboard.animais_nao_alimentados_48_hrs[i].nome_dieta,
                    baia_origem: this.dashboard.animais_nao_alimentados_48_hrs[i].baia_nome,
                    temp_dosagem: this.dashboard.animais_nao_alimentados_48_hrs[i].tempo_entre_dosagem,
                    hoje_key: status_hoje,
                    ontem_key: status_ontem,
                    anteontem_key: status_anteontem
                };
                rows.push(obj2);
            }
        }

        if (this.filtro == 1) {
            return this._pdfExcel.exportAsPDF("Não Alim. 24 hrs.", titulo, columns1dia, rows, this.nomeGranja, this.usuario);
        } else {
            return this._pdfExcel.exportAsPDF("Não Alim. 48 hrs.", titulo, columns2dia, rows, this.nomeGranja, this.usuario);
        }
    }
}