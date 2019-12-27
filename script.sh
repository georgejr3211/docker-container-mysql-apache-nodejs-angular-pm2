# SCRIPT_INICIALIZAÇÃO
################################################################################
MAIN_DIR=/var/www

API_NAME=fairtek-server 

APP_NAME=fairtek-portal

API_CONF=fairtek-server.com.conf

APP_CONF=fairtek-portal.com.conf

PM2_START_FILENAME=pm2.json

LOG_BACKUP_FILENAME=logs_backup.txt

DUMP_DAYS_FOLDER=dump_days

SDCARD_DIR=/home/nuc/sdcard
################################################################################

# VIRTUAL HOST
################################################################################
echo "1. VIRTUAL HOST - Restartando o apache"
a2dissite 000-default.conf && 
a2ensite $APP_CONF $APP_CONF
a2enmod proxy_http

service apache2 restart
################################################################################

# CRON
################################################################################
echo "2. CRON - Iniciando o cron"
service cron start

crontab -l | { cat; echo "59 17 * * * /usr/local/bin/backup.sh"; } | crontab -
################################################################################

# BACKUP
################################################################################
echo "3. BACKUP - Criando os arquivos e pastas de backup"
if [ ! -e $SDCARD_DIR ]; then
  mkdir -p $SDCARD_DIR
fi

if [ ! -e $MAIN_DIR/$API_NAME/$DUMP_DAYS_FOLDER ]; then
  mkdir $MAIN_DIR/$API_NAME/$DUMP_DAYS_FOLDER
fi

if [ ! -e $MAIN_DIR/$API_NAME/$LOG_BACKUP_FILENAME ]; then
  cd $MAIN_DIR/$API_NAME
  touch $LOG_BACKUP_FILENAME
fi
################################################################################

echo "------------------Iniciando o Servidor SOWTEK5000...---------------"
mysql --host=my-db --user='fairtek' --password='fairtek2018' fairtek << EOF
INSERT INTO tb_notificacoes (tb_notificacoes_tipos_id, origem, destino, valor, lida, created, excluido, st_toast) VALUES (20, null, null, '{"status": "Sistema Reiniciado"}', 0, NOW(), 0, 0);
EOF

echo "4. Instalando dependências da APP e dando build"
cd $MAIN_DIR/$APP_NAME
npm i
npm audit fix
npm update
ng build --prod --aot=false

echo "5. Instalando dependências da API"
cd $MAIN_DIR/$API_NAME
npm i
npm audit fix
npm update

echo "6. Iniciando a API"
cd $MAIN_DIR
pm2-docker $PM2_START_FILENAME