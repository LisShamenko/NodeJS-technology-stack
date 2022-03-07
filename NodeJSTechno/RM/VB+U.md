# Virtual Box + Ubuntu

1. Скачать дистрибутив Ubuntu.
    - https://ubuntu.ru/get
    - дистрибутив '.iso', 64 разрядность
2. Создать виртуальную машину.
    - Create Virtual Machine
    - Name and operating system:
        ```
                  Name: ubuntu_64_nodejs
        Machine Folder: C/VirtualBoxes
                  Type: Linux
               Version: Ubuntu (64-bit)
        ```
    - Memory size:
        ```
        2048 MB
        ```
    - Hard Disk:
        ```
        ☐ Do not add a virtual hard disk
        ☑ Create a virtual hard disk now
        ☐ Use an existing virtual hard disk file
        ```
    - Hard disk file type
        ```
        ☑ VDI (Virtual Disk Image)
        ☐ VHD (Virtual Hard Disk)
        ☐ VMDK (Virtual Machine Disk)
        ```
    - Storage on physical hard disk
        ```
        ☑ Dynamically allocated
        ☐ Fixed size
        ```
    - File location and size
        ```
        20 GB
        ```
    - Settings/Storage/
        ```
        Storage Devices
        └┈┈ Controller: IDE
            └───Empty (выбрать)
        Attributes
        └┈┈ Optical Drive: (выбрать образ ubuntu, файл '.iso')
        ```
    - Start
3. Установка Ubuntu.
    - Install Ubuntu
    - Keyboard layout
        ```
        English
        ```
    - Updates and other software
        ```
        What apps would you like to install to start with?
        ☑ Normal installation
        ☐ Minimal installation
        Other options
        ☑ Download updates while installing Ubuntu
        ☐ Install third-party ...
        ```
    - Installation type
        ```
        ☑ Erase disk and install Ubuntu
        ☐ Something else
        ```
    - Write the changes to disks? (форматирование дисков, нажать 'Continue')
    - Where are you? (часовой пояс)
    - Who are you?
        ```
                    Your name: lis
         Your computer's name: lis-vb
              Pick a username: lis
            Choose a password: 123
        Confirm your password: 123
                               ☐ Log in automatically
                               ☑ Require my password to log in
                               ☐ Use Active Directory
        ```
    - Restart Now
    - Please remove the installation medium, then press ENTER (диск вынут автоматически, нажать enter)
    - Power Off (выключить ВМ, поскольку требуется дополнительная настройка)
4. Настрйока виртуальной машины.
    - settings/General
        ```
        Advanced
        ├┈┈┈ Snapshot Folder: ...
        ├┈┈ Shared Clipboard: Bidirectional (для нормальной работы copy/paste)
        └┈┈┈┈┈┈┈ Drag'n'Drop: ...
        ```
    - settings/System
        ```
        Processor
        └┈┈ Processor(s): 2 CPU
        ```
5. Установка дополнительных программ на Ubuntu.
    - (запуск ВМ, вход логин/пароль)
    - Menu/Devices/Insert Guest Additions CD image... <br/>
        (если автоматический запуск, то нажать RUN, иначе в файловом менеджере выбрать смонтированный диск и нажать 'Run Software' в правом верхнем углу)
    - Press Return to close this window... (дождаться сообщения в терминале)
6. Проблема: автоматически не меняется разрешение при растягивании окна ВМ.
    - https://askubuntu.com/questions/452979/resolution-doesnt-change-when-resizing-virtualbox-window
    - Settings/Display
        ```
        Screen
        ├┈┈┈┈┈┈┈┈┈ Video Memory: 32 MB (увеличить видео память)
        ├┈┈ Graphics Controller: VMSVGA 
            VMSVGA по умолчанию поддерживает только 800x600, VBoxSVGA не поддерживает 
            '3D Acceleration', сначала переключил на VBoxSVGA потом вернулся к VMSVGA 
            с '3D Acceleration'
        └┈┈┈┈┈┈┈┈┈ Acceleration: ☑ Enable 3D Acceleration
        ```
7. Проблема: поменять host-кнопку, по умолчанию right ctrl.
    - Menu/File/Preferences
        ```
        Virtual Machine
        └┈┈ Host Key Combination: Ctrl
        >   кнопки в терминале: 
        >       вставка - right ctrl + shift + v
        >       home и end - работают
        >       ctrl + del - работает
        ```
8. Настройка общей папки.
    - Menu/Devices/Shared Folders/Shared Folders Settings...
    - Settings/Shared Folders/Add Share
        ```
        Folder Path: C:/VirtualBoxes/shared
        Folder Name: shared
                     ☐ Read-only
                     ☑ Auto-mount
        Mount point: (пусто)
                     ☑ Make Permanent
        ```
    - terminal
        ```
        sudo adduser lis vboxsf
            добавить пользователя в группу, которой доступны расшаренные папки, где: 
            lis - имя пользователя
        ln -s /media/sf_shared ~/shared
            создать ссылку на расшаренную папку 'shared', которая будет находится в папке 'media', где:
            '/media/sf_shared' - путь к расшаренной папки, 
            '~/shared' - путь к ссылке (ярлыку)
        ```
    - terminal: если предыдущие команды не сработали
        ```
        создать папку /home/shared
        sudo mount -t vboxsf -o uid=1000,gid=1000 shared ~/shared
            монтировать папку sf_shared_mount к расшаренной папке
        sudo nano /etc/fstab
            внести изменения в файл, чтобы ссылка не пропала после перезагрузки

        >   shared /home/lis/shared vboxsf uid=1000,gid=1000
        >       где:
        >       'shared' - расширенный ресурс
        >       '/home/lis/shared' - полный путь к домашней папке
        >   ctrl+x w enter
        
        sudo mount -a
            запуск файла
        
        ```

9. Устанвока Google Chrome.
    - скачать пакети установить
        ```
        wget https://dl.google.com/linux/direct/google-chrome-stable_current_amd64.deb
        sudo dpkg -i --force-depends google-chrome-stable_current_amd64.deb
        ```

10. Snapshots/Take (сделать снимок готовой системы)