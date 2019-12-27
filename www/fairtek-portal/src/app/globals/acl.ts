
import { Injectable, EventEmitter } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { HttpService } from './http';

import * as _ from 'underscore';
import { Session } from 'protractor';

import { Menu } from './../_nav';
import { MenuInterface } from './menu';

import * as crypto from 'crypto-js';

@Injectable()
export class aclService {

    crypto = require('crypto');

    permissao_user = [];
    menuComplete: MenuInterface[] = [
        {
            name: 'Dashboard',
            url: '/home',
            icon: 'icon-chart',
            rules: [1],

        },
        {
            name: 'Supervisório',
            url: '/supervisorio',
            icon: 'icon-speedometer',
            rules: [2],

        },
        {
            name: 'Cadastros',
            url: '/',
            icon: 'icon-plus',
            rules: [5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 49, 50, 51, 52],

            children: [
                {
                    name: 'Gerentes',
                    url: '/gestao/gerentes',
                    icon: 'icon-people',
                    rules: [5, 6, 7, 8]
                },
                {
                    name: 'Operadores',
                    url: '/gestao/operadores',
                    icon: 'icon-people',
                    rules: [9, 10, 11, 12]
                },
                {
                    name: 'Nutricionistas',
                    url: '/gestao/nutricionistas',
                    icon: 'fa fa-spoon',
                    rules: [13, 14, 15, 16]
                },
                {
                    name: 'Tipos de Dietas',
                    url: '/dieta-tipos',
                    icon: 'icon-list',
                    rules: [17, 18, 19, 20]
                },
                {
                    name: 'Veterinários',
                    url: '/gestao/veterinarios',
                    icon: 'fa fa-medkit',
                    rules: [21, 22, 23, 24]
                },
                {
                    name: 'Genéticas',
                    url: '/gestao/geneticas',
                    icon: 'fa fa-flask',
                    rules: [49, 50, 51, 52]
                },
                {
                    name: 'Motivo Desativação',
                    url: '/desativacao',
                    icon: 'icon-ban',
                    rules: [25, 26, 27, 28]
                },

            ]
        },

        {
            name: 'Granja',
            url: '/',
            icon: 'icon-home',
            rules: [29, 30, 31, 32, 33, 34, 35, 36, 37, 38, 39, 40],

            children: [
                {
                    name: 'Granjas',
                    url: '/granjas',
                    icon: 'icon-home',
                    rules: [29, 30, 31, 32]
                },
                {
                    name: 'Galpões',
                    url: '/galpoes',
                    icon: 'icon-layers',
                    rules: [33, 34, 35, 36]
                },
                {
                    name: 'Baias',
                    url: '/baias',
                    icon: 'icon-grid',
                    rules: [37, 38, 39, 40]
                },
            ]
        },

        {
            name: 'Manejos',
            url: '/animais',
            icon: 'flaticon-money',
            rules: [41, 42, 43, 44, 45, 46, 47, 48, 53, 54, 55, 56, 57, 58, 59, 60, 61, 62, 63, 64, 100, 101],

            children: [
                {
                    name: 'Chipes',
                    url: '/chips',
                    icon: 'icon-puzzle',
                    rules: [41, 42, 43, 44]
                },
                {
                    name: 'Escores',
                    url: '/escores',
                    icon: 'icon-trophy',
                    rules: [45, 46, 47, 48]
                },
                {
                    name: 'Dietas',
                    url: '/dietas',
                    icon: 'fa fa-cutlery',
                    rules: [53, 54, 55, 56]
                },
                {
                    name: 'Animais',
                    url: '/animais',
                    icon: 'flaticon-money',
                    rules: [57, 58, 59, 60]
                },
                {
                    name: 'TransferenciaS',
                    url: '/transferencia-baia',
                    icon: 'fa fa-exchange',
                    rules: [100, 101]
                },
                {
                    name: 'Movimentações',
                    url: '/animais-movimentacoes',
                    icon: 'icon-refresh',
                    rules: [61, 62, 63, 64]
                }
            ]
        },
        {
            name: 'Estatísticas',
            url: '/',
            icon: 'icon-graph',
            rules: [1],

            children: [
                {
                    name: 'Não Alimentados',
                    url: '/relatorio-rotina',
                    icon: 'icon-layers',
                    rules: [1]
                },
                {
                    name: 'Alimentados',
                    url: '/relatorio-alimentados',
                    icon: 'icon-layers',
                    rules: [1]
                },
                {
                    name: 'Animais por Baia',
                    url: '/animais-localizacao',
                    icon: 'icon-layers',
                    rules: [1]
                },
                {
                    name: 'Consumo de Ração',
                    url: '/consumo-racao',
                    icon: 'icon-layers',
                    rules: [1]
                },
                {
                    name: 'Animais Área Externa',
                    url: '/animais-externa',
                    icon: 'icon-layers',
                    rules: [1]
                },
                /*{
                    name: 'Histórico Semanal',
                    url: '/historico-semanal',
                    icon: 'icon-layers',
                    rules: [1]
                },*/
                {
                    name: 'Animais por dias de Gestação',
                    url: '/animais-gestacao',
                    icon: 'icon-layers',
                    rules: [1]
                },
                {
                    name: 'Animais na Gestação',
                    url: '/animais-em-gestacao',
                    icon: 'icon-layers',
                    rules: [1]
                },
                {
                    name: 'Dietas Cadast.',
                    url: '/dietas-relatorio',
                    icon: 'icon-layers',
                    rules: [1]
                },]
        },
        {
            name: 'Notificações',
            url: '/gestao/notificacoes',
            icon: 'icon-bell',
            rules: [3, 4],
        },
        {
            name: 'Local Backup',
            url: '/backup-local',
            icon: 'icon-cloud-download',
            class: 'mt-auto',
            variant: 'info',
            rules: [65, 66],
        },
        {
            name: 'Cloud Backup',
            url: '',
            icon: 'icon-cloud-upload',
            variant: 'green',
            rules: [67, 68],

        },
        {
            name: 'Assistência Técnica',
            url: '',
            icon: 'icon-bubbles',
            variant: 'danger',
            rules: [69, 70]

        }
    ]


