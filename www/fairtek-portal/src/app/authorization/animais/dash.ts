/***********************************************************
COMPONENTS
***********************************************************/
import { Component, OnInit, ViewChild } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { ActivatedRoute } from '@angular/router';
import { ProgressbarModule } from 'ngx-bootstrap/progressbar';
import * as _ from 'underscore';
/**********************************************************
PROVIDERS
***********************************************************/
import { HttpService } from '../../globals/http';
import { GlobalService } from '../../globals/globals';
import { BaseChartDirective } from 'ng2-charts';

@Component({
  selector: 'app-animais-dash',
  templateUrl: 'dash.html',
  styleUrls: ['dash.scss']
})
export class AnimaisDashNovoComponent implements OnInit {

  loading: boolean = true;
  @ViewChild(BaseChartDirective) public chart: BaseChartDirective;


  itemCarregado = [];
  isBusyForm: boolean = false;
  isBusyList: boolean = false;
  exibeUpdate: boolean = false;
  itens = [];
  itensFilter = [];
  tipoGrafico = "2";
  qa_total_alojamento;
  itemsPerPage = 10;
  id_animal = this.ActivatedRoute.snapshot.params.id;
  //COMBOS
  comboDieta = [];
  selectDieta = 0;
  comboAnimal = [];
  qtd_ciclos_animais = [];
  ciclo_animal;
  alojamentos = [];
  constructor(
    private ActivatedRoute: ActivatedRoute,
    private _HttpService: HttpService,
    private _ToastrService: ToastrService,
    private GlobalService: GlobalService
  ) {
    //this.getComboAnimal();

    //this.getItens();
  }

  public brandPrimary = '#20a8d8';
  public brandSuccess = '#007e69';
  public brandInfo = '#191516';
  public brandWarning = '#f8cb00';
  public brandDanger = '#f86c6b';

  // mainChart

