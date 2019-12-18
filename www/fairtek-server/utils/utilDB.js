function paginate(req, res, next) {

    var start = 0;
    var limit = 1000;

    if (typeof req.query.start !== 'undefined' && req.query.start !== '') {
        start = req.query.start;
    }
    if (typeof req.query.limit !== 'undefined' && req.query.limit !== '') {
        limit = req.query.limit;
    }

    return ' LIMIT ' + limit + ' OFFSET ' + start;
}

exports.paginate = paginate;

function construirObjetoRetornoBD(objResultDB) {
    var obj = {};

    //Posição data para ser extraidos os dados do obj pelo datagrid
    obj.data = objResultDB;
    obj.recordsTotal = (objResultDB[0].COUNT_LINHA ? objResultDB[0].COUNT_LINHA : 0);

    // Se houver retorno incrementa a posição com valor total de registros
    if (objResultDB.length >= 1) {
      obj.recordsFiltered = objResultDB.length;

    } else {
      obj.recordsFiltered = 0;
    }

    obj.draw = "null";


    return obj;
  };

  exports.construirObjetoRetornoBD = construirObjetoRetornoBD;