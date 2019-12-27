/***********************************************************
COMPONENTS
***********************************************************/
import { Component, OnInit } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import html2canvas from 'html2canvas';

/**********************************************************
PROVIDERS
***********************************************************/
import { HttpService } from '../../globals/http';
import { GlobalService } from '../../globals/globals';

/**********************************************************
SERVICES
***********************************************************/
import { PdfExcelService } from '../../shared/app-pdf-excel/pdf-excel.service'

@Component({
    selector: 'app-animais-localizacao',
    templateUrl: 'animais-localizacao.html',
    styleUrls: ['animais-localizacao.scss']
})

export class AnimaisLocalizacao {
    loading: boolean = true;
    isBusyForm: boolean = false;
    usuario: any;
    nomeGranja: any;
    itens = [];
    itensFilter = [];
    contentDataURL = '';

    constructor(
        private _HttpService: HttpService,
        private _ToastrService: ToastrService,
        private _pdfExcel: PdfExcelService,
        private GlobalService: GlobalService
    ) { }

    ngOnInit() {
        this.getAnimaisBaia();
        this.usuario = JSON.parse(localStorage.getItem('user'));
        this.usuario = this.usuario.email.toLowerCase();
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
            label: 'Qtd. Animais'
        }
    ];

    lineChartColors: Array<any> = [
        {
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

    getAnimaisBaia() {
        this.loading = true;
        this._HttpService.JSON_GET('/animais-localizacao', false, true)
            .then(
                res => {
                    this.loading = false;
                    this.itensFilter = res.json();
                    for (var i = 0; i < res.json().length; i++) {
                        this.barChartLabels.push(res.json()[i].nome);
                        this.barChartData[0].data.push(res.json()[i].qtd);
                    }
                    this.showGraph = 1;
                    return this.itens = res.json();
                },
                error => {
                    this.loading = false;
                    this._ToastrService.error(error.json().message);
                }
            )
    }

    /***********************************************************
    FILTRO
    ***********************************************************/
    orderByColumn(column){
        this.itensFilter = this.GlobalService.orderByColumn(column, this.itensFilter)
    }
    searchFilter(event) {
        var valor = event.target.value.toLowerCase();
        if (valor.length === 0) {
            this.itensFilter = this.itens;
        } else {
            let filtro = this.itens.filter(function (d) {
                return (d.nome.toLowerCase().indexOf(valor) !== -1 || !valor);
            });
            this.itensFilter = filtro;
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
              this.nomeGranja =  this.nomeGranja.charAt(0).toUpperCase() + this.nomeGranja.slice(1)   
              this.exportAsPDF();
            }
          )
      }

    //CRIA A GRID E PASSA OS PARAMÊTROS PARA O SERVIÇO DE PDF/EXCEL
    exportAsPDF() {
        var columns = [
            { title: "Baia", dataKey: "baia" },
            { title: "Total(m²)", dataKey: "total" },
            { title: "Qtd. Sugerida de Animais", dataKey: "qtd_sugerida_animais" },
            { title: "Qtd. Animais", dataKey: "qtd_animais" },
        ];

        var rows = [];
        for (var i = 0; i < this.itens.length; i++) {
            var obj = {
                baia: this.itens[i].nome,
                total: this.itens[i].total + ' m²',
                qtd_sugerida_animais: this.itens[i].femea + ' und.',
                qtd_animais: this.itens[i].qtd,
            };
            rows.push(obj);
        }
        this.isBusyForm = false;
        return this._pdfExcel.exportAsPDF_IMG("Animais por Baia", "Gráfico Animais x Baia", this.contentDataURL, "Quantidade de Animais por Baia", columns, rows, this.nomeGranja, this.usuario);
    }
}