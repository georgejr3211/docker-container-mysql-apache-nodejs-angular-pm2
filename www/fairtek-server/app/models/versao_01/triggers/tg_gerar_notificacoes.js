exports.tg_gerar_notificacoes = async (migration, Sequelize) => {
    var user_tg_gerarNotificacoes = 'CREATE DEFINER=`fairtek`@`%` TRIGGER `fairtek`.`tg_gerarNotificacoes` AFTER UPDATE ON `tb_dosadores` FOR EACH ROW';
    await migration.sequelize.query(`
        ${user_tg_gerarNotificacoes}
        BEGIN
        IF (OLD.status_racao <> NEW.status_racao)THEN
                SET @mac = NEW.codigo;
                SET @horario = NEW.created;
                INSERT INTO tb_notificacoes (tb_notificacoes_tipos_id, valor, lida, created, excluido, st_toast) VALUES (16, CONCAT('{"mac":','"',@mac,'"',',"data":','"',@horario,'"',',"status": "success"}'), 0, NOW(), 0, 0);
            END IF ;

            IF(OLD.status_motor <> NEW.status_motor) THEN
                SET @mac = NEW.codigo;
                SET @horario = NEW.created;
                INSERT INTO tb_notificacoes (tb_notificacoes_tipos_id, valor, lida, created, excluido, st_toast) VALUES (17, CONCAT('{"mac":','"',@mac,'"',',"data":','"',@horario,'"',',"status": "success"}'), 0, NOW(), 0, 0);
            END IF;

            IF (OLD.status_antena <> NEW.status_antena) THEN
                SET @mac = NEW.codigo;
                SET @horario = NEW.created;
                INSERT INTO tb_notificacoes (tb_notificacoes_tipos_id, valor, lida, created, excluido, st_toast) VALUES (18, CONCAT('{"mac":','"',@mac,'"',',"data":','"',@horario,'"',',"status": "success"}'), 0, NOW(), 0, 0);
            END IF;

            IF(OLD.status_dosador <> NEW.status_dosador) THEN
                SET @mac = NEW.codigo;
                SET @horario = NEW.created;
                INSERT INTO tb_notificacoes (tb_notificacoes_tipos_id, valor, lida, created, excluido, st_toast) VALUES (19, CONCAT('{"mac":','"',@mac,'"',',"data":','"',@horario,'"',',"status": "success"}'), 0, NOW(), 0, 0);
            END IF;
        END
        `), console.log('::: TG TG_GERARNOTIFICACOES')
}