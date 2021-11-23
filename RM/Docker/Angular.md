# Docker Angular - volume

-	текущая папка
	```
	lisandrsh@server:~$ pwd
	/home/lisandrsh
	```

-	перейти в папку
	```
	lisandrsh@server:~$ cd ./../../usr/projects/nodejs-docker/
	```

-	установить группу для папки docker
	```
	lisandrsh@server:/var/lib$ sudo chown root:docker ./docker
	[sudo] password for lisandrsh: 
	```

-	вывести список файлов чтобы посмотреть group
	```
	lisandrsh@server:/var/lib$ ls -l
		...
	drwxrwx--- 13 root          docker        4096 апр 19 08:46 docker
		...
	``` 

-	рекурсивно установить группу для содержимого папки volumes
	```
	lisandrsh@server:/var/lib$ sudo chown -R root:docker ./docker/volumes
	```

-	рекурсивно назначить права доступа

	[chown и chmod в Linux](https://androidp1.ru/kak-polzovatsja-komandami-chown-i-chmod-v-linux/)

	```
	lisandrsh@server:/var/lib/docker$ sudo chmod -R 770 ./volumes/angular-volume
	```

	-	Значения прав в цифрах суммируются:
		```
		полные права 			(rwx) 7 = 4 + 2 + 1
		чтение и запись 		(rw-) 6 = 4 + 2 + 0
		чтение и выполнение 	(r-x) 5 = 4 + 0 + 1
		только чтение 			(r--) 4 = 4 + 0 + 0
		только запись 			(-w-) 2 = 0 + 2 + 0
		права отсутствуют 		(---) 0 = 0 + 0 + 0
		```

	-	Для каждого файла и директории назначаются отдельно права для владельца, группы и остальных пользователей.
		```
		u - Владелец / g - Группа / o - Остальные
		буквы		цифры	
		rwxrwxrwx	777		u,g,o - читают, записывают, выполняют все
		rwxr-xr-x	755		u - читает, записывает, выполняет / g,o - читать и запускать
		rw-r--r--	644		u - чтение и запись / g,o - только четние
		r--------	400		читает только владец
		```

____

## новая струткура папок 

```
volumes					WORKDIR
- nodejs-volume			/projects/nodejs-docker
- angular-volume		/projects/angular-docker
```

```
images
- lisandrsh/nodejs
- lisandrsh/angular
```

```
docker run 
	-d 
	--name node-app 
	-p 3000:8080 
	--mount type=volume,src=nodejs-volume,target=/projects/nodejs-docker 
	lisandrsh/nodejs
```

```
docker run -d --name node-app -p 3001:8080 --mount type=volume,src=nodejs-volume,target=/projects/nodejs-docker lisandrsh/nodejs
```

```
docker build . -t lisandrsh/angular-nginx
```

```
docker run -d --name ng-nginx-app -p 3001:80 lisandrsh/angular-nginx
```

```
docker exec -it ng-nginx-app-volume bash
```

____

## запуск построенного приложения angular

[http-server](https://www.npmjs.com/package/http-server)

[How to run the Dist Folder on Local Machine in Angular 6+?](https://stackoverflow.com/questions/51129053/how-to-run-the-dist-folder-on-local-machine-in-angular-6)

-	установить http-server
	```
	npm install http-server
	```

-	вызвать скрипт на выполнение, использовать первые два адреса
	```
	> node ./node_modules/http-server/bin/http-server ./dist/angular-docker/
		Starting up http-server, serving ./dist/angular-docker/
		Available on:
		  http://192.168.56.1:8080
		  http://10.1.63.205:8080
		  http://127.0.0.1:8080
	```

____

## использовать volume для hot reload

1.	в проекте выполнить построение: ng build
2.	содержимое папки 'dist\angular-docker' сбрасываем через WinSCP на сервер при этом новым файлам прописывается не правильный доступ, что ведет к ошибке: 
	```
	-rw-rw-r-- 1 1000 1000
	```
3.	перейти в папку с volume: /var/lib/docker/volumes/angular-volume/_data
4.	выполнить операции по смене параметров доступа:
	```
	sudo chmod -R 777 .
	sudo chown -R root:root .
	```

____

-	CMD 1
	-	посмотреть права в работающем контейнере с NGINX
		```
		lisandrsh@server:~$ cd ./../../usr/projects/angular-docker/
		lisandrsh@server:/usr/projects/angular-docker$ docker ps -a
			...
		e76c501ea4fd   lisandrsh/angular-nginx   "/docker-entrypoint.…"   30 minutes ago   Up 30 minutes             0.0.0.0:8080->80/tcp     ng-nginx-app
			...
		lisandrsh@server:/usr/projects/angular-docker$ docker exec -it ng-nginx-app bash
		root@e76c501ea4fd:/# cd /usr/share/nginx/html
		root@e76c501ea4fd:/usr/share/nginx/html# ls -l
			... 
		-rwxrwxrwx 1 root root     498 Apr 20 10:38 index.html
			...
		```

____

-	CMD 2
	-	построение образа
		```
		lisandrsh@server:/usr/projects/angular-docker$ docker build . -t lisandrsh/angular-nginx 
		Step 1/15 : FROM node:latest AS build
		Step 2/15 : WORKDIR /app
		Step 3/15 : COPY package.json ./
		Step 4/15 : RUN npm install
		Step 5/15 : COPY . .
		Step 6/15 : RUN npm run build --prod
		Step 7/15 : FROM nginx:latest AS prod-stage
		Step 8/15 : COPY --from=build /app/dist/angular-docker /usr/share/nginx/html
		Step 9/15 : RUN chmod 777 /usr
		Step 10/15 : RUN chmod 777 /usr/share
		Step 11/15 : RUN chmod 777 /usr/share/nginx
		Step 12/15 : RUN chmod 777 /usr/share/nginx/html
		Step 13/15 : RUN chmod 777 -R /usr/share/nginx/html/
		Step 14/15 : EXPOSE 80
		Step 15/15 : CMD ["nginx","-g","daemon off;"]
		```

-	запуск контейнера
	```
	lisandrsh@server:/usr/projects/angular-docker$ docker run -d --name ng-nginx-app-volume -p 8081:80 --mount type=volume,src=angular-volume,target=/usr/share/nginx/html lisandrsh/angular-nginx
	```

	-	расшифровка
		```
		docker run 
			-d 
			--name ng-nginx-app-volume 
			-p 8081:80 
			--mount type=volume,src=angular-volume,target=/usr/share/nginx/html 
			lisandrsh/angular-nginx
		```

-	подключиться к логам контейнера с NGINX после запуска
	```
	lisandrsh@server:/usr/projects/angular-docker$ docker logs ng-nginx-app-volume
	```

	-	вывод после запуска контейнера
		```
		/docker-entrypoint.sh: /docker-entrypoint.d/ is not empty, will attempt to perform configuration
		/docker-entrypoint.sh: Looking for shell scripts in /docker-entrypoint.d/
		/docker-entrypoint.sh: Launching /docker-entrypoint.d/10-listen-on-ipv6-by-default.sh
		10-listen-on-ipv6-by-default.sh: info: Getting the checksum of /etc/nginx/conf.d/default.conf
		10-listen-on-ipv6-by-default.sh: info: Enabled listen on IPv6 in /etc/nginx/conf.d/default.conf
		/docker-entrypoint.sh: Launching /docker-entrypoint.d/20-envsubst-on-templates.sh
		/docker-entrypoint.sh: Launching /docker-entrypoint.d/30-tune-worker-processes.sh
		/docker-entrypoint.sh: Configuration complete; ready for start up
		```
	
	-	вывод ошибки после запроса из браузера, чтобы решить надо прописать доступ для всего содержимого папки "/usr/share/nginx/html/"
		```
		2021/04/20 11:06:40 [error] 31#31: *1 "/usr/share/nginx/html/index.html" is forbidden (13: Permission denied), client: 172.17.0.1, server: localhost, request: "GET / HTTP/1.1", host: "localhost:8081"
		172.17.0.1 - - [20/Apr/2021:11:06:40 +0000] "GET / HTTP/1.1" 403 154 "-" "Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:87.0) Gecko/20100101 Firefox/87.0" "-"
		```

-	подключится к контейнеру
	```
	lisandrsh@server:/usr/projects/angular-docker$ docker exec -it ng-nginx-app-volume bash
	```

____

-	результаты всех вариантов
	```
	root@b275e9883ec3:/# cd /usr/share/nginx/html
	```

	-	I: пользователь и группа заданы не правильно после перемещения данных через WinSCP
		```
		root@b275e9883ec3:/usr/share/nginx/html# ls -l
			... 
		-rw-rw-r-- 1 1000 1000     498 Apr 19 15:33 index.html
			...
		```
	
	-	II: группа задана не правильно, может быть только: root
		```
		root@b275e9883ec3:/usr/share/nginx/html# ls -l
			...
		-rwxrwx--- 1 root 997     498 Apr 19 15:33 index.html
			...
		```

	-	III: здесь все работает
		```
		root@b275e9883ec3:/usr/share/nginx/html# ls -l
			...
		-rwxrwxrwx 1 root root     498 Apr 19 15:33 index.html
			...
		```

____

-	CMD 3

	-	I: права доступа для содержимого volume связанного с NGINX

		группа и пользователь lisandrsh отображаются как '1000' внутри контейнера:
		```
		lisandrsh@server:/var/lib/docker/volumes/angular-volume/_data$ ls -l
			...
		-rw-rw-r-- 1 lisandrsh lisandrsh     498 апр 19 18:33 index.html 
			...
		```

	-	II: попытка включить содержимое в группу docker
		```
		lisandrsh@server:/var/lib/docker/volumes/angular-volume/_data$ sudo chown -R root:docker .
		[sudo] password for lisandrsh: 
		```

	-	II: права доступа для содержимого volume связанного с NGINX, после chown

		группа docker отображаются как '997' внутри контейнера:
		```
		lisandrsh@server:/var/lib/docker/volumes/angular-volume/_data$ ls -l
			...
		-rw-rw-r-- 1 root docker     498 апр 19 18:33 index.html
			...
		```

	-	III: установить полные права для всех групп и пользователей
		```
		lisandrsh@server:/var/lib/docker/volumes/angular-volume/_data$ sudo chmod -R 777 .
		```

	-	III: группу и пользователя установить в root
		```
		lisandrsh@server:/var/lib/docker/volumes/angular-volume/_data$ sudo chown -R root:root .
		```

# Docker Angular - без volume

____

## Windows: создать проект 

-	версия Angular
	```
    C:\Users\Professional>cd E:\PROJECTS
    C:\Users\Professional>E:
    E:\PROJECTS>ng version

         _                      _                 ____ _     ___
        / \   _ __   __ _ _   _| | __ _ _ __     / ___| |   |_ _|
       / △ \ | '_ \ / _` | | | | |/ _` | '__|   | |   | |    | |
      / ___ \| | | | (_| | |_| | | (_| | |      | |___| |___ | |
     /_/   \_\_| |_|\__, |\__,_|_|\__,_|_|       \____|_____|___|
                    |___/


    Angular CLI: 11.2.9
    Node: 14.16.1
    OS: win32 x64

    Angular:
    ...
    Ivy Workspace:

    Package                      Version
    ------------------------------------------------------
    @angular-devkit/architect    0.1102.9 (cli-only)
    @angular-devkit/core         11.2.9 (cli-only)
    @angular-devkit/schematics   11.2.9 (cli-only)
    @schematics/angular          11.2.9 (cli-only)
    @schematics/update           0.1102.9 (cli-only)
	```

    -	создать проект
		```
    	E:\PROJECTS>ng new angular-docker
    	? Do you want to enforce stricter type checking and stricter bundle budgets in the 	workspace?
    	  This setting helps improve maintainability and catch bugs ahead of time.
    	  For more information, see https://angular.io/strict Yes
    	? Would you like to add Angular routing? No
    	? Which stylesheet format would you like to use? CSS
    		...
		```

    -	перейти в каталог с проектом и открыть в visual studio code
		```
    	E:\PROJECTS>cd angular-docker
    	E:\PROJECTS\angular-docker>code .
		```

    -	запуск приложения angular
		```
    	npm start
    	** 
    	Angular Live Development Server is listening on localhost:4200, 
    	open your browser on http://localhost:4200/ 
    	**
		```

    -	разрешить выполнение скриптов Windows PowerShell

    	-	ошибка в Visual Studio Code
			```
    		PS E:\PROJECTS\angular-docker> ng build --prod
    		ng : Невозможно загрузить файл C:\Users\Professional\AppData\Ro
    		aming\npm\ng.ps1, так как выполнение сценариев отключено в этой
    		системе. Для получения дополнительных сведений см. about_Execu
    		tion_Policies по адресу https:/go.microsoft.com/fwlink/?LinkID=135170.
    		строка:1 знак:1
    		+ ng build --prod
    		+ ~~
    			+ CategoryInfo          : Ошибка безопасности: (:) [], PSS ecurityException
    			+ FullyQualifiedErrorId : UnauthorizedAccess
			```

    	-	решение проблемы

    		[Ошибка 'Невозможно загрузить файл ….ps1, так как выполнение сценариев отключено в этой системе'](https://zawindows.ru/решение-проблемы-невозможно-загруз/)

    		-	запустить Windows PowerShell
    		-	узнать политику выполнения скриптов 
				```
    			PS C:\Users\Professional> Get-ExecutionPolicy
    			Restricted
				```
    		-	утсановить новое значение 
				```
    			PS C:\Users\Professional> Set-ExecutionPolicy unrestricted
    			Изменение политики выполнения
    			Политика выполнения защищает компьютер от ненадежных сценариев. Изменение политики выполнения может поставить под
    			угрозу безопасность системы, как описано в разделе справки, вызываемом командой about_Execution_Policies и
    			расположенном по адресу https:/go.microsoft.com/fwlink/?LinkID=135170 . Вы хотите изменить политику выполнения?
    			[Y] Да - Y  [A] Да для всех - A  [N] Нет - N  [L] Нет для всех - L  [S] Приостановить - S  [?] Справка
    			(значением по умолчанию является "N"):y
				```


    -	построение приложения
		```
    	E:\PROJECTS\angular-docker>ng build --prod
    	√ Browser application bundle generation complete.
    	√ Copying assets complete.
    	√ Index html generation complete.
    	Initial Chunk Files               | Names         |      Size
    	main.7dd06046c6d57a5ca7c6.js      | main          | 134.26 kB
    	polyfills.94daefd414b8355106ab.js | polyfills     |  35.98 kB
    	runtime.7b63b9fd40098a2e8207.js   | runtime       |   1.45 kB
    	styles.3ff695c00d717f2d2a11.css   | styles        |   0 bytes
    	                                  | Initial Total | 171.69 kB
    	Build at: 2021-04-19T10:16:59.683Z - Hash: bbe8d47b0a479545f1a2 - Time: 50749ms
		```

____

## Ubuntu: закинуть в контейнер

-	ошибка при сборке, если в исходном каталоге уже присутствует папка node_modules
	```
	lisandrsh@server:/usr/projects/angular-docker$ docker build . -t lisandrsh/angular
		...
	Step 6/10 : RUN npm run build --prod
	 ---> Running in 08259a2753d2
	> angular-docker@0.0.0 build /app
	> ng build
	sh: 1: ng: Permission denied
	npm ERR! code ELIFECYCLE
	npm ERR! errno 126
	npm ERR! angular-docker@0.0.0 build: `ng build`
	npm ERR! Exit status 126
	npm ERR! 
	npm ERR! Failed at the angular-docker@0.0.0 build script.
	npm ERR! This is probably not a problem with npm. There is likely additional logging output 	above.

	npm ERR! A complete log of this run can be found in:
	npm ERR!     /root/.npm/_logs/2021-04-19T11_42_49_027Z-debug.log
	The command '/bin/sh -c npm run build --prod' returned a non-zero code: 126
		...
	```

-	удалить папку node_modules, чтобы не было ошибки при сборке
	```
	lisandrsh@server:/usr/projects/angular-docker$ rm -r node_modules
	```
    
-	второе решение прописать рекурсивно доступ к папке node_modules
    
-	запуск build для angular
	```
	lisandrsh@server:/usr/projects/angular-docker$ docker build . -t lisandrsh/angular
		...
	Step 1/10 : FROM node:latest AS build
		...
	Step 2/10 : WORKDIR /app
		...
	Step 3/10 : COPY package.json ./
		...
	Step 4/10 : RUN npm install
		...
	Step 5/10 : COPY . .
		...
	Step 6/10 : RUN npm run build --prod
		...
	Step 7/10 : FROM nginx:latest AS prod-stage
		...
	Step 8/10 : COPY --from=build /app/dist/angular-docker /usr/share/nginx/html
		...
	Step 9/10 : EXPOSE 80
		...
	Step 10/10 : CMD ["nginx","-g","daemon off;"]
		...
	```

-	запуск контейнера
	```
	lisandrsh@server:/usr/projects/angular-docker$ docker run -d -it -p 8080:80 --name angular lisandrsh/angular
	fdd5cbf64df4d45536f2138b563d05c8f58d0e7151233edaffda5a9bba8426ae
	```