  public mainChartElements = 119;
  public mainChartData1: Array<number> = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];

  public mainChartData: Array<any> = [];
  public mainChartColours: Array<any> = [
    { // CORES DO ALOJAMENTO 1
      backgroundColor: this.convertHex('#006666', 3),
      borderColor: this.brandSuccess,
      pointHoverBackgroundColor: this.brandSuccess
    },
    { //CORES DO ALOJAMENTO 2
      backgroundColor: this.convertHex(this.brandInfo, 3),
      borderColor: this.brandInfo,
      pointHoverBackgroundColor: this.brandInfo
    },
    { // CORES DO ALOJAMENTO 3
      backgroundColor: this.convertHex(this.brandPrimary, 3),
      borderColor: this.brandPrimary,
      pointHoverBackgroundColor: this.brandPrimary,
    },
    { // CORES DO ALOJAMENTO 4
      backgroundColor: this.convertHex(this.brandDanger, 3),
      borderColor: this.brandDanger,
      pointHoverBackgroundColor: this.brandDanger,
      borderWidth: 2,
    },
    { // CORES DO ALOJAMENTO 5
      backgroundColor: this.convertHex('#b3b300', 3),
      borderColor: '#b3b300',
      pointHoverBackgroundColor: '#b3b300',
      borderWidth: 2,
    },
    { // CORES DO ALOJAMENTO 6
      backgroundColor: this.convertHex('#003399', 3),
      borderColor: '#003399',
      pointHoverBackgroundColor: '#003399',
      borderWidth: 2
    },
    { // CORES DO ALOJAMENTO 7
      backgroundColor: this.convertHex('#e67300', 3),
      borderColor: '#e67300',
      pointHoverBackgroundColor: '#e67300',
      borderWidth: 2,
    },
    { // CORES DO ALOJAMENTO 8
      backgroundColor: this.convertHex('#5d5d89', 3),
      borderColor: '#5d5d89',
      pointHoverBackgroundColor: '#5d5d89',
      borderWidth: 2
    },
    { // CORES DO ALOJAMENTO 9
      backgroundColor: this.convertHex('#339999', 3),
      borderColor: '#339999',
      pointHoverBackgroundColor: '#339999',
      borderWidth: 2
    },
    { // CORES DO ALOJAMENTO 10
      backgroundColor: this.convertHex('#666699', 1),
      borderColor: '#666699',
      pointHoverBackgroundColor: '#666699',
      borderWidth: 2
    }
  ];
  /* tslint:disable:max-line-length */
  //public mainChartLabels: Array<any> = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday', 'Monday', 'Thursday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  public mainChartLabels: Array<any> = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11", "12", "13", "14", "15", "16", "17", "18", "19", "20", "21", "22", "23", "24", "25", "26", "27", "28", "29",
    "30", "31", "32", "33", "34", "35", "36", "37", "38", "39", "40", "41", "42", "43", "44", "45", "46", "47", "48", "49", "50",
    "51", "52", "53", "54", "55", "56", "57", "58", "59", "60", "61", "62", "63", "64", "65", "66", "67", "68", "69",
    "70", "71", "72", "73", "74", "75", "76", "77", "78", "79", "80", "81", "82", "83", "84", "85", "86", "87",
    "88", "89", "90", "91", "92", "93", "94", "95", "96", "97", "98", "99", "100",
    "101", "102", "103", "104", "105", "106", "107", "108", "109", "110", "111", "112", "113", "114", "115", "116", "117", "118", "119", "120"
  ];

  clearGraph() {
    this.mainChartData1 = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
      0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];

    this.mainChartData = [{
      data: this.mainChartData1,
      label: '%',
    }]
  }
  /* tslint:enable:max-line-length */
  public mainChartOptions: any = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      xAxes: [{
        gridLines: {
          drawOnChartArea: true,
        },
        ticks: {
          beginAtZero: false,
          max: 120
        }
      }],
      yAxes: [{
        ticks: {
          beginAtZero: true,
          stepSize: 10,
          max: 100
        }
      }]
    },
    elements: {
      line: {
        borderWidth: 2
      },
      point: {
        radius: 3,
        hitRadius: 2,
        hoverRadius: 4,
        hoverBorderWidth: 3,
      }
    },
    legend: {
      display: true
    }
  };

  public mainChartLegend = true;
  public mainChartType = 'line';

  // events
  public chartClicked(e: any): void {
  }

  public chartHovered(e: any): void {
  }

  // convert Hex to RGBA
  public convertHex(hex: string, opacity: number) {
    hex = hex.replace('#', '');
    const r = parseInt(hex.substring(0, 2), 16);
    const g = parseInt(hex.substring(2, 4), 16);
    const b = parseInt(hex.substring(4, 6), 16);

    const rgba = 'rgba(' + r + ', ' + g + ', ' + b + ', ' + opacity / 100 + ')';
    return rgba;
  }

  public random(min: number, max: number) {
    return Math.floor(Math.random() * (max - min + 1) + min);
  }

  ngOnInit() {

    this.ActivatedRoute.params.subscribe(params => {
      this._HttpService.JSON_GET(`/animais/getAnimal/${params.id}`, false, true)
        .then(
          res => {
            //FUNÇÃO DE PREENCHIMENTO DE ARRAY PARA SELECT DE FILTRO DE CICLO(ALOJAMENTOS)
            for (let i = 1; i <= res.json()[0].ciclo_animal; i++) {
              this.qtd_ciclos_animais.push(i);
            }
            this.qtd_ciclos_animais = this.qtd_ciclos_animais;
            this.getHistoricoAnimal(this.qtd_ciclos_animais.length);
            return this.itemCarregado = res.json();
          },
          error => {
            return this._ToastrService.error(error.json().message);
          }
        )
    });



  }


  /************
  BUSCA DADOS  DE ALIMENTAÇÃO DOS ANIMAIS
  *************/
  getHistoricoAnimal(event) {
    this.comboAnimal = [];
    this.loading = true;
    if (event.target) {
      this.ciclo_animal = event.target.value;
      this.mainChartData1 = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
        0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
    }
    else {
      this.ciclo_animal = event;
    }
    this.isBusyList = true;
    this._HttpService.JSON_GET(`/animais/historico/${this.id_animal}/${this.ciclo_animal}`, false, true)
      .then(
        res => {
          this.comboAnimal = res.json();

          this.qa_total_alojamento = res.json()[0].qa_tot_alojamento / 10;
          this.ciclo_animal != 0 ? this.dadosGraph() : this.dadosGraphAll();
          return this.comboAnimal;
        },
        error => {
          this.loading = false;
          return this._ToastrService.error(error.json().message);
        }
      );
  }

  /************
  GERAR DADOS DO ANIMAL NO GRÁFICO - FUNÇÃO SETA VALOR EM PORCENTAGEM DA QTD ALIMENTADA DO ANIMAL NO DIA REFERENTE
  *************/
  dadosGraph() {
    this.clearGraph();
    let forloop = this.comboAnimal.length;
    for (let i = 0; i < forloop; i++) {
      this.mainChartData1.splice((this.comboAnimal[i].dia - 1), 1, Math.round((this.comboAnimal[i].qa / this.comboAnimal[i].qt) * 100));
    }
    this.mainChartData[0].data = this.mainChartData1;
    for (let j = 0; j < this.mainChartData[0].data.length; j++) {
      if (this.mainChartData[0].data[j] > 100) {
        this.mainChartData[0].data[j] = 100;
      };
    }
    this.loading = false;
  }

  async dadosGraphAll() {
    this.mainChartData = []
    await this.mountAlojamentos(this.alojamentos, this.qtd_ciclos_animais, this.mainChartData1)
    for (let i = 0; i < this.alojamentos.length; i++) {
      this.mainChartData.push({ data: this.alojamentos[i].dias, label: this.alojamentos[i].ciclo + 'º aloj.' })
    }
  }

  async mountAlojamentos(alojamentos, qt_alojamentos, dias) {
    if (!alojamentos.length) {
      qt_alojamentos.forEach(function (alojamento) {
        alojamentos.push({ ciclo: alojamento, dias: dias })
      })
    }
    this.mountAlojamentoDays(alojamentos, this.comboAnimal);
  }
  mountAlojamentoDays(alojamentos, comboAnimal) {
    alojamentos.forEach(function (alojamento) {
      let auxDays = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
        0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
      comboAnimal.forEach(function (animal) {
        if (animal.ciclo_animal == alojamento.ciclo) {
          (animal.qa / 10) <= 100
            ? auxDays.splice((animal.dia - 1), 1, Math.round((animal.qa / animal.qt) * 100))
            : auxDays.splice((animal.dia - 1), 1, 100);
        }
      });
      alojamento.dias = auxDays;
    })
  }
  async relbuildGraph() {
    let forloop = this.comboAnimal.length;
    if (this.tipoGrafico == "1" && this.ciclo_animal != 0) {
      this.mainChartData[0].label = this.comboAnimal[0].ciclo_animal + 'º aloj.';
      this.chart.options.scales.yAxes[0].ticks.max = this.qa_total_alojamento;
      this.chart.options.scales.yAxes[0].ticks.stepSize = this.qa_total_alojamento / 10;
      for (let i = 0; i < forloop; i++) {
        (this.comboAnimal[i].qa / 10) <= this.qa_total_alojamento
          ? this.mainChartData1.splice((this.comboAnimal[i].dia - 1), 1, (this.comboAnimal[i].qa / 10))
          : this.mainChartData1.splice((this.comboAnimal[i].dia - 1), 1, this.qa_total_alojamento)
      }
    }
    else if (this.tipoGrafico == "2" && this.ciclo_animal != 0) {
      this.mainChartData[0].label = this.comboAnimal[0].ciclo_animal + 'º aloj.';
      this.chart.options.scales.yAxes[0].ticks.max = 100;
      this.chart.options.scales.yAxes[0].ticks.stepSize = 10;
      for (let i = 0; i < forloop; i++) {
        ((this.comboAnimal[i].qa / this.comboAnimal[i].qt) * 100) > 100
          ? 100
          : this.mainChartData1.splice((this.comboAnimal[i].dia - 1), 1, Math.ceil((this.comboAnimal[i].qa / this.comboAnimal[i].qt) * 100));
      }
    }
    this.chart.getChartBuilder(this.chart.ctx)
  }
  changeGrafico(event) {
    this.tipoGrafico = event.target.value;
    this.relbuildGraph()
  }


  /************
  FILTRA
  *************/
  searchFilter(event) {
    let val = event.target.value.toLowerCase();
    if (val.length === 0) {
      //this.getHistoricoAnimal();
    } else {
      let filtro = this.comboAnimal.filter(function (d) {
        return d.dosador_data.toLowerCase().indexOf(val) !== -1 || !val;
      });
      this.comboAnimal = filtro;
    }
  }
}

