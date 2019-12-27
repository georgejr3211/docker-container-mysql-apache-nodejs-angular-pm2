/*--------------
V 1.0.0 - Criado por Larner Diogo

DESCIÇÃO:
Modulo geral do componente


COMPONENTS
***********************************************************/
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NgSelectModule } from '@ng-select/ng-select';
import { NgxPaginationModule } from 'ngx-pagination';
import { AgGridModule } from "ag-grid-angular/main";
import { UtilsService } from "../globals/utils";
import { aclService } from './../globals/acl';
import { ShowService } from './../shared/app-show/show.service';
import { PdfExcelService } from './../shared/app-pdf-excel/pdf-excel.service';

import { ChartsModule } from 'ng2-charts/ng2-charts';
import { BsDropdownModule } from 'ngx-bootstrap/dropdown';
import { TabsModule } from 'ngx-bootstrap/tabs';
import { ProgressbarModule } from 'ngx-bootstrap/progressbar';

import { TextMaskModule } from 'angular2-text-mask';
/*
* FullCalendar
*/
import { FullCalendarModule } from 'ng-fullcalendar';

/***NGX-DATAGRID** */
import { NgxDatatableModule } from '@swimlane/ngx-datatable';

import { ModalModule } from 'ngx-bootstrap/modal';
import { NgxChartsModule } from '@swimlane/ngx-charts';


/**********************************************************
PROVIDERS
***********************************************************/

/**********************************************************
PAGES
***********************************************************/
import { HomeComponent } from './home/home';
import { UsuariosComponent } from './gestao/usuarios/usuarios';
import { ProdutorComponent } from './gestao/produtor/produtor';
import { VeterinariosComponent } from './gestao/veterinarios/veterinarios';
import { NutricionistasComponent } from './gestao/nutricionistas/nutricionistas';
import { GerentesComponent } from './gestao/gerentes/gerentes';
import { OperadoresComponent } from './gestao/operadores/operadores';
import { GeneticasComponent } from './gestao/geneticas/geneticas';
import { FazendasNovoComponent } from './fazendas/novo';
import { FazendasDashNovoComponent } from './fazendas/dash';
import { GranjasNovoComponent } from './granjas/novo';
import { GalpoesNovoComponent } from './galpoes/novo';
import { GalpoesDashNovoComponent } from './galpoes/dash';
import { BaiasNovoComponent } from './baias/novo';
import { BaiasDashNovoComponent } from './baias/dash';
import { DosadoresComponent } from './dosadores/novo';
import { AnimaisComponent } from './animais/animais';
import { AnimaisDashNovoComponent } from './animais/dash';
import { DietasComponent } from './animais/dietas';
import { DietasDiasComponent } from './animais/dieta-dias';
import { TipoNotificacoesComponent } from './gestao/notificacoes/tipo-notificacoes';
import { NotificacoesComponent } from './gestao/notificacoes/notificacoes';
import { RegistrosComponent } from './gestao/registros/registros';
import { SupervisorioComponent } from './supervisorio/supervisorio';
import { AnimaisBaiaComponent } from './animais-baia/animais-baia';
import { RegistrosAlimenticiosComponent } from './registros-alimenticios/registros-alimenticios';
import { BrincosNovoComponent } from './brincos/novo';
import { CalendarioComponent } from './calendario/calendario';
import { CalendarioConfigComponent } from './calendario/configuracoes';
import { EscoresComponent } from './escores/escores';
import { ChipsNovoComponent } from './chips/novo';
import { DesativacaoComponent } from './desativacao/desativacao'
import { DietasTiposComponent } from './animais/dietas-tipos';
import { DietasHistoricosComponent } from './animais/dieta-historico';
import { AnimaisMovimentacoesComponent } from './animais/animais-movimentacoes';
import { RelatorioRotinaComponent } from './relatorios/relatorio-rotina';
import { RelatorioAlimentadosComponent } from './relatorios/relatorio-alimentados';
import { CadastroGranjasComponent } from './cadastros-granjas/novo';
import { AnimaisLocalizacao } from './relatorios/animais-localizacao';
import { ConsumoRacao } from './relatorios/consumo-racao';
import { AnimaisExterna } from './relatorios/animais-externa';
import { HistoricoSemanal } from './relatorios/historico-semanal';
import { AnimaisGestacao } from './relatorios/animais-gestacao';
import { AnimaisEmGestacao } from './relatorios/animais-em-gestacao';
import { DietasRelatorio } from './relatorios/dietas-relatorio';
import { BackupLocalComponent } from './backups/backup-local';
import { CalibracaoComponent } from './calibracao/calibracao';
import { GrupoUsuariosComponent } from './gestao/grupo-usuarios/grupo.usuarios';
import { SuporteComponent } from './gestao/suporte/suporte';
import { TransferenciaBaiaComponent } from './transferencia-baia/transferencia-baia';
import { Calendar1000Component } from './calendar-1000.component/calendar-1000.component'

/**********************************************************
ROUTER
***********************************************************/
import { Routing } from './routing';
import { TooltipModule, BsDatepickerModule } from 'ngx-bootstrap';

@NgModule({
  imports: [
    Routing,
    CommonModule,
    FormsModule,
    NgxPaginationModule,
    ChartsModule,
    BsDropdownModule,
    TextMaskModule,
    TooltipModule.forRoot(),
    BsDatepickerModule.forRoot(),
    FullCalendarModule,
    TabsModule.forRoot(),
    ProgressbarModule.forRoot(),
    NgSelectModule,
    NgxDatatableModule,
    ModalModule,
    NgxChartsModule


  ],
  exports:[Calendar1000Component],
  providers: [
    UtilsService,
    aclService,
    ShowService,
    PdfExcelService
  ],
  declarations: [
    HomeComponent,
    UsuariosComponent,
    GrupoUsuariosComponent,
    ProdutorComponent,
    VeterinariosComponent,
    NutricionistasComponent,
    GerentesComponent,
    OperadoresComponent,
    GeneticasComponent,
    FazendasNovoComponent,
    FazendasDashNovoComponent,
    GranjasNovoComponent,
    GalpoesNovoComponent,
    GalpoesDashNovoComponent,
    BaiasNovoComponent,
    BaiasDashNovoComponent,
    DosadoresComponent,
    AnimaisComponent,
    AnimaisDashNovoComponent,
    DietasComponent,
    DietasDiasComponent,
    DietasHistoricosComponent,
    TipoNotificacoesComponent,
    NotificacoesComponent,
    RegistrosComponent,
    SupervisorioComponent,
    AnimaisBaiaComponent,
    RegistrosAlimenticiosComponent,
    BrincosNovoComponent,
    CalendarioComponent,
    CalendarioConfigComponent,
    EscoresComponent,
    ChipsNovoComponent,
    DesativacaoComponent,
    DietasTiposComponent,
    AnimaisMovimentacoesComponent,
    RelatorioRotinaComponent,
    RelatorioAlimentadosComponent,
    CadastroGranjasComponent,
    AnimaisLocalizacao,
    AnimaisGestacao,
    AnimaisEmGestacao,
    ConsumoRacao,
    AnimaisExterna,
    HistoricoSemanal,
    DietasRelatorio,
    BackupLocalComponent,
    CalibracaoComponent,
    SuporteComponent,
    TransferenciaBaiaComponent,
    Calendar1000Component
  ]
})
export class Module { }
