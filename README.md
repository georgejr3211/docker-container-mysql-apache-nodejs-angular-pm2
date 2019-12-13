<!-- MYSQL -->

https://medium.com/@chrischuck35/how-to-create-a-mysql-instance-with-docker-compose-1598f3cc1bee

<!-- BUILD ESSENCIAL -->

https://ubuntuforums.org/showthread.php?t=997308

<!-- RUN UBUNTU -->

docker run -i -t george/ubuntu

<!-- STARTING MYSQL SERVE INSTANCE -->

docker run --name=mysql1 -d mysql/mysql-server:tag

<!-- CHANGE MYSQL PASSWORD -->

docker exec -it mysql1 mysql -uroot -p
ALTER USER 'root'@'localhost' IDENTIFIED BY 'password';

service apache2 start
service apache2 status

netstat -tal
netstat -tan

docker-compose up db
docker run -d -p 80:80 george/ubuntu
docker exec -ti 8077ebc7489e /bin/bash

<!-- In order to delete all images, use the given command -->
docker rmi $(docker images -q)
<!-- In order to delete all containers, use the given command -->
docker rm $(docker ps -a -q)

https://medium.com/@shakyShane/laravel-docker-part-1-setup-for-development-e3daaefaf3c