// /***********************************************************
// COMPONENTS
// ***********************************************************/
// import { Component, OnInit } from '@angular/core';
// import { ToastrService } from 'ngx-toastr';
// import { ActivatedRoute } from '@angular/router';
// import { ProgressbarModule } from 'ngx-bootstrap/progressbar';
// import * as _ from 'underscore';
// /**********************************************************
// PROVIDERS
// ***********************************************************/
// import { HttpService } from '../../globals/http';
// import { GlobalService } from '../../globals/globals';

// @Component({
//   selector: 'app-animais-dash',
//   templateUrl: 'dash.html',
//   styleUrls: ['dash.scss']
// })
// export class AnimaisDashNovoComponent implements OnInit {

//   loading: boolean = true;

//   itemCarregado = [];
//   isBusyForm: boolean = false;
//   isBusyList: boolean = false;
//   exibeUpdate: boolean = false;
//   itens = [];
//   itensFilter = [];
//   itemsPerPage = 10;
//   id_animal = this.ActivatedRoute.snapshot.params.id;
//   //COMBOS
//   comboDieta = [];
//   selectDieta = 0;
//   comboAnimal = [];
//   qtd_ciclos_animais = [];
//   ciclo_animal;
//   constructor(
//     private ActivatedRoute: ActivatedRoute,
//     private _HttpService: HttpService,
//     private _ToastrService: ToastrService,
//     private GlobalService: GlobalService
//   ) {
//     //this.getComboAnimal();

