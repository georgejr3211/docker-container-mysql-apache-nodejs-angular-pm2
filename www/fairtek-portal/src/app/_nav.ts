import { Injectable } from '@angular/core';
import * as _ from 'underscore';
import * as crypto from 'crypto-js';


export var navigation = [];


let menus: any;
menus = '';


@Injectable()
export class Menu {

  addMenu(menu, permissoes) {
    
    var permissoes = permissoes;
    menus = menu;
    var new_menu = [];
    for (var i = 0; i < menus.length; i++) {
      
      new_menu = [];

      if (menus[i].children != undefined && menus[i].children.length > 0) {
        for (var j = 0; j < menus[i].children.length; j++) {
          if (_.intersection(permissoes, menus[i].children[j].rules).length > 0) {
            new_menu.push(menus[i].children[j]);
            
          }
        }
        menus[i].children = new_menu;
        if(menus[i].children.length > 0){
          navigation.push(menus[i]);
        }
      }
      else {
        if (_.intersection(permissoes, menus[i].rules).length != 0) {
          navigation.push(menus[i])
        }
      }
    }
  }

}





