# UBUNTU

## утилита Grep

**выполняет поиск файлов по строке**

Чтобы выполнить поиск среди нескольких файлов следует передать вывод команды ls в grep через вертикальную черту '|'. В grep передается искомое слово. Если команда grep ничего не вернула, значит искомого файла/папки не существует в данной директории. 
```
ls | grep Documents
```

Поиск по целому предложению.
```
ls | grep 'My Documents'
```

Пример: поиск указанных в кавычках слов в файле 'Students.txt'.
```
grep 'Class 1' Students.txt
```

## Ubuntu + WinScp

### настройка VirtualBox

-   Bridged Adapter
    ```
    в настройках 'Virtual Box' с Ubuntu указать в Network -> Attached to: Bridged Adapter
    ```

### Ubuntu

-   Terminal
    ```
    To run a command as administrator (user "root"), use "sudo <command>".
    See "man sudo_root" for details.
    ```
-   сеанс
    -   зайти как администратор
        ```
        lisandrsh@server:~$ sudo -i
        [sudo] password for lisandrsh: 
        ```
    -   установка пакета 'net-tools' для выполнения команды ifconfig
        ```
        root@server:~# apt install net-tools
        Reading package lists... Done
        ...
        ```
    -   выполнение команды ifconfig показывает адрес **inet 10.1.63.204** для виртуальной машины 'enp0s3', адрес следует указать в настройках WinScp
        ```
        root@server:~# ifconfig

        enp0s3: flags=4163<UP,BROADCAST,RUNNING,MULTICAST>  mtu 1500
                inet 10.1.63.204  netmask 255.255.255.248  broadcast 10.1.63.207
                inet6 fe80::4ff5:c397:87d9:9c94  prefixlen 64  scopeid 0x20<link>
                ether 08:00:27:86:6f:f4  txqueuelen 1000  (Ethernet)
                RX packets 35796  bytes 53941336 (53.9 MB)
                RX errors 0  dropped 0  overruns 0  frame 0
                TX packets 10914  bytes 907865 (907.8 KB)
                TX errors 0  dropped 0 overruns 0  carrier 0  collisions 0

        lo: flags=73<UP,LOOPBACK,RUNNING>  mtu 65536
                inet 127.0.0.1  netmask 255.0.0.0
                inet6 ::1  prefixlen 128  scopeid 0x10<host>
                loop  txqueuelen 1000  (Local Loopback)
                RX packets 207  bytes 17874 (17.8 KB)
                RX errors 0  dropped 0  overruns 0  frame 0
                TX packets 207  bytes 17874 (17.8 KB)
                TX errors 0  dropped 0 overruns 0  carrier 0  collisions 0
        ```
    -   установка пакета ssh
        ```
        root@server:~# sudo apt-get install ssh
        Reading package lists... Done
        ...
        ```

### проверка через PuTTY

-   сохранить настройку с ip адресом полученным командой ifconfig
-   сеанс
    -   ввести логин и пароль
        ```
        login as: lisandrsh
        lisandrsh@10.1.63.204's password:
        Welcome to Ubuntu 20.04.2 LTS (GNU/Linux 5.8.0-48-generic x86_64)

         * Documentation:  https://help.ubuntu.com
         * Management:     https://landscape.canonical.com
         * Support:        https://ubuntu.com/advantage

        0 updates can be installed immediately.
        0 of these updates are security updates.

        Your Hardware Enablement Stack (HWE) is supported until April 2025.

        The programs included with the Ubuntu system are free software;
        the exact distribution terms for each program are described in the
        individual files in /usr/share/doc/*/copyright.

        Ubuntu comes with ABSOLUTELY NO WARRANTY, to the extent permitted by
        applicable law.
        ```
    -   проверка
        ```
        lisandrsh@server:~$ sudo -i
        [sudo] password for lisandrsh:
        root@server:~# ifconfig

        enp0s3: flags=4163<UP,BROADCAST,RUNNING,MULTICAST>  mtu 1500
                inet 10.1.63.204  netmask 255.255.255.248  broadcast 10.1.63.207
        ...
        ```

### настройка WinScp

-   указать ip-адрес из ifconfig: 10.1.63.204
-   указать логин/пароль из ubuntu

## Install Docker

