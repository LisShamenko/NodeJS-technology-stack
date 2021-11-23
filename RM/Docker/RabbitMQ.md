# Docker RabbitMQ

[rabbitmqctl](https://www.rabbitmq.com/rabbitmqctl.8.html)

____

## [Learning - How to use RabbitMQ with Docker and NodeJs](https://www.youtube.com/watch?v=KLUJyrqlZ-w)

-	запуск докера с rabbitmq
	```
	docker run -d -p 15672:15672 -p 5672:5672 --name rabbitmq rabbitmq:3-management
	```

-	зайти в браузере в админку как гость
	```
	http://localhost:15672/
	Username: guest
	Password: guest
	```

-	добавить нового пользователя, два способа:
	-	через админку:
		```
		http://localhost:15672/#/users
		```
	-	через консоль:
		```
		rabbitmqctl add_user admin admin
		rabbitmqctl set_user_tags admin administrator
		rabbitmqctl set_permissions -p / admin  ".*" ".*" ".*"
		```

-	удалить пользователя: guest
	```
	rabbitmqctl delete_user janeway
	```

-	проект nodejs
	
	-	установить пакет для работы с RabbitMQ
		```
		npm i -s amqplib
		```

	-	node prodcuer.js
		```
		const amqp = require("ampqlib");

		connect();

		const rabbitSettings = {
			protocol: 'amqp',
			hostname: 'localhost',
			port: 5672,
			username: 'admin',
			password: 'admin',
			vhost: '/', 									// virtual host
			authMechanism: ['PLAIN','AMQPLAIN','EXTERNAL']
		};

		async function connect() {
		
			const queue = "employees";

			const msgs = [
				{ "name": "Enjoyable Programming Youtube", "enterprise": "Youtube" },
				{ "name": "Enjoyable Programming Facebook", "enterprise": "Facebook" },
				{ "name": "Enjoyable Programming Y", "enterprise": "Youtube" },
				{ "name": "Enjoyable Programming F", "enterprise": "Facebook" },
			];

			try {
				const conn = await ampq.connect(rabbitSettings);
				console.log("Connection Created...");

				const channel = await conn.createChannel()
				console.log("Channel Created...");

				const res = await channel.assertQueue(queue);
				console.log("Queue Created...");

				for (let msg in msgs) {
					await channel.sendToQueue(queue, Buffer.from(JSON.stringify(msgs[msg])));
					console.log("Message sent to queue ${queue}");
				}
			}
			catch(err) {
				console.log(err);
			}
		}
		```

	-	node consumer.js
		```
		const amqp = require("ampqlib");

		connect();

		const rabbitSettings = {
			protocol: 'amqp',
			hostname: 'localhost',
			port: 5672,
			username: 'admin',
			password: 'admin',
			vhost: '/', 									// virtual host
			authMechanism: ['PLAIN','AMQPLAIN','EXTERNAL']
		};

		async function connect() {
		
			const queue = "employees";
			const enterprise = "Youtube";

			try {
				const conn = await ampq.connect(rabbitSettings);
				console.log("Connection Created...");

				const channel = await conn.createChannel()
				console.log("Channel Created...");

				const res = await channel.assertQueue(queue);
				console.log("Queue Created...");

				console.log("Waiting for messages from &{enterprise}");
				channel.consume(queue, message => {
					let employee = JSON.parse(message.content.toString());
					console.log("Received employee ${employee.name}");
					console.log(employee);

					if (employee.enterprise == enterprise) {
						channel.ack(message);
						console.log("Deleted message from queue...\n");
					}
					else {
						console.log("That message is not for me I'll not delete it...");
					}
				});

			}
			catch(err) {
				console.log(err);
			}
		}
		```

____

## Installing RabbitMQ on Linux:

[Installing RabbitMQ on Linux](https://www.youtube.com/watch?v=eazz-Je4HAA)

[How to Install RabbitMQ in Ubuntu](https://www.youtube.com/watch?v=M6K3Fv-GH_I)

	apt-get update
	apt-get upgrade
	apt-get install erlang
	apt-get install rabbitmq-server
	systemctl enable rabbitmq-server
	systemctl start rabbitmq-server
	systemctl status rabbitmq-server
	rabbitmq-plugins enable rabbitmq_management
	rabbitmqctl add_user admin admin
	rabbitmqctl set_user_tags admin administrator
	rabbitmqctl set_permissions -p / admin  ".*" ".*" ".*"

	http://192.168.7.153:15672

____

## [RabbitMQ - How to Start Server](https://www.youtube.com/watch?v=UbUAtr0asI0)

	rabbitmq-diagnostics server_version
	rabbitmqctl status | grep "RabbitMQ\|rabbitmq"
	rabbitmq-diagnostics erlang_version
	rabbitmqctl status
	rabbitmqctl shutdown
	rabbitmq-server
	rabbitmq-server -detached

____

## [Брокер сообщений RabbitMQ: Часть 1. Установка и настройка отказоустойчевого кластера](https://www.youtube.com/watch?v=XiyXOMYoXAw)

**refactoring - требует доработки, сеанс**

-	настройка виртуальных машин
	-	три нод узла 
	-	dns запись для ip машины
	-	на каждой машине настроить файл '/etc/hosts'
		```
		vim /etc/hosts
			10.0.0.101 rabbitmq1
			10.0.0.102 rabbitmq1
			10.0.0.103 rabbitmq1
		ssh root@rabbitmq2
		```

- [Erlang RPM for RabbitMQ](https://github.com/rabbitmq/erlang-rpm)

-	
	```
	vim /etc/yum.repos.d/rabbitmq-erlang.repo
		[rabbitmq_erlang]
		name=rabbitmq_erlang
		baseurl=https://packagecloud.io/rabbitmq/erlang/el/8/$basearch
		repo_gpgcheck=1
		gpgcheck=1
		enabled=1
		# PackageCloud's repository key and RabbitMQ package signing key
		gpgkey=https://packagecloud.io/rabbitmq/erlang/gpgkey
			https://dl.bintray.com/rabbitmq/Keys/rabbitmq-release-signing-key.asc
		sslverify=1
		sslcacert=/etc/pki/tls/certs/ca-bundle.crt
		metadata_expire=300

	vim /etc/yum.repos.d/rabbitmq-server.repo
		...
	```
	
-	установка и запуск rabbitmq-server
	```
	yum install erlang rabbitmq-server

	systemctl status

	systemctl status rabbitmq-server

	systemctl start rabbitmq-server

	systemctl enable rabbitmq-server
	```

-	кластер из трех машин

-	мастер rabbitmq1
	-	куки рандомно сгенерированны при установке
	-	скопировать куки - rabbitmq1
		```
		cat /var/lib/rabbitmq/.erlang.cookie
		LEJIHQJYWUDSULKCNNPC[root@rabbitmq1 ~]# _
		```
	-	заменить в .erlang.cookie на LEJIHQJYWUDSULKCNNPC - rabbitmq2
		```
		vim /var/lib/rabbitmq/.erlang.cookie
		```
	-	заменить в .erlang.cookie на LEJIHQJYWUDSULKCNNPC - rabbitmq3
		```
		vim /var/lib/rabbitmq/.erlang.cookie
		```
	-	куки своего рода секрет
		```
		ls -la /var/lib/rabbitmq/.erlang.cookie
		```
	-	все не мастер машины нужно подключить к мастеру и перезагрузить rabbitmq
		```
		systemctl restart rabbimq-server
		rabbitmqctl cluster_status
		```
	-	добавить новый узел в класстер
		```
		rabbitmqctl stop_app
		```
		процесс продолжает бежать, но сервер находится в режиме обслуживания
		```
		systemctl status rabbitmq-server
		```
		добавить мастер-узел:
		-	сообщения будут сохраняться на диске: --disc
		-	сообщения будут сохраняться в памяти: --ram
		```
		rabbitmqctl join_cluster --disc rabbit@rabbitmq1	
		rabbitmqctl start_app
		rabbitmqctl cluster_status
		```

-	включть админку для мастер-узла, можно установить на все ноды
	```
	rabbitmq-plugins enable rabbitmq_management
	```

-	установить агенты на дочерние ноды. чтобы собирать данные
	```
	rabbitmq-plugins enable rabbitmq_management_agent
	```

-	создать пользователя администратора, запускать на любой ноде в кластере
	```
	rabbitmqctl add_user admin admin
	```

-	добавить в группу администраторов
	```
	rabbitmqctl set_user_tags admin administrator
	```

-	добавить безграничные полномочия
	```
	rabbitmqctl set_permissions -p / admin  ".*" ".*" ".*"
	http://rabbitmq1:15672
	```

-	rabbitmq3
	```
	systemctl stop rabbitmq-server
	systemctl start rabbitmq-server
	```

-	использовать обратный прокси для распределения нагрузки

	**проблема**: без прокси клиент может использовать только один адрес из трех, если произойдет сбой сервера rabbitmq с этим адресов то клиент не сможет работать, доступность пострадает
	
	**решение**: каждый клиент будет подключаться к прокси который перенаправит на работающий узел rabbitmq, упавшие узлы будут помечаться как невалидные, что дает равное использование ресурсов всех узлов и отказоустойчивость:

	[Part 1: RabbitMQ Best Practices](https://www.cloudamqp.com/blog/part1-rabbitmq-best-practice.html)

	[Part 2: RabbitMQ Best Practice for High Performance (High Throughput)](https://www.cloudamqp.com/blog/part2-rabbitmq-best-practice-for-high-performance.html)

	каждая очередь лежит только на одном сервере не зависимо от количества узлов и горизонтальное масштабирование не увеличивает скорость обработки, самый быстрый варинат с одним узлом, а каждый следующий узел повышает доступность за счет скорости работы

-	load balancer --- haproxy
	```
	yum install haproxy
	vim /etc/haproxy/haproxy.cfg
	```
	ОЧЕНЬ МНОГО БУКВ --- 36.49
	```
	systemctl start haproxy
	systemctl status haproxy
	```

-	админка: 
	```
	http://rabbitmq-lb:8080
	```

____

## [Message Queuing with RabbitMQ using NodeJs](https://www.youtube.com/watch?v=Qbs53khPoQs)

-	установка и запуск
	```
	node --version
	brew services list
	brew install rabbitmq
	brew services start rabbitmq
	```

-	npm init -y
	```
	npm install amqplib
	```

-	sender.js
	```
	const amqp = require("amqplib/callback_api");

	// Step 1: Create Connection
	amqp.connect('amqp://localhost', (error, connection) => {
		if (error) {
			throw error;
		}

		// Step 2: Create Channel
		connection.createChannel((error, channel) => {
			if (error) {
				throw error;
			}

			// Step 3: Assert Queue
			const QUEUE = 'codingtest';
			channel.assertQueue(QUEUE);

			// Step 4: Send message to queue
			channel.sendToQueue(QUEUE, Buffer.from('hello from its coding time'));
			console.log('Message send ${QUEUE}');
		});
	});
	```

-	receiver.js
	```
	const amqp = require("amqplib/callback_api");

	// Step 1: Create Connection
	amqp.connect('amqp://localhost', (error, connection) => {
		if (error) {
			throw error;
		}

		// Step 2: Create Channel
		connection.createChannel((error, channel) => {
			if (error) {
				throw error;
			}

			// Step 3: Assert Queue
			const QUEUE = 'codingtest';
			channel.assertQueue(QUEUE);

			// Step 4: Receive Messages
			channel.consume(QUEUE, 
				(msg) => {
					console.log('Message received: ${msg.content}');
				}, 
				{
					noAck: true
				}
			);
		});
	});	
	```