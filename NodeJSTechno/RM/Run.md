# Инструкция по запуску кода на Ubuntu.

- зайти как админ
    ```
    lis@lis-vb:~$ sudo -i
    ```
- перейти в папку с каталогом docker
    ```
    root@lis-vb:~# cd ./../var/lib
    ```
- проверить доступ к каталогу docker
    ```
    root@lis-vb:/var/lib# ls -l
    drwx--x--- 13 root          root          4096 фев 19 17:57 docker
    ```
- разрешить доступ к каталогу docker
    ```
    root@lis-vb:/var/lib# chmod -R  770 ./docker
    ```
- проверить доступ к каталогу docker
    ```
    root@lis-vb:/var/lib# ls -l
    drwxrwx--- 13 root          root          4096 фев 19 17:57 docker
    ```
- просмотр контейнеров
    ```
    root@lis-vb:/var/lib# docker ps -a
    ```
- остановить контейнер mynode
    ```
    root@lis-vb:/var/lib# docker stop mynode
    ```
- через WinCSP добавить код в папку '/var/lib/docker/volumes/mynode/_data'
- запустить контейнер mynode
    ```
    root@lis-vb:/var/lib# docker start mynode
    ```
- чтобы посмотреть логи
    ```
    root@lis-vb:/var/lib# docker logs mynode
    ```