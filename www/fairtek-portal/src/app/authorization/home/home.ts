/***********************************************************
COMPONENTS
***********************************************************/
import { Component, OnInit } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
// import { ColorHelper } from '@swimlane/ngx-charts';



/**********************************************************
PROVIDERS
***********************************************************/
import { HttpService } from '../../globals/http';
import { GlobalService } from '../../globals/globals';
import { Router, NavigationExtras, ActivatedRoute } from '@angular/router'
import { aclService } from './../../globals/acl';
import { debug } from 'util';
import { ShowService } from '../../shared/app-show/show.service';
import * as template from './template-data-graph'
import { AppVerifyRouteService } from '../../shared/app-verify-route/app-verify-route.service';
import *  as moment from 'moment';

@Component({
  selector: 'app-home',
  templateUrl: 'home.html',
  styleUrls: ['home.scss']
})
export class HomeComponent implements OnInit {
  loadingAcumuAlimentados: boolean = false;
  loadingAnimais: boolean = false;
  loadingAlimentados: boolean = false;
  loadingDosadores: boolean = false;
  loadingBaias: boolean = false;
  loadingAlimentadosGestacao: boolean = false;
  loadingNaoAlimentados: boolean = false;
  public brandPrimary = '#20a8d8';
  public brandSuccess = '#007e69';
  public brandInfo = '#191516';
  public brandWarning = '#f8cb00';
  public brandDanger = '#f86c6b';
  filtroBollean: boolean = false;
  isBusyList: boolean = false;
  dashboard: any = {
    animais_nao_alimentados_16_hrs: [],
    animais_nao_alimentados_24_hrs: [],
  };

  dashboard_nao_alimentados: any = {
    animais_nao_alimentados_16_hrs: [],
    animais_nao_alimentados_24_hrs: [],
  };

  selectFiltro = 1;
  filtro = 1;
  show = 0;
  show2 = 0;
  MaxValue;
  dashboard_animais_alimentados: any = {
    animais_nao_alimentados_16_hrs: [],
    animais_nao_alimentados_24_hrs: [],
  };

  alimentadosDezDias;
  alimentadosHJ = 0;
  naoAlimentadosHJ = 0;

  //Graficos
  graficoDia = [];

  //Controle de cores do progressbar
  animais = 'success';
  dosadores = 'success';
  baias = 'success';
  galpoes = 'success';

  //  Controle de visualizações
  show_animais: boolean = true;
  show_animais_alimentados: boolean = false;
  show_dosadores: boolean = false;
  show_baias: boolean = false;

  itens = [];
  itensFilter = [];
  itemsPerPage = 10;
  data = [];
  dosador_baia_rel = [];
  /*****
  * BAR GRAPH CONFIGURATIONS
  * 
  */
    theme = 'dark';
    chartType: string;
    chartGroups: any[];
    chart: any;
    realTimeData: boolean = false;
    countries: any[];
    single: any[];
    multi: any[];
    fiscalYearReport: any[];
    dateData: any[];
    dateDataWithRange: any[];
    calendarData: any[];
    statusData: any[];
    sparklineData: any[];
    timelineFilterBarData: any[];
    graph: { links: any[]; nodes: any[] };
    bubble: any;
    linearScale: boolean = false;
    range: boolean = false;
    view: any[] = [1000,500];
    horizontalView: any[] = [1000,2000]
    fitContainer: boolean = true;
    
    // options
    showXAxis = true;
    showYAxis = true;
    gradient = false;
    showLegend = true;
    legendTitle = 'Legenda';
    legendPosition = 'below';
    showXAxisLabel = true;
    tooltipDisabled = false;
    showText = true;
    showYAxisLabel = true;
    showGridLines = true;
    innerPadding = '10%';
    barPadding = 8;
    groupPadding = 16;
    roundDomains = false;
    maxRadius = 10;
    minRadius = 3;
    showSeriesOnHover = true;
    roundEdges: boolean = true;
    animations: boolean = true;
    xScaleMin: any;
    xScaleMax: any;
    yScaleMin: number;
    yScaleMax: number;
    showDataLabel = false;
    noBarWhenZero = true;
    trimXAxisTicks = true;
    trimYAxisTicks = true;
    rotateXAxisTicks = true;
    maxXAxisTickLength = 16;
    maxYAxisTickLength = 16;
    dt_pesquisa = moment().format('YYYY-MM-DD') ;
    public colorScheme = {
      domain: ['#007e69', '#ea872e']
    }
 /**
  * FINISH BAR CONFIG
  */

