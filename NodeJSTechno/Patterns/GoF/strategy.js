"use strict";

const path = require('path');
const fs = require('fs');
const objectPath = require('object-path');
const ini = require('ini');

// 
const { mkdirs } = require('./../Utilities/OpsFiles');
const basepath = path.join(__dirname, './../dist');
const dirnames = ['20'];

// 
const source20 = path.join(__dirname, './../Source/configs');
const fileConf = path.join(source20, 'conf.json');
const fileIni = path.join(source20, 'conf.ini');
const dist20 = path.join(__dirname, './../dist/20');
const saveConf = path.join(dist20, 'conf_mod.json');
const saveIni = path.join(dist20, 'conf_mod.ini');



// --------------- 20. Стратегия (strategy).

// object-path 
//      https://www.npmjs.com/package/object-path

// ini
//      https://www.npmjs.com/package/ini

// Стратегия позволяет объекту (Контексту) поддерживать несколько вариантов логики 
//      работы путем выделения переменных частей в отдельные взаимозаменяемые объекты, 
//      называемые Стратегиями. Контекст реализует общую логику. Стратегии реализуют 
//      интерфейс через который происходит замена лигики. Этот шаблон полезен, когда
//      требует сложная условная логика для смены поведения.

// --- 20.1 Реализация.

// Контекст
class Config {

    // параметр strategy определяет алгоритм парсинга и сериализации данных и
    //      позволяет поддерживать различные форматы файлов при загрузке и 
    //      сохранении данных
    constructor(strategy) {
        this.data = {};
        this.strategy = strategy;
    }

    // доступа к свойствам конфигурации осуществляется с помощью нотации путей
    //      через точку, например, property.subProperty
    get(path) {
        return objectPath.get(this.data, path);
    }

    // 
    set(path, value) {
        return objectPath.set(this.data, path, value);
    }

    // десериализация прочитанных данных делегируется объекту strategy
    read(file) {
        console.log(`--- deserializing: ${file}`);
        this.data = this.strategy.deserialize(fs.readFileSync(file, 'utf-8'));
    }

    // сериализация сохраняемых данных делегируется объекту strategy
    save(file) {
        console.log(`--- serializing: ${file}`);
        fs.writeFileSync(file, this.strategy.serialize(this.data));
    }
}

// 
function strategy() {
    console.log(`
        --- --- --- streams_pipeline --- --- ---
    `);

    // Другие возможные подходы:
    // - создание двух семейств стратегий для десериализации/сериализации, 
    //      что позволит читать данные в одном формате и сохранять в другом;
    // - выбор стратегии в зависимости от расширения файла, для этого Config 
    //      может хранить отображение extension->strategy

    // Стратегии
    const strategies = {
        json: {
            deserialize: data => JSON.parse(data),
            serialize: data => JSON.stringify(data, null, '  ')
        },
        ini: {
            deserialize: data => ini.parse(data),
            serialize: data => ini.stringify(data)
        }
    }

    // 
    const jsonConfig = new Config(strategies.json);
    jsonConfig.read(fileConf);
    jsonConfig.set('foo.bar', 'baz');
    jsonConfig.save(saveConf);

    // 
    const iniConfig = new Config(strategies.ini);
    iniConfig.read(fileIni);
    iniConfig.set('first.second', 'third');
    iniConfig.save(saveIni);
}

// --- 20.2 Реальное применение.

// Passport.js - фреймворк аутентификации, использует шаблон стратегия 
//      на этапе аутентификации.
//      http://passportjs.org

// --- Запуск.

// 
(async () => {
    await mkdirs(basepath, dirnames);
    strategy();
})();