/***********************************************************
COMPONENTS
***********************************************************/
import { Component, TemplateRef } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { BsModalService } from 'ngx-bootstrap/modal';
import { BsModalRef } from 'ngx-bootstrap/modal/bs-modal-ref.service';

/**********************************************************
PROVIDERS
***********************************************************/
import { Router } from '@angular/router';
import { HttpService } from '../../globals/http';
import { GlobalService } from '../../globals/globals';
import * as crypto from 'crypto-js';
import * as _ from 'underscore';
@Component({
  selector: 'app-calibracao',
  templateUrl: 'calibracao.html',
  styleUrls: ['calibracao.scss']
})
export class CalibracaoComponent {

  loading: boolean = true;

  permissoes;
  read: boolean = false;
  new: boolean = false;

  showNew: boolean = false;
  isBusyForm: boolean = true;
  isBusyList: boolean = false;
  exibeUpdate: boolean = false;
  itens = [];
  itensFilter = [];
  itemsPerPage = 10;
  tb_tempo_dosagem = 0;

  //COMBOS
  comboChip: any;
  selectChip;
  comboEscore = [];
  selectEscore = 0;
  comboDietas = [];
  selectDieta = 0
  name = '';
  comboBaias = [];
  selectBaias = 0;
  comboSetor = [];
  selectSetor = 0;

  //VISUALIZAR
  showLista: boolean = true;
  novaCalibracao: boolean = false;
  statusCalibracao: boolean = false;
  cadChip: boolean = false;
  cadCalculo: boolean = false;
  buttonCalcular: boolean = false;
  attDosadores: boolean = true;

  status1: boolean = false;
  status2: boolean = false;
  status3: boolean = false;
  status4: boolean = false;
  status5: boolean = false;
  status6: boolean = false;
  status7: boolean = false;

  //Calibrar
  cQA; // Recebe qa para comparar com o QT
  cQT; // Recebe qt para comparar com o QA
  recebeuQA: boolean = false; // Libera botão de calibrar

  vPESO = 0; // peso da amostra 
  vQRR = 0; // Quantidade de ração obtida a cada rotação
  vQA = 0 // Quantidade alimentada
  vPTA = 0 // Tempo de acionamento do dosador
  vChip; // Valor Chip
  vBaia: number = 0;
  vSetor: number = 0;
  id_calibra; // Animal usado na calibração
  id_rede_calibra; // Rede do animal usado na calibração
  rfid_calibra // rfid do animal usado na calibração
  // obj = []; obj para cadastrar a calibração

  //Modal
  modalRef: BsModalRef;

  constructor(
    private _HttpService: HttpService,
    private _ToastrService: ToastrService,
    private GlobalService: GlobalService,
    private modalService: BsModalService,
    public router: Router
  ) {

  }

  ngOnInit() {
    this.getItens();
    this.getComboChip();
    //this.fDesativaAnimal();
    this.fVerificaCalibracao();

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
    //Permissões: read = 71, new = 72
    //BLOQUEIA TUDO
    if (this.permissoes.includes(71, 72) == false) {
      this.read = false;
      this.new = false;
    }
    //READ
    if (this.permissoes.includes(71)) {
      this.read = true;
    }
    //NEW
    if (this.permissoes.includes(72)) {
      this.new = true;
    }
  }

  openModalWithClass(template: TemplateRef<any>) {
    this.modalRef = this.modalService.show(
      template,
      Object.assign({}, { class: ' ' })
    );
  }

  /************
   COMBOS
  ************/
  getComboChip() {
    this.isBusyList = true;
    this._HttpService.JSON_GET('/chips/extra/combo', false, true)
      .then(
        res => {
          this.comboChip = res.json();
          return this.comboChip

        },
        error => {
          return this._ToastrService.error(error.json().message);
        }
      )
  }
  getComboBaia() {
    this.isBusyList = true;
    this._HttpService.JSON_GET('/baias/extra/combo', false, true)
      .then(
        res => {
          console.log('res comboBaia', res.json());
          return this.comboBaias = res.json();
        },
        error => {
          return this._ToastrService.error(error.json().message);
        }
      )
  }
  getComboSetor() {
    this.isBusyList = true;
    this._HttpService.JSON_GET('/setores-tipos/extra/combo/calibracao', false, true)
      .then(
        res => {
          console.log('res comboSetor', res.json());
          return this.comboSetor = res.json();
        },
        error => {
          return this._ToastrService.error(error.json().message);
        }
      )
  }

  /************
   FUNÇÕES DE CONTROLE DE VISUALIZAÇÃO
  *************/
  sLista() {
    this.showLista = true;
    this.novaCalibracao = false;
    this.cadChip = false;
    this.cadCalculo = false;
    this.status1 = false;
    this.status2 = false;
    this.status3 = false;
    this.status4 = false;
    this.status5 = false;
    this.status6 = false;
    this.status7 = false;
    this.recebeuQA = false;
    this.vPESO = 0;
    this.id_calibra = undefined;
    this.fVerificaCalibracao();
  }

