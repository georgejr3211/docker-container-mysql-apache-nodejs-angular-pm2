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
import { LoginComponent } from './login/login';
import { RecoveryComponent } from './recovery/recovery';
import { P404Component } from './p404/P404';
import { P500Component } from './p500/P500';
import { ResetSenhaComponent } from './reset-senha/reset-senha';

const routes: Routes = [

  { path: '', pathMatch: 'full', redirectTo: 'login' },
  { path: 'login', component: LoginComponent, data: { title: 'Login' } },
  { path: 'recovery', component: RecoveryComponent, data: { title: 'Recuperar senha' } },
  { path: '404', component: P404Component, data: { title: '404 - Página não encontrada' } },
  { path: '500', component: P500Component, data: { title: '505 - Erro interno de servidor' } },
  { path: 'reset-senha', component: ResetSenhaComponent, data: { title: 'Resetar a senha.' } },

];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class Routing { }
