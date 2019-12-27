/***********************************************************
COMPONENTS
***********************************************************/
import { Component } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import * as _ from 'underscore';

/**********************************************************
PROVIDERS
***********************************************************/
import { HttpService } from '../../../globals/http';
import { GlobalService } from '../../../globals/globals';
import { ShowService } from '../../../shared/app-show/show.service'
import { IfObservable } from 'rxjs/observable/IfObservable';

import * as crypto from 'crypto-js';

@Component({
  selector: 'app-grupo-user',
  templateUrl: 'grupo.usuarios.html',
  styleUrls: ['grupo.usuarios.scss'],
  providers: [ShowService]
})

export class GrupoUsuariosComponent {

  loading: boolean = true;

  permissoes;
  read: boolean = false;
  new: boolean = false;
  edit: boolean = false;
  delete: boolean = false;

  showNew: boolean = false;
  isBusyForm: boolean = false;
  isBusyList: boolean = false;
  exibeUpdate: boolean = false;
  itens = [];
  itensFilter = [];
  itemsPerPage = 10;
  validaEmail = [];
  flag_admin: boolean = false;

  regras = [
    { regra: 1, valor: false }, /***Visualizar Dashboard* */

    { regra: 2, valor: false }, /***Visualizar Supervisorio* */

    /****Notificacoes* */
    { regra: 3, valor: false }, /***Visualizar Notificacoes* */
    { regra: 4, valor: false }, /***Editar  Notificacoes* */

    /***LOCAL BACKUP* */
    { regra: 65, valor: false }, /***Visualizar* */
    { regra: 66, valor: false }, /***Criar * */

    /***CLOUD BACKUP* */
    { regra: 67, valor: false }, /***Visualizar**/
    { regra: 68, valor: false }, /***Criar **/

    /***ASSIS. TEC.* */
    { regra: 69, valor: false }, /***Visualizar**/
    { regra: 70, valor: false }, /***Criar **/

    /***TIPO NOTIF.* */
    { regra: 73, valor: false }, /***Visualizar* */
    { regra: 74, valor: false }, /***Criar * */
    { regra: 75, valor: false }, /***Editar * */
    { regra: 76, valor: false }, /***Deletar * */

    /***DOSADORES * */
    { regra: 77, valor: false }, /***Visualizar* */
    { regra: 78, valor: false }, /***Criar * */
    { regra: 79, valor: false }, /***Editar * */
    { regra: 80, valor: false }, /***Deletar * */

    /***CALIBRACAO * */
    { regra: 71, valor: false }, /***Visualizar**/
    { regra: 72, valor: false }, /***Criar **/

    /***PRODUTOR * */
    { regra: 81, valor: false }, /***Visualizar* */
    { regra: 82, valor: false }, /***Criar * */
    { regra: 83, valor: false }, /***Editar * */
    { regra: 84, valor: false }, /***Deletar * */

    /***USUARIOS * */
    { regra: 89, valor: false }, /***Visualizar* */
    { regra: 90, valor: false }, /***Criar * */
    { regra: 91, valor: false }, /***Editar * */
    { regra: 92, valor: false }, /***Deletar * */

    /***GRUPO DE USURIOS * */
    { regra: 93, valor: false }, /***Visualizar* */
    { regra: 94, valor: false }, /***Criar * */
    { regra: 95, valor: false }, /***Editar * */
    { regra: 96, valor: false }, /***Deletar * */

    /***GERENTES * */
    { regra: 5, valor: false }, /***Visualizar* */
    { regra: 6, valor: false }, /***Criar * */
    { regra: 7, valor: false }, /***Editar * */
    { regra: 8, valor: false }, /***Deletar * */

    /***OPERADORES * */
    { regra: 9, valor: false }, /***Visualizar* */
    { regra: 10, valor: false }, /***Criar * */
    { regra: 11, valor: false }, /***Editar * */
    { regra: 12, valor: false }, /***Deletar * */

    /***NUTRICIONISTAS * */
    { regra: 13, valor: false }, /***Visualizar* */
    { regra: 14, valor: false }, /***Criar * */
    { regra: 15, valor: false }, /***Editar * */
    { regra: 16, valor: false }, /***Deletar * */

    /***TIPOS DIETAS * */
    { regra: 17, valor: false }, /***Visualizar* */
    { regra: 18, valor: false }, /***Criar * */
    { regra: 19, valor: false }, /***Editar * */
    { regra: 20, valor: false }, /***Deletar * */

    /***VETERINARIOS * */
    { regra: 21, valor: false }, /***Visualizar* */
    { regra: 22, valor: false }, /***Criar * */
    { regra: 23, valor: false }, /***Editar * */
    { regra: 24, valor: false }, /***Deletar * */

    /***MOT. DESATIVAÇÃO * */
    { regra: 25, valor: false }, /***Visualizar* */
    { regra: 26, valor: false }, /***Criar * */
    { regra: 27, valor: false }, /***Editar * */
    { regra: 28, valor: false }, /***Deletar * */

    /***GRANJAS * */
    { regra: 29, valor: false }, /***Visualizar* */
    { regra: 30, valor: false }, /***Criar * */
    { regra: 31, valor: false }, /***Editar * */
    { regra: 32, valor: false }, /***Deletar * */

    /***GALPOES * */
    { regra: 33, valor: false }, /***Visualizar* */
    { regra: 34, valor: false }, /***Criar * */
    { regra: 35, valor: false }, /***Editar * */
    { regra: 36, valor: false }, /***Deletar * */

    /***BAIAS * */
    { regra: 37, valor: false }, /***Visualizar* */
    { regra: 38, valor: false }, /***Criar * */
    { regra: 39, valor: false }, /***Editar * */
    { regra: 40, valor: false }, /***Deletar * */

    /***CHIPS * */
    { regra: 41, valor: false }, /***Visualizar* */
    { regra: 42, valor: false }, /***Criar * */
    { regra: 43, valor: false }, /***Editar * */
    { regra: 44, valor: false }, /***Deletar * */

    /***ESCORES * */
    { regra: 45, valor: false }, /***Visualizar* */
    { regra: 46, valor: false }, /***Criar * */
    { regra: 47, valor: false }, /***Editar * */
    { regra: 48, valor: false }, /***Deletar * */

    /***GENETICA * */
    { regra: 49, valor: false }, /***Visualizar* */
    { regra: 50, valor: false }, /***Criar * */
    { regra: 51, valor: false }, /***Editar * */
    { regra: 52, valor: false }, /***Deletar * */

    /***DIETAS * */
    { regra: 53, valor: false }, /***Visualizar* */
    { regra: 54, valor: false }, /***Criar * */
    { regra: 55, valor: false }, /***Editar * */
    { regra: 56, valor: false }, /***Deletar * */

    /***ANIMAIS * */
    { regra: 57, valor: false }, /***Visualizar* */
    { regra: 58, valor: false }, /***Criar * */
    { regra: 59, valor: false }, /***Editar * */
    { regra: 60, valor: false }, /***Deletar * */

    /***MOVIMENTACOES * */
    { regra: 61, valor: false }, /***Visualizar* */
    { regra: 62, valor: false }, /***Criar * */
    { regra: 63, valor: false }, /***Editar * */
    { regra: 64, valor: false }, /***Deletar * */

    /***RECUPERAÇÃO DE BACKUP * */
    { regra: 97, valor: false }, /***Restaurar* */

    /***SUPORTE * */
    { regra: 98, valor: false },
    { regra: 99, valor: false },

      /***TRANSFERÊNCIAS * */
    { regra: 100, valor: false }, /***Visualizar* */
    { regra: 101, valor: false }, /***Criar * */
 
  ];




