/***********************************************************
COMPONENTS
***********************************************************/
import { Component, TemplateRef, Output } from '@angular/core';
import { ToastrService } from 'ngx-toastr';

/**********************************************************
PROVIDERS
***********************************************************/
import { HttpService } from '../../globals/http';
import { GlobalService } from '../../globals/globals';
import { ActivatedRoute } from '@angular/router';
import * as _ from 'underscore';
import * as crypto from 'crypto-js';

@Component({
    selector: 'app-transferencia-baia',
    templateUrl: 'transferencia-baia.html',
    styleUrls: ['transferencia-baia.scss'],
  })
  export class TransferenciaBaiaComponent {
    //ACL
    permissoes;
    read: boolean = false;
    new: boolean = false;

    //SHOW
    isBusyForm: boolean = false;
    newBaia: boolean = false;
    showLista: boolean = true;
    showAnimal: boolean = false;
    showGrupo: boolean = false;
    itemsPerPage = 10;

    //COMBOS
    itens = [];
    itensFilter = [];
    comboAnimais: any = [];
    selectAnimais = 0;
    comboBaiasGeral: any = [];
    selectBaiasGeral = 0;
    comboBaiasTransferencia: any = [];
    selectBaiasTransferencia = 0
    comboGrupoBaia: any = [];
    selectComboGrupoBaia = 0;

    //VALUES
    simplesTatuagem;
    simplesChip;
    simplesBaia;
    usuario;
    constructor(
        private _HttpService: HttpService,
        private _ToastrService: ToastrService,
        private GlobalService: GlobalService    
      ) {
        
      }

      ngOnInit() {
        this.getItens();
        /*******
        * DESCRIPTANDO E OBTENDO AS PERMISSÕES DO USUÁRIO
        * ******* */
        var decrypt = "myencrypttext"
        var user_data = localStorage.getItem('r');
        var user_decrypt = crypto.AES.decrypt(user_data, decrypt)
        var user_data_decrypt = user_decrypt.toString(crypto.enc.Utf8);
        this.usuario = localStorage.getItem('user')
        var group = user_data_decrypt.split("|/|");
        group = group[1];
    
        this._HttpService.JSON_GET(`/grupo-usuarios/busca/permissions/${group}`, false, true)
          .then(
            res => {
              this.permissoes = _.pluck(res.json(), 'tb_acl_regras_id');
              this.fACL();
            }
          )
      }
    
      fACL() {
        //Permissões: read = 100, new = 101
        //BLOQUEIA TUDO
        if(this.permissoes.includes(100,101) == false){
          this.read = false;
          this.new = false;
        }
      
        //READ
        if(this.permissoes.includes(100)){
          this.read = true;
        }
        //NEW
        if(this.permissoes.includes(101)){
          this.new = true;
        }
      }

      //FUNÇÕES DE VISUALIZAÇÃO DA PÁGINA
      showTransferenciaLista(){
        this.showLista = true;
        this.showAnimal = false;
        this.showGrupo = false;
      }

      showTransferenciaAnimal() {
        this.showLista = false;
        this.showAnimal = true;
        this.showGrupo = false;
        this.getComboAnimais();
      }

      showTransferenciaGrupo() {
        this.showLista = false;
        this.showAnimal = false;
        this.showGrupo = true;
      }

      //COMBOS DA PÁGINA (GET)
      getItens(){
        this._HttpService.JSON_GET('/animais-transferencias-baias', false, true)
          .then(
            res => {
              this.itensFilter = res.json()
              return this.itens = res.json();
            },
            error => {
              return this._ToastrService.error(error.json().message);
            }
          )
      }

      getComboAnimais(){
        this._HttpService.JSON_GET('/animais-transferencias-baias/transferencia/animal', false, true)
          .then(
            res => {
              this.comboAnimais = res.json();
              return this.comboAnimais 
            },
            error => {
              return this._ToastrService.error(error.json().message);
            }
          )
      }

      getComboBaiasGeral() {
        this._HttpService.JSON_GET('/animais-transferencias-baias/baias/geral', false, true)
          .then(
            res => {
              console.log("combo: ", this.comboBaiasGeral)
              this.comboBaiasGeral = res.json();
              console.log("combo: ", this.comboBaiasGeral)
              return this.comboBaiasGeral;
            },
            error => {
              return this._ToastrService.error(error.json().message);
            }
          )
      }

      getComboBaiasTransferencia($event) {
        if(_.size($event) < 3){
          var baia_id = $event.baia_id.toString();
          this.getComboAnimaisBaia(baia_id)
        }else{
          var baia_id = $event.animal_baia.toString();
        }
        
        this._HttpService.JSON_GET(`/animais-transferencias-baias/baias/transferencia/${baia_id}`, false, true)
          .then(
            res => {
              this.comboBaiasTransferencia = res.json();
              this.newBaia = true;
              return this.comboBaiasTransferencia 
            },
            error => {
              return this._ToastrService.error(error.json().message);
            }
          )
      }

      getComboAnimaisBaia(baia_id){
        this._HttpService.JSON_GET(`/animais-transferencias-baias/animais/baia/${baia_id}`, false, true)
          .then(
            res => {
              this.comboGrupoBaia = res.json();
              return this.comboGrupoBaia 
            },
            error => {
              return this._ToastrService.error(error.json().message);
            }
          )
      }

    //FUNÇÕES ESPECIFICAS DA PÁGINA
    getDadosAnimal($event){
      let animal = $event;
      this.simplesTatuagem = animal.animal_tatuagem;
      this.simplesChip = animal.chip_num;
      this.simplesBaia = animal.baia_nome;      
    }

    cleanDadosAnimal(){
      this.simplesTatuagem = '';
      this.simplesChip = '';
      this.simplesBaia = ''; 
    }

    cleanComboGrupo(){
      this.comboGrupoBaia = null
    }

    removerAnimal(x) {
      let index = _.findLastIndex(this.comboGrupoBaia, {
        'animal_brinco': this.GlobalService.getItem()
      });
      this.comboGrupoBaia.splice(index, 1);
    }

    //POST
    postForm(form) {
      var formUsuario = JSON.parse(this.usuario)

      var obj = {
        animal_id: form.value.animal_id,
        nova_baia: form.value.nova_baia,
        usuario_nome: formUsuario.nome,
        usuario_email: formUsuario.email
      }

      if (form.value.animal_id == null || form.value.animal_id == ''
      || form.value.nova_baia == null || form.value.nova_baia == '') {
        return this._ToastrService.error('Preencha todos os campos corretamente', 'Erro!')
      }else {
        //BLOQUEANDO BOTAO DURANTE REQUEST
        this.isBusyForm = !this.isBusyForm;
        this._HttpService.JSON_POST('/animais-transferencias-baias', obj, false, true)
          .then(
            res => {
              this.showTransferenciaLista();
              this.getItens();
              this.cleanDadosAnimal()
              this.isBusyForm = !this.isBusyForm;
              return this._ToastrService.success(res.json().message);
            },
            error => {
              this.isBusyForm = false;
              return this._ToastrService.error(error.json().message);
            }
          )
  
      }
    }

    /************
  POST GRUPO
  *************/
 postGrupoForm(form) {
  form.value.comboGrupoBaia = this.comboGrupoBaia;
  var formUsuario = JSON.parse(this.usuario)
  for(var i = 0; i < this.comboGrupoBaia.length; i++){
    this.comboGrupoBaia[i] = {...this.comboGrupoBaia[i], nova_baia: form.value.nova_baia, usuario_nome: formUsuario.nome, usuario_email: formUsuario.email};
  }
  //VERIFICA SE O ARRAY NÃO ESTÁ VAZIO
  if (form.value.comboGrupoBaia == null || form.value.comboGrupoBaia == ''
  || form.value.nova_baia == null || form.value.nova_baia == '') {
    return this._ToastrService.error('Preencha todos os campos corretamente', 'Erro!');

  } else {
    //BLOQUEANDO BOTAO DURANTE REQUEST
    this.isBusyForm = !this.isBusyForm;
    console.log(form.value);
    this._HttpService.JSON_POST('/animais-transferencias-baias/extra/combo/cadastra/grupo', form.value.comboGrupoBaia, false, true)
      .then(
        res => {
          this.showTransferenciaLista();
          this.getItens();
          this.cleanComboGrupo();
          this.isBusyForm = !this.isBusyForm;
          return this._ToastrService.success(res.json().message);
        },
        error => {
          this.isBusyForm = false;
          return this._ToastrService.error(error.json().message);
        }
      )

      }
}

 /************
  FILTRA
  *************/
 searchFilter(event) {
  let val = event.target.value.toLowerCase();
  if (val.length === 0) {
    this.itensFilter = this.itens;
  } else {
    let filtro = this.itensFilter.filter(function (d) {
      return (d.brinco.toLowerCase().indexOf(val) !== -1 || !val) || (d.tatuagem.toLowerCase().indexOf(val) !== -1)
      || (d.chip.toLowerCase().indexOf(val) !== -1 || !val)
    });
    this.itensFilter = filtro;
  }

}
  
}