-   [установка Docker на Ubuntu](https://docs.docker.com/engine/install/ubuntu/)

-   обновить список пакетов
    ```
    lisandrsh@server:~$ apt-get update
    Reading package lists... Done
    ...
    ```
-   проверка наличия пакета 'lsb-release'
    ```
    lisandrsh@server:~$ dpkg -l | grep lsb-release
    ii  lsb-release                                11.1.0ubuntu2
    all          Linux Standard Base version reporting utility
    ```
-   установка пакетов 'apt-transport-https' и 'ca-certificates'
    ```
    lisandrsh@server:~$ sudo apt-get install apt-transport-https ca-certificates curl gnupg software-properties-common
    [sudo] password for lisandrsh: 
    Reading package lists... Done
    ...
    ```
-   добавили ключ репозитория (add Docker’s official GPG key)
    ```
    lisandrsh@server:~$ curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /usr/share/keyrings/docker-archive-keyring.gpg
    ```
    -   возвращает сам ключ:
        ```
        curl -fsSL https://download.docker.com/linux/ubuntu/gpg
        ```
    -   Записывает ключ куда то?
        ```
        sudo gpg --dearmor -o /usr/share/keyrings/docker-archive-keyring.gpg
        ```
    -   [Using GPG to encrypt a file.](http://www.asksomegeeks.com/posts/online-information-for-geeks/using-gpg-to-encrypt-a-file.html)
    -   [apt-key](https://www.opennet.ru/man.shtml?topic=apt-key&category=8&russian=2)

-   узнать версию ubuntu
    ```
    lisandrsh@server:~$  lsb_release -a
    No LSB modules are available.
    Distributor ID:	Ubuntu
    Description:	Ubuntu 20.04.2 LTS
    Release:	20.04
    Codename:	focal
    ```
    -   [check Ubuntu version](https://www.ionos.com/digitalguide/server/know-how/check-ubuntu-version)
    -   [пакет lsb-release](https://packages.debian.org/ru/sid/lsb-release)

-   установить репозиторий (set up the stable repository), символ '\\' позволяет выполнять многострочную команду
    ```
    lisandrsh@server:~$ echo \
    > "deb [arch=amd64 signed-by=/usr/share/keyrings/docker-archive-keyring.gpg] https://download.docker.com/linux/ubuntu \
    > $(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null
    [sudo] password for lisandrsh: 
    ```

-   обновить список пакетов (**Не забыть sudo!**)
    ```
    lisandrsh@server:~$ sudo apt-get update
    ...
    Reading package lists... Done
    ```

-   установка Docker (**Не забыть sudo!**)
    ```
    lisandrsh@server:~$ sudo apt-get install docker-ce docker-ce-cli containerd.io
    Reading package lists... Done
    ...
    ```

-   проверка после установки, должно быть: **Active: active (running)!**
    ```
    lisandrsh@server:~$ sudo systemctl status docker

    ● docker.service - Docker Application Container Engine
         Loaded: loaded (/lib/systemd/system/docker.service; enabled; vendor preset: enabled)
         Active: active (running) since Mon 2021-04-12 12:08:04 MSK; 4min 32s ago
    TriggeredBy: ● docker.socket
           Docs: https://docs.docker.com
       Main PID: 3827 (dockerd)
          Tasks: 10
         Memory: 42.4M
         CGroup: /system.slice/docker.service
                 └─3827 /usr/bin/dockerd -H fd:// --containerd=/run/containerd/containerd.sock
    ```

-   запустить тестовый докер
    ```
    lisandrsh@server:~$ sudo docker run hello-world

    Unable to find image 'hello-world:latest' locally
    latest: Pulling from library/hello-world
    b8dfde127a29: Pull complete 
    Digest: sha256:308866a43596e83578c7dfa15e27a73011bdd402185a84c5cd7f32a88b501a24
    Status: Downloaded newer image for hello-world:latest

    Hello from Docker!
    This message shows that your installation appears to be working correctly.

    To generate this message, Docker took the following steps:
     1. The Docker client contacted the Docker daemon.
     2. The Docker daemon pulled the "hello-world" image from the Docker Hub.
        (amd64)
     3. The Docker daemon created a new container from that image which runs the
        executable that produces the output you are currently reading.
     4. The Docker daemon streamed that output to the Docker client, which sent it
        to your terminal.

    To try something more ambitious, you can run an Ubuntu container with:
     $ docker run -it ubuntu bash

    Share images, automate workflows, and more with a free Docker ID:
     https://hub.docker.com/

    For more examples and ideas, visit:
     https://docs.docker.com/get-started/
    ```