//     //this.getItens();
//   }

//   public brandPrimary = '#20a8d8';
//   public brandSuccess = '#007e69';
//   public brandInfo = '#191516';
//   public brandWarning = '#f8cb00';
//   public brandDanger = '#f86c6b';

//   // mainChart

//   public mainChartElements = 119;
//   public mainChartData1: Array<number> = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
//     0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];


//   public mainChartData: Array<any> = [
//     {
//       data: this.mainChartData1,
//       label: '%',
//     }
//   ];

//   /* tslint:disable:max-line-length */
//   //public mainChartLabels: Array<any> = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday', 'Monday', 'Thursday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
//   public mainChartLabels: Array<any> = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11", "12", "13", "14", "15", "16", "17", "18", "19", "20", "21", "22", "23", "24", "25", "26", "27", "28", "29",
//     "30", "31", "32", "33", "34", "35", "36", "37", "38", "39", "40", "41", "42", "43", "44", "45", "46", "47", "48", "49", "50",
//     "51", "52", "53", "54", "55", "56", "57", "58", "59", "60", "61", "62", "63", "64", "65", "66", "67", "68", "69",
//     "70", "71", "72", "73", "74", "75", "76", "77", "78", "79", "80", "81", "82", "83", "84", "85", "86", "87",
//     "88", "89", "90", "91", "92", "93", "94", "95", "96", "97", "98", "99", "100",
//     "101", "102", "103", "104", "105", "106", "107", "108", "109", "110", "111", "112", "113", "114", "115", "116", "117", "118", "119", "120"
//   ];

