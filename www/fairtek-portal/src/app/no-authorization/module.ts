/*--------------
V 1.0.0 - Criado por Larner Diogo

DESCIÇÃO:
Modulo geral do componente


COMPONENTS
***********************************************************/
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

/**********************************************************
PROVIDERS
***********************************************************/

/**********************************************************
PAGES
***********************************************************/
import { LoginComponent } from './login/login';
import { RecoveryComponent } from './recovery/recovery';
import { P404Component } from './p404/P404';
import { P500Component } from './p500/P500';
import { ResetSenhaComponent } from './reset-senha/reset-senha';
import { aclService } from './../globals/acl';


/**********************************************************
ROUTER
***********************************************************/
import { Routing } from './routing';

@NgModule({
  imports: [
    Routing,
    CommonModule,
    FormsModule,
  ],
  providers: [
    aclService,
    
  ],
  declarations: [
    LoginComponent,
    RecoveryComponent,
    P404Component,
    P500Component,
    ResetSenhaComponent
  ]
})
export class Module { }
