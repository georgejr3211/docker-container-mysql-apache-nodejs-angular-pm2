/***********************************************************
COMPONENTS
***********************************************************/
import { Component, OnInit } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
// import { NgxDatatableModule } from '@swimlane/ngx-datatable';
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
  selector: 'app-dietas-relatorio',
  templateUrl: 'dietas-relatorio.html',
  styleUrls: ['dietas-relatorio.scss'],
})
export class DietasRelatorio implements OnInit {
  loading: boolean = true;
  isBusyList: boolean = false;
  usuario: any;
  nomeGranja: any;
  dietas = [];
  show = 0;
  show2 = 0;
  dietas_config = [];
  row = [];
  rowAux: any = [];
  rows: any = [];
  rowAux2 = [];
  contentDataURL = '';
  columnsPdf = [];
  obj_element;

  columns: any = [{ name: 'Dia', prop: 'day' }];
  constructor(
    private _HttpService: HttpService,
    private _ToastrService: ToastrService,
    private _pdfExcel: PdfExcelService,
    private GlobalService: GlobalService) { }

  ngOnInit() {
    this.getDietas();
    this.usuario = JSON.parse(localStorage.getItem('user'));
    this.usuario = this.usuario.email.toLowerCase();
  };

  public brandPrimary = '#20a8d8';
  public brandSuccess = '#007e69';
  public brandInfo = '#191516';
  public brandWarning = '#f8cb00';
  public brandDanger = '#f86c6b';

  // mainChart

