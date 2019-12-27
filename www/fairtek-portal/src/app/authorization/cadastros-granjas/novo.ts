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
import { ShowService } from '../../shared/app-show/show.service'
import { UtilsService } from '../../globals/utils';
import { TabsetComponent } from 'ngx-bootstrap';

@Component({
    selector: 'app-novo-cadastros-granjas',
    templateUrl: 'novo.html',
    styleUrls: ['novo.scss'],
    providers: [ShowService]
})
export class CadastroGranjasComponent implements OnInit {

    isBusyForm: boolean = false;
    isBusyList: boolean = false;
    exibeUpdate: boolean = false;
    exibeInsere: boolean = false;
    exibeLista: boolean = true;
    itens = [];
    itensFilter = [];
    itemsPerPage = 10;

    //COMBOS
    comboProdutores = [];
    selectProdutores = 0;
    comboFazendas = [];
    selectFazendas = 0;
    comboVeterinarios = [];
    selectVeterinarios = 0;
    comboNutricionistas = [];
    selectNutricionistas = 0;
    comboGerentes = [];
    selectGerentes = 0;
    comboOperadores = [];
    selectOperadores = 0;
    comboGeneticas = [];
    selectGeneticas = 0;

    //QUANTIDADE COMPONENTES
    configBarracoes = [{
        qt_barracoes1: 0
    }]
    qt_barracoes = 0;
    old_qt_barracoes = 0;

    @ViewChild('staticTabs') staticTabs: TabsetComponent;

    constructor(
        private _HttpService: HttpService,
        private _ToastrService: ToastrService,
        private GlobalService: GlobalService,
        private _ShowService: ShowService,
        private util: UtilsService
    ) {
        this.getItens();
    }

    ngOnInit() {
        this.getComboProdutor();
        this.getComboFazenda();
        this.getComboVeterinario();
        this.getComboNutricionista();
        this.getComboGerente();
        this.getComboOperador();
        this.getComboGenetica();
    }

    /************
    COMBOS
    *************/

    getComboProdutor() {
        this.isBusyList = true;
        this._HttpService.JSON_GET('/produtores/extra/combo', false, true)
            .then(
                res => {
                    return this.comboProdutores = res.json();
                },
                error => {
                    return this._ToastrService.error(error.json().message);
                }
            )
    }

    getComboFazenda() {
        this.isBusyList = true;
        this._HttpService.JSON_GET('/fazendas/extra/combo', false, true)
            .then(
                res => {
                    return this.comboFazendas = res.json();
                },
                error => {
                    return this._ToastrService.error(error.json().message);
                }
            )
    }

    getComboVeterinario() {
        this.isBusyList = true;
        this._HttpService.JSON_GET('/veterinarios/extra/combo', false, true)
            .then(
                res => {
                    return this.comboVeterinarios = res.json();
                },
                error => {
                    return this._ToastrService.error(error.json().message);
                }
            )
    }

    getComboNutricionista() {
        this.isBusyList = true;
        this._HttpService.JSON_GET('/nutricionistas/extra/combo', false, true)
            .then(
                res => {
                    return this.comboNutricionistas = res.json();
                },
                error => {
                    return this._ToastrService.error(error.json().message);
                }
            )
    }

    getComboGerente() {
        this.isBusyList = true;
        this._HttpService.JSON_GET('/gerentes/extra/combo', false, true)
            .then(
                res => {
                    return this.comboGerentes = res.json();
                },
                error => {
                    return this._ToastrService.error(error.json().message);
                }
            )
    }

    getComboOperador() {
        this.isBusyList = true;
        this._HttpService.JSON_GET('/operadores/extra/combo', false, true)
            .then(
                res => {
                    return this.comboOperadores = res.json();
                },
                error => {
                    return this._ToastrService.error(error.json().message);
                }
            )
    }

    getComboGenetica() {
        this.isBusyList = true;
        this._HttpService.JSON_GET('/geneticas/extra/combo', false, true)
            .then(
                res => {
                    return this.comboGeneticas = res.json();
                },
                error => {
                    return this._ToastrService.error(error.json().message);
                }
            )
    }

