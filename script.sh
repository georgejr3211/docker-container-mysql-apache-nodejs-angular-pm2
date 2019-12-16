MAIN_DIR=/var/www

a2dissite 000-default.conf && a2ensite \
  app.com.conf \
  api.com.conf

echo "RESTARTANDO APACHE"
service apache2 restart

echo "Inciando a API"
cd $MAIN_DIR && pm2-docker pm2.json