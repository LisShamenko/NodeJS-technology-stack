# Docker NodeJS

## сеанс

[Dockerizing a Node.js web app.](https://nodejs.org/fr/docs/guides/nodejs-docker-webapp/)

-	папка с Docker
	```
	Ubuntu: /var/lib/docker/ 
	Fedora: /var/lib/docker/ 
	Debian: /var/lib/docker/ 
	Windows: C:\ProgramData\DockerDesktop.
	```
	[Docker Container Paths](https://www.freecodecamp.org/news/where-are-docker-images-stored-docker-container-paths-explained)

-	добавить пользователя в группу docker, чтобы не писать sudo
	-	создать группу
		```
		lisandrsh@server:~$ sudo groupadd docker
		[sudo] password for lisandrsh: 
		groupadd: group 'docker' already exists
		```
	-	добавить пользователя в существующую группу
		```
		lisandrsh@server:~$ sudo usermod -aG docker lisandrsh
		```
	-	вывод пользователей в группе
		```
		lisandrsh@server:~$ getent group docker
		docker:x:997:lisandrsh
		```

-	редактор nano --version
	```
	root@server:/etc/sudoers.d# nano --version
	 GNU nano, version 4.8
	 (C) 1999-2011, 2013-2020 Free Software Foundation, Inc.
	 (C) 2014-2020 the contributors to nano
	 Email: nano@nano-editor.org	Web: https://nano-editor.org/
	 Compiled options: --disable-libmagic --enable-utf8
	```
	[редактор nano](https://www.hostinger.ru/rukovodstva/kak-ustanovit-tekstoviy-redaktor-linux-nano)

-	действия с группами
	-	вывести пользователей группы
		```
		getent group [groupname]
		```
	-	вывести группы в которых находится пользователь
		```
		groups [user]
		```
	-	[members of a group](https://askubuntu.com/questions/136788/how-do-i-list-the-members-of-a-group)
	-	[members of a group](https://www.cyberciti.biz/faq/linux-list-all-members-of-a-group/)		

-	редактировать файл / посмотреть
	-	содержимое папки
		```
		lisandrsh@server:~$ sudo -i
		root@server:/# ls -l
		```
	-	перейти в каталог
		```
		root@server:~# cd ./../etc/sudoers.d
		```
	-	редактировать nano
		```
		root@server:/etc/sudoers.d# nano README
		```
	-	открыть файл для просмотра
		```
		root@server:/etc/sudoers.d# cat README
		```

-	создать образ
	```
	lisandrsh@server:~/projects/docker_samples/nodejs$ docker build . -t lisandrsh/nodejs
	...
	Step 1/7 : FROM node:10
	...
	Step 2/7 : WORKDIR /usr/src/app
	...
	Step 3/7 : COPY package*.json ./
	...
	Step 4/7 : RUN npm install
	...
	Step 5/7 : COPY . .
	...
	Step 6/7 : EXPOSE 8080
	...
	Step 7/7 : CMD [ "node", "server.js" ]
	...
	```

-	удалить образ "lisandrsh/nodejs"
	```
	root@server:/var/lib/docker/volumes/cpm/_data# docker rmi lisandrsh/nodejs
	Untagged: lisandrsh/nodejs:latest
	...
	```

-	показать образы
	```
	lisandrsh@server:~/projects/docker_samples/nodejs$ docker images
	REPOSITORY         TAG       IMAGE ID       CREATED              SIZE
	lisandrsh/nodejs   latest    cbbfe1529de2   About a minute ago   913MB
	node               10        28dca6642db8   6 days ago           910MB
	hello-world        latest    d1165f221234   5 weeks ago          13.3kB
	```

-	показать только работающие контейнеры
	```
	lisandrsh@server:~/projects/docker_samples/nodejs$ docker ps
	CONTAINER ID   IMAGE              COMMAND                  CREATED          	STATUS          PORTS                    NAMES
	0a058f63d42d   lisandrsh/nodejs   "docker-entrypoint.s…"   19 seconds ago   Up 18 	seconds   0.0.0.0:8080->8080/tcp   great_roentgen
	```

-	остановить контейнер по идентификатору (можно получить из docker ps)
	```
	lisandrsh@server:~/projects/docker_samples/nodejs$ docker stop 0a058f63d42d 
	0a058f63d42d
	```

-	удалить контейнер по идентификатору
	```
	lisandrsh@server:~/projects/docker_samples/nodejs$ docker rm 0a058f63d42d
	0a058f63d42d
	```

-	пример с хировой работы
	```
	docker run
	// запустить в фоновом режиме
		-d
	// имя контейнера (можно использовать вместо идентификатора)
		--name cpm
	// проброс внутреннего порта контейнера во внешний порт (внешний:внутренний)
		-p 3001:3001
	// файл с переменными среды
		--env-file Docker/env.list
	// монтировать том (src=cpm) с переносом данных в папку (target=/cpm)
		--mount type=volume,src=cpm,target=/cpm
	// образ
		cpm:1.0
	// выполнить команду "node-v14.15.4-linux-x64/bin/node" для файла "cpm/index.js"
		node-v14.15.4-linux-x64/bin/node cpm/index.js
	```

-	работающий вариант 
	```
	docker run 
		-d 
		-p 3000:8080 
		--name mynode 
		--mount type=volume,src=mynode,target=/usr/src/app 
		lisandrsh/nodejs 
	// выполнить для контейнера команду через bash: команда "node" для файла "server.js"
	// можно не указывать если в Dockerfile есть запись: CMD [ "node", "server.js" ]
		/bin/bash -c "node server.js"
	```

-	запустить контейнер в терминале	
	```
	root@server:/var/lib/docker/volumes/cpm/_data# docker run -it -p 3000:8080 --name mynode --mount type=volume,src=mynode,target=/usr/src/app lisandrsh/nodejs /bin/bash	
	```
	
-	запустить приложение nodejs из терминала
	```
	root@be82db14b84f:/# node ./usr/src/app/server.js
	Running on http://0.0.0.0:8080
	Server started in port: http://localhost:8080/
	```
	-	нажать 'ctrl+C' чтобы остановить приложение
		```
		^C
		```
	-	выход из терминала
		```
		root@be82db14b84f:/# exit
		exit
		```

-	подключится к работающему контейнеру
	```
	root@server:/var/lib/docker/volumes/cpm/_data# docker exec -it mynode bash
	```

-	просмотреть логи контейнера
	```
	root@server:/var/lib/docker/volumes/cpm/_data# docker logs cpm
	Running on http://0.0.0.0:8080
	```

-	вывести список томов
	```
	root@server:/var/lib/docker/volumes/cpm/_data# docker volume ls
	DRIVER    VOLUME NAME
	```
	-	[bind mounts](https://docs.docker.com/storage/bind-mounts/)
	-	[volumes](https://docs.docker.com/storage/volumes/)

-	создать том (volume)
	```
	root@server:/var/lib/docker/volumes/cpm/_data# docker volume create my-vol
	my-vol
	```

-	инспектировать том (volume)
	```
	root@server:/var/lib/docker/volumes/cpm/_data# docker volume inspect my-vol
	[
	    {
	        "CreatedAt": "2021-04-17T14:22:03+03:00",
	        "Driver": "local",
	        "Labels": {},
	// папка размещения:
	        "Mountpoint": "/var/lib/docker/volumes/my-vol/_data",	
	        "Name": "my-vol",
	        "Options": {},
	        "Scope": "local"
	    }
	]
	```

-	удалить не используемые тома
	```
	docker volume prune
	```
	-	[docker volume prune](https://docs.docker.com/engine/reference/commandline/volume_prune/)

-	ошибка в логах
	```
	root@server:/var/lib/docker/volumes/cpm/_data# docker logs mynode
	/usr/local/bin/docker-entrypoint.sh: 8: exec: /home/node: Permission denied
	```

-	Заработало. Требуется сбросить проект в папку тома mynode (volume). Приложение запускается не через Dockerfile а через bash: /bin/bash -c "node server.js".
	```
	root@server:/var/lib/docker/volumes/cpm/_data# docker run -d -p 3000:8080 --name mynode --mount type=volume,src=mynode,target=/usr/src/app lisandrsh/nodejs /bin/bash -c "node server.js"
	65e4cbf634b578a917fb404331f0010920a3d13ac2b3c1bf228c29f8c41280cc
	root@server:/var/lib/docker/volumes/cpm/_data# docker logs mynode
	Server started in port: http://localhost:8080/
	```

-	[про порты](https://stackoverflow.com/questions/59798094/what-is-port-49160-in-docker-run)

-	удалить образ
	``` 
	docker rmi Image Image
	```
	[про удаление образов](https://devacademy.ru/article/kak-udalit-obrazy-kontieiniery-i-toma-docker)

## версия node в образе		

-	[get version of node](https://stackoverflow.com/questions/42671467/how-to-get-version-of-node-from-docker-container)
	
-	выполнить команду bash (node --version) для контейнера и сразу удалить контейнер (--rm)
	```
	root@server:/var/lib/docker/volumes/cpm/_data# docker run -it --rm node /bin/bash -c 'node --version'
	...
	v15.14.0
	```
	-	https://docs.docker.com/engine/reference/commandline/rm/

-	запуск контейнера и переход к терминалу этого контейнера с использованием bash
	```
	root@server:/var/lib/docker/volumes/cpm/_data# docker run -it node:10 /bin/bash
	```

-	если не указать оболочку bash
	```
	root@server:/var/lib/docker/volumes/cpm/_data# docker run -it node:10
	> ls
	Thrown:
	ReferenceError: ls is not defined
	```
		
-	поиск файла
	```
	root@dc539009472d:/# find . -name 'node'
	```
