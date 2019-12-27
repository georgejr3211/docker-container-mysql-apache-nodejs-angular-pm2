import { Injectable, ElementRef } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import * as XLSX from 'xlsx';
import * as moment from "moment";
require('jspdf-autotable');
var jsPDF = require('jspdf');
//declare var jsPDF: any; // Important

@Injectable()
export class PdfExcelService {
  public user;
  constructor(
    private _http: HttpClient,
  ) { }

  /*************************************************************************************************************************************
   PDF
  *************************************************************************************************************************************/

  //EXPORTA PDF COM IMAGEM DE ALGUM GRÁFICO E GRID
  exportAsPDF_IMG(titulo_arquivo: string, titulo_img: string, img, titulo_grid: string, columns, rows, nomeGranja, usuario) {
    this._http.get('../../../../assets/img/sowtek.png', { responseType: 'blob' })
      .subscribe(
        data => {
          var reader = new FileReader();
          reader.readAsDataURL(data);
          reader.onload = function () {
            return executa(reader.result);
          }
        }
      )
    function executa(result) {
      const totalPagesExp = "{total_pages_count_string}";
      var doc = new jsPDF('l', 'pt');

      // IMG
      // CONFIG IMAGEM (X,Y,W,H)
      var url = img;
      doc.addImage(result, 30, 5, 130, 50); // CABEÇALHO
      doc.addImage(url, 40, 60, 750, 480); // GRÁFICO

      // CABEÇALHO
      var pageWidth = doc.internal.pageSize.width || doc.internal.pageSize.getWidth();
      doc.setFontSize(10);
      doc.text(717, 30, moment().format("DD/MM/YYYY - HH:mm"));
      doc.setFontSize(18);
      doc.setFontStyle("bold");
      doc.text(titulo_img.toUpperCase(), pageWidth / 2, 30, "center");

      // RODAPÉ
      doc.page = 1;
      function footer() {
        doc.setFontStyle("normal");
        doc.setFontSize(10);
        doc.text("Granja: " + nomeGranja, 40, 585);
        doc.text("Usuario: " + usuario, pageWidth / 2, 585, "center");
        let footerStr = "Página " + doc.internal.getNumberOfPages();
        if (typeof doc.putTotalPages === 'function') {
          footerStr = footerStr + " / " + totalPagesExp;
        }
        doc.text(717, 585, footerStr);
        doc.page++;
      };
      footer();

      //GRID  
      doc.addPage();
      doc.autoTable(columns, rows, {
        theme: 'grid',
        margin: { top: 60 },
        styles: { halign: 'center' },
        headStyles: {
          fillColor: [0, 126, 105]
        },
        didDrawPage: function (data) {
          var pageWidth = doc.internal.pageSize.width || doc.internal.pageSize.getWidth();
          doc.addImage(result, 30, 5, 130, 50); // CABEÇALHO
          doc.setFontSize(10);
          doc.text(667, 30, moment().format("DD/MM/YYYY - HH:mm"));
          doc.setFontSize(18);
          doc.setFontStyle("bold");
          doc.text(titulo_grid.toUpperCase(), pageWidth / 2, 30, "center");
          footer();
        }
      });
      if (typeof doc.putTotalPages === 'function') {
        doc.putTotalPages(totalPagesExp);
      }

      // DOWNLOAD DO PDF
      doc.save(`${titulo_arquivo}.pdf`);
    }
  }

  //EXPORTA PDF COM IMAGEM DE ALGUM GRÁFICO
  exportAsIMG_PDF(titulo_arquivo: string, titulo_img: string, img, nomeGranja, usuario) {
    this._http.get('../../../../assets/img/sowtek.png', { responseType: 'blob' })
      .subscribe(
        data => {
          var reader = new FileReader();
          reader.readAsDataURL(data);
          reader.onload = function () {
            return executa(reader.result);
          }
        }
      )
    function executa(result) {
      const totalPagesExp = "{total_pages_count_string}";
      var doc = new jsPDF('l', 'pt');
      var pageWidth = doc.internal.pageSize.width || doc.internal.pageSize.getWidth();

      // CABEÇALHO
      function header() {        
        doc.addImage(result, 30, 5, 130, 50);
        doc.setFontSize(10);
        doc.text(717, 30, moment().format("DD/MM/YYYY - HH:mm"));
        doc.setFontSize(18);
        doc.setFontStyle("bold");
        doc.text(titulo_img.toUpperCase(), pageWidth / 2, 30, "center");
      };

      // RODAPÉ
      doc.page = 1;
      function footer() {
        doc.setFontStyle("normal");
        doc.setFontSize(10);
        doc.text("Granja: " + nomeGranja, 40, 585);
        doc.text("Usuario: " + usuario, pageWidth / 2, 585, "center");
        let footerStr = "Página " + doc.internal.getNumberOfPages();
        if (typeof doc.putTotalPages === 'function') {
          footerStr = footerStr + " / " + totalPagesExp;
        }
        doc.text(717, 585, footerStr);
        doc.page++;
      };

      //IMG
      var url = img
      var pageWidth = doc.internal.pageSize.width || doc.internal.pageSize.getWidth();
      doc.addImage(url, 30, 60, 795, 480)
      header();
      footer();
      if (typeof doc.putTotalPages === 'function') {
        doc.putTotalPages(totalPagesExp);
      }
      doc.save(`${titulo_arquivo}.pdf`);
    }
  };

  //EXPORTA APENAS O PDF DE ALGUM RELATÓRIO
  exportAsPDF(titulo_arquivo: string, titulo_grid: string, columns, rows, nomeGranja, usuario) {
    this._http.get('../../../../assets/img/sowtek.png', { responseType: 'blob' })
      .subscribe(
        data => {
          var reader = new FileReader();
          reader.readAsDataURL(data);
          reader.onload = () => {
            return executa(reader.result);
          }
        }
      )
    function executa(result) {
      var doc = new jsPDF('l', 'pt');
      const totalPagesExp = "{total_pages_count_string}";

      var pageWidth = doc.internal.pageSize.width || doc.internal.pageSize.getWidth();

      // CABEÇALHO
      function header() {
        doc.addImage(result, 30, 5, 130, 50);        
        doc.setFontSize(10);
        doc.text(717, 30, moment().format("DD/MM/YYYY - HH:mm"));
        doc.setFontSize(18);
        doc.setFontStyle("bold");
        doc.text(titulo_grid.toUpperCase(), pageWidth / 2, 30, "center");
      }

      // RODAPÉ
      doc.page = 1;
      function footer() {
        doc.setFontStyle("normal");
        doc.setFontSize(10);
        doc.text("Granja: " + nomeGranja, 40, 585);
        doc.text("Usuario: " + usuario, pageWidth / 2, 585, "center");
        let footerStr = "Página " + doc.internal.getNumberOfPages();
        if (typeof doc.putTotalPages === 'function') {
          footerStr = footerStr + " / " + totalPagesExp;
        }
        doc.text(734, 585, footerStr);
        doc.page++;
      };

      //Grid
      doc.autoTable(columns, rows, {
        afterPageContent: footer(),
        theme: 'grid',
        margin: { top: 60 },
        styles: { halign: 'center' }, 
        headStyles: {
          fillColor: [0, 126, 105]
        },
        didDrawPage: function (data) {
          header();
          footer();
        }
      });
      if (typeof doc.putTotalPages === 'function') {
        doc.putTotalPages(totalPagesExp);
      }
      doc.save(`${titulo_arquivo}.pdf`);
    }
  };
}