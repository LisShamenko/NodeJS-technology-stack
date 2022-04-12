## Errors.

### Uncaught ReferenceError ReferenceError: TextEncoder is not defined.

1. Обновить NodeJS до версии 12.0 - 14.0. [Mongoose github.](https://github.com/Automattic/мангуст/issues/10638)
    - Обновить базу данных пакетов.
        ```
        lis@lis-vb:~$ sudo apt update
        ```
    - Прямая установка NodeJS.
        ```
        lis@lis-vb:~$ sudo apt install nodejs
        ```
    - Проверка версии NodeJS.
        ```
        lis@lis-vb:~$ node --version
        v10.19.0
        ```
    - Обновить базу данных пакетов.
        ```
        lis@lis-vb:~$ sudo apt update
        ```
    - Обновить пакеты до последних версий.
        ```
        lis@lis-vb:~$ sudo apt -y upgrade
        ```
    - Установить необходимые пакеты.
        ```
        lis@lis-vb:~$ sudo apt -y install curl dirmngr apt-transport-https lsb-release ca-certificates
        ```
    - Добавить данные по версиям NodeJS.
        ```
        lis@lis-vb:~$ curl -sL https://deb.nodesource.com/setup_12.x | sudo -E bash -
        ```    
    - Установить NodeJS.
        ```
        lis@lis-vb:~$ sudo apt -y install nodejs
        ```
    - Установить компиляторы C:
        - gcc       компилятор языка программирования С
        - g++       компилятор языка программирования C++
        - make      утилита для организации сборки нескольких файлов
        ```
        lis@lis-vb:~$ sudo apt -y install gcc g++ make
        ```
    - Проверка версии NodeJS.
        ```
        lis@lis-vb:~$ node --version
        v12.22.11
        ```
    - Проверка версии npm.
        ```
        lis@lis-vb:~$ npm --version
        6.14.16
        ```
2. Добавить объявление TextEncoder в файл encoding.js.
    - Файл encoding.js находится по одному из двух птей: 
        - node_modules/whatwg-url/dist/encoding.js
        - node_modules/whatwg-url/lib/encoding.js
        ```
        const {TextDecoder, TextEncoder} = require("util");
            ...
        var util = require('util');
        var encoder = new util.TextEncoder('utf-8');
        ```