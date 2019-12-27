exports.tg_insert_alimentacao = async (migration, Sequelize) => {
    var user_tg_insert_alimentacao = 'CREATE DEFINER=`fairtek`@`localhost` TRIGGER `fairtek`.`insert_alimentacao` AFTER INSERT ON `tb_animais_registros` FOR EACH ROW';
    await migration.sequelize.query(`
        ${user_tg_insert_alimentacao}
        BEGIN
            SET @id_animal 	  = NEW.tb_animais_id;

            SET @hora_parcial = (SELECT HOUR((SELECT qa_data FROM tb_registros WHERE tb_animais_id = @id_animal AND DATE(qa_data) = '2018-01-14 00:00:00' AND qa > 0 ORDER BY id ASC LIMIT 1 )));
            SET @hora_complet = (SELECT HOUR((SELECT qa_data FROM tb_registros WHERE tb_animais_id = @id_animal AND DATE(qa_data) = '2018-01-14 00:00:00' AND qa > 0 ORDER BY id DESC LIMIT 1 )));
            SET @dia 		  = (SELECT (SELECT DATE(qa_data) FROM tb_registros WHERE tb_animais_id = @id_animal AND DATE(qa_data) = '2018-01-14 00:00:00' AND qa > 0 ORDER BY id DESC LIMIT 1 ));

            SET @calibracao   = (SELECT calibracao FROM tb_animais WHERE tb_animais.id = @id_animal);
            IF (@calibracao <> 1) THEN
                IF (NEW.qa = NEW.qt) THEN
                    IF EXISTS(SELECT ID_ANIMAL FROM tb_alimentacao_dia WHERE ID_ANIMAL = @id_animal AND DIA = @dia) THEN
                        SET @id_up = (SELECT id FROM tb_alimentacao_dia WHERE ID_ANIMAL = @id_animal AND DIA = @dia);
                        UPDATE tb_alimentacao_dia
                            SET HORA_PARCIAL = @hora_parcial,
                                HORA_COMPLET = @hora_complet
                            WHERE id = @id_up;

                    ELSE
                        INSERT INTO tb_alimentacao_dia
                        (
                            ID_ANIMAL,
                            HORA_PARCIAL,
                            HORA_COMPLET,
                            DIA
                        )
                        VALUES
                        (
                            @id_animal,
                            @hora_parcial,
                            @hora_complet,
                            @dia
                        );
                    END IF;

                ELSE
                    IF(NEW.qa > 0 ) THEN
                        IF EXISTS(SELECT ID_ANIMAL FROM tb_alimentacao_dia WHERE ID_ANIMAL = @id_animal AND DIA = @dia) THEN
                            SET @id_up = (SELECT id FROM tb_alimentacao_dia WHERE ID_ANIMAL = @id_animal AND DIA = @dia);
                            UPDATE tb_alimentacao_dia
                                SET HORA_PARCIAL = @hora_parcial,
                                    DIA = @dia
                                WHERE id = @id_up;

                        ELSE
                            INSERT INTO tb_alimentacao_dia
                            (
                                ID_ANIMAL,
                                HORA_PARCIAL,
                                DIA
                            )
                            VALUES
                            (
                                @id_animal,
                                @hora_parcial,
                                @dia
                            );
                        END IF;
                    END IF;
                END IF;
            END IF;
        END
        `), console.log('::: TG INSERT_ALIMENTACAO')
}