  constructor(
    private _HttpService: HttpService,
    private _ToastrService: ToastrService,
    private GlobalService: GlobalService,
    private _ShowService: ShowService
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
    //Permissões: read = 93, new = 94, edit = 95, delete = 96
    //BLOQUEIA TUDO
    if (this.permissoes.includes(93, 94, 95, 96) == false) {
      this.read = false;
      this.new = false;
      this.edit = false;
      this.delete = false;
    }

    //READ
    if (this.permissoes.includes(93)) {
      this.read = true;
    }
    //NEW
    if (this.permissoes.includes(94)) {
      this.new = true;
    }
    //EDIT
    if (this.permissoes.includes(95)) {
      this.edit = true
    }
    //DELETE
    if (this.permissoes.includes(96)) {
      this.delete = true;
    }
  }

  /************
  POST
  *************/
  postForm(form) {
    var permissions = _.where(this.regras, {
      'valor': true
    })

    if (form.value.ativo == true) form.value.ativo = 1
    else if (form.value.ativo == false) form.value.ativo = 0
    //VERIFICA CAMPOS PREENCHIDOS

    if (form.value.nome == null || form.value.nome == '') {
      return this._ToastrService.error('Preencha todos os campos corretamente', 'Erro!');

    } else {
      form.value.permissions = permissions;
      console.log(form.value)
      this._HttpService.JSON_POST('/grupo-usuarios', form.value, false, true).then(
        res => {
          this.getItens();
          this.isBusyForm = false;
          this._ShowService.showInserir();
          if (res.json().message === "erro") return this._ToastrService.error('Já existe um grupo de usuários com este nome.');
          else return this._ToastrService.success(res.json().message);
        },
        error => {
          this.isBusyForm = false;
          return this._ToastrService.error(error.json().message);
        }

      )
    }
  }