//   /* tslint:enable:max-line-length */
//   public mainChartOptions: any = {
//     responsive: true,
//     maintainAspectRatio: false,
//     scales: {
//       xAxes: [{
//         gridLines: {
//           drawOnChartArea: true,
//         },
//         ticks: {
//           beginAtZero: false,
//           max: 120
//           // callback: function (value: any) {
//           //   return value.charAt(0);
//           // }
//         }
//       }],
//       yAxes: [{
//         ticks: {
//           beginAtZero: true,
//           //maxTicksLimit: 5,
//           stepSize: 10,
//           max: 100
//         }
//       }]
//     },
//     elements: {
//       line: {
//         borderWidth: 2
//       },
//       point: {
//         radius: 3,
//         hitRadius: 2,
//         hoverRadius: 4,
//         hoverBorderWidth: 3,
//       }
//     },
//     legend: {
//       display: false
//     }
//   };
//   public mainChartColours: Array<any> = [
//     { // brandInfo
//       backgroundColor: this.convertHex(this.brandInfo, 10),
//       borderColor: this.brandInfo,
//       pointHoverBackgroundColor: this.brandSuccess
//     },
//     { // brandSuccess
//       backgroundColor: 'transparent',
//       borderColor: this.brandSuccess,
//       pointHoverBackgroundColor: '#fff'
//     },
//     { // brandDanger
//       backgroundColor: 'transparent',
//       borderColor: this.brandDanger,
//       pointHoverBackgroundColor: '#fff',
//       borderWidth: 1,
//       borderDash: [8, 5]
//     }
//   ];
//   public mainChartLegend = false;
//   public mainChartType = 'line';

//   // events
//   public chartClicked(e: any): void {
//   }

//   public chartHovered(e: any): void {
//   }

//   // convert Hex to RGBA
//   public convertHex(hex: string, opacity: number) {
//     hex = hex.replace('#', '');
//     const r = parseInt(hex.substring(0, 2), 16);
//     const g = parseInt(hex.substring(2, 4), 16);
//     const b = parseInt(hex.substring(4, 6), 16);

//     const rgba = 'rgba(' + r + ', ' + g + ', ' + b + ', ' + opacity / 100 + ')';
//     return rgba;
//   }

//   public random(min: number, max: number) {
//     return Math.floor(Math.random() * (max - min + 1) + min);
//   }

//   ngOnInit() {
//     this.getHistoricoAnimal(1);


//     this.ActivatedRoute.params.subscribe(params => {
//       this._HttpService.JSON_GET(`/animais/getAnimal/${params.id}`, false, true)
//         .then(
//           res => {
//             //FUNÇÃO DE PREENCHIMENTO DE ARRAY PARA SELECT DE FILTRO DE CICLO(ALOJAMENTOS)
//             for (let i = 1; i <= res.json()[0].ciclo_animal; i++) {
//               this.qtd_ciclos_animais.push(i);

//             }

//             return this.itemCarregado = res.json();
//           },
//           error => {
//             return this._ToastrService.error(error.json().message);
//           }
//         )
//     });
//   }


//   /************
//   BUSCA DADOS  DE ALIMENTAÇÃO DOS ANIMAIS
//   *************/
//   getHistoricoAnimal(event) {
//     this.comboAnimal = [];
//     this.loading = true;
//     if (event.target) {
//       this.ciclo_animal = event.target.value;
//       this.mainChartData1 = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
//         0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
//     }
//     else {
//       this.ciclo_animal = 1;
//     }
//     this.isBusyList = true;
//     this._HttpService.JSON_GET(`/animais/historico/${this.id_animal}/${this.ciclo_animal}`, false, true)
//       .then(
//         res => {
//           this.comboAnimal = res.json();
//           this.dadosGraph();

//           return this.comboAnimal;
//         },
//         error => {
//           this.loading = false;
//           return this._ToastrService.error(error.json().message);
//         }
//       );
//   }

