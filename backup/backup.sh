BACKUPTIME=`date +%b-%d-%y`

DESTINATION=/home/nuc/sdcard/backup-$BACKUPTIME.sql

HOST="my-db"
USER="root"
PASSWORD="root"
DATABASE="db"

mysqldump -h $HOST -u $USER -p$PASSWORD $DATABASE > $DESTINATION

# DESTINATION=/home/nuc/sdcard/backup-$BACKUPTIME.tar.gz
# SOURCEFOLDER=/var/www
# tar -cpzf $DESTINATION $SOURCEFOLDER