# Docker MongoDB

## [MongoDB inside Docker Container](https://www.youtube.com/watch?v=uklyCSKQ1Po)

```
docker pull mongo:latest
mkdir mongodb-youtube-docker
cd mongodb-youtube-docker
docker run -d -p 2717:27017 -v ~/mongodb-youtube-docker:/data/db --name mymongo mongo:latest
docker exec -it mymongo bash
	show dbs
	use test
	db.user.insert({"name":"truly mittal"})
	dm.user.find()
	exit
mongo localhost:2717
```

____

## СЕАНС

-	запуск докера
	```
	lisandrsh@server:~$ docker run -d -p 2717:27017 -v ~/mongodb-youtube-docker:/data/db --name mymongo mongo:latest
		...
	```

-	подключится к докеру
	```
	lisandrsh@server:~$ docker exec -it mymongo bash
	```
	-	вызвать MongoDB shell
		```
		root@f103a24e2631:/# mongo
		MongoDB shell version v4.4.5
		connecting to: mongodb://127.0.0.1:27017/?compressors=disabled&gssapiServiceName=mongodb
		Implicit session: session { "id" : UUID("b1124f1c-9b47-408d-84a8-b988816184af") }
		MongoDB server version: 4.4.5
		Welcome to the MongoDB shell.
		For interactive help, type "help".
		For more comprehensive documentation, see
			https://docs.mongodb.com/
		Questions? Try the MongoDB Developer Community Forums
			https://community.mongodb.com
		---
		The server generated these startup warnings when booting: 
				2021-04-26T15:52:24.767+00:00: Using the XFS filesystem is strongly recommended with the WiredTiger storage engine. See http://dochub.mongodb.org/core/prodnotes-filesystem
				2021-04-26T15:52:25.734+00:00: Access control is not enabled for the database. Read and write access to data and configuration is unrestricted
		---
		---
				Enable MongoDB's free cloud-based monitoring service, which will then receive and display
				metrics about your deployment (disk utilization, CPU, operation statistics, etc).

				The monitoring data will be available on a MongoDB website with a unique URL accessible to you
				and anyone you share the URL with. MongoDB may use this information to make product
				improvements and to suggest MongoDB products and deployment options to you.

				To enable free monitoring, run the following command: db.enableFreeMonitoring()
				To permanently disable this reminder, run the following command: db.disableFreeMonitoring()
		---
		```
		-	показать все БД
			```
			> show dbs
			admin   0.000GB
			config  0.000GB
			local   0.000GB
			```
		-	использовать новую БД "test"
			```
			> use test
			switched to db test
			```
		-	БД "test" еще не создана
			```
			> show dbs
			admin   0.000GB
			config  0.000GB
			local   0.000GB
			```
		-	добавить новый объект
			```
			> db.user.insert({"name":"true metal"})
			WriteResult({ "nInserted" : 1 })
			```
		-	поиск объекта 
			```
			> db.user.find()
			{ "_id" : ObjectId("6086e2693ac3574388a25779"), "name" : "true metal" }
			```
		-	выход из MongoDB shell
			```
			> ^C
			bye
			```
	-	выйти из контейнера
		```
		root@f103a24e2631:/# exit
		exit
		```

____

-	требуется установка клиента mongodb
	```
	lisandrsh@server:~$ mongo
	Command 'mongo' not found, but can be installed with:
	sudo apt install mongodb-clients
	```

-	установить пакет
	```
	lisandrsh@server:~$ sudo apt install mongodb-clients
	[sudo] password for lisandrsh: 
		...
	```

-	версия MongoDB shell
	```
	lisandrsh@server:~$ mongo
	MongoDB shell version v3.6.8
	connecting to: mongodb://127.0.0.1:27017
		...
	```

-	использовать MongoDB shell для подключения к MongoDB в контейнере
	```
	lisandrsh@server:~$ mongo localhost:2717
	MongoDB shell version v3.6.8
	connecting to: mongodb://localhost:2717/test
	Implicit session: session { "id" : UUID("b9e8e80c-4240-474e-af9b-053591cb4af7") }
	MongoDB server version: 4.4.5
	WARNING: shell and server versions do not match
	Welcome to the MongoDB shell.
	For interactive help, type "help".
	For more comprehensive documentation, see
		http://docs.mongodb.org/
	Questions? Try the support group
		http://groups.google.com/group/mongodb-user
	Server has startup warnings: 
		...
	```

	-	БД "test" создана
		```
		> show dbs
		admin   0.000GB
		config  0.000GB
		local   0.000GB
		test    0.000GB
		```

____

