import { Injectable,EventEmitter } from '@angular/core';

@Injectable()
export class ShowService {

  listar: boolean = true;
  inserir: boolean = false;
  editar: boolean = false;
 /******
  VARIAVES AUXILIARES PARA CADASTRO DE ANIMAIS DIRETAMENTE DA TELA DE CHIPS
 * ********* */
  static editarAnimal:boolean   = false; // OBS: variavel auxiliar para abrir tela de editar Animal diretamente do supervisorio
  static inserirAnimal: boolean = false;
  static updateNotification: boolean = false;
  static listarAnimal: boolean  = true;
  static chipAnimal = {num_chip:0, id_chip:0};
  /******
    VARIAVES AUXILIARES PARA CADASTRO DE MOVIMENTACOES DIRETAMENTE DA TELA DE ANIMAIS
  * ********* */
  static animalMovimentacao = {brinco: '', tatuagem:'', id_animal:0};
  static inserirMovimentacoes: boolean = false;
  static listarMovimentacoes: boolean  = true;
/******
    VARIAVES AUXILIARES PARA CADASTRO DE CHIPS DIRETAMENTE DA TELA DE NOTIFICACOES
  * ********* */
  static inserirChip: boolean = false;
  static listarChip: boolean = true;
  static chip_num;


  
  static abrirInserirAnimal = new EventEmitter<boolean>();
  static abrirInserirMovimentacoes = new EventEmitter<boolean>();

  /*SHOW formulário Novo */
  showInserir() {
    this.listar = !this.listar;
    this.inserir = !this.inserir;
    ShowService.inserirAnimal = !ShowService.inserirAnimal;
    ShowService.listarAnimal = !ShowService.listarAnimal; 
  }
  /*SHOW formulário Editar*/
  showEditar() {
    this.listar = !this.listar;
    this.editar = !this.editar;
  }
  
  /*SHOW formulário Inserir Animal direto da tela chips*/
  showInserirAnimal(chip){
    ShowService.chipAnimal.id_chip = chip.id_chip;
    ShowService.chipAnimal.num_chip = chip.chip_num;
    ShowService.inserirAnimal = true;
    ShowService.listarAnimal = false; 
    ShowService.inserirChip = false;
    ShowService.listarChip = true;
    //ShowService.abrirInserirAnimal.emit(true);
  }

  /*SHOW formulário Inserir Animal direto da tela chips*/
  showInserirMovimentacoes(animal){ 
    ShowService.animalMovimentacao.brinco = animal.brinco;
    ShowService.animalMovimentacao.tatuagem = animal.tatuagem;
    ShowService.animalMovimentacao.id_animal = animal.id_animal;
    ShowService.inserirMovimentacoes = true;
    ShowService.listarMovimentacoes = false; 
    ShowService.inserirAnimal = false;
    ShowService.listarAnimal = true;
    //ShowService.abrirInserirMovimentacoes.emit(true);
  }

  showInserirChip(numeracao){
      ShowService.chip_num = numeracao;
      ShowService.updateNotification = true;
      ShowService.inserirChip = true;
      ShowService.listarChip  = false;
      
  }

  /*FUNÇÃO PARA ABERTURA DE TELA EDITAR ANIMAL EM ANIMAIS */
  showEditAnimalFromSuper(){
    ShowService.editarAnimal = true;
    ShowService.listarAnimal = false;
  }
  constructor() { }

}