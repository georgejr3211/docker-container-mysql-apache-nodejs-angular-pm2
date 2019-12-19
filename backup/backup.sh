BACKUPTIME=`date +%Y-%m-%d-%H:%M:%S`

DEST_SERVER=/var/www/fairtek-server/dump_days/backup-$BACKUPTIME.sql
DEST_SDCARD=/home/nuc/sdcard/backup-$BACKUPTIME.sql

HOST="my-db"
USER="root"
PASSWORD="root"
DATABASE="db"

mysqldump -h $HOST -u $USER -p$PASSWORD $DATABASE > $DEST_SERVER
# mysqldump -h $HOST -u $USER -p$PASSWORD $DATABASE > $DESTINATION

# DESTINATION=/home/nuc/sdcard/backup-$BACKUPTIME.tar.gz
# SOURCEFOLDER=/var/www
# tar -cpzf $DESTINATION $SOURCEFOLDER