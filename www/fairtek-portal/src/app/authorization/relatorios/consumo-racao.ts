/***********************************************************
COMPONENTS
***********************************************************/
import { Component, OnInit } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { FormControl, FormGroup } from '@angular/forms';

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

@Component({
    selector: 'app-consumo-racao',
    templateUrl: 'consumo-racao.html',
    styleUrls: ['consumo-racao.scss']
})
export class ConsumoRacao {
    loading: boolean = true;
    isBusyList: boolean = false;
    usuario: any;
    nomeGranja: any;
    itens = [];
    itensFilter = [];
    filtro = 1; // filtro tipo
    dt_inicio; //filtro de periodo
    dt_final;  // filtro de periodo
    locale = 'pt-br';
    index;
    contentDataURL = '';
    filter1 = true;
    filter2 = true;

    bsConfig = {
        containerClass: 'theme-fairtek',
        dateInputFormat: 'DD-MM-YYYY'
      }

    constructor(
        private _HttpService: HttpService,
        private _ToastrService: ToastrService,
        private _pdfExcel: PdfExcelService,
        private GlobalService: GlobalService,
        private localeService: BsLocaleService
    ) { }

    ngOnInit() {
        this.getConsumoRacao()
        this.localeService.use(this.locale);
        this.usuario = JSON.parse(localStorage.getItem('user'));
        this.usuario = this.usuario.email.toLowerCase();
    }

    verificaDatas() {
        if (this.dt_inicio == undefined || this.dt_final == undefined) {
            this._ToastrService.error("Os campos de datas precisam ser preenchidos");
            
        } else {
            this.getConsumoRacaoFiltrado();
        }
    }

    configureDates(event){
        if(event.retorno == 'dt_inicial'){
            this.dt_inicio = moment(event.dt_inseminacao).format('DD/MM/YYYY');
            this.filter1 = false

        }
        else if(event.retorno == 'dt_final'){
            this.dt_final = moment(event.dt_inseminacao).format('DD/MM/YYYY');
            this.filter2 = false
        }
      }
      changeFocusFilter(filter){
        filter == 'filter1' ? this.filter1 = !this.filter1 : this.filter2 = !this.filter2;
      }

    /***********************************************************
    CONFIGURAÇÃO DO GRÁFICO
    ***********************************************************/
    showGraph = 0;
    public barChartOptions: any = {
        scaleShowVerticalLines: false,
        responsive: true,
        scales: {
            xAxes: [{
                gridLines: {
                    drawOnChartArea: false,
                },
                ticks: {
                    beginAtZero: false,
                    max: 24
                }
            }],
            yAxes: [{
                ticks: {
                    beginAtZero: true,
                    min: 0,
                }
            }]
        },
    };

    public barChartLabels: string[] = [];
    public barChartType: string = 'bar';
    public barChartLegend: boolean = false;

    barChartData = [
        {
            data: [],
            label: 'Qtd. Ração'
        }
    ];

    lineChartColors: Array<any> = [
        { // grey
            backgroundColor: 'rgba(10,76,67,0.8)',
            borderColor: 'rgba(10,10,10,1)',
            pointBackgroundColor: 'rgba(148,159,177,1)',
            pointBorderColor: '#000',
            pointHoverBackgroundColor: '#000',
            pointHoverBorderColor: 'rgba(148,159,177,0.8)'
        }
    ];
    /***********************************************************
    FIM CONFIGURAÇÃO DO GRÁFICO
    ***********************************************************/


    /***********************************************************
    BUSCA INICIAL DOS DADOS PARA O GRÁFICO
    ***********************************************************/
    getConsumoRacao() {
        this.loading = true;
        this._HttpService.JSON_GET('/consumo-racao', false, true)
            .then(
                res => {
                    this.loading = false;
                    this.itensFilter = res.json();
                    for (var i = 0; i < res.json().length; i++) {
                        this.barChartLabels.push(this.itensFilter[i].dosador_data);      // ADICIONA A DATA NO CHARTS
                        this.barChartData[0].data.push(this.itensFilter[i].qa_total * 100);    // ADICIONA A QUANTIDADE NO CHARTS
                    }
                    this.showGraph = 1;
                    return this.itensFilter;
                },
                error => {
                    this.loading = false;
                    this._ToastrService.error(error.json().message);
                }
            )
    }
    /***********************************************************
    FIM DA BUSCA INICIAL DOS DADOS PARA O GRÁFICO
    ***********************************************************/

