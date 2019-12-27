/***********************************************************
COMPONENTS
***********************************************************/
import { Component, OnInit, ViewChild } from '@angular/core';
import { ToastrService } from 'ngx-toastr';

/*
* Calendario Component
*/
import { CalendarComponent } from 'ng-fullcalendar';
import { Options } from 'fullcalendar';

/**********************************************************
PROVIDERS
***********************************************************/
import { HttpService } from '../../globals/http';
import { GlobalService } from '../../globals/globals';
import { moment } from 'ngx-bootstrap/chronos/test/chain';

@Component({
  selector: 'app-calendario',
  templateUrl: 'calendario.html',
  styleUrls: ['calendario.scss']
})
export class CalendarioComponent implements OnInit {
  @ViewChild(CalendarComponent) ucCalendar: CalendarComponent;
  calendarOptions: Options;

  isBusyForm: boolean = false;
  isBusyList: boolean = false;
  exibeUpdate: boolean = false;
  itens = [];
  itensFilter = [];
  itemsPerPage = 10;
  calendarDays = [];

  calendario = [];

  loading: boolean = true;

  constructor(
    private _HttpService: HttpService,
    private _ToastrService: ToastrService,
    private GlobalService: GlobalService
  ) {

  }

  ngOnInit() {

    this.getAllCalendars();
    //this.getCalendarioNow();
  }

  eventClick(event) {
  }

  clickButton(event) {
  }

  // getCalendarioNow() {
  //   var day = moment().format('YYYY-MM-DD HH:mm:ss');
  //   console.log(day);
  //   this._HttpService.JSON_GET('/calendarios/findone/' + day, false, true)
  //     .then(
  //       res => {
  //         console.log(res.json());
  //         this.calendario = res.json();

  //         this.calendarOptions = {
  //           locale: 'pt-br',
  //           editable: true,
  //           eventLimit: false,
  //           displayEventTime: false,
  //           buttonText: {
  //             today: 'Hoje',
  //             month: 'Mês',
  //             week: 'Semana',
  //             day: 'Dia',
  //             list: 'Lista Meses'
  //           },
  //           header: {
  //             left: 'prev,next today',
  //             center: 'title',
  //             right: 'month,agendaWeek,agendaDay,listMonth'
  //           },
  //           eventSources: [{
  //             events: this.calendario,
  //             backgroundColor: 'white',
  //           }],
  //         };

  //       },
  //       error => {
  //         this._ToastrService.error(error.json().message);
  //       }
  //     )
  // }

  getAllCalendars() {
    this.loading = true;
    this._HttpService.JSON_GET('/calendarios/findall/', false, true)
      .then(
        res => {
          this.calendario = res.json();
          //this.ucCalendar.fullCalendar('renderEvent', this.calendario);
          this.calendarOptions = {
            locale: 'pt-br',
            themeSystem: 'standard',
            editable: true,
            eventLimit: false,
            buttonText: {
              today: 'Hoje',
              month: 'Mês',
              week: 'Semana',
              day: 'Dia',
              list: 'Lista Meses'
            },
            header: {
              left: 'prev,next today',
              center: 'title',
              right: 'month,agendaWeek,agendaDay,listMonth'
            },
            eventSources: [{
              events: this.calendario,
              backgroundColor: '#007e69'
            }],
            eventBorderColor: "#000",
            eventTextColor: "#fff"

          };
          this.loading = false;

          error => {
            this.loading = false;
            this._ToastrService.error(error.json().message);
          }
        });
  }

}