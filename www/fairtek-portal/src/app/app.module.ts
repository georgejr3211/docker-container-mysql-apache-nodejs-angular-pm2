/*--------------
V 1.0.0 - Criado por Larner Diogo

DESCRIÇÃO:
Modulo geral da Aplicação


COMPONENTS
***********************************************************/
import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { BrowserModule, } from '@angular/platform-browser';
import { LocationStrategy, HashLocationStrategy, CommonModule } from '@angular/common';
import { ToastrModule } from 'ngx-toastr';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { HttpClientModule, HttpClient } from '@angular/common/http';
import { HttpModule } from '@angular/http';
import { NgxPaginationModule } from 'ngx-pagination';
import { TooltipModule, BsDatepickerModule, ModalModule } from 'ngx-bootstrap';
import { NgSelectModule } from '@ng-select/ng-select';
import { FormsModule } from '@angular/forms';
import { AppSupportService } from './shared/app-support/app-support.service';

// Import 3rd party components
import { BsDropdownModule } from 'ngx-bootstrap/dropdown';
import { TabsModule } from 'ngx-bootstrap/tabs';
import { ChartsModule } from 'ng2-charts/ng2-charts';


/**********************************************************
PROVIDERS
***********************************************************/
import { GuardService } from './globals/guard';
import { SessionService } from './globals/session';
import { StorageService } from './globals/storage';
import { HttpService } from './globals/http';
import { GlobalService } from './globals/globals';
import { UtilsService } from './globals/utils';
import { Menu } from './_nav';


/**********************************************************
PAGES
***********************************************************/
import { AppComponent } from './app.component';
import { NoAuthorizationComponent } from './no-authorization/index';
import { AuthorizationComponent } from './authorization/index';

/*// Import containers
import {
  FullLayoutComponent,
  SimpleLayoutComponent
} from './containers';

const APP_CONTAINERS = [
  FullLayoutComponent,
  SimpleLayoutComponent
]

// Import components
import {
  AppAsideComponent,
  AppBreadcrumbsComponent,
  AppFooterComponent,
  AppHeaderComponent,
  AppSidebarComponent,
  AppSidebarFooterComponent,
  AppSidebarFormComponent,
  AppSidebarHeaderComponent,
  AppSidebarMinimizerComponent,
  APP_SIDEBAR_NAV
} from './components';

const APP_COMPONENTS = [
  AppAsideComponent,
  AppBreadcrumbsComponent,
  AppFooterComponent,
  AppHeaderComponent,
  AppSidebarComponent,
  AppSidebarFooterComponent,
  AppSidebarFormComponent,
  AppSidebarHeaderComponent,
  AppSidebarMinimizerComponent,
  APP_SIDEBAR_NAV
]

// Import directives
import {
  AsideToggleDirective,
  NAV_DROPDOWN_DIRECTIVES,
  ReplaceDirective,
  SIDEBAR_TOGGLE_DIRECTIVES
} from './directives';

const APP_DIRECTIVES = [
  AsideToggleDirective,
  NAV_DROPDOWN_DIRECTIVES,
  ReplaceDirective,
  SIDEBAR_TOGGLE_DIRECTIVES
]*/

/**********************************************************
ROUTER
***********************************************************/
import { AppRoutingModule } from './app.routing';

/**********************************************************
SHAREDS
***********************************************************/
import { AppHeaderComponent } from './shared/app-header/index';
import { AppSidebarComponent } from './shared/app-sidebar/index';
import { AppBreadcrumbsComponent } from './shared/app-breadcrumbs/index';
import { AppAsideComponent } from './shared/app-aside/index';
import { AppFooterComponent } from './shared/app-footer/index';
import { AppSidebarFooterComponent } from './shared/app-sidebar-footer/index';
import { AppSidebarFormComponent } from './shared/app-sidebar-form/index';
import { AppSidebarHeaderComponent } from './shared/app-sidebar-header/index';
import { AppSidebarMinimizerComponent } from './shared/app-sidebar-minimizer/index';
import { APP_SIDEBAR_NAV } from './shared/app-sidebar-nav/index';

/**********************************************************
DIRETIVAS
***********************************************************/
import { AsideToggleDirective, NAV_DROPDOWN_DIRECTIVES, ReplaceDirective, SIDEBAR_TOGGLE_DIRECTIVES } from './directives/index';
import { moment } from 'ngx-bootstrap/chronos/test/chain';
import { AppVerifyRouteService } from './shared/app-verify-route/app-verify-route.service';



@NgModule({
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    AppRoutingModule,
    BsDropdownModule.forRoot(),
    TabsModule.forRoot(),
    ToastrModule.forRoot(),
    ChartsModule,
    CommonModule,
    HttpClientModule,
    HttpModule,
    NgxPaginationModule,
    TooltipModule.forRoot(),
    BsDatepickerModule.forRoot(),
    ModalModule.forRoot(),
    NgSelectModule,
    FormsModule



  ],
  declarations: [
    AppComponent,
    NoAuthorizationComponent,
    AuthorizationComponent,
    AppHeaderComponent,
    AppSidebarComponent,
    AppBreadcrumbsComponent,
    AppAsideComponent,
    AppFooterComponent,
    AppSidebarFooterComponent,
    AppSidebarFormComponent,
    AppSidebarHeaderComponent,
    AppSidebarMinimizerComponent,
    AsideToggleDirective,
    NAV_DROPDOWN_DIRECTIVES,
    ReplaceDirective,
    SIDEBAR_TOGGLE_DIRECTIVES,
    APP_SIDEBAR_NAV
    /*...APP_CONTAINERS,
    ...APP_COMPONENTS,
    ...APP_DIRECTIVES*/
  ],
  providers: [
    { provide: LocationStrategy, useClass: HashLocationStrategy },
    HttpModule,
    GuardService,
    SessionService,
    StorageService,
    HttpService,
    GlobalService,
    UtilsService,
    Menu,
    AppSupportService,
    AppVerifyRouteService
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  bootstrap: [AppComponent]
})
export class AppModule { }