  constructor(
    private _HttpService: HttpService,
    private _ToastrService: ToastrService,
    private GlobalService: GlobalService,
    private router: Router,
    private aclService: aclService,
    private _router: ActivatedRoute,
    private _history: AppVerifyRouteService
    
  ) {
    //PEGAR PARAMETROS PASSADOS PARA VARIAVEIS
    this._router.queryParams.subscribe(params => {

      if (Object.keys(params).length != 0) {
        this.show_animais = JSON.parse(params.show_animais);
        this.show_animais_alimentados = JSON.parse(params.show_animais_alimentados);
        this.show_baias = JSON.parse(params.show_baias);
        this.show_dosadores = JSON.parse(params.show_dosadores);
      }
    });
    
  }

  ngOnInit(): void {
    this.getDashboard();
    this.getAnimaisBaia();
    // this.getDosadoresBaia();
    this.getFiltrosAnimaisAlimentados();
    // this.getFiltro(event);
    // this.getAnimaisAlimentados();
    this.getAlimentadosDezDias();
    this.data = template.acumuladoAnimaisAlimentados
    this.getNewGraphData();
    this.getDosadorBaiaRel(false);
  }

  getNaoAlimentados() {
    this.loadingAlimentados = true;
    this.loadingNaoAlimentados = true
    this.isBusyList = true;
    this._HttpService.JSON_GET('/relatorio-rotina/nao-alimentados/hoje', false, true)
      .then(
        res => {
          this.dashboard_nao_alimentados = res.json().count;
          this.naoAlimentadosHJ = this.dashboard_nao_alimentados[0].naoAlimentados;
          this.alimentadosHJ = this.dashboard.total_animais_gestacao - this.dashboard_nao_alimentados[0].naoAlimentados;

          this.pieDataAnimaisAlimentado = [this.alimentadosHJ, this.dashboard_nao_alimentados[0].naoAlimentados]
          this.loadingAlimentados = false;
          this.loadingNaoAlimentados = false;
        },
        error => {
          this._ToastrService.error(error.json().message);
          this.loadingNaoAlimentados = false;
          this.loadingAlimentados = false;
        }
      )
  }

  getDashboard() {
    this.loadingAnimais = true;
    this.isBusyList = true;
    this._HttpService.JSON_GET('/dashboard', false, true)
      .then(
        res => {
          this.dashboard = res.json();
          this.getNaoAlimentados();
          this.pieDataAnimaisTotal = [this.dashboard.total_animais_gestacao, (this.dashboard.total_animais - this.dashboard.total_animais_gestacao)];
          this.loadingAnimais = false;
        },
        error => {
          this._ToastrService.error(error.json().message);
          this.loadingAnimais = false;
        }
      )
  }

  /* CHARTYPE */
  public pieChartType: string = 'pie';
  public barChartType: string = 'bar';

  /* CHARTS ANIMAIS */

  // ANIMAIS TOTAL 
  // Pies
  public pieLabelsAnimaisTotal: string[] = ['Animais em Gestação', 'Animais Área Externa'];
  public pieDataAnimaisTotal: number[] = [0, 0];
  pieChartColor: any = [
    { // blue
      backgroundColor: ['rgba(10,76,67,0.8)', '#ccc']
    }];
  // eventos
  public animaisTotalC(e: any): void {
    let click = e.active[0]._index
    if (click == 0) {
      this.router.navigate(['/animais-em-gestacao'], { queryParams: { show_animais: this.show_animais, show_animais_alimentados: this.show_animais_alimentados, show_dosadores: this.show_dosadores, show_baias: this.show_baias } });
    }
    else if (click == 1) {
      this.router.navigate(['/animais-externa'], { queryParams: { show_animais: this.show_animais, show_animais_alimentados: this.show_animais_alimentados, show_dosadores: this.show_dosadores, show_baias: this.show_baias } });
    }
    else if (click == 2) {
      this.router.navigate(['/animais-maternidade'], { queryParams: { show_animais: this.show_animais, show_animais_alimentados: this.show_animais_alimentados, show_dosadores: this.show_dosadores, show_baias: this.show_baias } });
    }
  }
  public animaisTotalH(e: any): void {
  }

