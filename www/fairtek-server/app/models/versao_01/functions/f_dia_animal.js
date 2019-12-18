exports.f_dia_animal = async (migration, Sequelize) => {
    var user_f_dia_animal = 'CREATE DEFINER=`fairtek`@`%` FUNCTION `dia_animal`(id_animal int) RETURNS int(11)';
    await migration.sequelize.query(`
        ${user_f_dia_animal}
BEGIN
    (SELECT dt_inseminacao INTO @dt_inseminacao FROM tb_animais_movimentacoes WHERE tb_animal_id = id_animal ORDER BY dt_movimentacao DESC LIMIT 1);
    (SELECT datediff(date(now()), @dt_inseminacao)+1 INTO @dia_animal);

    RETURN @dia_animal;
END
        `), console.log('::: F DIA_ANIMAL')
    }
