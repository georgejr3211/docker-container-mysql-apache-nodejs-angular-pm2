/***********************************************************
COMPONENTS
***********************************************************/
import { Component, TemplateRef, Input, ViewChild } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import * as _ from 'underscore';

/**********************************************************
PROVIDERS
***********************************************************/
import { HttpService } from '../../globals/http';
import { GlobalService } from '../../globals/globals';
import html2canvas from 'html2canvas';

/**********************************************************
SERVICES
***********************************************************/
import { PdfExcelService } from '../../shared/app-pdf-excel/pdf-excel.service'

@Component({
    selector: 'app-animais-gestacao',
    templateUrl: 'animais-gestacao.html',
    styleUrls: ['animais-gestacao.scss']
})

export class AnimaisGestacao {
    loading: boolean = true;
    isBusyForm: boolean = false;
    usuario: any;
    nomeGranja: any;
    itens = [];
    itensFilter = [];
    itemsPerPage = 20;
    contentDataURL = '';
    relatorio: any = [];
    relatorioFilters = [];
    filtro;

    /***********************************************************
    CONFIGURAÇÃO DO GRÁFICO
    ***********************************************************/
    showGraph = 0;
    public barChartOptions: any = {
        scaleShowVerticalLines: true,
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

    public barChartLabels: string[] = ['1ª Semana', '2ª Semana', '3ª Semana', '4ª Semana', '5ª Semana', '6ª Semana', '7ª Semana', '8ª Semana', '9ª Semana', '10ª Semana', '11ª Semana', '12ª Semana', '13ª Semana', '14ª Semana', '15ª Semana', '16ª Semana', '17ª Semana',];
    public barChartType: string = 'bar';
    public barChartLegend: boolean = false;

    public barChartData = [
        {
            data: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
            label: 'Qtd. Animais'
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

    // events
    public chartClicked(e: any): void {
    }

    public chartHovered(e: any): void {

    }
    /***********************************************************
    FIM CONFIGURAÇÃO DO GRÁFICO
    ***********************************************************/
    constructor(
        private _HttpService: HttpService,
        private _ToastrService: ToastrService,
        private _pdfExcel: PdfExcelService,
        private GlobalService: GlobalService
    ) { }

    ngOnInit() {
        this.getAnimaisGestacao()
        this.usuario = JSON.parse(localStorage.getItem('user'));
        this.usuario = this.usuario.email.toLowerCase();
    }

    getAnimaisGestacao() {
        this.loading = true;
        this._HttpService.JSON_GET('/animais-gestacao', false, true)
            .then(
                res => {
                    this.itensFilter = res.json();
                    this.loading = false;
                    //MONTAGEM DO GRÁFICO
                    for (var i = 0; i < res.json().length; i++) {
                        switch (true) {
                            case res.json()[i].dia_animal <= 7:
                                this.barChartData[0].data[0] += res.json()[i].qtd_animal;
                                break;
                            case res.json()[i].dia_animal > 7 && res.json()[i].dia_animal <= 14:
                                this.barChartData[0].data[1] += res.json()[i].qtd_animal
                                break;
                            case res.json()[i].dia_animal > 14 && res.json()[i].dia_animal <= 21:
                                this.barChartData[0].data[2] += res.json()[i].qtd_animal
                                break;
                            case res.json()[i].dia_animal > 21 && res.json()[i].dia_animal <= 28:
                                this.barChartData[0].data[3] += res.json()[i].qtd_animal
                                break;
                            case res.json()[i].dia_animal > 28 && res.json()[i].dia_animal <= 35:
                                this.barChartData[0].data[4] += res.json()[i].qtd_animal
                                break;
                            case res.json()[i].dia_animal > 35 && res.json()[i].dia_animal <= 42:
                                this.barChartData[0].data[5] += res.json()[i].qtd_animal
                                break;
                            case res.json()[i].dia_animal > 42 && res.json()[i].dia_animal <= 49:
                                this.barChartData[0].data[6] += res.json()[i].qtd_animal
                                break;
                            case res.json()[i].dia_animal > 49 && res.json()[i].dia_animal <= 56:
                                this.barChartData[0].data[7] += res.json()[i].qtd_animal
                                break;
                            case res.json()[i].dia_animal > 56 && res.json()[i].dia_animal <= 63:
                                this.barChartData[0].data[8] += res.json()[i].qtd_animal
                                break;
                            case res.json()[i].dia_animal > 63 && res.json()[i].dia_animal <= 70:
                                this.barChartData[0].data[9] += res.json()[i].qtd_animal
                                break;
                            case res.json()[i].dia_animal > 70 && res.json()[i].dia_animal <= 77:
                                this.barChartData[0].data[10] += res.json()[i].qtd_animal
                                break;
                            case res.json()[i].dia_animal > 77 && res.json()[i].dia_animal <= 85:
                                this.barChartData[0].data[11] += res.json()[i].qtd_animal
                                break;
                            case res.json()[i].dia_animal > 85 && res.json()[i].dia_animal <= 92:
                                this.barChartData[0].data[12] += res.json()[i].qtd_animal
                                break;
                            case res.json()[i].dia_animal > 92 && res.json()[i].dia_animal <= 99:
                                this.barChartData[0].data[13] += res.json()[i].qtd_animal
                                break;
                            case res.json()[i].dia_animal > 99 && res.json()[i].dia_animal <= 105:
                                this.barChartData[0].data[14] += res.json()[i].qtd_animal
                                break;
                            case res.json()[i].dia_animal > 105 && res.json()[i].dia_animal <= 112:
                                this.barChartData[0].data[15] += res.json()[i].qtd_animal
                                break;
                            case res.json()[i].dia_animal > 112 && res.json()[i].dia_animal <= 120:
                                this.barChartData[0].data[16] += res.json()[i].qtd_animal
                                break;
                            default:
                        }
                    }
                    console.log("itensfilter: ", this.itensFilter)
                    //MONTAGEM DO RELATÓRIO
                    for (var i = 0; i <= 120; i++) {
                        //debugger;
                        var index = _.findIndex(this.itensFilter, { dia_animal: i })
                        console.log("i", i)
                        console.log("index: ", index)
                        if (index != -1) {
                            this.relatorio.push({ dia: i, qtd: this.itensFilter[index].qtd_animal });
                        } else {
                            this.relatorio.push({ dia: i, qtd: 0 })
                        }

                    }
                    this.relatorioFilters = this.relatorio;
                    this.showGraph = 1;
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
        this.relatorio = this.GlobalService.orderByColumn(column, this.relatorio)
    }
    searchFilter(event) {
        var valor = event.target.value.toLowerCase();
        if (valor.length == 0) {
            this.relatorio = this.relatorioFilters;
        } else {
            let filtro = this.relatorio.filter((d) => {
                return (d.dia == valor)
            });
            if (valor.length > 1) {
                this.relatorio = this.relatorioFilters;
                filtro = this.relatorio.filter((d) => {
                    return (d.dia == valor)
                });
            }
            this.relatorio = filtro;
        }
    }

    /**********************************************************
    PDF
    **********************************************************/

    //TRANSFORMA O GRÁFICO EM IMAGEM E CHAMA A FUNÇÃO DE PDF
    captureScreen() {
        this.isBusyForm = true;
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
                    this.nomeGranja = this.nomeGranja.charAt(0).toUpperCase() + this.nomeGranja.slice(1)
                    this.exportAsPDF();
                }
            )
    }

    //CRIA A GRID E PASSA OS PARAMÊTROS PARA O SERVIÇO DE PDF/EXCEL
    exportAsPDF() {
        var columns = [
            { title: "Dia", dataKey: "dia" },
            { title: "Qtd. Animais", dataKey: "qtd_animais" }
        ];

        var rows = [];
        for (var i = 0; i < this.relatorio.length; i++) {
            var obj = {
                dia: this.relatorio[i].dia,
                qtd_animais: this.relatorio[i].qtd + ' und.'
            };
            rows.push(obj);
        }
        this.isBusyForm = false;
        return this._pdfExcel.exportAsPDF_IMG("Animais Por Dias De Gestação", "Gráfico Animais por dias de Gestação",
            this.contentDataURL, "Quantidade de Animais por dias de Gestação", columns, rows, this.nomeGranja, this.usuario);
    }
}