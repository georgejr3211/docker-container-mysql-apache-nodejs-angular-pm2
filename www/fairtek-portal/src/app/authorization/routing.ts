import { Component } from '@angular/core';

/*--------------
V 1.0.0 - Criado por Larner Diogo

DESCIÇÃO:
Rota geral do componente


COMPONENTS
***********************************************************/
import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

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
import { DesativacaoComponent } from './desativacao/desativacao';
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


const routes: Routes = [

  { path: '', pathMatch: 'full', redirectTo: 'home' },
  { path: 'home', component: HomeComponent, data: { title: 'Home' } },
  { path: 'gestao/usuarios', component: UsuariosComponent, data: { title: 'Usuários' } },
  { path: 'gestao/grupo-usuarios', component: GrupoUsuariosComponent, data: { title: 'Perfil-Usuários' } },
  { path: 'gestao/tipos-notificacao', component: TipoNotificacoesComponent, data: { title: 'Notificações' } },
  { path: 'gestao/notificacoes', component: NotificacoesComponent, data: { title: 'Notificações' } },
  { path: 'gestao/produtores', component: ProdutorComponent, data: { title: 'Produtores' } },
  { path: 'gestao/veterinarios', component: VeterinariosComponent, data: { title: 'Veterinarios' } },
  { path: 'gestao/nutricionistas', component: NutricionistasComponent, data: { title: 'Nutricionistas' } },
  { path: 'gestao/gerentes', component: GerentesComponent, data: { title: 'Gerentes' } },
  { path: 'gestao/operadores', component: OperadoresComponent, data: { title: 'Operadores' } },
  { path: 'gestao/geneticas', component: GeneticasComponent, data: { title: 'Geneticas' } },
  { path: 'gestao/suporte', component: SuporteComponent, data: { title: 'Suporte' } },
  // { path: 'gestao/registros', component: RegistrosComponent, data: { title: 'Registros' } },
  { path: 'fazendas', component: FazendasNovoComponent, data: { title: 'Fazendas' } },
  { path: 'granjas', component: GranjasNovoComponent, data: { title: 'Granjas' } },
  { path: 'galpoes', component: GalpoesNovoComponent, data: { title: 'Galpões' } },
  { path: 'brincos', component: BrincosNovoComponent, data: { title: 'Brincos' } },
  { path: 'baias', component: BaiasNovoComponent, data: { title: 'Baias' } },
  { path: 'dosadores', component: DosadoresComponent, data: { title: 'Dosadores' } },
  { path: 'animais', component: AnimaisComponent, data: { title: 'Animais' } },
  { path: 'animais/detalhes/:id', component: AnimaisDashNovoComponent, data: { title: 'Animais' } },
  { path: 'animais-movimentacoes', component: AnimaisMovimentacoesComponent, data: {title: 'Movimentações'}},
  { path: 'dietas', component: DietasComponent, data: { title: 'Dietas' } },
  //{ path: 'dietas/:id', component: DietasComponent, data: { title: 'Dietas' } },
  { path: 'dietas/detalhes/:id', component: DietasDiasComponent, data: { title: 'Dias de Dieta' } },
  { path: 'dietas/historico/:id', component: DietasHistoricosComponent, data: { title: 'Histórico de Dieta' } },
  { path: 'supervisorio', component: SupervisorioComponent, data: { title: 'Supervisorio' } },
  // { path: 'registros-alimenticios', component: RegistrosAlimenticiosComponent, data: { title: 'Registros Alimentícios' } },
  { path: 'animais-baia', component: AnimaisBaiaComponent, data: { title: 'Animais'} },
  { path: 'calendario', component: CalendarioComponent, data: { title: 'Calendário' } },
  { path: 'calendario-config', component: CalendarioConfigComponent, data: { title: 'Configurações do Calendário' } },
  { path: 'escores', component: EscoresComponent, data: {title: 'Escores'} },
  { path: 'chips', component: ChipsNovoComponent, data: {title: 'Chips'} },
  { path: 'desativacao', component: DesativacaoComponent, data: {title: 'Motivo Desativação'} },
  { path: 'dieta-tipos', component: DietasTiposComponent, data: {title: 'Tipos de Dietas'} },
  { path: 'relatorio-rotina', component: RelatorioRotinaComponent, data: {title: 'Relatório Rotina'}},
  { path: 'relatorio-alimentados', component: RelatorioAlimentadosComponent, data: {title: 'Relatório Alimentados'}},
  { path: 'cadastros-granjas', component: CadastroGranjasComponent, data: {title: 'Cadastro de Granja'}},
  { path: 'animais-localizacao', component:AnimaisLocalizacao, data: {title: 'Animais por Baia'}},
  { path: 'animais-gestacao', component: AnimaisGestacao, data: {title: 'Animais por Gestação'}},
  { path: 'animais-em-gestacao', component: AnimaisEmGestacao, data: {title: 'Animais em Gestação'}},
  { path: 'consumo-racao', component:ConsumoRacao, data: {title: 'Consumo de ração'}},
  { path: 'animais-externa', component:AnimaisExterna, data: {title: 'Animais na Área Externa'}},
  { path: 'historico-semanal', component:HistoricoSemanal, data: {title: 'Histórico Semanal'}},
  { path: 'dietas-relatorio', component:DietasRelatorio, data: {title: 'Relatório de Dietas'}},
  { path: 'backup-local', component: BackupLocalComponent, data: {title: 'Backup Local'}},
  { path: 'calibracao', component: CalibracaoComponent, data: {title: 'Calibração'}},
  { path: 'transferencia-baia', component: TransferenciaBaiaComponent, data: {title: 'Transferencia Baia'}},
  
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class Routing { }
 