  /*****
  * BUSCA AS PERMISSOES DO GRUPO SELECIONADO
  * ** */
  getPermissionsEdit(item) {
    this.cleanPermissions();
    this._HttpService.JSON_GET(`/grupo-usuarios/busca/permissions/${item}`, false, true)
      .then(
        res => {
          let permissoes = _.pluck(res.json(), 'tb_acl_regras_id');
          for (var i = 0; i < this.regras.length; i++) {
            if (_.contains(permissoes, this.regras[i].regra)) {
              this.regras[i].valor = true;
            }
          }
          this._ShowService.showEditar();
        }
      )
  }

  /************
   PUT
  *************/
  putForm(form) {
    var permissoes;
    form.value.permissoes = _.where(this.regras, {
      'valor': true
    });
    console.log("form: ", form.value)
    this._HttpService.JSON_PUT(`/grupo-usuarios/atualiza/permissoes/${this.GlobalService.getItem().id}`, form.value, false, true)
      .then(
        res => {
          this.getItens();
          this.isBusyForm = false;
          this._ShowService.showEditar();
          if (res.json().message === "erro") return this._ToastrService.error('Já existe um grupo de usuários com este nome.');
          else return this._ToastrService.success(res.json().message);
        },
        error => {
          this.isBusyForm = false;
          return this._ToastrService.error(error.json().message);
        }
      )

  }

  /****
  * LIMPA VALORES DAS PERMISSOES
  * ** */
  cleanPermissions() {
    this.regras.forEach(function (regra, index) {
      regra.valor = false;
    });
  }

  /****
  * SET TRUE PARA VALORES DAS PERMISSOES
  * ** */

  setAllPermissions() {
    this.regras.forEach(function (regra, index) {
      regra.valor = !regra.valor;
    });
  }

  /************
  GET
  *************/
  getItens() {
    this.loading = true;
    this.isBusyList = true;
    this._HttpService.JSON_GET('/grupo-usuarios', false, true).then(
      res => {
        this.itensFilter = res.json();
        this.isBusyList = false;
        this.loading = false;
        return this.itens = res.json();
      },
      error => {
        this.loading = false;
        this.isBusyList = false;
        return this._ToastrService.error(error.json().message);
      }
    )

  }

  /************
  DELETE
  *************/
  deleteItem() {
    let resp = confirm("Isso irá excluir todos os usuários vinculados ao Grupo. Tem certeza que deseja continuar?");
    if (resp) {
      this.isBusyList = true;
      this._HttpService.JSON_DELETE(`/grupo-usuarios/deleta-grupo/${this.GlobalService.getItem().id}`, false, true)
        .then(
          res => {
            this.getItens();
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
        return d.nome.toLowerCase().indexOf(val) !== -1 || !val;
      });

      this.itensFilter = filtro;
    }

  }

  /************
  RESETA SENHA
  *************/
  resetaSenha() {

  }


}