    /***********************************************************
    BUSCA VIA PARAMETROS PARA CARREGAR OS DADOS DO GRÁFICO
    ***********************************************************/
    getConsumoRacaoFiltrado() {
        this.loading = true;
        this.showGraph = 0;
        this.dt_inicio = moment(this.dt_inicio).format('YYYY-DD-MM 00:00:00');
        this.dt_final = moment(this.dt_final).format('YYYY-DD-MM 23:59:59');
        this.filter1 = true;
        this.filter2 = true;

        this._HttpService.JSON_GET(`/consumo-racao/intervalo/data/${this.filtro}/${this.dt_inicio}/${this.dt_final}`, false, true)
            .then(
                res => {
                    this.loading = false;
                    this.itensFilter = res.json();
                    this.barChartLabels = [];
                    // this.filter1 = true
                    // this.filter2 = true
                    this.barChartData = [
                        {
                            data: [],
                            label: 'Qtd. Ração'
                        }
                    ];
                    this.dt_inicio ='';
                    this.dt_final = '';
                    for (var i = 0; i < res.json().length; i++) {
                        if (this.itensFilter[0].semana != undefined) {
                            this.barChartLabels.push(this.itensFilter[i].primeiro_dia + " / " + this.itensFilter[i].fim);
                            this.barChartData[0].data.push(this.itensFilter[i].qa_total );

                        } else if (this.itensFilter[0].quinzenal != undefined) {
                            this.barChartLabels.push(this.itensFilter[i].quinzena);
                            this.barChartData[0].data.push(this.itensFilter[i].qa_total );

                        } else if (this.itensFilter[0].mensal != undefined) {
                            this.barChartLabels.push(this.itensFilter[i].mesAno);
                            this.barChartData[0].data.push(this.itensFilter[i].qa_total );

                        } else if (this.itensFilter[0].semestral != undefined) {
                            this.barChartLabels.push(this.itensFilter[i].semestre);
                            this.barChartData[0].data.push(this.itensFilter[i].qa_total );

                        } else if (this.itensFilter[0].anual != undefined) {
                            this.barChartLabels.push(this.itensFilter[i].ano);
                            this.barChartData[0].data.push(this.itensFilter[i].qa_total );

                        } else {
                            this.barChartLabels.push(this.itensFilter[i].dosador_data);
                            this.barChartData[0].data.push(this.itensFilter[i].qa_total );
                        }
                    }
                    this.showGraph = 1;
                    return this.itensFilter;
                },
                error => {
                    this.loading = false;
                    this._ToastrService.error(error.json().message);
                }
            )
    }
    /***********************************************************
    FIM DA BUSCA VIA PARAMETROS PARA CARREGAR OS DADOS DO GRÁFICO
    ***********************************************************/
    /**********************************************************
    PDF
    **********************************************************/

    //TRANSFORMA O GRÁFICO EM IMAGEM E CHAMA A FUNÇÃO DE PDF
    captureScreen() {
        this.isBusyList = true;
        var data = document.getElementById('contentToConvert');
        html2canvas(data).then(canvas => {
            this.contentDataURL = canvas.toDataURL('image/png')
            this.getNomeGranja();
        });       
    }

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

    //PASSA OS PARAMÊTROS PARA O SERVIÇO DE PDF/EXCEL
    exportAsPDF() {   
        this.isBusyList = false;    
        return  this._pdfExcel.exportAsIMG_PDF("Consumo de Ração", "Consumo de Ração",  this.contentDataURL, this.nomeGranja, this.usuario);          
    }

}