```
show dbs
use admin
show collections
use company
db
db.info
db.info.count()
db.info.insert({name:'Apple',product:'iphone',emp_no:'100'});
db.find()
db.info.find()
db.info.find().forEach(printjson)
var data = {}
data.name = "technotip"
data.product = "video tutorial"
data.emp = ["Satish", "Kiran"]
data.videos = {}
data.videos.mongo = "MongoDB videos"
data.videos.php = "PHP videos"
db.info.save(data)
db.info.find().forEach(printjson)
```

____

## [Spinning MongoDB, MongoShell and Mongo GUI with Docker](https://www.youtube.com/watch?v=DzyC8lqbjC8)

-	GUI-клиент для MongoDB
	```
	docker pull mongoclient/mongoclient:latest
	```

-	работает только на порте 3000 --- http://localhost:3000/
	```
	docker run -d -p 3000:3000 mongoclient/mongoclient
	```

____

## Windows MongoDB

[Install MongoDB Community Edition on Windows](https://docs.mongodb.com/manual/tutorial/install-mongodb-on-windows/)

-	чтобы администрировать mongoDB лучше использовать MongoDB Compass 

	[What is MongoDB Compass?](https://docs.mongodb.com/compass/current/)

	[Connect to MongoDB](https://docs.mongodb.com/compass/current/connect/)

	[MongoDB ODBC Driver for BI Connector](https://docs.mongodb.com/bi-connector/current/reference/odbc-driver/)

	[mongodb/mongo-odbc-driver](https://github.com/mongodb/mongo-odbc-driver/releases/)

	[MongoDB ODBC Driver](https://www.mongodb.com/blog/post/odbc-driver-for-the-mongodb-connector-for-business-intelligence)

	[DBeaver - MongoDB](https://dbeaver.com/databases/mongo/)

-	чтобы открыть окно служб выполнить: services.msc 
-	чтобы вывести все службы в powershell

	[Windows: List Services – CMD & PowerShell](https://www.shellhacks.com/ru/windows-list-services-cmd-powershell/)

	```
	PS C:\Users\Professional> Get-Service
	```

____

### ПЕРВЫЙ ТЕРМИНАЛ: ЗАПУСК ДАЕМОНА mongod

-	перейти в папку с mongo, чтобы запустить демона mongod
	```
	C:\Users\Professional>cd C:\Program Files\MongoDB\Server\4.4\bin
	```

-	первый вызов mongod приводит к ошибке NonExistentPath, так как отсутствует папка 'C:\data\db\', чтобы исправить ошибку необходимо создать указанную папку
	```
	C:\Pogram Files\MongoDB\Server\4.4\bin>mongod
		...
	{"t":{"$date":"2021-04-26T19:21:47.382+03:00"},"s":"E",  "c":"STORAGE",  "id":20557,   "ctx":"initandlisten","msg":"DBException in initAndListen, terminating","attr":{"error":"NonExistentPath: Data directory C:\\data\\db\\ not found. Create the missing directory or specify another path using (1) the --dbpath command line option, or (2) by adding the 'storage.dbPath' option in the configuration file."}}
		...
	```

-	второй вызов mongod, возвращает предупреждения startupWarnings:
	```
	C:\Program Files\MongoDB\Server\4.4\bin>mongod
		...
	{"t":{"$date":"2021-04-26T20:36:26.086+03:00"},"s":"W",  "c":"CONTROL",  "id":22120,   "ctx":"initandlisten","msg":"Access control is not enabled for the database. Read and write access to data and configuration is unrestricted","tags":["startupWarnings"]}
	{"t":{"$date":"2021-04-26T20:36:26.087+03:00"},"s":"W",  "c":"CONTROL",  "id":22140,   "ctx":"initandlisten","msg":"This server is bound to localhost. Remote systems will be unable to connect to this server. Start the server with --bind_ip <address> to specify which IP addresses it should serve responses from, or with --bind_ip_all to bind to all interfaces. If this behavior is desired, start the server with --bind_ip 127.0.0.1 to disable this warning","tags":["startupWarnings"]}
		...
	```

____

### ВТОРОЙ ТЕРМИНАЛ: ЗАПУСК MongoDB shell

-	в той же папке с mongo запустить клиента mongo
	```
	C:\Users\Professional>cd C:\Program Files\MongoDB\Server\4.4\bin
	```

-	запустить MongoDB shell
	```
	C:\Program Files\MongoDB\Server\4.4\bin>mongo
	MongoDB shell version v4.4.5
		...
	```

	-	можно выполнять операции 
	```
	> show dbs
	admin   0.000GB
	config  0.000GB
	local   0.000GB
	```
