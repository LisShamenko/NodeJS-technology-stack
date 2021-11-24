# Postgres
____
## Утилиты

Получение дампа памяти Postgres:

1. cd C:\Program Files\PostgreSQL\13\bin
    > возможный путь к файлу:<br/>
    > 'C:\Program Files\PostgreSQL\13\pgAdmin 4\runtime\pg_dump.exe'
2. pg_dump --help
3. pg_dump -d myClassDB -U postgres -W > C:/myClassDB.dump
    > параметры:
    > - '-d' идентификатор базы данных
    > - '-U' пользователь
    > - '-W' запросить пароль при выполнении команды
    > - после символа '>' указать имя файла дампа
