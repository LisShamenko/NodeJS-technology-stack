// --------------- менеджер задач grunt

// установка grunt
//      npm install grunt --save-dev
//      npm install grunt-exec --save-dev
//      npm install grunt-contrib-watch --save-dev
// создайте новый файл GruntFile.js
// запустить grunt из командной строки:
//      grunt

// --------------- содержимое файла

module.exports = function (grunt) {
    // loadNpmTasks загружает gruntcontrib-watch и grunt-exec как задачи npm
    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-exec');

    // вызываем initConfig для настройки запускаемых задач
    // свойство pkg используется для загрузки файла package.json
    // свойство watch
    //      свойство files определяет какие файлы нужно искать
    //      массив tasks указывает запукаемую команду 'exec: run_tsc' после изменения файла
    // свойство exec
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        watch: {
            files: ['**/*.ts'],
            tasks: ['exec:run_tsc']
        },
        exec: {
            run_tsc: { cmd: 'tsc' }
        }
    });

    // указывает что задачей по умолчанию является отслеживание изменений файла
    grunt.registerTask('default', ['watch']);
};