  // ANIMAIS ALIMENTADOS 
  // Pies
  public pieLabelsAnimaisAlimentado: string[] = ['Animais Alimentados', 'Animais Não Alimentados'];
  public pieDataAnimaisAlimentado: number[] = [0, 0];
  // eventos
  public animaisAlimentadoC(e: any): void {
    let click = e.active[0]._index
    if (click == 0) {
      this.router.navigate(['/relatorio-alimentados'], { queryParams: { show_animais: this.show_animais, show_animais_alimentados: this.show_animais_alimentados, show_dosadores: this.show_dosadores, show_baias: this.show_baias } });
    }
    else if (click == 1) {
      this.router.navigate(['/relatorio-rotina'], { queryParams: { show_animais: this.show_animais, show_animais_alimentados: this.show_animais_alimentados, show_dosadores: this.show_dosadores, show_baias: this.show_baias } })
    }
  }
  public animaisAlimentadoH(e: any): void {
  }

  /* CHARTS DOSADORES */
  /***********************************************************
  CONFIGURAÇÃO DO GRÁFICO DOSADORES
  ***********************************************************/
  showGraph2 = 0;
  public barChartOptions2: any = {
    scaleShowVerticalLines: false,
    responsive: true
  };
  public barChartLabels2: string[] = [];
  public barChartLegend2: boolean = false;

  barChartData2 = [
    {
      data: [],
      label: 'Qtd. Dosadores',
    }
  ];