  sNovaCalibracao() {
    this.showLista = false;
    this.novaCalibracao = true;
    this.cadChip = true;
    this.cadCalculo = false;
    this.status1 = false;
    this.status2 = false;
    this.status3 = false;
    this.status4 = false;
    this.status5 = false;
    this.status6 = false;
    this.status7 = false;
  }

  sCalculo() {
    this.showLista = false;
    this.novaCalibracao = true;
    this.cadChip = false;
    this.cadCalculo = true;
    this.status1 = false;
    this.status2 = false;
    this.status3 = false;
    this.status4 = false;
    this.status5 = false;
    this.status6 = false;
    this.status7 = false;
  }

  chipChanged(event) {
    this.buttonCalcular = true;
  }

  //FUNÇÕES PARA REALIZAR CADASTRO DE ANIMAL DA CALIBRAÇÃO E ATUALIZAR DOSADORES

  //FUNÇÃO PARA VERIFICAR SE NÃO EXISTE UMA CALIBRAÇÃO EM ANDAMENTO, SE EXISTIR CHAMA A FUNÇÃO fLiberaCalculo
  fVerificaCalibracao() {
    this._HttpService.JSON_GET(`/calibracao/continua/calibra/busca`, false, true)
      .then(
        res => {
          console.log('res.json que chega paracalibrar', res.json());
          if (res.json().length == 1) {
            this.statusCalibracao = true;
            this.name = res.json()[0].numChip;
            this.vChip = res.json()[0].chip;
            this.vBaia = res.json()[0].baia;
            this.vSetor = res.json()[0].setor;
            this.selectBaias = res.json()[0].baia;
            this.selectSetor = res.json()[0].setor;
            this.id_calibra = res.json()[0].id;
            this.id_rede_calibra = res.json()[0].id_rede;
            this.rfid_calibra = res.json()[0].rfid;
          } else {
            this.statusCalibracao = false;
          }

        },
        error => {
          return this._ToastrService.error(error.json().message);
        }
      )
  }


  //FUNÇÃO fLiberarCalculo, VERIFICA O ANIMAL E SE O MESMO JÁ RECEBEU TODAS AS DOSAGENS
  //SE ELE JÁ RECEBEU AS DOSAGENS, ELA LIBERA O BOTÃO QUE ATIVA A FUNÇÃO fCalcula
  fLiberaCalculo() {
    let intervalo = setInterval(() => {
      if (this.id_calibra === undefined) {
        this._HttpService.JSON_GET(`/calibracao/calibra/busca/id`, false, true)
          .then(
            res => {
              this.id_calibra = res.json()[0].id;
              this.id_rede_calibra = res.json()[0].id_rede;
              this.rfid_calibra = res.json()[0].rfid;
              return this._ToastrService.success(res.json().message);
            },
            error => {
              return this._ToastrService.error(error.json().message);
            }
          )
      }
      if (this.router.url !== '/calibracao') {
        clearInterval(intervalo);
      }
      if (this.id_calibra != undefined && this.cadCalculo == true) {
        this._HttpService.JSON_GET(`/calibracao/verifica/qa/qt/${this.id_calibra}`, false, true).then(
          res => {
            this.cQA = res.json()[0].qa;
            this.cQT = res.json()[0].qt;
            if (this.cQA == this.cQT) {
              this.recebeuQA = true;
              this.status1 = true;
              clearInterval(intervalo);
            }
          },
          error => {
            return this._ToastrService.error(error.json().message);
          }
        )
      }
    }, 15000)
  }

  //RECEBE O VALOR DA PESAGEM REALIZADA PELO PRODUTOR(vPESO), JUNTAMENTO COM O VALOR DE ABERTURA DO DOSADOR ATULAMENTE(vPTA) 
  //E O VALOR DA QUANTIDADE DE ACIONAMENTO DESSA ABERTURA(vQA), PARA CALCULAR O NOVO VALOR DE ABERTURA DO DOSADOR(vQRR). CHAMA A FUNÇÃO fAtualizaDosador
  fCalcula() {
    this._HttpService.JSON_GET(`/calibracao/calibra/${this.id_calibra}`, false, true).then(
      res => {
        console.log('id calibra', this.id_calibra);
        console.log('id baia', this.vBaia);
        console.log('res.json /calibracao/calibra', res);
        if (this.vPESO < 100) {
          return this._ToastrService.error("Verifique se o valor informado é valido!")
        } else {
          this.status2 = true;
          this.vQA = res.json()[0].qa;
          this.vPTA = res.json()[0].pTa;
          this.vQRR = this.vPESO / this.vQA;
          this.vQRR = (this.vPTA * 100) / this.vQRR;
          this.vQRR = Math.trunc(this.vQRR)
          this.fAtualizaDosador(this.vQRR);
        }
      },
      error => {
        return this._ToastrService.error(error.json().message);
      }
    )
  }

