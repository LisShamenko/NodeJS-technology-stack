## [Устанвока MongoDB.](https://www.mongodb.com/docs/manual/tutorial/install-mongodb-on-ubuntu/)

- Проверка версии Ubuntu.
    ```
    lis@lis-vb:~$ lsb_release -a
        No LSB modules are available.
        Distributor ID:	Ubuntu
        Description:	Ubuntu 20.04.4 LTS
        Release:	20.04
        Codename:	focal
    ```
- Установка gnupg.
    ```
    lis@lis-vb:~$ sudo apt-get install gnupg
    ```
- Загрузка пакета.
    ```
    lis@lis-vb:~$ wget -qO - https://www.mongodb.org/static/pgp/server-5.0.asc | sudo apt-key add -
    ```
- Create a list file for MongoDB.
    ```
    lis@lis-vb:~$ cd ../..
    lis@lis-vb:/$ sudo touch etc/apt/sources.list.d/mongodb-org-5.0.list
    lis@lis-vb:/$ echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu focal/mongodb-org/5.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-5.0.list
    ```
- Reload local package database.
    ```
    lis@lis-vb:/$ sudo apt-get update
    ```
- Install the MongoDB packages.
    ```
    lis@lis-vb:/$ sudo apt-get install -y mongodb-org
    ```
- Init System.
    ```
    lis@lis-vb:/$ ps --no-headers -o comm 1
        systemd
    ```
- Start MongoDB.
    ```
    lis@lis-vb:/$ sudo systemctl start mongod
    ```
- Verify that MongoDB has started successfully.
    ```
    lis@lis-vb:/$ sudo systemctl status mongod
        ● mongod.service - MongoDB Database Server
             Loaded: loaded (/lib/systemd/system/mongod.service; disabled; vendor prese>
             Active: active (running) since Fri 2022-03-25 21:10:24 +03; 10s ago
               Docs: https://docs.mongodb.org/manual
           Main PID: 5581 (mongod)
             Memory: 66.5M
             CGroup: /system.slice/mongod.service
                     └─5581 /usr/bin/mongod --config /etc/mongod.conf

        мар 25 21:10:24 lis-vb systemd[1]: Started MongoDB Database Server.
    ```