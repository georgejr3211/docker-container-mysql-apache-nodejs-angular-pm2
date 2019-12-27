import { Component, TemplateRef, ViewChild } from '@angular/core';

import { HttpService } from './../../globals/http';
import { UtilsService } from './../../globals/utils';
import { GlobalService } from '../../globals/globals';

import { ShowService } from './../../shared/app-show/show.service';
import { ToastrService } from 'ngx-toastr';
import { BsModalService } from 'ngx-bootstrap/modal';
import { BsModalRef } from 'ngx-bootstrap/modal/bs-modal-ref.service';

import * as _ from 'underscore';
import * as crypto from 'crypto-js';


@Component({
    selector: 'app-backup-local',
    templateUrl: 'backup-local.html',
    styleUrls: ['backup-local.scss'],
    providers: [ShowService]
})
export class BackupLocalComponent {
    @ViewChild('carregando') carregando;

    permissoes;
    read: boolean = false;
    new: boolean = false;
    restore_rule: boolean = false;

    passwd;
    conf_passwd;
    arquivo;

    versao_sist;
    recuperar: boolean = false;

    novoB: boolean = false;
    showList: boolean = true;
    itensPendrive = [];
    itens = [];
    itensFilter = [];
    itemsPerPage = 10;
    nome_backup;
    alert = 0;
    isBusyForm = false;
    modal: BsModalRef;
    itensFilterDirectory: any = [];

    loading: boolean = true;

    constructor(
        private _Http: HttpService,
        private _ShowService: ShowService,
        private _ToastrService: ToastrService,
        private _modalService: BsModalService,
        private _utilService: UtilsService,
        private _GlobalService: GlobalService
    ) { }

    ngOnInit() {
        this.listArquivosPendrive();
        this.listArquivosDirectory();
        /*******
        * DESCRIPTANDO E OBTENDO AS PERMISSÕES DO USUÁRIO
        * ******* */
        var decrypt = "myencrypttext"
        var user_data = localStorage.getItem('r');
        var user_decrypt = crypto.AES.decrypt(user_data, decrypt)
        var user_data_decrypt = user_decrypt.toString(crypto.enc.Utf8);

        var group = user_data_decrypt.split("|/|");
        group = group[1];

        this._Http.JSON_GET(`/grupo-usuarios/busca/permissions/${group}`, false, true)
            .then(
                res => {
                    this.permissoes = _.pluck(res.json(), 'tb_acl_regras_id');
                    this.fACL();
                }
            )
        this.getSystemVersion();
    }

    fACL() {
        //Permissões: read = 65, new = 66
        //BLOQUEIA TUDO
        if (this.permissoes.includes(65, 66, 97) == false) {
            this.read = false;
            this.new = false;
            this.restore_rule = false;
        }
        //READ
        if (this.permissoes.includes(65)) {
            this.read = true;
        }
        //NEW
        if (this.permissoes.includes(66)) {
            this.new = true;
        }
        //RECUPERACAO
        if (this.permissoes.includes(97)) {
            this.restore_rule = true;
        }
    }

    showRecoverScreen() {
        this.showList = !this.showList
        this.recuperar = !this.recuperar;
    }

    showNewScreen() {
        this.showList = !this.showList
        this.novoB = !this.novoB;
    }

    listArquivosPendrive() {
        this.loading = true;
        this._Http.JSON_GET('/utils/backup-local', false, true).then(
            res => {

                if (res.json().length >= 0) {
                    if (res.json().length == 0) {
                        this.alert = 1;
                        this.loading = false;
                        return this._ToastrService.info('Nenhum Backup foi realizado.');
                    }
                    else {
                        this.itensFilter = res.json();
                        this.alert = 0;
                        this.loading = false;
                        return this.itensPendrive = res.json();
                    }
                }
                else {
                    this.alert = 2;
                    this.loading = false;
                    return this._ToastrService.error(res.json().message);
                }

            }
        )
    }


