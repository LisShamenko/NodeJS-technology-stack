"use strict";

const path = require('path');
const fs = require('fs');
const objectPath = require('object-path');
const util = require('util');

// 
const { mkdirs } = require('./../Utilities/OpsFiles');
const basepath = path.join(__dirname, './../dist');
const dirnames = ['22'];

// 
const fileConf = path.join(__dirname, './../Source/configs/conf.json');
const saveConf = path.join(__dirname, './../dist/22/conf_mod.json');



// --------------- 22. Макет (template).

// Макет состоит из базового абстрактного псевдокласса, в котором часть операций 
//      остаются неопределенными. Подклассы реализуют отсутствующие операции, которые
//      называются методами макета. Цель шаблона - дать возможность определить 
//      семейство классов, охватывающее все варианты алгоритма. Метод макета
//      может быть неопределен или ему назначается функция, всегда возбуждающая 
//      исключение, которое указывает, что метод должен быть реализован. 

// Макет и Стратегия имеют схожие цели, но отличаются структурой и реализацией.
//      Оба позволяют изменять некоторые части алгоритма при обязательной общей части, 
//      но Стратегия делает это динамически во время выполнения, а Макет задает весь 
//      алгоритм в момент определения конкретного класса. Макет больше подходит, когда 
//      требуется создать заранее подготовленные варианты алгоритма. 

// 
class ConfigTemplate {

    // 
    read(file) {
        console.log(`--- deserializing: ${file}`);
        this.data = this._deserialize(fs.readFileSync(file, 'utf-8'));
    }
    save(file) {
        console.log(`--- serializing: ${file}`);
        fs.writeFileSync(file, this._serialize(this.data));
    }

    // 
    get(path) {
        return objectPath.get(this.data, path);
    }
    set(path, value) {
        return objectPath.set(this.data, path, value);
    }

    // методы шаблона для загрузки и сохранения конфигурации, символ '_' указывает, 
    //      что это приватные методы, методы определяются как заглушки, генерирующие 
    //      исключения
    _serialize() {
        throw new Error('Отсутствует метод: _serialize.');
    }
    _deserialize() {
        throw new Error('Отсутствует метод: _deserialize.');
    }
}

// JsonConfig может использоваться как автономный объект для хранения конфигурации, 
//      так как сериализация и десериализация встроена в сам класс
class JsonConfig extends ConfigTemplate {
    _deserialize(data) {
        return JSON.parse(data);
    };
    _serialize(data) {
        return JSON.stringify(data, null, ' ');
    }
}

// 
function template() {
    console.log(`
        --- --- --- streams_pipeline --- --- ---
    `);

    // 
    const jsonConfig = new JsonConfig();
    jsonConfig.read(fileConf);
    jsonConfig.set('foo.bar', 'baz');
    jsonConfig.set('first.second', 'third');
    jsonConfig.save(saveConf);
}

// --- Запуск.

(async () => {
    await mkdirs(basepath, dirnames);
    template();
})();