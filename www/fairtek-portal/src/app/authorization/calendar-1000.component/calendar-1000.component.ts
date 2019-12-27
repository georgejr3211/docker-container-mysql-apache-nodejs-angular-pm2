import { Component, OnInit, Input, Output, EventEmitter, Renderer2, TemplateRef } from '@angular/core';
import { BsModalService, BsModalRef } from 'ngx-bootstrap/modal';
import { HttpService } from '../../globals/http';
import * as $ from 'jquery';
@Component({
  selector: 'calendar-1000',
  templateUrl: './calendar-1000.component.html',
  styleUrls: ['./calendar-1000.component.css'],
})

export class Calendar1000Component {

  @Input('range') range;
  @Input('title_calendar') title_calendar;
  @Input('id') retorno;
  @Input('format') format;



  @Output() getConfigureDates = new EventEmitter;


  showDate = true;
  array = [{ name: 1 }, { name: 2 }, { name: 3 }, { name: 4 }, { name: 5 }]
  daysWeek = [{ dia: 'Seg' }, { dia: 'Ter' }, { dia: 'Qua' }, { dia: 'Qui' }, { dia: 'Sex' }, { dia: 'Sab' }, { dia: 'Dom' }]
  currPage;
  year;
  day;
  dataAtual = new Date();
  monthTitle;
  dt_inseminacao;
  diaPorco;
  pigadays;
  modalRef: BsModalRef;
  constructor(
    private _HttpService: HttpService,
    private _modalService: BsModalService
  ) { }

  ngOnInit() { }

  openModal(template: TemplateRef<any>) {
    this.modalRef = this._modalService.show(template,
      {
        ignoreBackdropClick: true
      });
  }

  setDates = function (data, diaPorco) {
    this.getConfigureDates.emit({ dt_inseminacao: data, pigDay: diaPorco, retorno: this.retorno });
    this.modalRef.hide();
  }

  focusWaha(template) {
    let month = this.dataAtual.getMonth();
    this.currPage = month;

    this.year = this.dataAtual.getFullYear();

    this.monthTitle = month

    this.getDays(month, this.dt_inseminacao, this.diaPorco, this.setDates, this.format);
    $("#datepicker").css("display", " block");
    this.openModal(template);
  }

  nextMonth() {
    if (this.currPage < 11) {
      this.currPage = this.currPage + 1;
      this.getDays(this.currPage, this.dt_inseminacao, this.diaPorco, this.setDates, this.format);
    }
    else if (this.currPage >= 11) {
      this.currPage = 0;
      this.year++;
      this.getDays(this.currPage, this.dt_inseminacao, this.diaPorco, this.setDates, this.format);

    }
  }

  prevMonth() {
    if (this.currPage > 0) {
      this.currPage = this.currPage - 1;
      this.getDays(this.currPage, this.dt_inseminacao, this.diaPorco, this.setDates, this.format);
    }
    else if (this.currPage <= 0) {
      this.currPage = 11;
      this.year--;
      this.getDays(this.currPage, this.dt_inseminacao, this.diaPorco, this.setDates, this.format);

    }
  }

  nextYear() {
    this.year++;
    this.getDays(this.currPage, this.dt_inseminacao, this.diaPorco, this.setDates, this.format);
  }

  prevYear() {
    this.year--;
    this.getDays(this.currPage, this.dt_inseminacao, this.diaPorco, this.setDates, this.format);
  }

  async getDays(month, dt_inseminacao, diaPorco, funcao, format) {
    this.pigadays = await this.getPigDays();
    $("#dt-able").empty();
    let mos = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];
    let day = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sab'];
    $("#month-title").html(mos[month]);

    for (let i = 0; i < 7; i++) {
      $('#dt-able').append("<td style='text-align: center;margin-bottom: -5px; font-weight: bold;'>" + day[i] + "</td>");
    }

    let firstDay = new Date(this.year, month, 1);
    let lastDay = new Date(this.year, month + 1, 0);
    let offset = firstDay.getDay();
    let year = this.year;
    let mes = month++;
    let dayCount = 1;
    let mesString;
    let DayString;
    let StringDate;

    for (let i = 0; i < 5; i++) {
      $('#dt-able').append("<tr style=' 0px!important;' id=row-" + i + ">");
      for (let rw = 0; rw < 7; rw++) {
        if (offset == 0) {

          DayString = dayCount < 10 ? ('0' + dayCount) : dayCount;
          mesString = mes + 1 < 10 ? '0' + (mes + 1) : (mes + 1);
          StringDate = (year + "-" + mesString + "-" + DayString).toString();
          let dayporco = this.getDayByDay(StringDate, this.pigadays);
          let scope = this;
          let diaPorcoShow = dayporco[0].title.split('.')[1];
          $('#' + "row-" + i).append("<td style='text-align: center;padding:5px!important; height:1px!important;' id='" + "cell-" + dayCount + "' >" + "<button style='background-color:transparent; border: none' type='button' id ='day_val" + dayCount + "'" + " value= '" + dayCount + "' >" + dayCount + "</button>" + "</br>" + "<a style='font-size:10px!important' id ='day_pig" + dayporco[0].title + "'" + " value= '" + dayporco[0].title + "' >" + diaPorcoShow + "</a>" + '</td>')
            .css("height", "3px")
            .css("font-size", "12px")



          $("#" + "day_val" + dayCount).on("click", scope, function (e) {
            let day = (<HTMLInputElement>document.getElementById(e.target.id)).value;
            let br = (<HTMLInputElement>document.getElementById(e.target.id).nextSibling);
            let pigDay = <HTMLInputElement>br.nextSibling
            dt_inseminacao = format == 'true' ? year + "-" + (mes + 1) + "-" + day : year + "/" + (mes + 1) + "/" + day;
            diaPorco = pigDay.id.split('day_pig')[1];
            if (format == 'true') {
              (<HTMLInputElement>document.getElementById("waha")).value = day + "/" + month + "/" + year + "    -   " + diaPorco;
            }
            scope.setDates(dt_inseminacao, diaPorco)
          });

          if (dayCount >= lastDay.getDate()) {
            break;
          }
          dayCount++;
        } else {
          $('#' + "row-" + i).append('<td>' + '</td>');
          offset--;

        }
      }
      $('#dt-able').append('</tr>');
    }
  }

  getPigDays() {
    let date = this.year + '-' + '01' + '-' + '01';
    console.log('Inicio calendario:', date);
    return this._HttpService.JSON_GET(`/calendarios/findRangeCalendar/${date}/${this.range}`, false, true)
      .then(async function (response) {
        return JSON.parse(response._body)
      })
      .catch(function (error) {
        console.log('Error: ', error)
      })
  }

  validaBuscaCalendario() {
    return (this.year >= (this.dataAtual.getFullYear() + this.range)) || (this.year == this.dataAtual.getFullYear())
  }

  getDayByDay(dia, dias) {
    return dias.filter(function (daypig) {
      if (daypig.start == dia) {
        return daypig.title;
      }
    })
  }
}