  lineChartColors2: Array<any> = [
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
  public chartClicked2(e: any): void {
    this.router.navigate(['/supervisorio'])
  }

  public chartHovered2(e: any): void {

  }
  /***********************************************************
  FIM CONFIGURAÇÃO DO GRÁFICO DOSADORES
  ***********************************************************/

  /* CHARTS BAIAS */
  /***********************************************************
  CONFIGURAÇÃO DO GRÁFICO BAIAS
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
  public barChartLegend: boolean = false;

  barChartData = [];

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
    var pos = e.active[0]._index;
    let navigationExtras: NavigationExtras = {
      queryParams: { 'baia_id': e.active[0]._chart.boxes[0].chart.config.data.datasets[0].id[pos], show_animais: this.show_animais, show_animais_alimentados: this.show_animais_alimentados, show_dosadores: this.show_dosadores, show_baias: this.show_baias }
    };

    this.router.navigate(['/animais-baia'], navigationExtras);
  }

  public chartHovered(e: any): void {

  }
  /***********************************************************
  FIM CONFIGURAÇÃO DO GRÁFICO BAIAS
  ***********************************************************/

  getAnimaisBaia() {
    this.loadingDosadores = true;
    this._HttpService.JSON_GET('/animais-localizacao', false, true)
      .then(
        res => {
          this.itensFilter = res.json();
          for (var i = 0; i < res.json().length; i++) {
            this.barChartData.push({
              "name": res.json()[i].nome,
              "series": [
                {
                  "name": "Complet. Alimentados",
                  "value": res.json()[i].qtd_totalmente
                },
                {
                  "name": "Parc. Alimentados",
                  "value": res.json()[i].qtd_parcialmente
                }
              ]
            })
          }
          this.showGraph = 1;
          this.loadingDosadores = false;
          return this.itens = res.json();
        },
        error => {
          this._ToastrService.error(error.json().message);
          this.loadingDosadores = false;
        }
      )
  }

  configureDates(event){
    console.log('event', event)
    this.dt_pesquisa = event.dt_inseminacao;
  }

  // getDosadoresBaia() {
  //   this.loadingBaias = true;
  //   this._HttpService.JSON_GET('/dosadores/baias/count', false, true)
  //     .then(
  //       res => {
  //         this.itensFilter = res.json();
  //         for (var i = 0; i < res.json().length; i++) {
  //           this.barChartLabels2.push(res.json()[i].nome);
  //           this.barChartData2[0].data.push(res.json()[i].dosadores);
  //         }
  //         this.showGraph2 = 1;
  //         this.loadingBaias = false;
  //         return this.itens = res.json();
  //       },
  //       error => {
  //         this._ToastrService.error(error.json().message);
  //         this.loadingBaias = false;
  //       }
  //     )
  // }

  // Controle de visualização 
  showAnimais() {
    this.show_animais = true;
    this.show_dosadores = false;
    this.show_baias = false;
    this.show_animais_alimentados = false;
  }
  showDosadores() {
    this.show_animais = false;
    this.show_dosadores = true;
    this.show_baias = false;
    this.show_animais_alimentados = false;
  }
  showBaias() {
    this.show_animais = false;
    this.show_dosadores = false;
    this.show_baias = true;
    this.show_animais_alimentados = false;
  }
  showAnimaisAlimentados() {
    this.show_animais = false;
    this.show_dosadores = false;
    this.show_baias = false;
    this.show_animais_alimentados = true;
  }

  /**************************************************************** 
  Gráficos
  *****************************************************************/
  public mainChartLegend = true;

  // convert Hex to RGBA
  public convertHex(hex: string, opacity: number) {
    hex = hex.replace('#', '');
    const r = parseInt(hex.substring(0, 2), 16);
    const g = parseInt(hex.substring(2, 4), 16);
    const b = parseInt(hex.substring(4, 6), 16);

    const rgba = 'rgba(' + r + ', ' + g + ', ' + b + ', ' + opacity / 100 + ')';
    return rgba;
  }

  getDosadorBaiaRel(datafilter){
    debugger
    let data = datafilter ? moment(datafilter).format('YYYY-MM-DD') : moment().format('YYYY-MM-DD');
    this._HttpService.JSON_GET(`/dosadores/baias/relatorio/alimentacao/${data}`, false, true)
        .then(
          res => {
           this.dosador_baia_rel = res.json();
          },
          error => {
            this._ToastrService.error(error.json().message);
            this.loadingBaias = false;
          }
        )
  }

  // getGraficoDia() {
  //   this.isBusyList = true;
  //   this.loadingAcumuAlimentados = true;
  //   this._HttpService.JSON_GET('/animais-alimentados-hoje/grafico/dia', false, true)
  //     .then(
  //       res_data => {
  //         this.MaxValue = res_data.json()[24]
  //         var geral = res_data.json().geral;
  //         var parcialmente = res_data.json().parcialmente;
  //         var completamente = res_data.json().completamente;
  //         var qt_total_racao = res_data.json().qt_total_racao;

  //         var nGeral = [];
  //         var nParcial = [];
  //         var nTotal = [];
  //         var qtRacao = [];
  //         var GeralLabel = 'Acumulado de Animais';
  //         var ParcialLabel = 'Alimentados Parcialmente';
  //         var TotalLabel = 'Alimentados Completamente';
  //         //var RacaoLabel = 'Percentual de Ração alimentada';
  //         var porcentG;
  //         var porcentP;
  //         var porcentC;
  //         var porcentR;
  //         for (var i = 0; i < geral.length - 1; i++) {
  //           porcentG = (geral[i] / geral[24]) * 100;
  //           porcentG = Math.floor(porcentG);
  //           nGeral.push(porcentG);

  //         }
  //         for (var i = 0; i < parcialmente.length - 1; i++) {
  //           porcentP = (parcialmente[i] / parcialmente[24]) * 100;
  //           porcentP = Math.floor(porcentP);
  //           nParcial.push(porcentP);

  //         }
  //         for (var i = 0; i < completamente.length - 1; i++) {
  //           porcentC = (completamente[i] / completamente[24]) * 100;
  //           porcentC = Math.floor(porcentC);
  //           nTotal.push(porcentC);

  //         }
  //         /*for (var i = 0; i < qt_total_racao.length - 1; i++) {
  //           porcentR = qt_total_racao[i];
  //           porcentR = Math.floor(porcentR);
  //           qtRacao.push(porcentR);

  //         }*/

  //         this.mainChartData.push({ data: nGeral, label: GeralLabel }, { data: nParcial, label: ParcialLabel }, { data: nTotal, label: TotalLabel } )//, { data: qtRacao, label: RacaoLabel })
  //         this.show = 1;
  //         this.show2 = 1;
  //         this.loadingAcumuAlimentados = false;
  //       },
  //       error => {
  //         this.loadingAcumuAlimentados = false;
  //         this._ToastrService.error(error.json().message);
  //       }
  //     )
  // }

  getNewGraphData() {
    this.isBusyList = true;
    this.loadingAcumuAlimentados = true;
    this._HttpService.JSON_GET('/animais-alimentados-hoje/grafico/dia', false, true)
      .then(
        res_data => {

          // this.MaxValue = res_data.json()[24]
          // var geral = res_data.json().geral;
          // var parcialmente = res_data.json().parcialmente;
          // var completamente = res_data.json().completamente;
          // var qt_total_racao = res_data.json().qt_total_racao;

          // var nGeral = [];
          // var nParcial = [];
          // var nTotal = [];
          // var qtRacao = [];
          // var GeralLabel = 'Acumulado de Animais';
          // var ParcialLabel = 'Alimentados Parcialmente';
          // var TotalLabel = 'Alimentados Completamente';
          // //var RacaoLabel = 'Percentual de Ração alimentada';
          // var porcentG;
          // var porcentP;
          // var porcentC;
          // var porcentR;
          // for (var i = 0; i < geral.length - 1; i++) {
          //   porcentG = (geral[i] / geral[24]) * 100;
          //   porcentG = Math.floor(porcentG);
          //   nGeral.push(porcentG);

          // }
          // for (var i = 0; i < parcialmente.length - 1; i++) {
          //   porcentP = (parcialmente[i] / parcialmente[24]) * 100;
          //   porcentP = Math.floor(porcentP);
          //   nParcial.push(porcentP);

          // }
          // for (var i = 0; i < completamente.length - 1; i++) {
          //   porcentC = (completamente[i] / completamente[24]) * 100;
          //   porcentC = Math.floor(porcentC);
          //   nTotal.push(porcentC);

          // }
          // /*for (var i = 0; i < qt_total_racao.length - 1; i++) {
          //   porcentR = qt_total_racao[i];
          //   porcentR = Math.floor(porcentR);
          //   qtRacao.push(porcentR);

          // }*/

          // this.mainChartData.push({ data: nGeral, label: GeralLabel }, { data: nParcial, label: ParcialLabel }, { data: nTotal, label: TotalLabel })//, { data: qtRacao, label: RacaoLabel })

          let res = res_data.json()
          this.data.forEach(function(hora, index){
            hora.series[0].value = res.completamente[index]
            hora.series[1].value = res.parcialmente[index]
          })
          this.show = 1;
          this.show2 = 1;
          this.loadingAcumuAlimentados = false;
        },
        error => {
          this.loadingAcumuAlimentados = false;
          this._ToastrService.error(error.json().message);
        }
      )
  }
  /************
      FILTRA ANIMAIS ALIMENTADOS COMPLETAMENTE/PARCIALMENTE
  *************/
  getFiltro(event) {
    if (event == null || event == undefined) {
      this.filtro = 1;
    } else if (this.filtroBollean == false) {
      this.filtro = event.target.value;
    }

    if (this.filtro == 1) {
      this.isBusyList = true;
      this._HttpService.JSON_GET('/animais-alimentados-hoje', false, true, true)
        .then(
          res => {
            this.filtroBollean = false;
            return this.dashboard_animais_alimentados = res.json();
          },
          error => {
            this._ToastrService.error(error.json().message);
          }
        )
    }
    else if (this.filtro == 2) {
      this._HttpService.JSON_GET('/animais-alimentados-hoje/parcialmente', false, true, true)
        .then(
          res => {
            this.filtroBollean = false;
            return this.dashboard_animais_alimentados = res.json();
          },
          error => {
            this._ToastrService.error(error.json().message);
          }
        )
    }
    else if (this.filtro == 3) {
      this._HttpService.JSON_GET('/animais-alimentados-hoje/completamente', false, true, true)
        .then(
          res => {
            this.filtroBollean = false;
            return this.dashboard_animais_alimentados = res.json();
          },
          error => {
            this._ToastrService.error(error.json().message);
          }

        )
    }
    else if (this.filtro == 4) {
      this._HttpService.JSON_GET('/relatorio-rotina/nao-alimentados/hoje', false, true, true)
        .then(
          res => {
            this.filtroBollean = false;
            return this.dashboard_animais_alimentados = res.json().animais_nao_alimentados_hoje;
          },
          error => {
            this._ToastrService.error(error.json().message);
          }

        )
    }
  }
  getFiltrosAnimaisAlimentados(){
    switch(this._history.lastFilter){
      case '/animais-alimentados-hoje':
        this.getFiltro({target:{value:1}});
        this.selectFiltro = 1;
        break;
      case '/animais-alimentados-hoje/parcialmente':
        this.getFiltro({target:{value:2}});
        this.selectFiltro = 2;        
        break;
      case '/animais-alimentados-hoje/completamente':
        this.getFiltro({target:{value:3}});
        this.selectFiltro = 3;
        break;
      case '/relatorio-rotina/nao-alimentados/hoje':
        this.getFiltro({target:{value:4}});
        this.selectFiltro = 4;
        break;
      default:
        this.getFiltro({target:{value:1}});
        break;
    }
  }
  getAnimaisAlimentados() {
    this.isBusyList = true;
    this._HttpService.JSON_GET('/animais-alimentados-hoje', false, true)
      .then(
        res => {
          this.dashboard_animais_alimentados = res.json();
        },
        error => {
          this._ToastrService.error(error.json().message);
        }
      )
  }

  /* CHARTS DOSADORES */
  /***********************************************************
  CONFIGURAÇÃO DO GRÁFICO ALIMENTADOS DEZ DIAS
  ***********************************************************/
  showGraph3 = 0;
  public barChartOptions3: any = {
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
          stepSize: 5,
          min: 0,
          max: 100
        }
      }]
    },
  };
  public barChartLabels3: string[] = [];
  public barChartLegend3: boolean = false;

  barChartData3 = [
    {
      data: [],
      label: 'Qtd. Animais Alimentados',
    }
  ];

  lineChartColors3: Array<any> = [
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
  public chartClicked3(e: any): void {
    this.router.navigate(['/supervisorio'])
  }

  public chartHovered3(e: any): void {
  }

  /***********************************************************
  FIM CONFIGURAÇÃO DO GRÁFICO ALIMENTADOS DEZ DIAS
  ***********************************************************/

  getAlimentadosDezDias() {
    this.isBusyList = true;
    this._HttpService.JSON_GET('/animais-alimentados-hoje/alimentados/dez/dias', false, true)
      .then(
        res => {
          this.itensFilter = res.json();
          for (var i = 0; i < res.json().length; i++) {
            this.barChartLabels3.push(res.json()[i].dosador_data);
            this.barChartData3[0].data.push(res.json()[i].animais_alimentados);
          }
          this.showGraph3 = 1;
          return this.itens = res.json();
        },
        error => {
          this._ToastrService.error(error.json().message);
        }
      )
  }

  searchFilter(event) {
    let val = event.target.value.toLowerCase();

    if (val.length === 0 || event.target.value == null) {
      this.filtroBollean = true;
      this.getFiltro(this.filtro);
    } else {
      let filtro = this.dashboard_animais_alimentados.filter(function (d) {
        return ((d.brinco.toLowerCase().indexOf(val) !== -1 || !val) || (d.chip_num.toLowerCase().indexOf(val) !== -1 || !val) || (d.nome_baia.toLowerCase().indexOf(val) !== -1 || !val) || (d.dosador.toLowerCase().indexOf(val) !== -1 || !val));
      });
      this.dashboard_animais_alimentados = filtro;
    }
  }

  loadShow() {
    $('.page-loading').css('opacity', '0.9');
    $('.page-loading').css('z-index', '9999');
  }

  loadHide() {
    $('.page-loading').css('opacity', '0');
    $('.page-loading').css('z-index', '-1');
  }
 
  
}