    backupLocal() {
        this._utilService.loadShow();
        var user = JSON.parse(localStorage.getItem('user'));
        var configs = {
            pass: this.passwd,
            user: user.email
        }
        this._Http.JSON_POST(`/utils/backup-local/novo`, configs, false, true).then(
            res => {
                this.listArquivosPendrive();
                this._ShowService.showInserir();

                if (res.json().cod == 200) {
                    this._utilService.loadHide();
                    this._ToastrService.success(res.json().message);
                }
                else if (res.json().cod == 500) {
                    this._utilService.loadHide();
                    this._ToastrService.error(res.json().message);
                }

            }
        ).catch(
            error => {
                if (error.json().cod == 500) {
                    this._utilService.loadHide();
                    this._ToastrService.error(error.json().message);
                }
                this._utilService.loadHide();
            }
        );
    }

    configBackup() {
        this._utilService.loadShow();
        this._Http.JSON_GET(`/utils/config/backup-local`, false, true)
            .then(
                res => {
                    if (res.json().message === 'success') {
                        this.listArquivosPendrive();
                        this._utilService.loadHide();
                    }
                    else {
                        this._utilService.loadHide();
                        this.itensFilter = [];
                        this.alert = 2;
                        return this.itens = [];

                    }
                })
    }

    listArquivosDirectory() {
        this.loading = true;
        this._Http.JSON_GET('/utils/restore/backup', false, true).then(
            res => {
                if (res.json().length >= 0) {
                    if (res.json().length == 0) {
                        this.loading = false;
                        return this._ToastrService.info('Nenhum Backup foi realizado.');
                    }
                    else {
                        this.itensFilterDirectory = res.json();
                        this.loading = false;
                        return this.itens = res.json();
                    }
                }
                else {
                    this.loading = false;
                    return this._ToastrService.error(res.json().message);
                }

            }
        )
    }
    restoreBackup() {

        if (this.passwd === this.conf_passwd && this.passwd != undefined) {

            var user = JSON.parse(localStorage.getItem('user'));
            var configs = {
                nome_arq: this.arquivo,
                pass: this.passwd,
                user: user.email
            }
            this._utilService.loadShow();
            this._Http.JSON_POST('/utils/restore/backup', configs, false, true)
                .then(
                    res => {

                        if (res.json().cod == 200) {
                            this._ToastrService.success(res.json().message);
                            this._GlobalService.getLogout();

                        }
                        else if (res.json().cod == 500) {
                            this._ToastrService.error(res.json().message);
                        }
                        this._utilService.loadHide();
                    }
                ).catch(
                    error => {
                        this._utilService.loadHide();
                    }
                )
        }
        else {
            this._ToastrService.error("As senhas digitadas não conferem.");
        }

    }

    getSystemVersion() {
        this._Http.JSON_GET(`/utils/version/system`, false, true)
            .then(
                res => {
                    this.versao_sist = res.json().version;
                }
            )
            .catch(
                error => {
                    return this._ToastrService.error(error.json().message);
                }
            )
    }


    removeLocal() {
        this._utilService.loadShow();
        this._Http.JSON_GET(`/utils/remove/storage`, false, true)
            .then(
                res => {
                    if (res.json().message === 'success') {
                        this.listArquivosPendrive();
                        this._utilService.loadHide();
                    }
                    else {
                        this._utilService.loadHide();
                        this.itensFilter = [];
                        this.alert = 2;
                        return this.itens = [];

                    }
                })

    }
    carregarModal(template: TemplateRef<any>) {
        this.modal = this._modalService.show(template,
            Object.assign({}, { class: 'modalCarrregar' }));

    }

    openModalWithClass(template: TemplateRef<any>, arquivo) {
        this.arquivo = arquivo;
        this.modal = this._modalService.show(
            template,
            Object.assign({}, { class: 'gray modal-lg' })
        )
    }
    /************
     FILTRA
    *************/
    searchFilter(event) {
        let val = event.target.value.toLowerCase();

        if (this.recuperar) {

            if (val.length === 0) {

                this.itensFilterDirectory = this.itens;
            } else {

                let filtro = this.itensFilterDirectory.filter(function (d) {
                    return d.name.toLowerCase().indexOf(val) !== -1 || !val;
                });

                this.itensFilterDirectory = filtro;
            }
        }
        else if (this.showList) {

            if (val.length === 0) {
                this.itensFilter = this.itensPendrive;

            } else {

                let filtro = this.itensFilter.filter(function (d) {
                    return d.name.toLowerCase().indexOf(val) !== -1 || !val;
                });

                this.itensFilter = filtro;
            }

        }


    }

}