# Redis

1. Установка Redis.
    - создать каталог для устанвоки
        ```
        lis@lis-vb:~$ mkdir redis
        ```
    - загрузить архивы установки
        ```
        lis@lis-vb:~$ cd redis
        lis@lis-vb:~/redis$ wget https://download.redis.io/releases/redis-6.2.6.tar.gz
        lis@lis-vb:~/redis$ wget https://download.redis.io/releases/redis-7.0-rc2.tar.gz
        ```
    - распаковка tar-архива
        ```
        lis@lis-vb:~/redis$ tar -xf redis-6.2.6.tar.gz
        ```
    - перейти в каталог с распакованным архивом и выполнить установку
        ```
        lis@lis-vb:~/redis$ cd redis-6.2.6
        lis@lis-vb:~/redis/redis-6.2.6$ make
        ```
    - выполнить тесты
        ```
        lis@lis-vb:~/redis/redis-6.2.6$ make test
        ```
    - запустить сервер Redis
        ```
        lis@lis-vb:~/redis/redis-6.2.6$ src/redis-server
            Redis 6.2.6 (00000000/0) 64 bit
            Running in standalone mode
            Port: 6379
            PID: 24561
        ```
    - останвоить сервис Redis
        ```
        sudo service redis-server stop 
        ```
    - запустить сервис Redis
        ```
        sudo service redis-server start
        ```
    - перезапустить сервис Redis
        ```
        sudo service redis-server restart
        ```
    - запустить redis-cli
        ```
        lis@lis-vb:~/redis/redis-6.2.6$ src/redis-cli
            127.0.0.1:6379> set name max
                OK
            127.0.0.1:6379> get name
                "max"
            127.0.0.1:6379> exit
        ```
    - выполнить установку сервера
        ```
        lis@lis-vb:~/redis/redis-6.2.6$ sudo make install
            INSTALL redis-server
            INSTALL redis-benchmark
            INSTALL redis-cli
        ```
    - вывести версию сервера Redis
        ```
        lis@lis-vb:~$ redis-server --version
            Redis server v=6.2.6 sha=00000000:0 malloc=jemalloc-5.1.0 bits=64 build=293232ef778940b1
        ```