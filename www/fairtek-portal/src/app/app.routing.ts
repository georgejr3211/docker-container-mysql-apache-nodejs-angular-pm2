/*--------------
V 1.0.0 - Criado por Larner Diogo

DESCIÇÃO:
Roteador geral da Aplicação


COMPONENTS
***********************************************************/
import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { GuardService } from './globals/guard';

/**********************************************************
PAGES
***********************************************************/
import { NoAuthorizationComponent } from './no-authorization/index';
import { AuthorizationComponent } from './authorization/index';


/*// Import Containers
import {
  FullLayoutComponent,
  SimpleLayoutComponent
} from './containers';*/

export const routes: Routes = [

  //ROTA PROTEGIDA
  {
    path: '',
    component: AuthorizationComponent,
    canActivate: [GuardService],
    children: [
      {
        path: '',
        loadChildren: './authorization/module#Module'
      },
    ]
  },

  //ROTAS GERAIS
  {
    path: 'no-auth',
    component: NoAuthorizationComponent,
    children: [
      {
        path: '',
        loadChildren: './no-authorization/module#Module'
      },
    ]
  },

  //404
  { path: '**', pathMatch: 'full', redirectTo: 'no-auth/404' },
  
  /*{
    path: '',
    redirectTo: 'dashboard',
    pathMatch: 'full',
  },
  {
    path: '',
    component: FullLayoutComponent,
    data: {
      title: 'Home'
    },
    children: [
      {
        path: 'dashboard',
        loadChildren: './views/dashboard/dashboard.module#DashboardModule'
      },
      {
        path: 'components',
        loadChildren: './views/components/components.module#ComponentsModule'
      },
      {
        path: 'icons',
        loadChildren: './views/icons/icons.module#IconsModule'
      },
      {
        path: 'widgets',
        loadChildren: './views/widgets/widgets.module#WidgetsModule'
      },
      {
        path: 'charts',
        loadChildren: './views/chartjs/chartjs.module#ChartJSModule'
      }
    ]
  },
  {
    path: 'pages',
    component: SimpleLayoutComponent,
    data: {
      title: 'Pages'
    },
    children: [
      {
        path: '',
        loadChildren: './views/pages/pages.module#PagesModule',
      }
    ]
  }*/
];

@NgModule({
  imports: [ RouterModule.forRoot(routes) ],
  exports: [ RouterModule ]
})
export class AppRoutingModule {}
