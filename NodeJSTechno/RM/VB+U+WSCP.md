# Virtual Box + Ubuntu + WinSCP

1. Настройка ВМ.
    - Settings/Network/
        ```
        Adapter 1
        └┈┈ ☑ Enable Network Adapter
            Attached to: Bridged Adapter
                   Name: ...
        ```
2. Настройка Ubuntu.
    - зайти как администратор
        ```
        lisandrsh@server:~$ sudo -i
        [sudo] password for lisandrsh: 
            (пароль 123)
        ```
    - установить программу для вызова ifconfig
        ```
        apt install net-tools
        ```
    - вызов ifconfig, позволяет посмотреть сетевую информацию
        ```
        ifconfig
        >   enp0s3: flags=4163<UP,BROADCAST,RUNNING,MULTICAST>  mtu 1500
        >           inet 192.168.0.102  netmask 255.255.255.0  broadcast 192.168.0.255
            показывает адрес **inet 192.168.0.102** виртуальной машины 'enp0s3'
        ```
    - установка пакета ssh
        ```
        apt-get install ssh
        Do you want to continue? [Y/n] y
        ```
3. Проверка через PuTTY.
    - Category/Session
        ```
        Host Name (or IP address)
        ┌───────────────────────┐
        │ 192.168.0.102         │
        └───────────────────────┘
        Saved Sessions
        ┌───────────────────────┐
        │ ubuntu_64_nodejs      │
        └───────────────────────┘
            (нажать кнопку 'Save')
        ```
    - сеанс (выбрать в PuTTY 'ubuntu_64_nodejs' и нажать 'Load', затем 'Open')
        ```
        login as: lis
        lis@192.168.0.102's password: 123
            (ввеси логин и пароль)

        lis@lis-vb:~$ sudo -i
        [sudo] password for lis:
            (получить права админа)

        root@lis-vb:~# ifconfig
        enp0s3: flags=4163<UP,BROADCAST,RUNNING,MULTICAST>  mtu 1500
                inet 192.168.0.102  netmask 255.255.255.0  broadcast 192.168.0.255
            (вызов ifconfig)
        ```
4. Настройка WinScp.
    - Login/New Site
        ```
        Host name:
        ┌───────────────┐
        │ 192.168.0.102 │
        └───────────────┘
        User name:        Password:
        ┌───────────────┐ ┌───────────────┐
        │ lis           │ │ 123           │
        └───────────────┘ └───────────────┘
            (нажать кнопку 'Save')
        ```
    - нажать Login, чтобы войти
5. Проблема: при выполнении команды 'apt install net-tools' возвращается строка 'Waiting for cache lock: Could not get lock /var/lib/dpkg/lock-frontend. It is he'. Решилось после завершения процессов обновления.
    - ps aux | grep -i apt
        показывает запущенные процессы apt, процесс 'apt.systemd.daily' является ежедневным обновлением пакетов, он же мешает выполнению команды apt
    - systemctl list-units | grep apt
        показывает установленные службы apt