  //RECEBE O NOVO VALOR DE ABERTURA DO DOSADOR E ATUALIZA O MESMO. CHAMA A FUNÇÃO fCadastraCalibraca
  fAtualizaDosador(form) {
    console.log('form fAtualizaDosador:', form);
    this._HttpService.JSON_PUT(`/dosadores/calibra/${this.vQRR}/${this.vBaia}`, form, false, true)
      .then(
        res => {
          console.log('id baia', this.vBaia);
          console.log('res.json /dosadores/calibra', res);
          this.status3 = true;
          this.fCadastraCalibracao();
          return this._ToastrService.success(res.json().message);
        },
        error => {
          return this._ToastrService.error(error.json().message);
        }
      )
  }

  //REALIZA O CADASTRO DESTA CALIBRAÇÃO E CHAMA AS FUNÇÕES fgetItens() e fDesativaAnimal
  fCadastraCalibracao() {
    var obj = [{
      chip: this.vChip,
      peso: this.vPESO,
      pta_antigo: this.vPTA,
      pta_novo: this.vQRR,
      baia: this.vBaia,
      setor: this.vSetor,
      excluido: 0
    }];
    console.log('objeto para cadastrar na calibracao', obj);
    this._HttpService.JSON_POST(`/calibracao/cadastra/calibra/${this.vChip}/${this.vPESO}/${this.vPTA}/${this.vQRR}/${this.vBaia}/${this.vSetor}`, obj, false, true)
      .then(
        res => {
          this.status4 = true;
          this.status5 = true;
          this.getItens();
          this.fDesativaAnimal();
          return this._ToastrService.success(res.json().message);
        },
        error => {
          return this._ToastrService.error(error.json().message);
        }
      )
  }

  //DESATIVA O ANIMAL DA CALIBRAÇÃO
  fDesativaAnimal() {
    this.id_calibra = undefined;
    var form;
    this._HttpService.JSON_PUT(`/calibracao/desativa/animal/chip`, form, false, true)
      .then(
        res => {
          if (res.json().message != 'Nada') {
            this.getComboChip();
          }
        },
        error => {
          return this._ToastrService.error(error.json().message);
        }
      )
  }

  /************
  POST
  *************/
  postForm(form) {
    console.log("form", form.value);
    //VERIFICA CAMPOS PREENCHIDOS
    if (form.value.chip == null || form.value.chip == '') {
      return this._ToastrService.error('Preencha todos os campos corretamente', 'Erro!');

    } else {
      //GET VALOR DO CHIP
      this._HttpService.JSON_GET(`/chips/value/chip/${form.value.chip}`, false, true)
        .then(
          res => {
            this.name = res.json()[0].chip;
            var finalName = this.name.slice(-4)
            form.value.tatuagem = 'TTCA' + finalName;
            form.value.brinco = 'BBCA' + finalName;
            this.vChip = form.value.chip;
            this.vBaia = form.value.baia;
            this.vSetor = form.value.setor;

            //BLOQUEANDO BOTAO DURANTE REQUEST
            this.isBusyForm = true;
            this._HttpService.JSON_POST('/calibracao', form.value, false, true)
              .then(
                res => {
                  console.log('res', res.json());
                  this.fLiberaCalculo();
                  this.sCalculo()
                  if (res.json().message === 'erro') return this._ToastrService.error('Já existe um animal de calibração cadastrado com esses dados.', 'Erro!');
                  else return this._ToastrService.success(res.json().message);
                },
                error => {
                  return this._ToastrService.error(error.json().message);
                }
              )
          },
          error => {
            this.isBusyList = false;
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
    this._HttpService.JSON_GET('/calibracao', false, true)
      .then(
        res => {
          this.itens = res.json();
          this.itensFilter = res.json();
          for (var i = 0; i < res.json().length; i++) {
            this.itensFilter[i].pta_antigo = res.json()[i].pta_antigo / 1000 + " Seg.";
            this.itensFilter[i].pta_novo = res.json()[i].pta_novo / 1000 + " Seg.";
            this.itens[i].pta_antigo = res.json()[i].pta_antigo / 1000 + " Seg.";
            this.itens[i].pta_novo = res.json()[i].pta_novo / 1000 + " Seg.";
          }
          this.isBusyList = false;
          this.loading = false;
          return this.itens;
        },
        error => {
          this.isBusyList = false;
          this.loading = false;
          return this._ToastrService.error(error.json().message);
        }
      )

  }

  /************
  FILTRA
  *************/
  searchFilter(event) {
    let val = event.target.value;
    if (val.length === 0) {
      this.itensFilter = this.itens;

    } else {

      let filtro = this.itensFilter.filter(function (d) {
        return d.created.toLowerCase().indexOf(val) !== -1 || d.num_chip.toLowerCase().indexOf(val) !== -1 || !val;
      });

      this.itensFilter = filtro;
    }
  }
}
