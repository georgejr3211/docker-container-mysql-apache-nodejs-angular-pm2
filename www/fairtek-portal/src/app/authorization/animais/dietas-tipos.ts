/***********************************************************
COMPONENTS
***********************************************************/
import { Component, TemplateRef } from '@angular/core';
import { ToastrService } from 'ngx-toastr';

/**********************************************************
PROVIDERS
***********************************************************/
import { HttpService } from '../../globals/http';
import { GlobalService } from '../../globals/globals';
import { ShowService } from '../../shared/app-show/show.service'
import { BsModalService } from 'ngx-bootstrap/modal';
import { BsModalRef } from 'ngx-bootstrap/modal/bs-modal-ref.service';
import * as crypto from 'crypto-js';
import * as _ from 'underscore';
@Component({
    selector: 'app-dietas-tipos',
    templateUrl: 'dietas-tipos.html',
    styleUrls: ['dietas-tipos.scss'],
    providers: [ShowService]
})
export class DietasTiposComponent {

    permissoes;
    read: boolean = false;
    new: boolean = false;
    edit: boolean = false;
    delete: boolean = false;

    isBusyForm: boolean = false;
    isBusyList: boolean = false;
    exibeUpdate: boolean = false;
    itens = [];
    itensFilter = [];
    itemsPerPage = 10;
    qtd_dias_default = 120;

    modalRef: BsModalRef;
    loading: boolean = true;

    constructor(
        private _HttpService: HttpService,
        private _ToastrService: ToastrService,
        private GlobalService: GlobalService,
        private _ShowService: ShowService,
        private modalService: BsModalService

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
        //Permissões: read = 17, new = 18, edit = 19, delete = 20
        //BLOQUEIA TUDO
        if (this.permissoes.includes(17, 18, 19, 20) == false) {
            this.read = false;
            this.new = false;
            this.edit = false;
            this.delete = false;
        }

        //READ
        if (this.permissoes.includes(17)) {
            this.read = true;
        }
        //NEW
        if (this.permissoes.includes(18)) {
            this.new = true;
        }
        //EDIT
        if (this.permissoes.includes(19)) {
            this.edit = true
        }
        //DELETE
        if (this.permissoes.includes(20)) {
            this.delete = true;
        }
    }

    /************
    POST
    *************/
    postForm(form) {


        //VERIFICA CAMPOS PREENCHIDOS
        if (form.value.nome == null || form.value.nome == ''
            || form.value.qtd_dias == null || form.value.qtd_dias == ''
        ) {
            return this._ToastrService.error('Preencha todos os campos corretamente', 'Erro!');

        } else {

            //BLOQUEANDO BOTAO DURANTE REQUEST
            this.isBusyForm = true;

            this._HttpService.JSON_POST('/tipos-dietas', form.value, false, true)
                .then(
                    res => {
                        this.getItens();
                        this.isBusyForm = false;
                        this._ShowService.showInserir()
                        if (res.json().message === 'erro') return this._ToastrService.error('Já existe um Tipo de Dieta com esse nome.', 'Erro!');
                        else return this._ToastrService.success(res.json().message);
                    },
                    error => {
                        this.isBusyForm = false;
                        return this._ToastrService.error(error.json().message);
                    }
                )

        }
    }

    /************
     PUT
    *************/
    putForm(form) {

        //VERIFICA CAMPOS PREENCHIDOS
        if (form.value.nome == null || form.value.nome == ''
            || form.value.qtd_dias == null || form.value.qtd_dias == ''
        ) {
            return this._ToastrService.error('Preencha todos os campos corretamente', 'Erro!');

        } else {

            //BLOQUEANDO BOTAO DURANTE REQUEST
            this.isBusyForm = true;

            this._HttpService.JSON_PUT(`/tipos-dietas/${this.GlobalService.getItem().id}`, form.value, false, true)
                .then(
                    res => {
                        this.getItens();
                        this.isBusyForm = false;
                        this.exibeUpdate = false;
                        this._ShowService.showEditar()
                        return this._ToastrService.success(res.json().message);
                    },
                    error => {
                        this.isBusyForm = false;
                        this.exibeUpdate = false;
                        return this._ToastrService.error(error.json().message);
                    }
                )

        }
    }

    /************
     GET
    *************/
    getItens() {
        this.loading = true;
        this.isBusyList = true;
        this._HttpService.JSON_GET('/tipos-dietas', false, true)
            .then(
                res => {
                    this.loading = false;
                    this.itensFilter = res.json().data;
                    this.isBusyList = false;
                    return this.itens = res.json().data;

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
        let res = confirm("Tem certeza que deseja excluir o tipo de dieta?");
        if (res) {

            this._HttpService.JSON_DELETE(`/tipos-dietas/${this.GlobalService.getItem().id}`, false, true)
                .then(
                    res => {
                        this.getItens();
                        return this._ToastrService.success(res.json().message);
                    },
                    error => {
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
                return d.nome.toLowerCase().indexOf(val) !== -1 || !val;
            });

            this.itensFilter = filtro;
        }

    }
}