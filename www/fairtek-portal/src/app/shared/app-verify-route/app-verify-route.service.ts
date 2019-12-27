import { Injectable, ɵConsole } from '@angular/core';
import { Router } from '@angular/router';
import { THIS_EXPR } from '@angular/compiler/src/output/output_ast';

@Injectable()

export class AppVerifyRouteService {

    //ARRAY DO HISTORICO DE ROTAS
    history: any = [];

    //SABER SE FOI UTILIZADO O BOTÃO VOLTAR
    back: boolean = false;

    //BLOQUEIO DO BOTAO VOLTAR
    block: boolean = false;

    lastFilter = null;
    constructor(private _router: Router) { }

    //SETAR HISTORICO NO ARRAY
    setHistoryRoutes(val) {
        //CASO NÃO TENHA CLICADO EM VOLTAR
        if (this.back != true) {

            //ARRAY NÃO PODE SER MAIOR QUE 100
            if (this.history.length < 100) {

                if (this.history.length == 0) {

                    val.position = 1

                } else {

                    val.position = this.history.length + 1

                }

                this.history.push(val);

            } else {

                val.position = this.history.length - 1

                this.history.shift();
                this.history.push(val);
            }

        } else {
            //CASO TENHA CLICADO EM VOLTAR EXCLUI A ROTA ANTERIOR DO ARRAY
            this.history.pop();
        }

        //BLOQUEIA BOTÃO DE VOLTAR CASO TAMANHO DO ARRAY FOR 1
        if (this.history.length == 1) {
            this.block = true;
        } else {
            this.block = false;
        }

        // SE O PARAMETROS EM ROTAS ANTERIORES CASO FOR PASSADO QUERY PARAMS
        if(this.history.length > 1) {
            this.setParamsInLastRoute();
        }

        this.back = false;

    }

    //SETAR PARAMETROS DE VARIAVEIS NA ROTA CERTA
    setParamsInLastRoute() {

        let url = this.history[this.history.length - 1].url;

        url = url.split('?');

        if(url.length > 1) {
            this.history[this.history.length - 1].url = url[0]
            this.history[this.history.length - 2].url = this.history[this.history.length - 2].url + '?' + url[1];
        }
    }

    storeLastFilter(filter){
        this.lastFilter = filter
    }

    // VOLTAR PARA A PÁGINA ANTERIOR GRAVADA NO ARRAY
    goBack() {

        this.back = true;

        let position = this.history.length - 1

        let index = this.history.findIndex(
            val => val.position == position
        )
        
        if (index >= 0) {

            let newUrl = this.history[index].url.split('?');

            let params = newUrl[newUrl.length - 1];

            params = params.split('&');
            
            let queryParams = {};

            for(let i = 0; i < params.length; i++){

                let auxParam = params[i].split('=');

                queryParams[auxParam[0]] = auxParam[1];

            }

            this._router.navigate([newUrl[0]], { queryParams: queryParams });
        }
    }
}
