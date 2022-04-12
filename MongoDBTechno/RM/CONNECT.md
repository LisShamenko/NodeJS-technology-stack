## Connect.

1. Запуск CLI.
	```
	lis@lis-vb:~$ mongo
	MongoDB shell version v5.0.6
		...
	```
	- Использовать базу данных testdb.
		```
		> use testdb
			switched to db testdb
		```
	- Добавить документы в коллекцию user.
		```
		> db.user.insert({ name:'Taro', age:10, gender:'m' });
			WriteResult({ "nInserted" : 1 })
		> db.user.insert({ name:'Jiro', age:20, gender:'f' });
			WriteResult({ "nInserted" : 1 })
		```
	- Вывести содержимое коллекции user.
		```
		> db.user.find()

			{ "_id" : ObjectId("6252d124e50453c254be9063"), "name" : "Taro", "age" : 10, "gender" : "m" }
			{ "_id" : ObjectId("6252d13be50453c254be9064"), "name" : "Jiro", "age" : 20, "gender" : "f" }
		```
	- Использовать базу данных admin. 
		```
		> use admin
			switched to db admin
		```
	- Создать нового пользователя. 
		```
		> db.createUser({ user:'lis', pwd:'123', roles:[{ role:'userAdminAnyDatabase', db:'admin' }] })

			Successfully added user: {
				"user" : "lis",
				"roles" : [
					{
						"role" : "userAdminAnyDatabase",
						"db" : "admin"
					}
				]
			}
		```
	- Выход.
		```
		> exit
			bye
		```
2. Restart mongod with --auth.
	```
	lis@lis-vb:~$ mongod --auth --dbpath /var/lib/mongo
	```
3. Запуск CLI с аутентификацией lis/123.
	```
	lis@lis-vb:~$ mongo -u lis -p 123 --authenticationDatabase=admin
	MongoDB shell version v5.0.6
		...
	```
	- Использовать базу данных testdb.
		```
		> use testdb
			switched to db testdb
		```
	- Вывести содержимое коллекции user.
		```
		> db.user.find()

			{ "_id" : ObjectId("6252d124e50453c254be9063"), "name" : "Taro", "age" : 10, "gender" : "m" }
			{ "_id" : ObjectId("6252d13be50453c254be9064"), "name" : "Jiro", "age" : 20, "gender" : "f" }
		```
	- Создать пользователя с ограничениями.
		```
		> db.createUser({ user:'test', pwd:'test', roles:[{ role:'readWrite', db:'testdb' }] })

			Successfully added user: {
				"user" : "test",
				"roles" : [
					{
						"role" : "readWrite",
						"db" : "testdb"
					}
				]
			}
		```
	- Выход.
		```
		> exit
			bye
		```
4. Запуск CLI с аутентификацией read/test.
	```
	lis@lis-vb:~$ mongo -u read -p test --authenticationDatabase=admin
	MongoDB shell version v5.0.6
		...
	Error: Authentication failed.
		...
	```
5. Запуск CLI с аутентификацией lis/123.
	```
	lis@lis-vb:~$ mongo -u lis -p 123 --authenticationDatabase=admin
	MongoDB shell version v5.0.6
		...
	```
	- Использовать базу данных testdb.
		```
		> use testdb
			switched to db testdb
		```
	- Вывести содержимое коллекции user.
		```
		> db.user.find()

			{ "_id" : ObjectId("6252d124e50453c254be9063"), "name" : "Taro", "age" : 10, "gender" : "m" }
			{ "_id" : ObjectId("6252d13be50453c254be9064"), "name" : "Jiro", "age" : 20, "gender" : "f" }
		```
	- Использовать базу данных admin. 
		```
		> use admin
			switched to db admin
		```
	- Вернуть всех пользователей, определенных для базы данных admin.
		```
		> db.getUsers()
			[
				{
					"_id" : "admin.lis",
					"userId" : UUID("09ebf121-3ae8-4f4f-a7fd-28bf8a03b5ce"),
					"user" : "lis",
					"db" : "admin",
					"roles" : [
						{
							"role" : "userAdminAnyDatabase",
							"db" : "admin"
						}
					],
					"mechanisms" : [
						"SCRAM-SHA-1",
						"SCRAM-SHA-256"
					]
				}
			]
		```
	- Использовать базу данных testdb.
		```
		> use testdb
			switched to db testdb
		```
	- Вернуть всех пользователей, определенных для базы данных testdb.
		```
		> db.getUsers()
			[
				{
					"_id" : "testdb.read",
					"userId" : UUID("ea965659-260b-415a-afe3-ce3fea440ae2"),
					"user" : "read",
					"db" : "testdb",
					"roles" : [
						{
							"role" : "read",
							"db" : "testdb"
						}
					],
					"mechanisms" : [
						"SCRAM-SHA-1",
						"SCRAM-SHA-256"
					]
				},
				{
					"_id" : "testdb.test",
					"userId" : UUID("540b06d2-626a-40f5-9480-5ce07f72725b"),
					"user" : "test",
					"db" : "testdb",
					"roles" : [
						{
							"role" : "readWrite",
							"db" : "testdb"
						}
					],
					"mechanisms" : [
						"SCRAM-SHA-1",
						"SCRAM-SHA-256"
					]
				}
			]
		```
	- Выход.
		```
		> exit
			bye
		```
6. Запуск CLI с аутентификацией read/test.
	```
	lis@lis-vb:~$ mongo -u read -p test --authenticationDatabase=testdb
	MongoDB shell version v5.0.6
		...
	```
	- Использовать базу данных testdb.
		```
		> use testdb
			switched to db testdb
		```
	- Вывести содержимое коллекции user.
		```
		> db.user.find()

			{ "_id" : ObjectId("6252d124e50453c254be9063"), "name" : "Taro", "age" : 10, "gender" : "m" }
			{ "_id" : ObjectId("6252d13be50453c254be9064"), "name" : "Jiro", "age" : 20, "gender" : "f" }
		```
	- Добавить документы в коллекцию user.
		```
		> db.user.insert({ name:'Writer', age:40, gender:'m' });
			WriteResult({ "nInserted" : 1 })
		```
	- Вывести содержимое коллекции user.
		```
		> db.user.find()

			{ "_id" : ObjectId("6252d124e50453c254be9063"), "name" : "Taro", "age" : 10, "gender" : "m" }
			{ "_id" : ObjectId("6252d13be50453c254be9064"), "name" : "Jiro", "age" : 20, "gender" : "f" }
			{ "_id" : ObjectId("6252d51be74279a195f1e09f"), "name" : "Writer", "age" : 40, "gender" : "m" }
		```
	- Выход.
		```
		> exit
			bye
		```