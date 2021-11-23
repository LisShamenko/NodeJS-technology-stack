# Docker Postgres

## локадьные настройки postgres

```
Installation Directory: C:\Program Files\PostgreSQL\13
Server Installation Directory: C:\Program Files\PostgreSQL\13
Data Directory: C:\Program Files\PostgreSQL\13\data
Database Port: 5432
Database Superuser: postgres
Password Superuser: postgres
Operating System Account: NT AUTHORITY\NetworkService
Database Service: postgresql-x64-13
Command Line Tools Installation Directory: C:\Program Files\PostgreSQL\13
pgAdmin4 Installation Directory: C:\Program Files\PostgreSQL\13\pgAdmin 4
Stack Builder Installation Directory: C:\Program Files\PostgreSQL\13
```

____

-	подключение через DBeaver после запуска контейнера postgres на виртуальной машине

	-	определить адрес виртуальной машины: 'inet 10.1.63.204'
		```
		lisandrsh@server:~$ ifconfig
		...
		enp0s3: flags=4163<UP,BROADCAST,RUNNING,MULTICAST>  mtu 1500
				inet 10.1.63.204  netmask 255.255.255.248  broadcast 10.1.63.207
				inet6 fe80::4ff5:c397:87d9:9c94  prefixlen 64  scopeid 0x20<link>
				ether 08:00:27:86:6f:f4  txqueuelen 1000  (Ethernet)
				RX packets 83949  bytes 124183056 (124.1 MB)
				RX errors 0  dropped 0  overruns 0  frame 0
				TX packets 28617  bytes 2286620 (2.2 MB)
				TX errors 0  dropped 0 overruns 0  carrier 0  collisions 0
		...
		```
	
	-	DBeaver
		при насройке соединения:
		-	скачать драйвера если потребуется для соединения с Postgres
		-	указать адрес виртуальной машины полученный через ifconfig
		-	указать базу данных, логин, пароль, порт

____

