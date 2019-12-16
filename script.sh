MAIN_DIR=/var/www

API_NAME=fairtek-server 

APP_NAME=fairtek-portal

API_CONF=fairtek-server.com.conf

APP_CONF=fairtek-portal.com.conf

PM2_START_FILENAME=pm2.json

LOG_BACKUP_FILENAME=logs_backup.txt

DUMP_DAYS_FOLDER=dump_days

a2dissite 000-default.conf && a2ensite \
  $APP_CONF $APP_CONF

service apache2 restart

mkdir $MAIN_DIR/$API_NAME/$DUMP_DAYS_FOLDER

if [ ! -e $MAIN_DIR/$API_NAME/$LOG_BACKUP_FILENAME ]; then
  cd $MAIN_DIR/$API_NAME
  touch $LOG_BACKUP_FILENAME
fi

cd $MAIN_DIR/$APP_NAME
npm i
npm audit fix
npm update
ng build --prod

cd $MAIN_DIR/$API_NAME
npm i
npm audit fix

cd $MAIN_DIR
pm2-docker $PM2_START_FILENAME