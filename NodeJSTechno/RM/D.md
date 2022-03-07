# Docker

1. Установка Docker.
    - права доступа администратора
        ```
        lis@lis-vb:~$ sudo -i
        [sudo] password for lis: 
        ```
    - обновить список пакетов
        ```
        root@lis-vb:~# apt-get update
        ```
    - проверка наличия пакета 'lsb-release'
        ```
        root@lis-vb:~# dpkg -l | grep lsb-release
        ```
    - установка пакетов 'apt-transport-https' и 'ca-certificates'
        ```
        root@lis-vb:~# sudo apt-get install apt-transport-https ca-certificates curl gnupg software-properties-common
        ```
        software-properties-common - предоставляет средства для управления используемыми APT-репозиториями, управляет дистрибутивом и независимыми репозиториями программ.
        gnupg - шифрование/дешифрование файлов в командной строке Linux.
    - добавить ключ репозитория
        ```
        root@lis-vb:~# curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /usr/share/keyrings/docker-archive-keyring.gpg
        ```
    - версия ubuntu
        ```
        root@lis-vb:~# lsb_release -a
        ```
    - установить репозиторий
        ```
        root@lis-vb:~# echo \
        > "deb [arch=amd64 signed-by=/usr/share/keyrings/docker-archive-keyring.gpg] https://download.docker.com/linux/ubuntu \
        > $(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null
        ```
    - обновить список пакетов
        ```
        root@lis-vb:~# sudo apt-get update
        ```
    - установить Docker
        ```
        root@lis-vb:~# sudo apt-get install docker-ce docker-ce-cli containerd.io
        ```
    - проверка после установки, должно быть: **Active: active (running)!**
        ```
        root@lis-vb:~# sudo systemctl status docker
        ```
    - запустить тестовый докер
        ```
        root@lis-vb:~# sudo docker run hello-world
        ```
    - список всех контейнеров
        ```
        root@lis-vb:~# docker ps -a
        ```
2. Создать образ NodeJS.
    - папка с проектами NodeJS
        ```
        lis@lis-vb:~$ mkdir Projects
        lis@lis-vb:~$ cd ./Projects
        lis@lis-vb:~/Projects$ mkdir docker
        lis@lis-vb:~/Projects$ mv docker Docker
        lis@lis-vb:~/Projects$ cd ./Docker
        lis@lis-vb:~/Projects/Docker$ mkdir NodeJS
        lis@lis-vb:~/Projects/Docker$ cd NodeJS
        ```
    - права доступа администратора
        ```
        lis@lis-vb:~$ sudo -i
        ```
    - перейти в папку с проектом, в которой находится файл Dockerfile
        ```
        root@lis-vb:~# cd ./../home/lis/Projects/Docker/NodeJS/nodejs
        ```
    - создать образ
        ```
        root@lis-vb:/home/lis/Projects/Docker/NodeJS/nodejs# docker build . -t lisandrsh/nodejs
        ```
    - показать все образы
        ```
        root@lis-vb:/home/lis/Projects/Docker/NodeJS/nodejs# docker images
            (в списке должен быть образ lisandrsh/nodejs)
        ```
3. создать и запустить контейнер
    - создать и запустить контейнер
        ```
        root@lis-vb:/home/lis/Projects/Docker/NodeJS/nodejs# docker run -d -p 3000:8080 --name mynode --mount type=volume,src=mynode,target=/usr/src/app lisandrsh/nodejs /bin/bash -c "node server.js"
            (для проверки выполнить 'http://localhost:3000/')
        ```
    - показать все запущенные контейнеры
        ```
        root@lis-vb:/home/lis/Projects/Docker/NodeJS/nodejs# docker ps -a
            (все запущенные контейнеры)
        ```
    - показать все хранилища
        ```
        root@lis-vb:~# docker volume ls
            (должен показать наличие хранилища mynode)
        ```
    - вывести информацию хранилища
        ```
        root@lis-vb:~# docker volume inspect mynode
        ```
    - обновление кода 
        ```
        root@lis-vb:~# docker stop mynode
            (остановить контейнер, добавить код в папку '/var/lib/docker/volumes/mynode/_data')
        root@lis-vb:~# docker start mynode
            (запустить контейнер с обновленным кодом)
        ```
4. Обновить доступ к папке для передачи изменений через WinSCP.<br/>
    - [How do I copy files into `/var/www` with WinSCP?](https://superuser.com/questions/286831/how-do-i-copy-files-into-var-www-with-winscp)
    - [How to Login in as SSH root user from WinSCP to AWS.](http://cvlive.blogspot.com/2014/03/how-to-login-in-as-ssh-root-user-from.html)
    - создать группу 'docker'
        ```
        sudo groupadd docker
            (на данном этапе группа 'docker' должна уже существовать)
        ```
    - перейти в каталог с папкой docker
        ```
        cd ./../var/lib
        ```
    - ошибка 'Permission denied'
        ```
            root@lis-vb:/var/lib# cd ./docker
        ```
    - сменить владельца и группу папки docker
        ```
        root@lis-vb:/var/lib# chown root:docker ./docker
        ```
    - сменить владельца и группу рекурсивно для папки volumes
        ```
        root@lis-vb:/var/lib# chown -R root:docker ./docker/volumes
        ```
    - изменить права доступа на 777, доступно всем
        ```
        chmod -R 777 ./docker
            (основной шаг)
        ```
    - добавить пользователя в группы docker и root
        ```
        usermod -aG docker lis
        usermod -aG root lis
            (не рекомендуется добавлять пользователя в группу root)
            (возможно этот шаг не требуется)
        ```
    - показать в каких группах состоит пользователь
        ```
        groups lis
        ```
    - показать пользователей входящих в группу docker
        ```
        getent group docker
        ```
5. Предупреждение: npm WARN package.json: No repository field.
    - просто отсутствует свойство repository в package.json
        ```
        "repository": {
            "type": "git",
            "url": "git://github.com/username/repository.git"
        }
        ```
6. Быстрый способ.
    - посмотреть права доступа на папку
        ```
        root@lis-vb:/var/lib# ls -l | grep docker
        drwx--x--- 13 root          root          4096 дек 19 11:23 docker
        ```
    - добавить пользователя в группу root
        ```
        usermod -aG root lis
        ```
    - прописать доступ к папкам для группы root
        ```
        chmod -R  770 ./docker
        ```