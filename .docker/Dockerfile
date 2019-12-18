FROM ubuntu:latest

RUN apt-get update && apt-get upgrade -y && apt-get install -y \
  wget nano curl net-tools lsof \
  build-essential make unzip git \
  mysql-client cron apache2 && apt-get clean

RUN curl --silent --location https://deb.nodesource.com/setup_10.x | bash -

COPY script.sh /usr/local/bin
RUN chmod +x /usr/local/bin/script.sh

COPY backup/backup.sh /usr/local/bin
RUN chmod +x /usr/local/bin/backup.sh

# NODE, ANGULAR, PM2
RUN apt-get install -y nodejs && \
  export NG_CLI_ANALYTICS=ci && \
  npm install -g @angular/cli && \
  npm install -g pm2

# JAVA
RUN apt-get install -y default-jre default-jdk

# TIMEZONE
ENV DEBIAN_FRONTEND=noninteractive
RUN apt-get install -y tzdata;

ENV APACHE_RUN_USER www-data
ENV APACHE_RUN_GROUP www-data
ENV APACHE_RUN_DIR=/var/run
ENV APACHE_PID_FILE=/var/run/apache2.pid
ENV APACHE_LOG_DIR=/var/log/apache2
ENV APACHE_LOCK_DIR=/var/lock/apache2

EXPOSE 80

CMD ["/usr/sbin/apache2", "-D", "FOREGROUND"]