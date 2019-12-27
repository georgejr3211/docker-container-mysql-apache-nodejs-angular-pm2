/***********************************************************
COMPONENTS
***********************************************************/
import { Component, OnInit } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { ActivatedRoute } from '@angular/router';

/**********************************************************
PROVIDERS
***********************************************************/
import { HttpService } from '../../globals/http';
import { GlobalService } from '../../globals/globals';

@Component({
  selector: 'app-dieta-dias',
  templateUrl: 'dieta-dias.html',
  styleUrls: ['dieta-dias.scss']
})
export class DietasDiasComponent implements OnInit {

  // itemCarregado = [];

  // isBusyForm: boolean = false;
  // isBusyList: boolean = false;
  // exibeUpdate: boolean = false;
  // itens = [];
  // itensFilter = [];
  // itemsPerPage = 10;

  // constructor(
  //   private _HttpService: HttpService,
  //   private _ToastrService: ToastrService,
  //   private GlobalService: GlobalService,
  //   private ActivatedRoute: ActivatedRoute
  // ) {}

   ngOnInit() {

  //   this.ActivatedRoute.params.subscribe(params => {
  //     this._HttpService.JSON_GET(`/dietas/${params.id}`, false, true)
  //     .then(
  //       res => {

  //         this.itemCarregado = res.json();
  //         return this.getItens();
  //       },
  //       error => {
  //         return this._ToastrService.error(error.json().message);
  //       }
  //     )
  //   })

   }

  // /************
  // POST
  // *************/
  // postForm(form) {
  //   console.log('dados do form',form);

  //   form.value.dietas_id = this.itemCarregado[0].id;
    
  //   //VERIFICA CAMPOS PREENCHIDOS
  //   if (form.value.dia == null || form.value.dia == '' ||
  //     form.value.qr == null || form.value.qr == '' ||
  //     form.value.qtd == null || form.value.qtd == '') {
  //       return this._ToastrService.error('Preencha todos os campos corretamente', 'Erro!');

  //   } else {

  //     //BLOQUEANDO BOTAO DURANTE REQUEST
  //     this.isBusyForm = true;
      
  //     this._HttpService.JSON_POST('/dietas-dias', form.value, false, true)
  //     .then(
  //       res => {
  //         this.getItens();
  //         this.isBusyForm = false;
  //         return this._ToastrService.success(res.json().message);
  //       },
  //       error =>{
  //         this.isBusyForm = false;
  //         return this._ToastrService.error(error.json().message);
  //       }
  //     )

  //   }
  // }

  // /************
  // PUT
  // *************/
  // putForm(form) {
    
  //   form.value.dietas_id = this.itemCarregado[0].id;
    
  //   //VERIFICA CAMPOS PREENCHIDOS
  //   if (form.value.dia == null || form.value.dia == '' ||
  //     form.value.qr == null || form.value.qr == '' ||
  //     form.value.qtd == null || form.value.qtd == '') {
  //       return this._ToastrService.error('Preencha todos os campos corretamente', 'Erro!');

  //   } else {

  //     //BLOQUEANDO BOTAO DURANTE REQUEST
  //     this.isBusyForm = true;
      
  //     this._HttpService.JSON_PUT(`/dietas-dias/${this.GlobalService.getItem().id}`, form.value, false, true)
  //     .then(
  //       res => {
  //         this.getItens();
  //         this.isBusyForm = false;
  //         this.exibeUpdate = false;
  //         return this._ToastrService.success(res.json().message);
  //       },
  //       error =>{
  //         this.isBusyForm = false;
  //         this.exibeUpdate = false;
  //         return this._ToastrService.error(error.json().message);
  //       }
  //     )

  //   }
  // }

  // /************
  // GET
  // *************/
  // getItens() {
  //   this.isBusyList = true;
  //   this._HttpService.JSON_GET(`/dietas-dias/dias/list/${this.itemCarregado[0].id}`, false, true)
  //   .then(
  //       res => {
  //         this.itensFilter = res.json();
  //         this.isBusyList = false;
  //         return this.itens = res.json();
  //       },
  //       error =>{
  //         this.isBusyList = false;
  //         return this._ToastrService.error(error.json().message);
  //       }
  //     )

  // }

  // /************
  // DELETE
  // *************/
  // deleteItem() {
  //   let res = confirm("Tem certeza que deseja excluir o dia da dieta?");
  //   if(res){

  //     this._HttpService.JSON_DELETE(`/dietas-dias/${this.GlobalService.getItem().id}/${this.GlobalService.getItem().tb_dietas_id}`, false, true)
  //     .then(
  //       res => {
  //         this.getItens();
  //         return this._ToastrService.success(res.json().message);
  //       },
  //       error =>{
  //         return this._ToastrService.error(error.json().message);
  //       }
  //     )

  //   }

  // }

  // /************
  // FILTRA
  // *************/
  // searchFilter(event) {
  //   let val = event.target.value.toLowerCase();

  //   if(val.length === 0){
  //     this.itensFilter = this.itens;
    
  //   }else{

  //     let filtro = this.itensFilter.filter(function(d) {
  //       return d.dia.toLowerCase().indexOf(val) !== -1 || !val;
  //     });

  //     this.itensFilter = filtro;
  //   }

  // }

}