    constructor(
        private _HttpService: HttpService,
        private _Menu: Menu,

    ) { }
    loadUserPermissions() {
        var decrypt = "myencrypttext"
        var user_data = localStorage.getItem('r');
        var user_decrypt = crypto.AES.decrypt(user_data, decrypt)
        var user_data_decrypt = user_decrypt.toString(crypto.enc.Utf8);
        
        var group = user_data_decrypt.split("|/|");
        group = group[1];
        this._HttpService.JSON_GET(`/grupo-usuarios/busca/permissions/${group}`, false, true)
            .then(
                res => {
                    
                    this.permissao_user = _.pluck(res.json(), 'tb_acl_regras_id');
                    //this._Menu.addMenu(this.menuComplete, this.permissao_user );
                }
            )
    }

    // loadUserPermissions(user) {
    //     this._HttpService.JSON_GET(`/grupo-usuarios/get-permissoes/user/${user}`, false, true)
    //         .then(
    //             res => {
    //                 this.permissao_user = _.pluck(res.json(), 'tb_acl_regras_id');
    //                 var encrypt = "myencrypttext"
    //                 var permission_encrypt = crypto.AES.encrypt(JSON.stringify(this.permissao_user), encrypt)
    //                 permission_encrypt = permission_encrypt.toString()

    //                 // function GravaPermissao() {
    //                 //     return function (resolve, reject) {

    //                 //         localStorage.setItem('r', permission_encrypt)
    //                 //         resolve('ok')
    //                 //     }

    //                 // }
    //                 // var ofPermission = GravaPermissao()
    //                 // ofPermission.then(()=>{
    //                 //     return this._Menu.addMenu(this.menuComplete)
                        
    //                 // })


    //             }
    //         );
    // }

}