//   /************
//   GERAR DADOS DO ANIMAL NO GRÁFICO - FUNÇÃO SETA VALOR EM PORCENTAGEM DA QTD ALIMENTADA DO ANIMAL NO DIA REFERENTE
//   *************/
//   dadosGraph() {
//     let forloop = this.comboAnimal.length;
//     for (let i = 0; i < forloop; i++) {
//       this.mainChartData1.splice((this.comboAnimal[i].dia - 1), 1, Math.round((this.comboAnimal[i].qa / this.comboAnimal[i].qt) * 100));
//     }
//     this.mainChartData[0].data = this.mainChartData1;
//     for (let j = 0; j < this.mainChartData[0].data.length; j++) {
//       console.log('VALOR: ', this.mainChartData[0].data[j], 'LOOP', j);
//       if (this.mainChartData[0].data[j] > 100) {
//         console.log('ENTROU NO IF');
//         this.mainChartData[0].data[j] = 100;
//         console.log('TRATOU? ', this.mainChartData[0].data[j]);
//       };
//     }
//     console.log("RESULT:::: ", this.mainChartData[0], this.mainChartData1)
//     this.loading = false;
//   }
/************
POST
*************/
  // postForm(form) {

  //   form.value.animais_id = this.itemCarregado[0].id;

  //   console.log(form.value);

  //   //VERIFICA CAMPOS PREENCHIDOS
  //   if (form.value.dia_dieta == null || form.value.dia_dieta == '' ||
  //     form.value.dietas_id == null || form.value.dietas_id == 0 ||
  //     form.value.dt_inicio == null || form.value.dt_inicio == '' ||
  //     form.value.dt_prevista == null || form.value.dt_prevista == '' ||
  //     form.value.dt_final == null || form.value.dt_final == '') {
  //     return this._ToastrService.error('Preencha todos os campos corretamente', 'Erro!');

  //   } else {

  //     //BLOQUEANDO BOTAO DURANTE REQUEST
  //     this.isBusyForm = true;

  //     this._HttpService.JSON_POST('/animais-dietas', form.value, false, true)
  //       .then(
  //         res => {
  //           this.getItens();
  //           this.isBusyForm = false;
  //           return this._ToastrService.success(res.json().message);
  //         },
  //         error => {
  //           this.isBusyForm = false;
  //           return this._ToastrService.error(error.json().message);
  //         }
  //       )

  //   }
  // }

/************
PUT
*************/
  // putForm(form) {

  //   form.value.animais_id = this.itemCarregado[0].id;

  //   //VERIFICA CAMPOS PREENCHIDOS
  //   if (form.value.dia_dieta == null || form.value.dia_dieta == '' ||
  //     form.value.dietas_id == null || form.value.dietas_id == 0 ||
  //     form.value.dt_inicio == null || form.value.dt_inicio == '' ||
  //     form.value.dt_prevista == null || form.value.dt_prevista == '' ||
  //     form.value.dt_final == null || form.value.dt_final == '') {
  //     return this._ToastrService.error('Preencha todos os campos corretamente', 'Erro!');

  //   } else {

  //     //BLOQUEANDO BOTAO DURANTE REQUEST
  //     this.isBusyForm = true;

  //     this._HttpService.JSON_PUT(`/animais-dietas/${this.GlobalService.getItem().id}`, form.value, false, true)
  //       .then(
  //         res => {
  //           this.getItens();
  //           this.isBusyForm = false;
  //           this.exibeUpdate = false;
  //           return this._ToastrService.success(res.json().message);
  //         },
  //         error => {
  //           this.isBusyForm = false;
  //           this.exibeUpdate = false;
  //           return this._ToastrService.error(error.json().message);
  //         }
  //       )

  //   }
  // }

/************
GET
*************/
  // getItens() {
  //   this.isBusyList = true;
  //   this._HttpService.JSON_GET('/animais-dietas', false, true)
  //     .then(
  //       res => {
  //         this.itensFilter = res.json();
  //         this.isBusyList = false;
  //         return this.itens = res.json();
  //       },
  //       error => {
  //         this.isBusyList = false;
  //         return this._ToastrService.error(error.json().message);
  //       }
  //     )

  // }

/************
DELETE
*************/
  // deleteItem() {
  //   let res = confirm("Tem certeza que deseja excluir a dieta do animal?");
  //   if (res) {

  //     this._HttpService.JSON_DELETE(`/animais-dietas/${this.GlobalService.getItem().id}`, false, true)
  //       .then(
  //         res => {
  //           this.getItens();
  //           return this._ToastrService.success(res.json().message);
  //         },
  //         error => {
  //           return this._ToastrService.error(error.json().message);
  //         }
  //       )

  //   }

  // }

/************
FILTRA
*************/
  // searchFilter(event) {
  //   let val = event.target.value.toLowerCase();
  //   if (val.length === 0) {
  //     //this.getHistoricoAnimal();
  //   } else {
  //     let filtro = this.comboAnimal.filter(function (d) {
  //       return d.dosador_data.toLowerCase().indexOf(val) !== -1 || !val;
  //     });
  //     this.comboAnimal = filtro;
  //   }
  // }
// }