  public mainChartElements = 119;
  public mainChartData1: Array<number> = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];


  mainChartData: Array<any> = [
    // {
    //   data: this.mainChartData1,
    //   label: '%',
    // }
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

  /* tslint:enable:max-line-length */
  public mainChartOptions: any = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      xAxes: [{
        gridLines: {
          drawOnChartArea: false,
        },
        ticks: {
          beginAtZero: false,
          max: 120
          // callback: function (value: any) {
          //   return value.charAt(0);
          // }
        }
      }],
      yAxes: [{
        ticks: {
          beginAtZero: true,
          //maxTicksLimit: 5,
          stepSize: 250,
          max: 5000,
          min: 0
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
  public mainChartColours: Array<any> = [
    { // CORES DA DIETA 1
      backgroundColor: this.convertHex('#006666', 3),
      borderColor: this.brandSuccess,
      pointHoverBackgroundColor: this.brandSuccess
    },
    { //CORES DA DIETA 2
      backgroundColor: this.convertHex(this.brandInfo, 3),
      borderColor: this.brandInfo,
      pointHoverBackgroundColor: this.brandInfo
    },
    { // CORES DA DIETA 3
      backgroundColor: this.convertHex(this.brandPrimary, 3),
      borderColor: this.brandPrimary,
      pointHoverBackgroundColor: this.brandPrimary,
    },
    { // CORES DA DIETA 4
      backgroundColor: this.convertHex(this.brandDanger, 3),
      borderColor: this.brandDanger,
      pointHoverBackgroundColor: this.brandDanger,
      borderWidth: 2,
    },
    { // CORES DA DIETA 5
      backgroundColor: this.convertHex('#b3b300', 3),
      borderColor: '#b3b300',
      pointHoverBackgroundColor: '#b3b300',
      borderWidth: 2,
    },
    { // CORES DA DIETA 6
      backgroundColor: this.convertHex('#003399', 3),
      borderColor: '#003399',
      pointHoverBackgroundColor: '#003399',
      borderWidth: 2
    },
    { // CORES DA DIETA 7
      backgroundColor: this.convertHex('#e67300', 3),
      borderColor: '#e67300',
      pointHoverBackgroundColor: '#e67300',
      borderWidth: 2,
    },
    { // CORES DA DIETA 8
      backgroundColor: this.convertHex('#5d5d89', 3),
      borderColor: '#5d5d89',
      pointHoverBackgroundColor: '#5d5d89',
      borderWidth: 2
    },
    { // CORES DA DIETA 9
      backgroundColor: this.convertHex('#339999', 3),
      borderColor: '#339999',
      pointHoverBackgroundColor: '#339999',
      borderWidth: 2
    },
    { // CORES DA DIETA 10
      backgroundColor: this.convertHex('#666699', 1),
      borderColor: '#666699',
      pointHoverBackgroundColor: '#666699',
      borderWidth: 2
    }
  ];
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

  /**********Lista todas as Dietas cadastradas e ativas************ */
  getDietas() {
    this.loading = true;
    this._HttpService.JSON_GET('/dietas-relatorio', false, true)
      .then(
        res => {
          this.loading = false;
          var config = [];
          var config2 = [];
          var nome = [];
          for (var i = 0; i < res.json().length; i++) {
            for (var j = 0; j < res.json()[i].data.length; j++) {
              config.push(res.json()[i].data[j].qtd);
              config2.push({ qtd: res.json()[i].data[j].qtd })
              nome = res.json()[i].data[j].nome_dieta;
              //this.rows.push(res.json()[i].data[j].qtd);
            }
            this.mainChartData.push({ data: config, label: nome })
            this.dietas_config.push(config2);
            config = [];
            config2 = [];
            nome = [];
          }
          /******OBJETO PARA AS ROWS DO RELATÓRIO**** */
          for (var j = 0; j < 120; j++) {
            for (var i = 0; i < res.json().length; i++) {
              if (res.json()[i].data[j] == undefined) {
                this.row = [`"nome_dieta": 0`];
              }
              else {
                this.row = [`"${res.json()[i].data[j].nome_dieta}": ${res.json()[i].data[j].qtd}, "day": ${j + 1}`];
              }
              this.rowAux.push(this.row);
            }

            this.rows.push(JSON.parse(`{${this.rowAux}}`));
            this.rowAux = [];
          }

          /******OBJETO PARA AS COLUNAS DO RELATÓRIO**** */
          for (var i = 0; i < res.json().length; i++) {
            if (res.json()[i].data[0] == undefined) {
              this.row = [`"nome_dieta": 0`];
            }
            else {
              this.columns.push({ name: res.json()[i].data[0].nome_dieta, prop: res.json()[i].data[0].nome_dieta });
            }
          }

          this.show = 1;
          this.show2 = 1;
          this.dietas = res.json();
        },
        error => {
          this.loading = false;
          this._ToastrService.error(error.json().message);
        }
      )
  }

  /**********************************************************
   PDF
   **********************************************************/
  /*
    captureScreen() {
    var data = document.getElementById('myChart');
    html2canvas(data, {width: 820}).then(canvas => {
      this.contentDataURL = canvas.toDataURL('image/png')
      this.exportAsPDF();
    });
  }

  */


  //TRANSFORMA O GRÁFICO EM IMAGEM E CHAMA A FUNÇÃO DE PDF
  captureScreen() {
    var data = document.getElementById('myChart');
    html2canvas(data).then(canvas => {
      this.contentDataURL = canvas.toDataURL('image/png')
      this.getNomeGranja();
    });
  }

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


  //CRIA A GRID E PASSA OS PARAMÊTROS PARA O SERVIÇO DE PDF/EXCEL
  exportAsPDF() {

    //BUSCA TODOS OS TITULOS DAS COLUNAS DO GRID E CRIA ARRAY COM OS MESMO, SETANDO O VALOR DA DATAKEY
    for (var i = 0; i < this.columns.length; i++) {
      var nome = i;
      var obj = { title: this.columns[i].name, dataKey: `${nome}` };
      this.columnsPdf.push(obj);
    }
    var rows = []
    var value;
    var dia = 1;

    //PERCORRE A QUANTIDADE DE COLUNAS 
    for (var j = 0; j < this.columnsPdf.length; j++) {
      //BUSCA A POSIÇÃO DA COLUNA NO ARRAY QUE CONTEM OS VALORES DA MESMA
      for (var v = 0; v < this.mainChartData.length; v++) {
        if (this.mainChartData[v].label === this.columnsPdf[j].title) {
          value = v
        }
      }
      //PERCORRE 120 VEZES AS LINHAS DA COLUNA ATUAL (120 É O NÚMERO MAXIMO DE DIAS EM UMA DIETA)
      for (var p = 0; p < 120; p++) {
        //SE O ARRAY ROW NÃO CONTER 120 POSIÇÕES, O MESMO RECEBE A PRIMEIRA COLUNA COM SEUS VALORES FIXOS DOS 120 DIAS
        if (rows.length < 120) {
          this.obj_element = this.columnsPdf[0].dataKey;
          rows.push({ [this.obj_element]: dia });
          dia++
        }
        //SE JÁ EXISTIR AS 120 POSIÇÕES, O MESMO É PREENCHIDO DE ACORDO COM OS VALORES ADEQUADOS PARA A SUA COLUNA
        else {
          if (this.mainChartData[value].data[p] != undefined) {
            this.obj_element = this.columnsPdf[j].dataKey;
            rows[p][this.obj_element] = this.mainChartData[value].data[p];
          } else if (this.mainChartData[value].data[p] === undefined) {
            this.obj_element = this.columnsPdf[j].dataKey;
            rows[p][this.obj_element] = "-";
          }

        }
      }

    }
    this.isBusyList = false;
    return this._pdfExcel.exportAsPDF_IMG("Dietas Cadastradas", "Gráfico Dieta x Dias", this.contentDataURL, "Relatório Gráfico Dieta x Dias", this.columnsPdf, rows, this.nomeGranja, this.usuario);
  }

}
