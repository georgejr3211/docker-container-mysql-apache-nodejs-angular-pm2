/***********************************************************
COMPONENTS
***********************************************************/
import { Component, OnInit, ViewChild } from '@angular/core';
import { ToastrService } from 'ngx-toastr';

/**********************************************************
PROVIDERS
***********************************************************/
import { HttpService } from '../../globals/http';
import { GlobalService } from '../../globals/globals';

@Component({
  selector: 'app-configuracoes',
  templateUrl: 'configuracoes.html',
  styleUrls: ['configuracoes.scss']
})
export class CalendarioConfigComponent implements OnInit {

  ngOnInit(){
    
  }

}