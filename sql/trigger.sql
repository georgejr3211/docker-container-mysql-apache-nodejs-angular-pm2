DELIMITER $
 
CREATE TRIGGER tg_gerarNotificacoes AFTER UPDATE
ON tb_dosadores
FOR EACH ROW
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
END$ 
DELIMITER ;