    //VERIFICAR QUANTIDADE DO PRÓXIMO COMPONENTE
    barracoesChanged() {
        if (this.qt_barracoes > this.old_qt_barracoes || this.qt_barracoes == 0) {
            this.configBarracoes.push({
                qt_barracoes1: this.qt_barracoes++
            })
        } else if (this.qt_barracoes < this.old_qt_barracoes) {
            this.configBarracoes.splice(-1, 1)
        } else {}
        this.old_qt_barracoes = this.qt_barracoes;
    }

    //VERIFICAR CAMPOS PREENCHIDOS BARRACOES

    //VERIFICAR CAMPOS PREENCHIDOS BAIAS
    /************
    POST
    *************/
    postForm(form) {
        //VERIFICA CAMPOS PREENCHIDOS
        if (form.value.nome_granja == null || form.value.nome_granja == '' ||
            form.value.produtor_granja == null || form.value.produtor_granja == '' ||
            form.value.localizacao_granja == null || form.value.localizacao_granja == '' ||
            form.value.endereco_granja == null || form.value.endereco_granja == '' ||
            form.value.fazenda_granja == null || form.value.fazenda_granja == '' ||
            form.value.veterinario_granja == null || form.value.veterinario_granja == '' ||
            form.value.nutricionista_granja == null || form.value.nutricionista_granja == '' ||
            form.value.gerente_granja == null || form.value.gerente_granja == '' ||
            form.value.operador_granja == null || form.value.operador_granja == '' ||
            form.value.modulo_producao_granja == null || form.value.modulo_producao_granja == '' ||
            form.value.genetica == null || form.value.genetica == '' ||
            form.value.plano_assistencia_granja == null || form.value.plano_assistencia_granja == '') {
            return this._ToastrService.error('Preencha todos os campos corretamente', 'Erro!');

        } else {
            //Alterar pra service depois
            form.value = form.value.toUpperCase();

            //BLOQUEANDO BOTAO DURANTE REQUEST
            this.isBusyForm = true;

            this._HttpService.JSON_POST('/baias', form.value, false, true)
                .then(
                    res => {
                        this.getItens();
                        this.isBusyForm = false;
                        this._ShowService.showInserir();
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
    PUT
    *************/
    putForm(form) {

        //VERIFICA CAMPOS PREENCHIDOS
        if (form.value.nome_granja == null || form.value.nome_granja == '' ||
            form.value.produtor_granja == null || form.value.produtor_granja == '' ||
            form.value.localizacao_granja == null || form.value.localizacao_granja == '' ||
            form.value.endereco_granja == null || form.value.endereco_granja == '' ||
            form.value.fazenda_granja == null || form.value.fazenda_granja == '' ||
            form.value.veterinario_granja == null || form.value.veterinario_granja == '' ||
            form.value.nutricionista_granja == null || form.value.nutricionista_granja == '' ||
            form.value.gerente_granja == null || form.value.gerente_granja == '' ||
            form.value.operador_granja == null || form.value.operador_granja == '' ||
            form.value.modulo_producao_granja == null || form.value.modulo_producao_granja == '' ||
            form.value.genetica == null || form.value.genetica == '' ||
            form.value.plano_assistencia_granja == null || form.value.plano_assistencia_granja == '') {
            return this._ToastrService.error('Preencha todos os campos corretamente', 'Erro!');

        } else {

            //Alterar pra service depois
            form.value = form.value.toUpperCase();

            //BLOQUEANDO BOTAO DURANTE REQUEST
            this.isBusyForm = true;

            this._HttpService.JSON_PUT(`/baias/${this.GlobalService.getItem().id}`, form.value, false, true)
                .then(
                    res => {
                        this.getItens();
                        this.isBusyForm = false;
                        this.exibeUpdate = false;
                        this._ShowService.showEditar();
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
        this.isBusyList = true;
        this._HttpService.JSON_GET('/fazendas', false, true)
            .then(
                res => {
                    this.itensFilter = res.json().data;
                    this.isBusyList = false;
                    return this.itens = res.json().data;
                },
                error => {
                    this.isBusyList = false;
                    return this._ToastrService.error(error.json().message);
                }
            )

    }

    /************
    DELETE
    *************/
    deleteItem() {
        let res = confirm("Tem certeza que deseja excluir a granja?");
        if (res) {

            this._HttpService.JSON_DELETE(`/baias/${this.GlobalService.getItem().id}`, false, true)
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