-	сеанс

	____

	-	войти как root-админ
		```
		lisandrsh@server:~$ sudo -i
		[sudo] password for lisandrsh: 
		```
	-	показать список контэйнеров
		```
		root@server:~# docker container ls -a
		CONTAINER ID   IMAGE              COMMAND                  CREATED        STATUS                      PORTS     NAMES
		f5d633e19ca4   lisandrsh/nodejs   "docker-entrypoint.s…"   39 hours ago   Exited (137) 20 hours ago             mynode
		5649ce4912c6   hello-world        "/hello"                 6 days ago     Exited (0) 6 days ago                 silly_einstein
		```
	-	попытка подключится к postgres через telnet
		```
		root@server:~# telnet localhost 5432
		Trying 127.0.0.1...
		telnet: Unable to connect to remote host: Connection refused
		```
		-	https://losst.ru/kak-polzovatsya-telnet

	-	вывести содержимое '/pgdata'
		> persist data by mounting a directory from the host machine
		```
		root@server:~# ls /pgdata
		ls: cannot access '/pgdata': No such file or directory
		```

	____

	-	запуск контэйнера postgres

		-	сокращение: запуск контэйнера postgres
			```
			docker container run 
				-d --name=pg 
				-p 5432:5432 
				--user $(id -u):$(id -g) 
				-e POSTGRES_PASSWORD=postgres 
				-e PGDATA=/pgdata 
				-v /pgdata:/pgdata 
				postgres:latest

			docker container run 
				-d --name=pg 
				-p 5432:5432 
				-e POSTGRES_PASSWORD=postgres 
				-e PGDATA=/pgdata 
				--mount type=volume,src=pgdata,target=/pgdata 
				postgres:latest

			docker container run 
				-d --name=pg 
				-p 5432:5432 
				-e POSTGRES_PASSWORD=postgres 
				-e PGDATA=/pgdata 
				-v /pgdata:/pgdata 
				postgres:latest 

			docker container run -it --name=pg 
				-p 5432:5432 
				-e POSTGRES_PASSWORD=postgres 
				postgres:latest /bin/bash

			sudo chmod -R 777 .
    		sudo chown -R root:root .
			```
	
		-	официальное решение
			```
			docker run -it --rm 
				--user "$(id -u):$(id -g)" 
				-v /etc/passwd:/etc/passwd:ro 
				-e POSTGRES_PASSWORD=postgres 
				postgres

			docker run -it --rm 
				-v pgdata:/var/lib/postgresql/data 
				-e POSTGRES_PASSWORD=postgres 
				postgres:latest 

			docker run -it --rm 
				-v pgdata:/var/lib/postgresql/data bash chown 
				-R 1000:1000 /var/lib/postgresql/data

			docker run -d --name pg 
				-p 5432:5432 
				--user 1000:1000 
				-e POSTGRES_PASSWORD=postgres 
				-v pgdata:/var/lib/postgresql/data 
				postgres
			```
	
	```
	lisandrsh@server:/etc$ sudo userdel postgres
	lisandrsh@server:/etc$ sudo groupadd -g 999 postgres
	lisandrsh@server:/etc$ sudo useradd -u 999 -g 999 postgres
	lisandrsh@server:/etc$ cat passwd
	```

	____

	-	ошибка
		```
		lisandrsh@server:~$ docker logs pg
		error: exec: "/usr/local/bin/docker-entrypoint.sh": stat /usr/local/bin/	docker-entrypoint.sh: permission denied
		```

	____

	-	расшифровка
		> the environment variable PGDATA can be used to specify the data directory for the Postgres server
		> all of the configuration files and data are stored in that directory
		```
		root@server:~# docker container run -d 
			--name=pg 
		// 5432 это TCP порт Postgres по умолчанию
			-p 5432:5432
		// админский пароль 
			-e POSTGRES_PASSWORD=postgres
		// директория с даными (можно вывести через "ls /pgdata")
			-e PGDATA=/pgdata
		// mount volume/directory (настроить том по адресу директории PGDATA)
			-v /pgdata:/pgdata
		// последний образ postgres, где latest это тег версии
			postgres:latest
		```
		-	тэги версий образов postgres можно найти здесь: https://hub.docker.com/_/postgres

	____

	-	показать новый образ
		```
		root@server:~# docker container ls -a
		CONTAINER ID   IMAGE              COMMAND                  CREATED         STATUS                      PORTS                    NAMES
		3ae0af87c734   postgres:latest    "docker-entrypoint.s…"   2 minutes ago   Up 2 minutes                0.0.0.0:5432->5432/tcp   pg
		f5d633e19ca4   lisandrsh/nodejs   "docker-entrypoint.s…"   39 hours ago    Exited (137) 20 hours ago                            mynode
		5649ce4912c6   hello-world        "/hello"                 6 days ago      Exited (0) 6 days ago                                silly_einstein
		```

	____

	-	содержимое volume папки /pgdata
		> the mounted directory did not exist and Docker created it for us Postgres populated it with data files and config files like postgresql.conf and pg_hba.conf
		```
		root@server:~# ls -l /pgdata/
		total 124
		...
		```

	-	доступ к папке /pgdata (папка была создана в папке админа (admin:///))
		-	перейти в папку
			```
			root@server:~# cd /pgdata
			```
		-	вывести текущий путь
			```
			root@server:/pgdata# pwd
			/pgdata
			```
		-	содержимое папки
			```
			root@server:/pgdata# ls
			base          pg_dynshmem    pg_logical    pg_replslot   pg_stat      pg_tblspc    pg_wal                postgresql.conf
			global        pg_hba.conf    pg_multixact  pg_serial     pg_stat_tmp  pg_twophase  pg_xact               postmaster.opts
			pg_commit_ts  pg_ident.conf  pg_notify     pg_snapshots  pg_subtrans  PG_VERSION   postgresql.auto.conf  postmaster.pid
			```

	____

	-	проблемы с вызовом psql 
		> psql is a command line interface client that ships with Postgres

		-	требует установки postgresql-client-common
			```
			root@server:~# psql -h localhost -p 5432 -U postgres
			Command 'psql' not found, but can be installed with:
			apt install postgresql-client-common
			```
		-	установка postgresql-client-common
			```
			root@server:~# apt install postgresql-client-common
			Reading package lists... Done
			...
			```
		-	требует установки postgresql-client-<version>
			-	[install postgresql-client-<version>](https://stackoverflow.com/questions/28290488/get-error-you-must-install-at-least-one-postgresql-client-version-package-whe)
			```
			root@server:~# psql -h localhost -p 5432 -U postgres
			Error: You must install at least one postgresql-client-<version> package
			```
		-	установить общий postgresql-client
			```
			root@server:~# apt-get install postgresql-client
			Reading package lists... Done
			...
			```
		-	обновить пакеты
			```
			root@server:~# apt-get update
			```

	> connections from localhost are "Trusted" by default and do not require a password, Host Based Authentication can be specified for each network address/range in the [pg_hba.conf](https://postgrespro.ru/docs/postgrespro/10/auth-pg-hba-conf) file

	-	после всех установок, запуск psql внутри контейнера
		-	подключиться к контейнеру
			```
			root@server:~# docker exec -it 3ae0af87c734 bash
			```
			-	версия psql
				```
				root@3ae0af87c734:/# psql --version
				psql (PostgreSQL) 13.2 (Debian 13.2-1.pgdg100+1)
				```
			-	запустить psql
				```
				root@3ae0af87c734:/# psql -h localhost -p 5432 -U postgres
				psql (13.2 (Debian 13.2-1.pgdg100+1))
				Type "help" for help.				
				```
				-	выйти из psql
					```
					postgres=# exit
					```
			-	выйти из контейнера
				```
				root@3ae0af87c734:/# exit
				exit
				```

	____

	-	запустить psql из консоли для экземпляра postgres работающего в контейнере
		```
		root@server:~# psql -h localhost -p 5432 -U postgres
		Password for user postgres: 
		psql (12.6 (Ubuntu 12.6-0ubuntu0.20.04.1), server 13.2 (Debian 13.2-1.pgdg100+1))
		WARNING: psql major version 12, server major version 13.
		         Some psql features might not work.
		Type "help" for help.
		```
		
		-	вывести версию PostgreSQL, psql будет ждать завершения ввода многострочной команды, пока не встретит симол ';'
			```
			select version();
			```
			эквивалентно: 
			```
			postgres=# select version()		// строка ввода =#
			postgres-# ;					// строка ввода -#
			...
			PostgreSQL 13.2 (Debian 13.2-1.pgdg100+1) on x86_64-pc-linux-gnu, compiled by gcc (Debian 8.3.0-6) 8.3.0, 64-bit
			(1 row)
			```
		-	создать таблицу
			```
			postgres=# create table foss(name text, id int generated by default as identity);
			CREATE TABLE
			postgres=# select * from foss;
			name | id 
			------+----
			(0 rows)
			```
		-	добавить записи к таблицу
			```
			postgres=# insert into foss(name) values ('Postgres'),('Lucee'),('DBeaver');
			INSERT 0 3
			postgres=# select * from foss;
			name   | id 
			----------+----
			Postgres |  1
			Lucee    |  2
			DBeaver  |  3
			(3 rows)
			```
		-	особая команда клиента psql
			> \dt is a psql command and will not work in other SQL clients
			> 	there are plently of options and commands in psql and I encourage you to check it out
			```
			postgres=# \dt
					List of relations
			Schema | Name | Type  |  Owner   
			--------+------+-------+----------
			public | foss | table | postgres
			(1 row)
			```
		-	выйти из psql
			```
			postgres=# \q
			```

	____

	-	запустить bash на контейнере
		```
		root@server:~# docker container exec -it pg bash
		```
		-	содержимое контэйнера
			```
			root@3ae0af87c734:/# ls
			bin   dev			  docker-entrypoint.sh	home  lib64  mnt  pgdata  root	sbin  sys  usr
			boot  docker-entrypoint-initdb.d  etc			lib   media  opt  proc	  run	srv   tmp  var
			```
		-	содержимое /pgdata 
			```
			root@3ae0af87c734:/# ls /pgdata/
			base	      pg_dynshmem    pg_logical    pg_replslot	 pg_stat      pg_tblspc    pg_wal		 postgresql.conf
			global	      pg_hba.conf    pg_multixact  pg_serial	 pg_stat_tmp  pg_twophase  pg_xact		 postmaster.opts
			pg_commit_ts  pg_ident.conf  pg_notify	   pg_snapshots  pg_subtrans  PG_VERSION   postgresql.auto.conf  postmaster.pid
			```
		-	выйти из контэйнера
			```
			root@3ae0af87c734:/# exit
			exit
			```
	
	-	запустить psql на контейнере
		> this time psql connects to the Postgres server from inside the container
		> the connection from localhost is Trusted - no password reuired
		```
		root@server:~# docker container exec -it pg psql -U postgres
		psql (13.2 (Debian 13.2-1.pgdg100+1))
		Type "help" for help.
		```

	-	вызов telnet когда postgres работает
		```
		root@server:~# telnet localhost 5432
		Trying 127.0.0.1...
		Connected to localhost.
		Escape character is '^]'.
		```
