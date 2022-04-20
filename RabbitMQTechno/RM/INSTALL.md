## Устанвока RabbitMQ

- Права администратора (необязательно).
    ```
    lis@lis-vb:/$ sudo -i
    ```
- Обновить пакеты.
    ```
    root@lis-vb:~# apt-get update
    root@lis-vb:~# apt-get upgrade
    ```
- Установка Erlang.
    ```
    root@lis-vb:~# apt-get install erlang
    ```
- Установка сервера RabbitMQ.
    ```
    root@lis-vb:~# apt-get install rabbitmq-server
    ```
- Запуск сервера RabbitMQ.
    ```
    root@lis-vb:~# systemctl enable rabbitmq-server
    root@lis-vb:~# systemctl start rabbitmq-server
    ```
- Проверка статуса сервера RabbitMQ.
    ```
    root@lis-vb:~# systemctl status rabbitmq-server

        ● rabbitmq-server.service - RabbitMQ Messaging Server
             Loaded: loaded (/lib/systemd/system/rabbitmq-server.service; enabled; vend>
             Active: active (running) since Sat 2022-03-26 20:42:47 +03; 2min 33s ago
           Main PID: 28741 (beam.smp)
             Status: "Initialized"
              Tasks: 87 (limit: 2294)
             Memory: 86.1M
             CGroup: /system.slice/rabbitmq-server.service
                     ├─28737 /bin/sh /usr/sbin/rabbitmq-server
                     ├─28741 /usr/lib/erlang/erts-10.6.4/bin/beam.smp -W w -A 64 -MBas >
                     ├─28986 erl_child_setup 65536
                     ├─29011 inet_gethost 4
                     └─29012 inet_gethost 4
    ```
- Подключить UI плагин, который запускается по адресу 'http://localhost:15672/'.
    ```
    root@lis-vb:~# rabbitmq-plugins enable rabbitmq_management
    ```
- Добавить пользователя.
    ```
    root@lis-vb:~# rabbitmqctl add_user admin admin
    ```
- Добавить тег.
    ```
    root@lis-vb:~# rabbitmqctl set_user_tags admin administrator
    ```
- Предоставить пользователю права админа.
    ```
    root@lis-vb:~# rabbitmqctl set_permissions -p / admin  ".*" ".*" ".*"
    ```