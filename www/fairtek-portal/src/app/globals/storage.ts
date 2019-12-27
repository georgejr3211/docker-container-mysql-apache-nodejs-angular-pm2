/*--------------
V 0.0.1 - Criado por Larner Diogo

DESCRICAO:
Serviço de armazenamento LocalStorage


COMPONENTS
***********************************************************/
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';

/**********************************************************
PROVIDERS
***********************************************************/

@Injectable()
export class StorageService {

    /************
    GET STORAGE
    *************/
    getItem(item){ return localStorage.getItem(item); }

    /************
    SET STORAGE
    *************/
    setItem(item, valor){ return localStorage.setItem(item, valor); }

    /************
    DELETE STORAGE
    *************/
    removeItem(item){ return localStorage.removeItem(item); }

    /************
     * SET JUST USER STORAGE
     *************/
    setUser(user, valor){ return localStorage.setItem(user, valor); }
}