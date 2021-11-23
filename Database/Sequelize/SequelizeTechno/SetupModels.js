// --------------- фабрика

const colors = require('colors/safe');
const { gzipSync, gunzipSync } = require('zlib');
const { Sequelize, Model, DataTypes, Deferrable, Op, QueryTypes } = require('sequelize');

let setupSQLite;

module.exports = (inSetupSQLite) => {
    setupSQLite = inSetupSQLite;
    return {
        init: init,
        getSqliteSequelize: getSqliteSequelize,
        getPostgresSequelize: getPostgresSequelize,
        clearSequelize: clearSequelize,
        // 
        technoConnections: technoConnections,
        technoModels: technoModels,
        technoSyncModel: technoSyncModel,
        technoCreateUpdateDelete: technoCreateUpdateDelete,
        technoModelQuerying: technoModelQuerying,
        technoGettersSettersVirtuals: technoGettersSettersVirtuals,
        technoValidationsConstraints: technoValidationsConstraints,
        technoRawQueries: technoRawQueries,
        technoAssociations: technoAssociations,
        technoAssociationsQuerying: technoAssociationsQuerying,
        technoMixins: technoMixins,
        technoAssociationKeys: technoAssociationKeys,
        technoParanoid: technoParanoid,
        technoEagerLoadingMtoM: technoEagerLoadingMtoM,
        technoAssociationCreating: technoAssociationCreating,
        technoAssociationAdvancedMtoM: technoAssociationAdvancedMtoM,
        technoSuperManyToMany: technoSuperManyToMany,
    };
}

// --------------- подготовка sqlite базы

async function init(dbPathName) {

    console.log(colors.green(`
        --- --- --- настройка моделей --- --- ---
    `));

    // --- настройка sqlite
    console.log(colors.white(`--- создание базы данных sqlite на диске \n`));

    try {
        console.log(`настройка sqlite \n`);
        let dbSqlite = await setupSQLite.createDatabase(dbPathName);
        console.log(`база sqlite создана --- ${JSON.stringify(dbSqlite)} \n`);
    }
    catch (err) {
        console.log(colors.red(`создание базы sqlite --- ${err} \n`));
    }
}

// --------------- варианты подключения

async function technoConnections(dbPathName) {

    console.log(colors.green(`
        --- --- --- варианты подключения к базам --- --- ---
    `));

    // --- диалекты: 'mysql' | 'mariadb' | 'postgres' | 'mssql'
    console.log(colors.white(`--- диалекты \n`));

    // Option 1: Passing a connection URI (sqlite, postgres)

    // Example for sqlite
    const sqliteSequelizeMemory = new Sequelize('sqlite::memory:');
    // Example for postgres: 'postgres://user:pass@example.com:5432/dbname'
    const postgresSequelizeFirst = new Sequelize('postgres://postgres:postgres@localhost:5432/db_for_sequelize');

    // Option 2: Passing parameters separately

    // Example for sqlite
    const sqliteSequelizeStorage = new Sequelize({ dialect: 'sqlite', storage: dbPathName });
    // Example for postgres: database, username, password, options
    const postgresSequelizeSecond = new Sequelize('db_for_sequelize', 'postgres', 'postgres',
        { host: 'localhost', dialect: 'postgres' });

    // --- Тестирование соединений
    console.log(colors.white(`--- тестирование \n`));

    try {
        await sqliteSequelizeMemory.authenticate();
        console.log(`sqlite sequelize memory --- successfully \n`);
    } catch (error) {
        console.log(`sqlite sequelize memory --- error = ${error} \n`);
    }

    try {
        await postgresSequelizeFirst.authenticate();
        console.log(`postgres sequelize first --- successfully \n`);
    } catch (error) {
        console.log(`postgres sequelize first --- error = ${error} \n`);
    }

    try {
        await sqliteSequelizeStorage.authenticate();
        console.log(`sqlite sequelize storage --- successfully \n`);
    } catch (error) {
        console.log(`sqlite sequelize storage --- error = ${error} \n`);
    }

    try {
        await postgresSequelizeSecond.authenticate();
        console.log(`postgres sequelize second --- successfully \n`);
    } catch (error) {
        console.log(`postgres sequelize second --- error = ${error} \n`);
    }

    // --------------- Закрытие соединения
    console.log(colors.white(`--- закрытие соединений \n`));

    // Sequelize будет держать соединение открытым по умолчанию и использовать одно и то же соединение для всех запросов.
    await sqliteSequelizeMemory.close();
    console.log(`sqlite sequelize memory --- close`);
    await postgresSequelizeFirst.close();
    console.log(`postgres sequelize first --- close`);
    await sqliteSequelizeStorage.close();
    console.log(`sqlite sequelize storage --- close`);
    await postgresSequelizeSecond.close();
    console.log(`postgres sequelize second --- close`);

    // --------------- можно запускать примеры на всех поддерживаемых диалектах:
    console.log(colors.white(`--- запуск примеров на всех диалектах \n`));

    // https://github.com/papb/sequelize-sscce

    // --------------- логирование
    console.log(colors.white(`--- логирование`));
    console.log(colors.white(`--- refactoring - логеры Winston / Bunyan`));

    // диалект sqlite
    try {
        console.log(`--- --- диалект sqlite`);

        // в опциях передается функция для записи логов, примеры логирования:
        let logging, logger = { debug: () => console.log('debug') };
        logging = console.log;                  // Default, displays the first parameter of the log function call
        logging = (...msg) => console.log(msg); // Displays all log function call parameters
        logging = false;                        // Disables logging
        logging = msg => logger.debug(msg);     // Use custom logger (e.g. Winston or Bunyan), displays the first parameter
        logging = logger.debug.bind(logger);    // Alternative way to use custom logger, displays all messages
        let sequelize = new Sequelize('sqlite::memory:', {
            dialect: 'sqlite', logging: logging
        });
        await sequelize.authenticate();
        console.log('sqlite sequelize storage --- successfully');
        await sequelize.close();
        console.log(`sqlite sequelize storage --- close`);
    } catch (error) {
        console.log(`sqlite sequelize storage --- error = ${error}`);
    }

    // диалект postgres
    try {
        console.log(`--- --- диалект postgres --- настройки --- operatorsAliases`);

        let sequelize = new Sequelize('db_for_sequelize', 'postgres', 'postgres',
            {
                host: 'localhost',
                dialect: 'postgres',
                schema: 'sequelize_schema',
                // Default options for model definitions (будут использоваться для всех моделей)
                define: {
                    // freezeTableName: true
                },
                // совместимость операторов с Sequelize v4
                operatorsAliases: {
                    // $gt: Op.gt       // вместо [Op.gt] будет использоваться $gt
                }
            }
        );
        await sequelize.authenticate();
        console.log('postgres sequelize storage --- successfully');
        await sequelize.close();
        console.log(`postgres sequelize storage --- close`);
    } catch (error) {
        console.log(`postgres sequelize storage --- error = ${error}`);
    }
}

async function getSqliteSequelize() {
    let sequelize = new Sequelize('sqlite::memory:', { dialect: 'sqlite' });
    try {
        await sequelize.authenticate();
    } catch (err) {
        console.log(colors.red(err));
    }
    return sequelize;
}

async function getPostgresSequelize() {
    let sequelize = new Sequelize('db_for_sequelize', 'postgres', 'postgres',
        { host: 'localhost', dialect: 'postgres', schema: 'sequelize_schema', }
    );
    try {
        await sequelize.authenticate();
    } catch (error) {
        console.log(colors.red(err));
    }
    return sequelize;
}

async function clearSequelize(sequelize) {
    if (sequelize) {
        await sequelize.drop();
        await sequelize.close();
    }
}

// --------------- models

// https://sequelize.org/master/manual/model-basics.html

async function technoModels() {

    console.log(colors.green(`
        --- --- --- объявление моделей --- --- ---
    `));

    ; await (async () => {
        let sequelize = await getPostgresSequelize(); // getSqliteSequelize(); // 
        try {

            // Модель представляет таблицу в базе данных, расширяет класс Model.
            // Содержит данные о таблице в базе данных, имя модели не обязательно должно совпадать с именем таблицы в базе:
            // обычно модели имеют имена в единственном числе (User), а таблицы во множественном (Users).

            // По умолчанию, когда имя таблицы не указано, Sequelize автоматически использует имя модели во множественном числе 
            // в качестве имени таблицы. Для получения имени во множественном числе используется пакет inflection:
            //      https://www.npmjs.com/package/inflection

            // --- определение модели, двумя способами:
            //      - sequelize.define(modelName, attributes, options) - внутри sequelize.define вызывается Model.init
            //      - extends и вызов init(attributes, options)

            console.log(colors.white(`--- объявление моеделей --- extends и init`));

            // 
            class Bar extends Model { }
            Bar.init({ id: { type: DataTypes.STRING, primaryKey: true } }, { sequelize, modelName: 'bar', });

            // 
            class Foo extends Model { }
            Foo.init(
                {
                    // --- defaultValue

                    // instantiating will automatically set the flag to true if not set
                    flag: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true },
                    // default values for dates => current time
                    myDate: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },

                    // --- allowNull

                    // setting allowNull to false will add NOT NULL to the column, which means an error will be
                    // thrown from the DB when the query is executed if the column is null. If you want to check that a value
                    // is not null before querying the DB, look at the validations section below.
                    title: { type: DataTypes.STRING, allowNull: false },

                    // --- unique

                    // Creating two objects with the same value will throw an error. The unique property can be either a
                    // boolean, or a string. If you provide the same string for multiple columns, they will form a
                    // composite unique key.
                    uniqueOne: { type: DataTypes.STRING, unique: 'compositeIndex' },
                    uniqueTwo: { type: DataTypes.INTEGER, unique: 'compositeIndex' },
                    // The unique property is simply a shorthand to create a unique constraint.
                    someUnique: { type: DataTypes.STRING, unique: true },

                    // --- primaryKey

                    // Go on reading for further information about primary keys
                    identifier: { type: DataTypes.STRING, primaryKey: true },

                    // --- autoIncrement

                    // autoIncrement can be used to create auto_incrementing integer columns
                    incrementMe: { type: DataTypes.INTEGER, autoIncrement: true },

                    // --- field

                    // You can specify a custom column name via the 'field' attribute:
                    fieldWithUnderscores: { type: DataTypes.STRING, field: 'field_with_underscores' },

                    // It is possible to create foreign keys:
                    bar_id: {
                        type: DataTypes.INTEGER,
                        references: {
                            // This is a reference to another model
                            model: Bar,
                            // This is the column name of the referenced model
                            key: 'id',
                            // With PostgreSQL, it is optionally possible to declare when to check the foreign key constraint, passing the Deferrable type.
                            deferrable: Deferrable.INITIALLY_IMMEDIATE
                            // Options:
                            // - `Deferrable.INITIALLY_IMMEDIATE` - Immediately check the foreign key constraints
                            // - `Deferrable.INITIALLY_DEFERRED` - Defer all foreign key constraint check to the end of a transaction
                            // - `Deferrable.NOT` - Don't defer the checks at all (default) - This won't allow you to dynamically change the rule in a transaction
                        }
                    },

                    // --- comment

                    // Comments can only be added to columns in MySQL, MariaDB, PostgreSQL and MSSQL
                    commentMe: { type: DataTypes.INTEGER, comment: 'This is a column name that has a comment' }
                },
                {
                    sequelize,
                    modelName: 'foo',

                    // --- unique

                    // Using `unique: true` in an attribute above is exactly the same as creating the index in the model's options:
                    indexes: [{ unique: true, fields: ['someUnique'] }]
                }
            );

            // 
            const DefineUser = sequelize.define('DefineUser',
                // Model attributes are defined here
                {
                    firstName: {
                        type: DataTypes.STRING,     // тип данных столбца
                        allowNull: false,           // допускается null, по умолчанию allowNull равен true
                        defaultValue: "John Doe",   // значение по умолчанию:
                        //      - Sequelize.NOW задает текущее время
                        //      - Sequelize.UUIDV1 и Sequelize.UUIDV4 генерируется значение типа UUID
                    },
                    lastName: { type: DataTypes.STRING },
                    // сокращенная версия, если указан type
                    thirdName: DataTypes.STRING,
                },
                // Other model options go here
                {
                    // freezeTableName: true
                    //      использовать имя модели в качестве имени таблицы в базе
                    tableName: 'Users',
                    //      указать имя таблицы в базе данных

                    // --- опции timestamp 
                    timestamps: false,
                    //      false - не добавлять в модель колонки createdAt и updatedAt
                    createdAt: false,
                    //      false - не добавлять колонку createdAt
                    updatedAt: 'updateTimestamp',
                    //      указать название колонки updatedAt в таблице

                    // --- createdAt и updatedAt
                    // к каждой модели добавляются поля createdAt и updatedAt (тип данных DataTypes.DATE)
                    // поля управляются sequelize автоматически, триггеры-sql не используются, без sequelize требуется устанавливать вручную
                    // смотри опции timestamp: timestamps, createdAt, updatedAt    
                }
            );

            // 
            class InitUser extends Model {
                static classLevelMethod() { return 'foo'; }
                instanceLevelMethod() { return 'bar'; }
                getFullname() { return [this.firstName, this.lastName].join(' '); }
            }
            InitUser.init(
                // Model attributes are defined here
                {
                    // allowNull defaults to true
                    firstName: { type: DataTypes.STRING, allowNull: false },
                    lastName: { type: DataTypes.STRING }
                },
                // Other model options go here
                {
                    // указать имя таблицы в базе данных
                    tableName: 'Users',
                    // We need to pass the connection instance
                    sequelize,
                    // We need to choose the model name
                    modelName: 'InitUser',
                }
            );

            // 
            console.log(`sequelize.define also returns the model: (User === sequelize.models.User) => ${DefineUser === sequelize.models.DefineUser}\n`);
            console.log(`the defined model is the class itself: (User === sequelize.models.User) => ${InitUser === sequelize.models.InitUser}\n`);

            // модели доступны в sequelize.models по названию модели:
            console.log(colors.white(`--- список моделей в sequelize --- ${sequelize.models}`));
            for (const key in sequelize.models) {
                if (Object.hasOwnProperty.call(sequelize.models, key)) {
                    const modelObj = sequelize.models[key];
                    console.log(`--- --- ${JSON.stringify(modelObj)}`);
                }
            }

            // 
            console.log(colors.white(`--- статические методы и методы экземпляра`));
            const defineUser = DefineUser.build({ firstName: 'First', lastName: 'Last', thirdName: 'Third' });
            const initUser = InitUser.build({ firstName: 'Jane', lastName: 'Doe' });
            console.log(`
                --- classLevelMethod: ${InitUser.classLevelMethod()} 
                --- instanceLevelMethod: ${initUser.instanceLevelMethod()} 
                --- getFullname: ${initUser.getFullname()} `);

            // --- типы данных столбцов

            console.log(colors.white(`--- типы данных DataTypes`));
            ; (() => {
                DataTypes.STRING             // VARCHAR(255)
                DataTypes.STRING(1234)       // VARCHAR(1234)
                DataTypes.STRING.BINARY      // VARCHAR BINARY
                DataTypes.TEXT               // TEXT
                DataTypes.TEXT('tiny')       // TINYTEXT
                DataTypes.CITEXT             // CITEXT          PostgreSQL and SQLite only.

                DataTypes.BOOLEAN            // TINYINT(1)

                DataTypes.INTEGER            // INTEGER
                DataTypes.BIGINT             // BIGINT
                DataTypes.BIGINT(11)         // BIGINT(11)

                DataTypes.FLOAT              // FLOAT
                DataTypes.FLOAT(11)          // FLOAT(11)
                DataTypes.FLOAT(11, 10)      // FLOAT(11,10)

                DataTypes.REAL               // REAL            PostgreSQL only.
                DataTypes.REAL(11)           // REAL(11)        PostgreSQL only.
                DataTypes.REAL(11, 12)       // REAL(11,12)     PostgreSQL only.

                DataTypes.DOUBLE             // DOUBLE
                DataTypes.DOUBLE(11)         // DOUBLE(11)
                DataTypes.DOUBLE(11, 10)     // DOUBLE(11,10)

                DataTypes.DECIMAL            // DECIMAL
                DataTypes.DECIMAL(10, 2)     // DECIMAL(10,2)

                // для MySQL и MariaDB типы INTEGER, BIGINT, FLOAT, DOUBLE могут быть установлены как UNSIGNED и ZEROFILL
                // You can also specify the size i.e. INTEGER(10) instead of simply INTEGER
                DataTypes.INTEGER.UNSIGNED
                DataTypes.INTEGER.ZEROFILL
                DataTypes.INTEGER.UNSIGNED.ZEROFILL

                DataTypes.DATE              // DATETIME for mysql / sqlite, TIMESTAMP WITH TIME ZONE for postgres
                DataTypes.DATE(6)           // DATETIME(6) for mysql 5.6.4+. Fractional seconds support with up to 6 digits of precision
                DataTypes.DATEONLY          // DATE without time

                DataTypes.UUID              // для PostgreSQL и SQLite становится UUID, для MySQL становится CHAR(36)
            });

            // --- дополнительные типы данных столбцов

            console.log(colors.white(`--- refactoring --- разобрать дополнительные типы данных`));
            // refactoring - разобрать дополнительные типы данных
            // https://sequelize.org/master/manual/other-data-types.html
        }
        catch (err) {
            console.log(err);
        }
        finally {
            await clearSequelize(sequelize);
        }
    })();
}

// --------------- синхронизация / удаление

// Модель может быть синхронизирована с базой данных путем вызова model.sync(options)
// Sequelize автоматически выполнит SQL-запрос к базе данных

// для синхронизации производственного уровня рекомендуется использовать миграции и cli:
//      https://sequelize.org/master/manual/migrations.html
//      https://github.com/sequelize/cli

async function technoSyncModel() {

    console.log(colors.green(`
        --- --- --- синхронизация --- --- ---
    `));

    ; await (async () => {
        let sequelize = await getPostgresSequelize(); // getSqliteSequelize(); // 
        try {
            console.log(colors.white(`--- способы синхронизации sequelize`));

            const User = sequelize.define('User', { name: { type: DataTypes.STRING }, age: { type: DataTypes.INTEGER } });

            // создает таблицу, если она не существует
            await User.sync();

            // создает таблицу, сначала отбрасывая ее, если она уже существует
            await User.sync({ force: true });

            // проверяет состояние таблицы в базе, а затем изменяет таблицу, чтобы она соответствовала модели
            await User.sync({ alter: true });

            // синхронизировать все модели
            try {
                // This will run .sync() only if database name ends with '_test'
                await sequelize.sync({ force: true, match: /_test$/ });
            }
            catch (err) {
                // возникает ошибка для базы данных в памяти: 'sqlite:memory'
                // Error: Database ":memory" does not match sync match parameter "/_test$/"
                console.log(colors.red(err));
            }

            // после выполнения sync для столбцов с опцией 'allowNull = false' будет определено SQL ограничение NOT NULL
            console.log(colors.white(`--- создание после синхронизации`));

            await User.create({ name: "A", age: 10 });
            await User.create({ name: "B", age: 20 });
            await User.create({ name: "C", age: 30 });
            let users = await User.findAll();
            console.log('--- --- techno sync model');
            console.log(`users[0] --- name = ${users[0].name} --- age = ${users[0].age}`);
            console.log(`users[1] --- name = ${users[1].name} --- age = ${users[1].age}`);
            console.log(`users[2] --- name = ${users[2].name} --- age = ${users[2].age}`);
            console.log('--- ---');

            // --- удаление
            console.log(colors.white(`--- удаление`));

            // удалить таблицу
            await User.drop();

            // удалить все таблицы
            await sequelize.drop();
        }
        catch (err) {
            console.log(err);
        }
        finally {
            await clearSequelize(sequelize);
        }
    })();
}

// --------------- экземпляры: создание / обновление / удаление

// https://sequelize.org/master/manual/model-instances.html
// https://en.wikipedia.org/wiki/Data_access_object
// https://sequelize.org/master/class/lib/model.js~Model.html#static-method-build

async function technoCreateUpdateDelete() {

    console.log(colors.green(`
        --- --- --- экземпляры: создание / обновление / удаление --- --- ---
    `));

    ; await (async () => {
        let sequelize = await getPostgresSequelize(); // getSqliteSequelize(); // 
        try {
            console.log(colors.white(`--- build + save --- create`));

            const User = sequelize.define('User', {
                name: { type: DataTypes.STRING },
                lastName: { type: DataTypes.STRING },
                age: { type: DataTypes.INTEGER },
                cash: { type: DataTypes.INTEGER },
                favoriteColor: { type: DataTypes.STRING }
            });
            await User.sync();

            const Foo = sequelize.define('foo', {
                name: { type: DataTypes.TEXT, validate: { len: [4, 6] } },
                age: { type: DataTypes.INTEGER, defaultValue: 0 }
            });
            await Foo.sync();

            // Созданные экземпляры автоматически получат значения по умолчанию

            // build метод создает только объект, представляющий данные, которые могут быть сопоставлены с базой данных
            // чтобы сохранить этот экземпляр в базе данных, следует использовать метод save:
            const jane_1 = User.build({ name: "Jane I" });
            await jane_1.save();
            console.log(`jane instanceof User: ${jane_1 instanceof User} --- jane.name: ${jane_1.name}`);

            // метод create сочетает в себе build и save
            const jane_2 = await User.create({ name: "Jane II", age: 100, cash: 5000 });
            console.log(`jane instanceof User: ${jane_2 instanceof User} --- jane.name: ${jane_2.name}`);

            // 
            const jane_3 = await User.create({ name: "Jane III", age: 50, cash: 100 });

            // логирование
            console.log(colors.white(`--- логирование`));
            console.log(`Don't do this! --- ` + jane_1);
            console.log(`This is good! --- ` + jane_1.toJSON());
            console.log(`This is also good! --- ` + JSON.stringify(jane_1, null, 4));

            console.log(colors.white(`--- bulkCreate --- создание нескольких записей за один запрос`));

            // метод Model.bulkCreate позволяет создавать несколько записей с помощью одного запроса
            let foos_1 = await Foo.bulkCreate([{ name: 'abc123', age: 10 }, { name: 'name too long', age: 10 }]);

            // указать список вставляемых колонок
            let foos_2 = await Foo.bulkCreate([{ name: 'abc123', age: 20 }, { name: 'name too long', age: 20 }], { fields: ['name'] });

            // bulkCreate возвращает массив объектов
            console.log(`foos_1 length = ${foos_1} --- (is instanceof Foo) = ${foos_1[0] instanceof Foo} --- foos_1[0] = ${foos_1[0]}`);
            console.log(`foos_2 length = ${foos_2} --- (is instanceof Foo) = ${foos_2[0] instanceof Foo} --- foos_2[0] = ${foos_2[0]}`);

            // ошибка при выполнении проверки
            try {
                await Foo.bulkCreate([{ name: 'abc123', age: 20 }, { name: 'name too long', age: 20 }], { validate: true });
            }
            catch (err) {
                console.log(colors.red(`запланированная ошибка --- validate = true --- err = ${err}`));
            }

            console.log(colors.white(`--- обновление данных`));

            // обновление
            jane_1.name = "Ada";
            await jane_1.save();
            console.log(`name = ${jane_1.name} --- favoriteColor = ${jane_1.favoriteColor}`);

            // выборочное обновление
            jane_1.name = "Jane I";
            jane_1.favoriteColor = "blue";
            await jane_1.save({ fields: ['name'] });
            console.log(`name = ${jane_1.name} --- favoriteColor = ${jane_1.favoriteColor}`);

            // обновить модель чтобы вернуть актуальное значение столбцу favoriteColor
            await jane_1.reload();
            console.log(`name = ${jane_1.name} --- favoriteColor = ${jane_1.favoriteColor}`);

            // обновить через статику
            await User.update({ lastName: "Doe" }, { where: { lastName: null } });

            // запрос: reload генерирует SELECT запрос для получения актуальных данных из базы данных
            jane_2.name = "Ada";
            await jane_2.reload();
            console.log(`jane.name: ${jane_2.name}`);

            // обновление целочисленных полей (without running into concurrency issues): increment / decrement
            let incResult = await jane_2.increment('age', { by: 2 });
            // сокращенный вариант увеличит на 1
            incResult = await jane_2.increment('age');
            // инкремент нескольких полей
            incResult = await jane_2.increment({ 'age': 2, 'cash': 100 });
            // инкремент нескольких полей на одинаковое значение
            incResult = await jane_2.increment(['age', 'cash'], { by: 2 });

            // PostgreSQL: если опция returning установлена в true, то значение incResult будет содержать обновленную запись из базы
            // other dialects: undefined, для получения актуального значения использовать reload()

            console.log(colors.white(`--- удаление данных`));

            // удаление
            await jane_1.destroy();

            // удаление через статику
            await User.destroy({ where: { name: "Jane II" } });

            // удалить все строки в таблице
            //      https://docs.microsoft.com/ru-ru/sql/t-sql/statements/truncate-table-transact-sql?view=sql-server-ver15
            await User.destroy({ truncate: true });

            // удалить все таблицы
            await sequelize.drop();
        }
        catch (err) {
            console.log(colors.red(err));
        }
        finally {
            await clearSequelize(sequelize);
        }
    })();
}

// --------------- Model Querying

// https://en.wikipedia.org/wiki/Create,_read,_update_and_delete
// https://sequelize.org/master/class/lib/model.js~Model.html#static-method-findAll

async function technoModelQuerying() {

    console.log(colors.green(`
        --- --- --- простые запросы (модели) --- --- ---
    `));

    ; await (async () => {
        let sequelize = await getPostgresSequelize(); // getSqliteSequelize(); // 
        try {

            const User = sequelize.define('User', {
                name: { type: DataTypes.STRING },
                age: { type: DataTypes.INTEGER },
                cash: { type: DataTypes.INTEGER },
                job: { type: DataTypes.STRING },
            });
            await User.sync();
            await User.create({ name: "Jane - 10", age: 10, cash: 5000 });
            await User.create({ name: "Jane - 5", age: 5, cash: 5000 });
            await User.create({ name: "Jane - 40", age: 40, cash: 5000 });

            // 
            const Acronym = sequelize.define('Acronym', {
                foo: { type: DataTypes.STRING },
                bar: { type: DataTypes.STRING },
                qux: { type: DataTypes.STRING },
                hats: { type: DataTypes.STRING },
            });
            await Acronym.sync();
            await Acronym.create({ foo: "q1", bar: "w2", qux: "e3", hats: "r4" });
            await Acronym.create({ foo: "t5", bar: "y6", qux: "u7", hats: "i8" });
            await Acronym.create({ foo: "o9", bar: "p0", qux: "a1", hats: "s2" });
            await Acronym.create({ foo: "d3", bar: "f4", qux: "g5", hats: "h6" });
            await Acronym.create({ foo: "j7", bar: "k8", qux: "l9", hats: "00" });

            // 
            const Project = sequelize.define('Project', {
                title: { type: DataTypes.STRING },
                job: { type: DataTypes.STRING },
            });
            await Project.sync();
            await Project.create({ title: "foo-home" });
            await Project.create({ title: "foo-school" });
            await Project.create({ title: "bar-shop" });
            await Project.create({ title: "My Title" });

            // 
            const Post = sequelize.define('Post', {
                id: { type: DataTypes.INTEGER, primaryKey: true },
                authorId: { type: DataTypes.INTEGER },
                status: { type: DataTypes.STRING },
                content: { type: DataTypes.STRING },
            });
            await Post.sync();
            await Post.create({ id: 1, authorId: 10, status: 'active', content: 'Hello World!' });
            await Post.create({ id: 2, authorId: 11, status: 'draft', content: '' });
            await Post.create({ id: 3, authorId: 12, status: 'active', content: '' });
            await Post.create({ id: 4, authorId: 13, status: 'active', content: '' });
            await Post.create({ id: 5, authorId: 14, status: 'active', content: '' });

            let users, acronyms, project, projects, posts, fnAge;

            // --- SELECT: findAll

            console.log(colors.white(`--- SELECT`));

            // https://sequelize.org/master/manual/model-querying-finders.html

            // по умолчанию результаты всех методов поиска являются экземплярами класса модели, а не объектами JavaScript
            // это не эффективно если результатов слишком много, опция { raw: true } отключает упаковку

            // методы запросов:
            //      - findAll               стандартный SELECT запрос
            //      - findByPk              получает одну запись по указанному идентификатору ключа
            //      - findOne               получает первую найденную запись
            //      - findOrCreate          получает из базы или создает запись, defaults и where определяют создаваемую запись
            //      - findAndCountAll       возвращает объект с двумя свойствами: count - количество записей, rows - полученные записи

            // простой запрос: 'SELECT * FROM ...'
            users = await User.findAll();
            console.log('SELECT * FROM ...');
            console.log('users --- ', JSON.stringify(users, null, 2));
            console.log('users.every(user => user instanceof User) --- ', users.every(user => user instanceof User));

            // запрос выбранных колонок: 'SELECT foo, bar FROM ...'
            acronyms = await Acronym.findAll({ attributes: ['foo', 'bar'] });

            // псевдоним: 'SELECT foo, bar AS baz, qux FROM ...'
            acronyms = await Acronym.findAll({ attributes: ['foo', ['bar', 'baz'], 'qux'] });

            // --- SELECT: include / exclude

            // все колонки и агрегирование: SELECT id, foo, bar, baz, qux, hats, COUNT(hats) AS n_hats FROM ...
            acronyms = await Acronym.findAll({
                attributes: ['id', 'foo', 'bar', 'qux', 'hats',
                    [sequelize.fn('char_length', sequelize.col('hats')), 'hats_length']
                ]
            });

            // все колонки и агрегирование (include): SELECT id, foo, bar, baz, qux, hats, COUNT(hats) AS n_hats FROM ...
            acronyms = await Acronym.findAll({
                attributes: {
                    include: [
                        [sequelize.fn('char_length', sequelize.col('hats')), 'hats_length']
                    ]
                }
            });

            // все колонки кроме exclude: SELECT id, foo, bar, qux FROM ...
            acronyms = await Acronym.findAll({ attributes: { exclude: ['bar'] } });

            // 
            project = await Project.findByPk(123);
            if (project === null) {
                console.log('Not found!');
            } else {
                console.log(`(project instanceof Project) = ${project instanceof Project}`);
            }

            // 
            project = await Project.findOne({ where: { title: 'My Title' } });
            if (project === null) {
                console.log('Not found!');
            } else {
                console.log(`(project instanceof Project) = ${project instanceof Project} --- title = ${project.title}`);
            }

            // 
            const [user, created] = await User.findOrCreate({
                where: { name: 'sdepold' },
                defaults: { job: 'Technical Lead JavaScript' }
            });
            console.log(`${created ? 'created' : 'finded'} --- name = ${user.name} --- job = ${user.job}`);

            // 
            const { count, rows } = await Project.findAndCountAll({
                where: { title: { [Op.like]: 'foo%' } },
                offset: 1,
                limit: 2
            });
            console.log(`count = ${count} --- rows = ${rows}`);

            // --- WHERE

            console.log(colors.white(`--- WHERE`));

            // https://sequelize.org/master/variable/index.html#static-variable-Op

            // простой where: SELECT * FROM post WHERE authorId = 2
            posts = await Post.findAll({ where: { authorId: 2 } });
            // эквивалентный where с оператором [Op.eq]: SELECT * FROM post WHERE authorId = 2
            posts = await Post.findAll({
                where: {
                    authorId: { [Op.eq]: 12 }
                }
            });

            // несколько проверок: SELECT * FROM post WHERE authorId = 12 AND status = 'active'
            posts = await Post.findAll({ where: { authorId: 12, status: 'active' } });
            // эквивалентный where с оператором [Op.and]: SELECT * FROM post WHERE authorId = 12 AND status = 'active'
            posts = await Post.findAll({
                where: {
                    [Op.and]: [{ authorId: 12 }, { status: 'active' }]
                }
            });

            // тоже самое для [Op.or]: SELECT * FROM post WHERE authorId = 12 OR authorId = 13
            posts = await Post.findAll({
                where: {
                    [Op.or]: [{ authorId: 12 }, { authorId: 13 }]
                }
            });
            // сокращенный вариант для [Op.or]: SELECT * FROM post WHERE authorId = 12 OR authorId = 13
            posts = await Post.findAll({
                where: {
                    authorId: {
                        [Op.or]: [12, 13]
                    }
                }
            });

            // передача массива в where: SELECT ... FROM "posts" AS "post" WHERE "post"."id" IN (1, 2, 3)
            posts = await Post.findAll({
                where: {
                    id: [1, 2, 3]
                }
            });
            posts = await Post.findAll({
                where: {
                    id: { [Op.in]: [1, 2, 3] }
                }
            });

            // --- operations

            console.log(colors.white(`--- операции WHERE`));

            let operations = {
                [Op.and]: [{ a: 5 }, { b: 6 }],                 // (a = 5) AND (b = 6)
                [Op.or]: [{ a: 5 }, { b: 6 }],                  // (a = 5) OR (b = 6)
                someAttribute: {

                    [Op.eq]: 3,                                 // = 3
                    [Op.ne]: 20,                                // != 20
                    [Op.is]: null,                              // IS NULL
                    [Op.not]: true,                             // IS NOT TRUE
                    [Op.or]: [5, 6],                            // (someAttribute = 5) OR (someAttribute = 6)

                    [Op.col]: 'user.organization_id',           // = "user"."organization_id"

                    [Op.gt]: 6,                                 // > 6
                    [Op.gte]: 6,                                // >= 6
                    [Op.lt]: 10,                                // < 10
                    [Op.lte]: 10,                               // <= 10
                    [Op.between]: [6, 10],                      // BETWEEN 6 AND 10
                    [Op.notBetween]: [11, 15],                  // NOT BETWEEN 11 AND 15

                    [Op.all]: sequelize.literal('SELECT 1'),    // > ALL (SELECT 1)

                    [Op.in]: [1, 2],                            // IN [1, 2]
                    [Op.notIn]: [1, 2],                         // NOT IN [1, 2]

                    [Op.like]: '%hat',                          // LIKE '%hat'
                    [Op.notLike]: '%hat',                       // NOT LIKE '%hat'
                    [Op.startsWith]: 'hat',                     // LIKE 'hat%'
                    [Op.endsWith]: 'hat',                       // LIKE '%hat'
                    [Op.substring]: 'hat',                      // LIKE '%hat%'
                    [Op.iLike]: '%hat',                         // ILIKE '%hat'                 (case insensitive) (PG only)
                    [Op.notILike]: '%hat',                      // NOT ILIKE '%hat'             (PG only)
                    [Op.regexp]: '^[h|a|t]',                    // REGEXP/~ '^[h|a|t]'          (MySQL/PG only)
                    [Op.notRegexp]: '^[h|a|t]',                 // NOT REGEXP/!~ '^[h|a|t]'     (MySQL/PG only)
                    [Op.iRegexp]: '^[h|a|t]',                   // ~* '^[h|a|t]'                (PG only)
                    [Op.notIRegexp]: '^[h|a|t]',                // !~* '^[h|a|t]'               (PG only)

                    [Op.any]: [2, 3],                           // ANY ARRAY[2, 3]::INTEGER     (PG only)

                    // в postgres операторы Op.like/Op.iLike/Op.notLike комбинируются в Op.any:
                    [Op.like]: { [Op.any]: ['cat', 'hat'] }     // LIKE ANY ARRAY['cat', 'hat']
                },

                // --- примеры

                // rank < 1000 OR rank IS NULL
                rank: { [Op.or]: { [Op.lt]: 1000, [Op.eq]: null } },

                // createdAt < [timestamp] AND createdAt > [timestamp]
                createdAt: {
                    [Op.lt]: new Date(), [Op.gt]: new Date(new Date() - 24 * 60 * 60 * 1000)
                },

                // title LIKE 'Boat%' OR description LIKE '%boat%'
                [Op.or]: [{ title: { [Op.like]: 'Boat%' } }, { description: { [Op.like]: '%boat%' } }],

                // NOT (`Projects`.`id` IN (1, 2, 3) OR `Projects`.`description` LIKE 'Hello%')
                [Op.not]: [{ id: [1, 2, 3] }, { description: { [Op.like]: 'Hello%' } }],

                // --- postgres: операторы range

                //      https://sequelize.org/master/manual/data-types.html#range-types
                //      https://sequelize.org/master/manual/other-data-types.html
                //      https://sequelize.org/master/manual/extending-data-types.html
                //      https://sequelize.org/master/manual/dialect-specific-things.html

                [Op.contains]: 2,               // @> '2'::integer  (PG range contains element operator)
                [Op.contains]: [1, 2],          // @> [1, 2)        (PG range contains range operator)
                [Op.contained]: [1, 2],         // <@ [1, 2)        (PG range is contained by operator)
                [Op.overlap]: [1, 2],           // && [1, 2)        (PG range overlap (have points in common) operator)
                [Op.adjacent]: [1, 2],          // -|- [1, 2)       (PG range is adjacent to operator)
                [Op.strictLeft]: [1, 2],        // << [1, 2)        (PG range strictly left of operator)
                [Op.strictRight]: [1, 2],       // >> [1, 2)        (PG range strictly right of operator)
                [Op.noExtendRight]: [1, 2],     // &< [1, 2)        (PG range does not extend to the right of operator)
                [Op.noExtendLeft]: [1, 2],      // &> [1, 2)        (PG range does not extend to the left of operator)
            };

            // --- расширенные запросы

            // sequelize.fn генерирует вызов функции в SQL
            //      https://sequelize.org/master/class/lib/sequelize.js~Sequelize.html#static-method-fn
            // sequelize.col указывает на используемую колонку
            //      https://sequelize.org/master/class/lib/sequelize.js~Sequelize.html#static-method-col

            // SELECT ...FROM "posts" AS "post" WHERE(char_length("content") = 7 OR "post"."content" LIKE 'Hello%' OR( "post"."status" = 'draft' AND char_length("content") > 10))
            posts = await Post.findAll({
                where: {
                    [Op.or]: [
                        sequelize.where(sequelize.fn('char_length', sequelize.col('content')), 7),
                        { content: { [Op.like]: 'Hello%' } },
                        { [Op.and]: [{ status: 'draft' }, sequelize.where(sequelize.fn('char_length', sequelize.col('content')), { [Op.gt]: 10 })] }
                    ]
                }
            });

            // --- ORDER BY

            console.log(colors.white(`--- ORDER BY`));

            // order by по двум полям
            users = await User.findAll({ order: ['name', sequelize.fn('char_length', sequelize.col('name'))] });
            users = await User.findAll({ order: sequelize.literal('char_length(name) DESC') });
            users = await User.findAll({ order: sequelize.fn('char_length', sequelize.col('name')) });
            users = await User.findAll({ order: sequelize.col('age') });
            users = await User.findAll({ order: sequelize.random() });

            // 
            (() => {

                // варианты сортировок
                Subtask.findAll({
                    order: [
                        // Will escape title and validate DESC against a list of valid direction parameters
                        ['title', 'DESC'],
                        // Will order by max(age)
                        sequelize.fn('max', sequelize.col('age')),
                        // Will order by max(age) DESC
                        [sequelize.fn('max', sequelize.col('age')), 'DESC'],
                        // Will order by  otherfunction(`col1`, 12, 'lalala') DESC
                        [sequelize.fn('otherfunction', sequelize.col('col1'), 12, 'lalala'), 'DESC'],

                        // This nesting is potentially infinite!
                        // otherfunction(awesomefunction(`col`)) DESC
                        [sequelize.fn('otherfunction', sequelize.fn('awesomefunction', sequelize.col('col'))), 'DESC']

                        // --- associations ORDER BY

                        // Will order an associated model's createdAt using the model name as the association's name.
                        [Task, 'createdAt', 'DESC'],
                        // Will order through an associated model's createdAt using the model names as the associations' names.
                        [Task, Project, 'createdAt', 'DESC'],
                        // Will order by an associated model's createdAt using the name of the association.
                        ['Task', 'createdAt', 'DESC'],
                        // Will order by a nested associated model's createdAt using the names of the associations.
                        ['Task', 'Project', 'createdAt', 'DESC'],
                        // Will order by an associated model's createdAt using an association object. (preferred method)
                        [Subtask.associations.Task, 'createdAt', 'DESC'],
                        // Will order by a nested associated model's createdAt using association objects. (preferred method)
                        [Subtask.associations.Task, Task.associations.Project, 'createdAt', 'DESC'],
                        // Will order by an associated model's createdAt using a simple association object.
                        [{ model: Task, as: 'Task' }, 'createdAt', 'DESC'],
                        // Will order by a nested associated model's createdAt simple association objects.
                        [{ model: Task, as: 'Task' }, { model: Project, as: 'Project' }, 'createdAt', 'DESC']
                    ],

                    // Will order by max age descending
                    order: sequelize.literal('max(age) DESC'),
                    // Will order by max age ascending assuming ascending is the default order when direction is omitted
                    order: sequelize.fn('max', sequelize.col('age')),
                    // Will order by age ascending assuming ascending is the default order when direction is omitted
                    order: sequelize.col('age'),
                    // Will order randomly based on the dialect (instead of fn('RAND') or fn('RANDOM'))
                    order: sequelize.random()
                });

                // the elements of the order array can be the following:
                // 
                // - A string (which will be automatically quoted)
                // - An array, whose first element will be quoted, second will be appended verbatim
                // - An object with a raw field:
                //      - The content of raw will be added verbatim without quoting
                //      - Everything else is ignored, and if raw is not set, the query will fail
                // - A call to Sequelize.fn (which will generate a function call in SQL)
                // - A call to Sequelize.col (which will quoute the column name)
            });

            // --- GROUP

            console.log(colors.white(`--- GROUP`));

            // синтаксис аналогичен ORDER BY за исключением передачи последнего аргумента: 'DESC'
            // можно передать строку что не рекомендуется: '... GROUP BY name ...'
            // ERROR (postgres): столбец "Acronym.id" должен фигурировать в предложении GROUP BY или использоваться в агрегатной функции
            projects = await Project.findAll({
                group: 'title',
                attributes: ['title']
            });

            // агрегирование: 'SELECT foo, COUNT(hats) AS n_hats, bar FROM ...'
            acronyms = await Acronym.findAll({
                group: ['foo', 'bar'],
                attributes: ['foo', 'bar', [sequelize.fn('COUNT', sequelize.col('hats')), 'n_hats']]
            });
            console.log(`GROUP BY --- acronyms[0].dataValues = ${JSON.stringify(acronyms[0].dataValues)}`);

            // все колонки и агрегирование: SELECT id, foo, bar, baz, qux, hats, COUNT(hats) AS n_hats FROM ...
            acronyms = await Acronym.findAll({
                group: ['id', 'foo', 'bar', 'qux', 'hats'],
                attributes: ['id', 'foo', 'bar', 'qux', 'hats',
                    [sequelize.fn('COUNT', sequelize.col('hats')), 'n_hats']
                ]
            });

            // все колонки и агрегирование (include): SELECT id, foo, bar, baz, qux, hats, COUNT(hats) AS n_hats FROM ...
            acronyms = await Acronym.findAll({
                group: ['id', 'foo', 'bar', 'qux', 'hats'],
                attributes: {
                    include: [
                        [sequelize.fn('COUNT', sequelize.col('hats')), 'n_hats']
                    ]
                }
            });

            // --- LIMIT / OFFSET

            console.log(colors.white(`--- LIMIT / OFFSET --- count --- max / min / sum`));

            projects = await Project.findAll({ limit: 5 });
            projects = await Project.findAll({ offset: 2 });
            projects = await Project.findAll({ offset: 2, limit: 4 });

            // --- count

            // подсчитывает число вхождений элементов в базе данных
            console.log(`There are ${await Project.count()} projects`);
            const amount = await Project.count({ where: { id: { [Op.gt]: 3 } } });
            console.log(`There are ${amount} projects with an id greater than 25`);

            // --- max / min / sum

            // если в базе присутствует три записи age: 10, 5, 40
            fnAge = await User.max('age'); // 40
            fnAge = await User.max('age', { where: { age: { [Op.lt]: 20 } } }); // 10
            fnAge = await User.min('age'); // 5
            fnAge = await User.min('age', { where: { age: { [Op.gt]: 5 } } }); // 10
            fnAge = await User.sum('age'); // 55
            fnAge = await User.sum('age', { where: { age: { [Op.gt]: 5 } } }); // 50
        }
        catch (err) {
            console.log(colors.red(err));
        }
        finally {
            await clearSequelize(sequelize);
        }
    })();
}

// --------------- Getters / Setters / Virtuals

// https://sequelize.org/master/manual/getters-setters-virtuals.html

async function technoGettersSettersVirtuals() {

    console.log(colors.green(`
        --- --- --- Getters / Setters / Virtuals --- --- ---
    `));

    ; await (async () => {
        let sequelize = await getPostgresSequelize(); // getSqliteSequelize(); // 
        try {

            // --- Getters - это get() функция, определенная для одного столбца в определении модели
            // --- Setters - это set() функция, определенная для одного столбца в определении модели
            // --- Virtuals - виртуальные поля поддерживаются Sequelize и не связаны с базой данных

            const User = sequelize.define('user', {
                // getter
                username: {
                    type: DataTypes.STRING,
                    get() {
                        // стандартный getter JavaScript вызывается автоматически при чтении значения поля
                        // getDataValue получает значение поля username, иначе получается бесконечный цикл!
                        const rawValue = this.getDataValue('username');
                        return rawValue ? rawValue.toUpperCase() : null;
                    }
                },
                // setter
                password: {
                    type: DataTypes.STRING,
                    set(value) {
                        // setDataValue сохраняет значение в базу
                        this.setDataValue('password', `hash(${value}) --- ${value} хэширован для ${this.username}`);
                        // что то по безопасности
                        //      https://owasp.org/
                        //      https://security.stackexchange.com/
                    }
                },
                // virtual
                firstName: DataTypes.TEXT,
                lastName: DataTypes.TEXT,
                fullName: {
                    // в модели не будет fullName столбца
                    type: DataTypes.VIRTUAL,
                    get() {
                        return `${this.firstName} ${this.lastName}`;
                    },
                    set(value) {
                        throw new Error('Do not try to set the `fullName` value!');
                    }
                }
            });
            await User.sync();
            const user = User.build({ username: 'SuperUser123', password: 'пароль', firstName: 'John', lastName: 'Doe' });
            console.log(`getter --- username = ${user.username} --- getDataValue  = ${user.getDataValue('username')} --- `);
            console.log(`setter --- password (уже хэширован) = ${user.password} --- getDataValue = ${user.getDataValue('password')} --- `);
            console.log(`virtual --- fullName = ${user.fullName}`);

            // --- getter + setter
            const Post = sequelize.define('post', {
                content: {
                    type: DataTypes.TEXT,
                    get() {
                        const storedValue = this.getDataValue('content');
                        const gzippedBuffer = Buffer.from(storedValue, 'base64');
                        const unzippedBuffer = gunzipSync(gzippedBuffer);
                        return unzippedBuffer.toString();
                    },
                    set(value) {
                        const gzippedBuffer = gzipSync(value);
                        this.setDataValue('content', gzippedBuffer.toString('base64'));
                    }
                }
            });
            await Post.sync();
            // Sequelize автоматически обрабатывает пользовательские методы получения и установки
            const post = await Post.create({ content: 'Hello everyone!' });
            console.log('content = ' + post.content + ' -> Hello everyone!');
            console.log('getDataValue = ' + post.getDataValue('content') + ' -> строка в формате base64');

            // --- getterMethods / setterMethods

            // не рекомендуется и будет исключено в будущем!
            const Person = sequelize.define('person',
                { firstName: DataTypes.STRING, lastName: DataTypes.STRING },
                {
                    getterMethods: {
                        fullName() {
                            return this.firstName + ' ' + this.lastName;
                        }
                    },
                    setterMethods: {
                        fullName(value) {
                            const names = value.split(' ');
                            const firstName = names[0];
                            const lastName = names.slice(1).join(' ');
                            this.setDataValue('firstName', firstName);
                            this.setDataValue('lastName', lastName);
                        }
                    }
                }
            );
            await Person.sync();
            let person = await Person.create({ firstName: 'John', lastName: 'Doe' });
            console.log('fullName = ' + person.fullName);
            person.fullName = 'Someone Else';
            console.log(`firstName = ${person.firstName} --- lastName = ${person.lastName}`);
        }
        catch (err) {
            console.log(colors.red(err));
        }
        finally {
            await clearSequelize(sequelize);
        }
    })();
}

// --------------- Validations & Constraints

// https://sequelize.org/master/manual/validations-and-constraints.html
// бибилиотека валидации
//      https://github.com/validatorjs/validator.js

async function technoValidationsConstraints() {

    console.log(colors.green(`
        --- --- --- валидация --- --- ---
    `));

    ; await (async () => {
        let sequelize = await getPostgresSequelize(); // getSqliteSequelize(); // 
        try {

            // Validations - проверки на уровне javascript, в случае не удачи запрос sql не выполняется, ошибка ValidationError
            //      автоматически запускаются на методах create, update и save
            //      проверку можно вызвать вручную методом validate()
            // Constraints - правила определенные на уровне sql, в случае не удачи база данных выдает ошибку,
            //      которой соответствует ошибка Sequelize: SequelizeUniqueConstraintError

            const User = sequelize.define("user",
                {
                    age: DataTypes.INTEGER,
                    username: {
                        type: DataTypes.TEXT,
                        // Null Constraint (UNIQUE) - поле username не может быть равно null
                        //      allowNull является как проверкой Sequelize (ошибка ValidationError), так и ограничением базы данных
                        //      если 'allowNull:false' и будет установлено значение null, то все проверки будут пропущены и произойдет ошибка ValidationError
                        //      если 'allowNull:true' и будет установлено значение null, то будут пропущены встроеные проверки, а пользовательские останутся
                        allowNull: false,
                        // 
                        validate: {
                            // пользовательские проверки не будут пропущены если 'allowNull:true' и 'username=null'
                            customValidator(value) {
                                if (value === null && this.age > 9) {
                                    throw new Error("name can't be null unless age is 10");
                                }
                            },
                            // сообщение об ошибке для allowNull
                            notNull: {
                                msg: 'Please enter your name'
                            }
                        },
                        // Unique Constraint (NOT NULL) - поле username не должно содержать повторов для всех записей
                        unique: true,
                    },
                    hashedPassword: {
                        type: DataTypes.STRING(4),
                        is: /^[0-9a-f]{4}$/i
                    },
                    latitude: { type: DataTypes.INTEGER, validate: { min: -90, max: 90 } },
                    longitude: { type: DataTypes.INTEGER, validate: { min: -180, max: 180 } },
                },
                {
                    // Model-wide validations - методы валидатора модели
                    // вызывается методом validate(), который вернет объект с ошибками, где имена свойств это имена валидаторов
                    // метод проходит проверку если не генерируется ошибка
                    validate: {
                        bothCoordsOrNone() {
                            if ((this.latitude === null) !== (this.longitude === null)) {
                                throw new Error('Either both latitude and longitude, or neither!');
                            }
                        }
                    }
                }
            );
            await User.sync();
            await User.create({ username: 'ddda', hashedPassword: '1111', latitude: -23, longitude: 104, });

            // чтобы передать несколько аргументов во встроенную функцию проверки, аргументы должны быть в массиве: ['arg_1', 1, ['arg_2', '3', '4']]
            // Hint: You can also define a custom function for the logging part. Just pass a function. The first parameter will be the string that is logged.

            // справка по валидации
            let validate = {
                is: /^[a-z]+$/i,                // matches this RegExp
                is: ["^[a-z]+$", 'i'],          // same as above, but constructing the RegExp from a string
                not: /^[a-z]+$/i,               // does not match this RegExp
                not: ["^[a-z]+$", 'i'],         // same as above, but constructing the RegExp from a string

                isEmail: true,                  // checks for email format (foo@bar.com)
                isUrl: true,                    // checks for url format (http://foo.com)
                isIP: true,                     // checks for IPv4 (129.89.23.1) or IPv6 format
                isIPv4: true,                   // checks for IPv4 (129.89.23.1)
                isIPv6: true,                   // checks for IPv6 format

                // настраиваемое сообщение об ошибке для функций без параметров (которым передается true)
                isInt: {                        // checks for valid integers
                    msg: "Must be an integer number of pennies"
                },
                isAlpha: true,                  // will only allow letters
                isAlphanumeric: true,           // will only allow alphanumeric characters, so "_abc" will fail
                isNumeric: true,                // will only allow numbers
                isFloat: true,                  // checks for valid floating point numbers
                isDecimal: true,                // checks for any numbers
                isUUID: 4,                      // only allow uuids
                isDate: true,                   // only allow date strings

                isAfter: "2011-11-05",          // only allow date strings after a specific date
                isBefore: "2011-11-05",         // only allow date strings before a specific date
                isLowercase: true,              // checks for lowercase
                isUppercase: true,              // checks for uppercase

                notNull: true,                  // won't allow null
                isNull: true,                   // only allows null
                notEmpty: true,                 // don't allow empty strings
                equals: 'specific value',       // only allow a specific value

                contains: 'foo',                // force specific substrings
                notContains: 'bar',             // don't allow specific substrings

                // настраиваемое сообщение об ошибке для функций с параметрами
                isIn: {                         // check the value is one of these
                    args: [['foo', 'bar']],
                    msg: "Must be English or Chinese"
                },
                notIn: [['foo', 'bar']],        // check the value is not one of these
                len: [2, 10],                   // only allow values with length between 2 and 10
                max: 23,                        // only allow values <= 23
                min: 23,                        // only allow values >= 23

                isCreditCard: true,             // check for valid credit card numbers

                // Examples of custom validators:
                isEven(value) {
                    if (parseInt(value) % 2 !== 0) {
                        throw new Error('Only even values are allowed!');
                    }
                },
                isGreaterThanOtherField(value) {
                    if (parseInt(value) <= parseInt(this.otherField)) {
                        throw new Error('Bar must be greater than otherField.');
                    }
                }
            }
        }
        catch (err) {
            console.log(colors.red(err));
        }
        finally {
            await clearSequelize(sequelize);
        }
    })();
}

// --------------- Raw Queries

// https://sequelize.org/master/manual/raw-queries.html
// https://github.com/sequelize/sequelize/blob/master/src/query-types.ts

async function technoRawQueries(dialect) {

    console.log(colors.green(`
        --- --- --- необработанные запросы (${(dialect === 'postgres') ? 'POSTGRES' : 'MYSQL'}) --- --- ---
    `));

    console.log(colors.white(`--- запросы для диалекта mysql:memory`));
    console.log(colors.white(`--- --- чтобы заработал диалект postgres необходимо добавить 'sequelize_schema.' к таблицам и переписать часть запросов`));

    ; await (async () => {
        let sequelize = (dialect === 'postgres') ? await getPostgresSequelize() : await getSqliteSequelize();
        let usersLabel = (dialect === 'postgres') ? 'sequelize_schema.users' : 'users';
        let projectsLabel = (dialect === 'postgres') ? 'sequelize_schema.projects' : 'projects';

        try {

            const User = sequelize.define('user', { name: DataTypes.TEXT, x: DataTypes.INTEGER, y: DataTypes.INTEGER });
            const Project = sequelize.define('project', { name: DataTypes.TEXT, status: DataTypes.TEXT });
            await sequelize.sync();

            await User.create({ name: 'Jane_x10', x: 10, y: 100 });
            await User.create({ name: 'Jane_x12', x: 12, y: 0 });
            await Project.create({ name: 'p1', status: 'active' });

            // тип запроса определяет как нужно форматирвать результаты
            const users = await sequelize.query(`SELECT * FROM ${usersLabel}`, { type: QueryTypes.SELECT });

            // поскольку это необработанный запрос, метаданные зависят от диалекта
            // для MSSQL и MySQL это будут две ссылки на один и тот же объект
            const [results, metadata] = await sequelize.query(`UPDATE ${usersLabel} SET y = 42 WHERE x = 12`);

            // представить результат запроса как экземпляры указанной модели
            const projects = await sequelize.query(`SELECT * FROM ${projectsLabel}`,
                {
                    model: Project,         // модель 
                    mapToModel: true        // выполнить сопоставление возвращаемых колонок с колонками модели
                }
            );

            // 
            let records = await sequelize.query('SELECT 1', {
                logging: console.log,           // функция логирования
                plain: false,                   // true - вернет только первую запись, false - вернет все записи
                raw: false,                     // true - нет модели для резултатов запроса, вернет не обработанный объект
                type: QueryTypes.SELECT         // тип запроса, влияет на формат результата
            });

            // --- "Dotted" колонки

            // опция nest применяется если названия столбцов содержат '.'
            //      https://github.com/mickhansen/dottie.js/

            // 'nest:false' -> { "foo.bar.baz": 1 }
            records = await sequelize.query('SELECT 1 as "foo.bar.baz"', {
                nest: false,                // по умолчанию
                type: QueryTypes.SELECT
            });
            console.log(JSON.stringify(records[0], null, 2));

            // 'nest:true' -> { "foo": { "bar": { "baz": 1 } } }
            records = await sequelize.query('SELECT 1 as "foo.bar.baz"', {
                nest: true,
                type: QueryTypes.SELECT
            });
            console.log(JSON.stringify(records[0], null, 2));

            // --- Replacements

            // запрос может иметь либо параметры привязки
            // замены экранируются и вставляются в запрос с помощью sequelize перед отправкой запроса в базу данных

            // unnamed parameters - передается массив, знаки '?' будут по порядку заменены значениями из массива
            // named parameters - передается объект, строки ':key' будут заменены значениями свойств объекта, 
            //      происходит ошибка если набор свойств объекта не совпадает с набором ключей в запросе 

            // SELECT * FROM projects WHERE status = 'active'
            records = await sequelize.query(`SELECT * FROM ${projectsLabel} WHERE status = ?`,
                { replacements: ['active'], type: QueryTypes.SELECT });
            records = await sequelize.query(`SELECT * FROM ${projectsLabel} WHERE status = :status`,
                { replacements: { status: 'active' }, type: QueryTypes.SELECT });

            // замены массивов будут обрабатываться автоматически
            records = await sequelize.query(`SELECT * FROM ${projectsLabel} WHERE status IN(:status)`,
                { replacements: { status: ['active', 'inactive'] }, type: QueryTypes.SELECT });

            // знак %
            records = await sequelize.query(`SELECT * FROM ${usersLabel} WHERE name LIKE :search_name`,
                { replacements: { search_name: 'ben%' }, type: QueryTypes.SELECT });

            // --- Bind Parameter

            // запрос может иметь либо параметры привязки
            // параметры привязки отправляются в базу данных вне текста запроса SQL

            // формат ссылок не зависит от диалекта
            // допускается симол '$' за счет экранирования '$$'
            // массив или объект должен содержать все привязываемые значения или произойдет ошибка
            // numeric - передается массив, подстроки ['$1', '$2', ...] определяют привязки к элементам массива
            // alpha-numeric - передается объект, подстроки '$key' определяют привязки к соответствующим свойствам объекта,
            //      происходит ошибка если ключ начинается с цифры

            // база данных может добавлять дополнительные ограничения: 
            // - параметры привязки не могут быть ключевыми словами SQL, именами таблиц или столбцов
            // - PostgreSQL может потребовать приведения к типу ($1::varchar), если тип не может быть выведен из контекста

            records = await sequelize.query(`SELECT *, 'text with literal $$1 and literal $$status' as t FROM ${projectsLabel} WHERE status = $1`,
                { bind: ['active'], type: QueryTypes.SELECT });
            console.log(`--- --- $$1 / $$status --- ${JSON.stringify(records[0])}`);

            records = await sequelize.query(`SELECT *, 'text with literal $$1 and literal $$status' as t FROM ${projectsLabel} WHERE status = $status`,
                { bind: { status: 'active' }, type: QueryTypes.SELECT });
            console.log(`--- --- $$1 / $$status --- ${JSON.stringify(records[0])}`);
        }
        catch (err) {
            console.log(colors.red(err));
        }
        finally {
            await clearSequelize(sequelize);
        }
    })();
}

// --------------- Associations

// https://sequelize.org/master/manual/assocs.html
// https://en.wikipedia.org/wiki/One-to-one_(data_model)
// https://en.wikipedia.org/wiki/One-to-many_(data_model)
// https://en.wikipedia.org/wiki/Many-to-many_(data_model)

async function technoAssociations() {

    console.log(colors.green(`
        --- --- --- ассоциации(связи) между моделями --- --- ---
    `));

    console.log(colors.white(`--- описание ассоциаций`));

    ; await (async () => {
        let sequelize = await getSqliteSequelize(); // getPostgresSequelize(); // 
        try {
            // ассоциации Sequelize применяются для комбинирования стандартных ассоциаций 
            // [HasOne, BelongsTo, HasMany, BelongsToMany] -> [One-To-One, One-To-Many, Many-To-Many]

            // One-To-One -> hasOne + belongsTo
            // One-To-Many -> hasMany + belongsTo
            // Many-To-Many -> два belongsToMany
            // Super Many-To-Many -> 
            //      https://sequelize.org/master/manual/advanced-many-to-many.html

            const A = sequelize.define('A', { name: DataTypes.TEXT });           // A называется 'source model'
            const B = sequelize.define('B', { name: DataTypes.TEXT });           // B называется 'target model' 
            const C = sequelize.define('C', { name: DataTypes.TEXT });           // C называется 'target model' 

            // порядок определения ассоциации имеет значение
            // для первых трех вызовов Sequelize автоматически добавит внешние ключи к соответствующим моделям

            // A HasOne B - отношение One-To-One между A и B, внешний ключ определяет B ('target model')
            A.hasOne(B, { /* options */ });

            // A BelongsTo B - отношение One-To-One между A и B, внешний ключ определяет A ('source model')
            B.belongsTo(A, { /* options */ });

            // A HasMany C - отношение One-To-Many между A и C, внешний ключ определяет C ('target model')
            A.hasMany(C, { /* options */ });

            // A BelongsToMany B through the junction table AtoC - отношение Many-To-Many между A и C через 
            //      распределительную таблицу AtoC, внешние ключи определяет AtoC
            //      если таблица AtoC не существует, то она будет автоматически создана с внешними ключами
            A.belongsToMany(C, { through: 'AtoC', /* options */ });

            // отношения между модели определяются парами потмоу что при вызове одного метода о созданной связи 
            // знает только целевая модель, поэтому мы обычно устанавливаем отношения парами, чтобы обе модели узнали об этом
        }
        catch (err) {
            console.log(colors.red(err));
        }
        finally {
            await clearSequelize(sequelize);
        }
    })();

    console.log(colors.white(`--- hasOne и belongsTo`));

    // создать ассоциацию только для модели Foo
    ; await (async () => {
        let { sequelize, Foo, Bar } = await prepareFooBar();
        try {
            Foo.hasOne(Bar);
            await sequelize.sync();
            await Foo.findOne({ include: Bar });    // This works...
            await Bar.findOne({ include: Foo });    // But this throws an error: [SequelizeEagerLoadingError: foo is not associated to bar!]
        }
        catch (err) {
            console.log(colors.red(`--- --- запланированная ошибка --- если не указать обратную связь Bar с Foo, то возникает ошибка: `));
            console.log(colors.red(err));
        }
        finally {
            await clearSequelize(sequelize);
        }
    })();

    // создать ассоциации для обеих моделей
    ; await (async () => {
        let { sequelize, Foo, Bar } = await prepareFooBar();
        try {
            Foo.hasOne(Bar);
            Bar.belongsTo(Foo);
            await sequelize.sync();
            await Foo.findOne({ include: Bar });    // This works!
            await Bar.findOne({ include: Foo });    // This also works!
        }
        catch (err) {
            console.log(colors.red(err));
        }
        finally {
            await clearSequelize(sequelize);
        }
    })();

    // --- One-To-One

    /* Философия
    Прежде чем углубляться в аспекты использования Sequelize, полезно сделать шаг назад, чтобы рассмотреть, что происходит с отношениями «один на один».
    Допустим, у нас есть две модели, Fooи Bar. Мы хотим установить отношения один-к-одному между Foo и Bar. Мы знаем, что в реляционной базе данных это будет сделано путем установления внешнего ключа в одной из таблиц. Итак, в этом случае очень актуальный вопрос: в какой таблице мы хотим, чтобы этот внешний ключ был? Другими словами, мы хотим Fooиметь barIdстолбец или вместо него должен Barбыть fooIdстолбец?
    В принципе, оба варианта - допустимый способ установить отношения «один-к-одному» между Foo и Bar. Однако, когда мы говорим что-то вроде «между Foo и Bar существует однозначное отношение» , неясно, является ли это отношение обязательным или необязательным. Другими словами, может ли Foo существовать без бара? Может ли Bar существовать без Foo? Ответы на эти вопросы помогают понять, где мы хотим разместить столбец внешнего ключа.
    */

    console.log(colors.white(`--- One-To-One`));

    // при синхронизации будет добавлен внешний ключ, имена: foos.id <- bars.fooId
    ; await (async () => {
        let { sequelize, Foo, Bar } = await prepareFooBar();
        try {
            Foo.hasOne(Bar);
            Bar.belongsTo(Foo);
            //      CREATE TABLE IF NOT EXISTS "foos"();
            //      CREATE TABLE IF NOT EXISTS "bars"(
            //          "fooId" INTEGER REFERENCES "foos"("id") ON DELETE SET NULL ON UPDATE CASCADE
            //      );
            await sequelize.sync();
        }
        catch (err) {
            console.log(colors.red(err));
        }
        finally {
            await clearSequelize(sequelize);
        }
    })();

    // настройка ON DELETE и ON UPDATE
    ; await (async () => {
        let { sequelize, Foo, Bar } = await prepareFooBar();
        try {
            Foo.hasOne(Bar, { onDelete: 'RESTRICT', onUpdate: 'RESTRICT' });
            Bar.belongsTo(Foo);
            //      варианты: RESTRICT, CASCADE, NO ACTION, SET DEFAULT, SET NULL
            //      по умолчанию: ON DELETE SET NULL, ON UPDATE CASCADE
            //      https://postgrespro.ru/docs/postgresql/9.5/ddl-constraints
            await sequelize.sync();
        }
        catch (err) {
            console.log(colors.red(err));
        }
        finally {
            await clearSequelize(sequelize);
        }
    })();

    // внешние ключи
    ; await (async () => {
        let { sequelize, Foo, Bar } = await prepareFooBar();
        try {
            // указать имя внешнего ключа, вариант 1: foos.id <- bars.myFooId
            Foo.hasOne(Bar, { foreignKey: 'myFooId' });
            Bar.belongsTo(Foo);

            // указать имя внешнего ключа, вариант 2: foos.id <- bars.myFooId
            Foo.hasOne(Bar, { foreignKey: { name: 'myFooId' } });
            Bar.belongsTo(Foo);

            // указать имя внешнего ключа, вариант 3: foos.id <- bars.myFooId
            Foo.hasOne(Bar);
            Bar.belongsTo(Foo, { foreignKey: 'myFooId' });

            // указать имя внешнего ключа, вариант 4: foos.id <- bars.myFooId
            Foo.hasOne(Bar);
            Bar.belongsTo(Foo, { foreignKey: { name: 'myFooId' } });

            // допустимы параметры как и при определении столбца в sequelize.define:
            //      type, allowNull, defaultValue ...

            // использовать UUID в качестве типа данных внешнего ключа 
            Foo.hasOne(Bar, { foreignKey: { name: 'myFooId', type: DataTypes.UUID } });
            Bar.belongsTo(Foo);

            // если 'allowNull:false' то fooId не может принимать значение null и каждой записи Bar соответсвует запись Foo
            // если 'allowNull:true' то при fooId равном null для записи Bar не будет соответствовать запись Foo
            Foo.hasOne(Bar, { foreignKey: { allowNull: false } });
            //      "fooId" INTEGER NOT NULL REFERENCES "foos" ("id") ON DELETE RESTRICT ON UPDATE RESTRICT

            await sequelize.sync();
        }
        catch (err) {
            console.log(colors.red(err));
        }
        finally {
            await clearSequelize(sequelize);
        }
    })();

    // --- One-To-Many

    /* Философия
    Ассоциации «один ко многим» соединяют один источник с несколькими целями, в то время как все эти цели связаны только с этим единственным источником.
    Это означает, что, в отличие от ассоциации One-To-One, в которой нам нужно было выбрать, где будет размещен внешний ключ, в ассоциациях One-To-Many есть только один вариант. Например, если у одного Foo много Bars (и, таким образом, каждый Bar принадлежит одному Foo), то единственная разумная реализация - иметь fooIdстолбец в Barтаблице. Обратное невозможно, поскольку у одного Foo много Bars.
    */

    console.log(colors.white(`--- One-To-Many`));

    // использует те же параметры что и One-To-One: onDelete, onUpdate, foreignKey ...
    ; await (async () => {
        let { sequelize, Team, Player } = await preparePlayerTeamGame();
        try {
            Team.hasMany(Player);
            Player.belongsTo(Team);
            //      CREATE TABLE IF NOT EXISTS "Teams"();
            //      CREATE TABLE IF NOT EXISTS "Players"(
            //          "TeamId" INTEGER REFERENCES "Teams"("id") ON DELETE SET NULL ON UPDATE CASCADE,
            //      );
            await sequelize.sync();
        }
        catch (err) {
            console.log(colors.red(err));
        }
        finally {
            await clearSequelize(sequelize);
        }
    })();

    // --- Many-To-Many

    // https://en.wikipedia.org/wiki/Associative_entity

    /*
    Философия
    Ассоциации "многие-ко-многим" связывают один источник с несколькими целевыми объектами, в то время как все эти целевые объекты, в свою очередь, могут быть связаны с другими источниками, помимо первого.
    Это не может быть представлено добавлением одного внешнего ключа к одной из таблиц, как это делали другие отношения. Вместо этого используется концепция модели соединения . Это будет дополнительная модель (и дополнительная таблица в базе данных), которая будет иметь два столбца внешнего ключа и будет отслеживать ассоциации. Соединительную таблицу также иногда называют таблицей соединений или сквозной таблицей .
    */

    console.log(colors.white(`--- Many-To-Many`));

    // настройка ON DELETE и ON UPDATE устанавливается в CASCADE
    // параметр 'unique:false' позволяет предотвратить создание уникального ключа
    // junction table - соединительная таблица, в которой содержится составной уникальный ключ из двух связующих колонок
    // параметр uniqueKey позволяет задать имя уникального составного ключа: 'my_custom_unique'

    // Movie и Actor будут связаны через модель ActorMovies, которая будет создана Sequelize
    ; await (async () => {
        let { sequelize, Movie, Actor } = await prepareMovieActor();
        try {
            Movie.belongsToMany(Actor, { through: 'ActorMovies' /*, uniqueKey: 'customMovieId' */ });
            Actor.belongsToMany(Movie, { through: 'ActorMovies' /*, uniqueKey: 'customActorId' */ });
            //      CREATE TABLE IF NOT EXISTS "ActorMovies"(
            //          "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL,
            //          "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL,
            //          "MovieId" INTEGER REFERENCES "Movies"("id") ON DELETE CASCADE ON UPDATE CASCADE,
            //          "ActorId" INTEGER REFERENCES "Actors"("id") ON DELETE CASCADE ON UPDATE CASCADE,
            //          PRIMARY KEY("MovieId", "ActorId")
            //      );
            await sequelize.sync();
        }
        catch (err) {
            console.log(colors.red(err));
        }
        finally {
            await clearSequelize(sequelize);
        }
    })();

    // вместо строки поддерживается передача модели напрямую, которая будет использоваться в качестве модели соединения
    ; await (async () => {
        let { sequelize, Movie, Actor } = await prepareMovieActor();
        try {
            const ActorMovies = sequelize.define('ActorMovies', {
                MovieId: { type: DataTypes.INTEGER, references: { model: Movie, key: 'id' } },  // 'Movies' would also work
                ActorId: { type: DataTypes.INTEGER, references: { model: Actor, key: 'id' } },  // 'Actors' would also work
            });
            Movie.belongsToMany(Actor, { through: ActorMovies });
            Actor.belongsToMany(Movie, { through: ActorMovies });
            //      CREATE TABLE IF NOT EXISTS "ActorMovies"(
            //          "MovieId" INTEGER NOT NULL REFERENCES "Movies"("id") ON DELETE RESTRICT ON UPDATE CASCADE,
            //          "ActorId" INTEGER NOT NULL REFERENCES "Actors"("id") ON DELETE RESTRICT ON UPDATE CASCADE,
            //          "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL,
            //          "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL,
            //          UNIQUE("MovieId", "ActorId"),       -- Note: Sequelize generated this UNIQUE constraint but
            //          PRIMARY KEY("MovieId", "ActorId")   -- it is irrelevant since it's also a PRIMARY KEY
            //      );
            await sequelize.sync();
        }
        catch (err) {
            console.log(colors.red(err));
        }
        finally {
            await clearSequelize(sequelize);
        }
    })();
}

async function prepareFooBar(dialect) {
    let sequelize = (dialect === 'postgres') ? await getPostgresSequelize() : await getSqliteSequelize();
    return {
        sequelize: sequelize,
        Foo: sequelize.define('Foo', { name: DataTypes.TEXT/*, barId: DataTypes.INTEGER*/ }),
        Bar: sequelize.define('Bar', { name: DataTypes.TEXT/*, fooId: DataTypes.INTEGER*/ }),
        Qux: sequelize.define('Qux', { name: DataTypes.TEXT }),
    }
}

async function preparePlayerTeamGame(dialect) {
    let sequelize = (dialect === 'postgres') ? await getPostgresSequelize() : await getSqliteSequelize();
    return {
        sequelize: sequelize,
        Player: sequelize.define('Player', { username: DataTypes.STRING }),
        Team: sequelize.define('Team', { name: DataTypes.STRING }),
        Game: sequelize.define('Game', { name: DataTypes.INTEGER }),
    }
}

async function prepareMovieActor(dialect) {
    let sequelize = (dialect === 'postgres') ? await getPostgresSequelize() : await getSqliteSequelize();
    return {
        sequelize: sequelize,
        Movie: sequelize.define('Movie', { name: DataTypes.STRING }),
        Actor: sequelize.define('Actor', { name: DataTypes.STRING }),
    }
}

async function prepareShipCaptain(dialect) {
    let sequelize = (dialect === 'postgres') ? await getPostgresSequelize() : await getSqliteSequelize();
    return {
        sequelize: sequelize,
        Ship: sequelize.define('ship',
            { name: DataTypes.TEXT, crewCapacity: DataTypes.INTEGER, amountOfSails: DataTypes.INTEGER },
            { timestamps: false }
        ),
        Captain: sequelize.define('captain',
            { name: DataTypes.TEXT, skillLevel: { type: DataTypes.INTEGER, validate: { min: 1, max: 10 } } },
            { timestamps: false }
        ),
    }
}

async function insertShipCaptain(Ship, Captain, fkey) {
    let ship1 = await Ship.create({ name: 'ship 1', crewCapacity: 10, amountOfSails: 2 });
    let captain1 = await Captain.create({ name: 'Jack Sparrow', skillLevel: 5 });
    if (Array.isArray(fkey)) {
        fkey.forEach(item => {
            ship1[item] = captain1.id;
        });
    }
    else {
        ship1[fkey] = captain1.id;
    }
    await ship1.save();
    console.log(`ship1 = ${JSON.stringify(ship1.dataValues)} --- captain1 = ${JSON.stringify(captain1.dataValues)}`);
}

async function prepareUserTaskTool(dialect) {
    let sequelize = (dialect === 'postgres') ? await getPostgresSequelize() : await getSqliteSequelize();
    return {
        sequelize: sequelize,
        User: sequelize.define('user', { name: DataTypes.STRING }, { timestamps: false }),
        Project: sequelize.define('project', { name: DataTypes.STRING, state: DataTypes.STRING }, { timestamps: false }),
        Task: sequelize.define('task', { name: DataTypes.STRING, state: DataTypes.STRING }, { timestamps: false }),
        Tool: sequelize.define('tool', { name: DataTypes.STRING, size: DataTypes.STRING }, { timestamps: false }),
    }
}

async function insertUserTaskProjectTool(User, Task, Tool, Project) {
    let user1 = await User.create({ name: 'user 1' });
    let task1 = await Task.create({ name: 'task 1', state: 'active' });
    let task2 = await Task.create({ name: 'task 2', state: 'none' });
    let tool1 = await Tool.create({ name: 'tool 1', size: 'big' });
    let tool2 = await Tool.create({ name: 'tool 2', size: 'small' });
    user1.addTask(task1);
    user1.addTask(task2);
    user1.addInstrument(tool1);
    user1.addInstrument(tool2);
    await user1.save();

    let project1 = await Project.create({ name: 'project 1', state: 'active' });
    project1.addTask(task1);
    project1.addTask(task2);
    await project1.save();
}

// --------------- Associations Querying

async function technoAssociationsQuerying() {

    console.log(colors.green(`
        --- --- --- сложные запросы (ассоциации) --- --- ---
    `));

    console.log(colors.white(`--- простой запрос через миксин-метод`));

    ; await (async () => {
        let { sequelize, Ship, Captain } = await prepareShipCaptain();
        try {
            Captain.hasOne(Ship);
            Ship.belongsTo(Captain);
            await sequelize.sync();

            // insert
            await insertShipCaptain(Ship, Captain, 'captainId');

            // --- Lazy / Eager

            // https://sequelize.org/master/manual/eager-loading.html

            // Lazy Loading example - получние связанных данных когда это необходимо
            // Sequelize автоматически добавляет метод getShip() к экземпляру Captain
            let awesomeCaptain = await Captain.findOne({ where: { name: "Jack Sparrow" } });
            console.log(`Name = ${awesomeCaptain.name} --- Skill Level = ${awesomeCaptain.skillLevel}`);
            const hisShip = await awesomeCaptain.getShip();
            console.log(`Ship Name = ${hisShip.name} --- Amount of Sails = ${hisShip.amountOfSails}`);

            // Eager Loading Example - получение всего сразу
            // используется опция include, выполняется только один запрос к базе (JOIN)
            awesomeCaptain = await Captain.findOne({ where: { name: "Jack Sparrow" }, include: Ship });
            console.log(`Name = ${awesomeCaptain.name} --- Skill Level = ${awesomeCaptain.skillLevel}`);
            console.log(`Ship Name = ${awesomeCaptain.ship.name} --- Amount of Sails = ${awesomeCaptain.ship.amountOfSails}`);
        }
        catch (err) {
            console.log(colors.red(err));
        }
        finally {
            await clearSequelize(sequelize);
        }
    })();

    console.log(colors.white(`--- простой запрос include --- Foreign Keys: по умолчанию`));

    // --- Association Aliases & Custom Foreign Keys: по умолчанию
    ; await (async () => {
        let { sequelize, Ship, Captain } = await prepareShipCaptain();
        try {
            // This creates the `captainId` foreign key in Ship.
            Ship.belongsTo(Captain);
            await sequelize.sync();

            // insert
            await insertShipCaptain(Ship, Captain, 'captainId');

            // Eager Loading is done by passing the model to `include`:
            console.log(JSON.stringify(await Ship.findAll({ include: Captain })));
            // Or by providing the associated model name:
            console.log(JSON.stringify(await Ship.findAll({ include: 'captain' })));
            // Also, instances obtain a `getCaptain()` method for Lazy Loading:
            ship = await Ship.findOne();
            console.log(JSON.stringify(await ship.getCaptain()));
        }
        catch (err) {
            console.log(colors.red(err));
        }
        finally {
            await clearSequelize(sequelize);
        }
    })();

    console.log(colors.white(`--- простой запрос include --- Foreign Keys: указать первичный ключ`));

    // --- Association Aliases & Custom Foreign Keys: указать первичный ключ при создании ассоциации
    ; await (async () => {
        let { sequelize, Ship, Captain } = await prepareShipCaptain();
        try {
            // This creates the `bossId` foreign key in Ship.
            Ship.belongsTo(Captain, { foreignKey: 'bossId' });
            await sequelize.sync();

            // insert
            await insertShipCaptain(Ship, Captain, 'bossId');

            // Eager Loading is done by passing the model to `include`:
            console.log(JSON.stringify(await Ship.findAll({ include: Captain })));
            // Or by providing the associated model name:
            console.log(JSON.stringify(await Ship.findAll({ include: 'captain' })));
            // Also, instances obtain a `getCaptain()` method for Lazy Loading:
            ship = await Ship.findOne();
            console.log(JSON.stringify(await ship.getCaptain()));
        }
        catch (err) {
            console.log(colors.red(err));
        }
        finally {
            await clearSequelize(sequelize);
        }
    })();

    console.log(colors.white(`--- простой запрос include --- Foreign Keys: указать псевдоним`));

    // --- Association Aliases & Custom Foreign Keys: через определение псевдонима
    ; await (async () => {
        let { sequelize, Ship, Captain } = await prepareShipCaptain();
        try {
            // для hasOne и belongsTo следует использовать слово в единственном числе (leader)
            // для belongsToMany следует использовать слово во множественном числе 
            // необходимо использовать псевдонимы, чтобы определить две разные связи между одними и теми же моделями
            //      модели Mail и Person => две связи для получения отправителей и получателей писем (senderMail и receiverMail)
            //      следует использовать псевдонимы sender и receiver => два метода getSender() и getReceiver()
            Captain.hasOne(Ship, { as: 'HomeCaptain', foreignKey: 'homeCaptainId' });
            Captain.hasOne(Ship, { as: 'AwayCaptain', foreignKey: 'awayCaptainId' });
            // This creates the `leaderId` foreign key in Ship.
            Ship.belongsTo(Captain, { as: 'leader' });
            await sequelize.sync();

            // insert
            await insertShipCaptain(Ship, Captain, ['homeCaptainId', 'awayCaptainId', 'leaderId']);

            // Eager Loading no longer works by passing the model to `include`:
            try {
                console.log(JSON.stringify(await Ship.findAll({ include: Captain })));               // Throws an error
            }
            catch (err) {
                console.log(colors.red(`запланированная ошибка --- не указан псевдоним --- ${err}`));
            }
            // Instead, you have to pass the alias:
            console.log(JSON.stringify(await Ship.findAll({ include: 'leader' })));
            // Or you can pass an object specifying the model and alias:
            console.log(JSON.stringify(await Ship.findAll({ include: { model: Captain, as: 'leader' } })));
            // Also, instances obtain a `getLeader()` method for Lazy Loading:
            ship = await Ship.findOne();
            console.log(JSON.stringify(await ship.getLeader()));
        }
        catch (err) {
            console.log(colors.red(err));
        }
        finally {
            await clearSequelize(sequelize);
        }
    })();

    console.log(colors.white(`--- простой запрос include --- Foreign Keys: указать первичный ключ и псевдоним`));

    // --- Association Aliases & Custom Foreign Keys: указать первичный ключ и псевдоним при создании ассоциации
    ; await (async () => {
        let { sequelize, Ship, Captain } = await prepareShipCaptain();
        try {
            // This creates the `bossId` foreign key in Ship.
            Ship.belongsTo(Captain, { as: 'leader', foreignKey: 'bossId' });
            await sequelize.sync();

            // insert
            await insertShipCaptain(Ship, Captain, 'bossId');

            // Since an alias was defined, eager Loading doesn't work by simply passing the model to `include`:
            try {
                console.log(JSON.stringify(await Ship.findAll({ include: Captain })));               // Throws an error
            }
            catch (err) {
                console.log(colors.red(`запланированная ошибка --- не указан псевдоним --- ${err}`));
            }
            // Instead, you have to pass the alias:
            console.log(JSON.stringify(await Ship.findAll({ include: 'leader' })));
            // Or you can pass an object specifying the model and alias:
            console.log(JSON.stringify(await Ship.findAll({ include: { model: Captain, as: 'leader' } })));
            // Also, instances obtain a `getLeader()` method for Lazy Loading:
            ship = await Ship.findOne();
            console.log(JSON.stringify(await ship.getLeader()));
        }
        catch (err) {
            console.log(colors.red(err));
        }
        finally {
            await clearSequelize(sequelize);
        }
    })();

    // --------------- Eager Loading

    // https://sequelize.org/master/manual/eager-loading.html
    // https://en.wikipedia.org/wiki/Join_(SQL)

    // активная загрузка - это процесс запроса данных сразу нескольких моделей, основной модели и связанных моделей через JOIN

    ; await (async () => {
        let { sequelize, User, Task, Tool, Project } = await prepareUserTaskTool();
        try {
            // 'Instruments' - псевдоним ассоциации
            User.hasMany(Task);
            Task.belongsTo(User);
            Project.hasMany(Task);
            Task.belongsTo(Project);
            User.hasMany(Tool, { as: 'Instruments' });
            await sequelize.sync();

            // insert
            await insertUserTaskProjectTool(User, Task, Tool, Project);

            console.log(colors.white(`--- активная загрузка (include)`));

            // получение одного связанного элемента
            let tasks = await Task.findAll({ include: User });
            console.log(JSON.stringify(tasks, null, 2));
            //      [{ "name": "A Task", "id": 1, "userId": 1, "user": { "name": "John Doe", "id": 1 } }]
            //      (tasks[0].user instanceof User) => true.

            // получение всех связанных элементов
            let users = await User.findAll({ include: Task });
            console.log(JSON.stringify(users, null, 2));
            //      [{ "name": "John Doe", "id": 1, "tasks": [{ "name": "A Task", "id": 1, "userId": 1 }] }]

            // запрос с использованием псевдонима ассоциации (3 варианта)
            users = await User.findAll({ include: { model: Tool, as: 'Instruments' } });
            // const users = await User.findAll({ include: 'Instruments' });
            // const users = await User.findAll({ include: { association: 'Instruments' } }); 
            console.log(JSON.stringify(users, null, 2));
            //      [{ "name": "John Doe", "id": 1, "Instruments": [{ "name": "Scissor", "id": 1, "userId": 1 }] }]

            // запрос возвращает только те записи, которые имеют связанную модель: OUTER JOIN => INNER JOIN
            users = await User.findAll({ include: { model: Task, required: true } });

            // фильтрация на уровне связанной модели: выбирть 'User' с хотя бы одним 'Tool', у которого 'size = small'
            // когда where параметр используется внутри include, Sequelize автоматически устанавливает 'required = true'
            users = await User.findAll({ include: { model: Tool, as: 'Instruments', where: { size: { [Op.eq]: 'small' } } } });
            //      SELECT 
            //          `user`.`id`, `user`.`name`, 
            //          `Instruments`.`id` AS `Instruments.id`, `Instruments`.`name` AS `Instruments.name`,
            //          `Instruments`.`size` AS `Instruments.size`, `Instruments`.`userId` AS `Instruments.userId`
            //      FROM `users` AS `user`
            //      INNER JOIN `tools` AS `Instruments` ON `user`.`id` = `Instruments`.`userId` AND `Instruments`.`size` != 'small';

            // фильтрация на уровне связанной модели: ссылка на столбец модели (task.state === project.state)
            let project = await Project.findAll({ include: { model: Task, where: { state: { [Op.eq]: Sequelize.col('project.state') } } } })

            // выборка нескольких связанных моделей сразу
            users = await User.findAll({
                include: [
                    { model: Task, required: true },
                    { model: Tool, as: 'Instruments', where: { size: { [Op.ne]: 'small' } } },
                ]
            })

            // выбрать все связанные модели с User: 'all:true'
            users = await User.findAll({ include: { all: true } });

            // выбрать все связанные модели с User и его ассоциациями рекурсивно: 'nested:true'
            users = await User.findAll({ include: { all: true, nested: true } });

            // выбрать записи с учетом удаленных в paranoid-таблице
            users = await User.findAll({
                include: [{
                    model: Tool, as: 'Instruments',
                    where: { size: { [Op.ne]: 'small' } },
                    paranoid: false
                }]
            });

            // --- инструкции WHERE на связанные таблицы

            console.log(colors.white(`--- WHERE с активной загрузкой (include)`));

            // инструкция WHERE может ссылаться на столбцы связанной через JOIN таблицы, синтаксис: '$nested.column$'
            // для нескольких уровней вложенности: $nested.nested.nested.nested...column$

            users = await User.findAll({
                where: { '$Instruments.size$': { [Op.ne]: 'small' } },
                include: [{ model: Tool, as: 'Instruments' }]
            });
            //      SELECT
            //          `user`.`id`, `user`.`name`,
            //          `Instruments`.`id` AS `Instruments.id`, `Instruments`.`name` AS `Instruments.name`,
            //          `Instruments`.`size` AS `Instruments.size`, `Instruments`.`userId` AS `Instruments.userId`
            //      FROM `users` AS `user`
            //      LEFT OUTER JOIN `tools` AS`Instruments` ON `user`.`id` = `Instruments`.`userId`
            //      WHERE `Instruments`.`size` != 'small';

            // --- комбинации: Top-level where / Inner where / `required:true` / `required:false`

            // Inner where, with default `required: true`
            users = await User.findAll({
                include: { model: Tool, as: 'Instruments', where: { size: { [Op.ne]: 'small' } } }
            });
            //      SELECT [...] FROM `users` AS `user`
            //      INNER JOIN `tools` AS `Instruments` 
            //      ON `user`.`id` = `Instruments`.`userId` AND `Instruments`.`size` != 'small'

            // Inner where, `required: false`
            users = await User.findAll({
                include: { model: Tool, as: 'Instruments', where: { size: { [Op.ne]: 'small' } }, required: false }
            });
            //      SELECT [...] FROM `users` AS `user`
            //      LEFT OUTER JOIN `tools` AS `Instruments` 
            //      ON `user`.`id` = `Instruments`.`userId` AND `Instruments`.`size` != 'small'

            // Top-level where, with default `required: false`
            users = await User.findAll({
                where: { '$Instruments.size$': { [Op.ne]: 'small' } },
                include: { model: Tool, as: 'Instruments' }
            });
            //      SELECT [...] FROM `users` AS `user`
            //      LEFT OUTER JOIN `tools` AS `Instruments` 
            //      ON `user`.`id` = `Instruments`.`userId`
            //      WHERE `Instruments`.`size` != 'small'

            // Top-level where, `required: true`
            users = await User.findAll({
                where: { '$Instruments.size$': { [Op.ne]: 'small' } },
                include: { model: Tool, as: 'Instruments', required: true }
            });
            //      SELECT [...] FROM `users` AS `user`
            //      INNER JOIN `tools` AS `Instruments` 
            //      ON `user`.`id` = `Instruments`.`userId`
            //      WHERE `Instruments`.`size` != 'small'

            // --- RIGHT OUTER JOIN (MySQL, MariaDB, PostgreSQL и MSSQL)

            // SQLite не поддерживает RIGHT OUTER JOIN
            //      https://www.sqlite.org/omitted.html

            // этот функционал работает только если `required:false`
            // Inner where автоматически устанавливает `required:true`

            // will create a left join
            users = await User.findAll({ include: [{ model: Task }] });
            // will create a right join
            users = await User.findAll({ include: [{ model: Task, right: true }] });
            // has no effect, will create an inner join
            users = await User.findAll({ include: [{ model: Task, required: true, right: true }] });
            // has no effect, will create an inner join
            users = await User.findAll({ include: [{ model: Task, where: { name: { [Op.ne]: 'empty trash' } }, right: true }] });
            // will create a left join
            users = await User.findAll({
                include: [{
                    model: Tool, as: 'Instruments',
                    where: { name: { [Op.ne]: 'empty trash' } }, required: false
                }]
            });
            // will create a right join
            users = await User.findAll({
                include: [{
                    model: Tool, as: 'Instruments',
                    where: { name: { [Op.ne]: 'empty trash' } }, required: false, right: true
                }]
            });
        }
        catch (err) {
            console.log(colors.red(err));
        }
        finally {
            await clearSequelize(sequelize);
        }
    })();
}

// --------------- Special methods/mixins added to instances

async function technoMixins() {

    console.log(colors.green(`
        --- --- --- миксины --- --- ---
    `));

    ; await (async () => {
        let { sequelize, Foo, Bar, Qux } = await prepareFooBar();
        Foo.hasOne(Bar);
        Bar.belongsTo(Foo);
        Foo.hasMany(Qux);
        Qux.belongsTo(Foo);
        await sequelize.sync();

        // --- Creating, updating and deleting

        // метод save() экземпляра не поддерживает ассоциации, вызов save на родительском объекте проигнорирует изменения в дочернем
        // обычными методами можно создавать связи с уже имеющимися данными
        let bar = await Bar.create({ name: 'My Bar', fooId: 5 });
        let foo = await Foo.create({ name: 'the-foo' });
        let qux1 = await Qux.create({ name: 'first qux' });
        let qux2 = await Qux.create({ name: 'second qux' });

        // --- special methods

        // методы которые добавляются при создании связи между двумя моделями
        // если был определен псевдоним, то он будет использоваться вместо имени модели для формирования имен методов

        // - Foo.hasOne(Bar) добавляет: foo.getBar(), foo.setBar(), foo.createBar()

        console.log(await foo.getBar());                    // null
        await foo.setBar(bar);
        console.log((await foo.getBar()).name);             // 'some-bar'
        await foo.createBar({ name: 'yet-another-bar' });
        console.log(await foo.getBar().name);               // 'yet-another-bar'
        await foo.setBar(null);                             // Un-associate
        console.log(await foo.getBar());                    // null

        // - Foo.belongsTo(Bar) добавляет (такие же hasOne): foo.getBar(), foo.setBar(), foo.createBar()

        // - Foo.hasMany(Bar) добавляет: 
        //      foo.getBars(), foo.countBars(), foo.hasBar(), foo.hasBars(), foo.setBars(), 
        //      foo.addBar(), foo.addBars(), foo.removeBar(), foo.removeBars(), foo.createBar()

        // getBars может принимать условие запроса: { where: { ... } } 
        console.log(await foo.getQuxes());           // []
        console.log(await foo.countQuxes());         // 0
        console.log(await foo.hasQux(qux1));        // false
        await foo.addQuxes([qux1, qux2]);
        console.log(await foo.countQuxes());         // 2
        await foo.addQux(qux1);
        console.log(await foo.countQuxes());         // 2
        console.log(await foo.hasQux(qux1));        // true
        await foo.removeQux(qux2);
        console.log(await foo.countQuxes());         // 1
        await foo.createQux({ name: 'yet-another-bar' });
        console.log(await foo.countQuxes());         // 2
        await foo.setQuxes([]);                      // Un-associate all previously associated bars
        console.log(await foo.countQuxes());         // 0

        // - Foo.belongsToMany(Bar, { through: Baz }) добавляет (такие же hasMany):
        //      foo.getBars(), foo.countBars(), foo.hasBar(), foo.hasBars(), foo.setBars(), 
        //      foo.addBar(), foo.addBars(), foo.removeBar(), foo.removeBars(), foo.createBar(), 

        await clearSequelize(sequelize);
    })();
}

// --------------- Creating associations referencing a field which is not the primary key

async function technoAssociationKeys() {

    console.log(colors.green(`
        --- --- --- опции ассоциаций: sourceKey / targetKey / foreignKey --- --- ---
    `));

    // на поле, указанное в ассоциации, должно быть наложено уникальное ограничение ('unique:true')

    // выбор между sourceKey и targetKey заключается в том, чтобы запомнить, где размещаютя внешние ключи:
    //      - A.belongsTo(B) сохраняет внешний ключ в исходной модели A => 
    //          указанный ключ находится в целевой модели => targetKey
    //      - A.hasOne(B) и A.hasMany(B) сохраняют внешний ключ в целевой модели B => 
    //          указанный ключ находится в исходной модели => sourceKey
    //      - A.belongsToMany(B) сохраняет внешние ключи в соединительной таблице => 
    //          sourceKey соответствует полю в исходной модели A и targetKey соответствует полю в целевой модели B

    console.log(colors.white(`--- belongsTo`));

    // --- belongsTo
    ; await (async () => {
        let sequelize = await getSqliteSequelize(); // getPostgresSequelize(); // 

        try {
            // A.belongsTo(B) помещает внешний ключ в исходную модель A
            const Ship = sequelize.define('ship', { name: DataTypes.TEXT }, { timestamps: false });
            const Captain = sequelize.define('captain', { name: { type: DataTypes.TEXT, unique: true } }, { timestamps: false });
            // This creates a foreign key called `captainName` in the source model (Ship)
            // which references the `name` field from the target model (Captain).
            Ship.belongsTo(Captain, { targetKey: 'name', foreignKey: 'captainName' });
            await sequelize.sync();

            // 
            await Captain.create({ name: "Jack Sparrow" });
            let ship = await Ship.create({ name: "Black Pearl", captainName: "Jack Sparrow" });
            await ship.reload();
            let captain = await ship.getCaptain();
            console.log('captain = ' + JSON.stringify(captain));    // "Jack Sparrow"
        }
        catch (err) {
            console.log(colors.red(err));
        }
        finally {
            await clearSequelize(sequelize);
        }
    })();

    console.log(colors.white(`--- сложный пример для hasOne/hasMany --- миксин методы в асооциациях`));

    // --- hasOne / hasMany
    ; await (async () => {
        let sequelize = await getSqliteSequelize(); // getPostgresSequelize(); // 
        try {
            // hasOne и hasMany сохраняют внешний ключ на целевой модели
            let Foo = sequelize.define('foo', { name: { type: DataTypes.TEXT, unique: true } }, { timestamps: false });
            let Bar = sequelize.define('bar', { title: { type: DataTypes.TEXT, unique: true } }, { timestamps: false });
            let Baz = sequelize.define('baz', { summary: DataTypes.TEXT }, { timestamps: false });

            // 
            Foo.hasOne(Bar, { sourceKey: 'name', foreignKey: { name: 'fooName', type: DataTypes.TEXT } });
            Bar.belongsTo(Foo, { targetKey: 'name', foreignKey: 'fooName' });
            Bar.hasMany(Baz, { sourceKey: 'title', foreignKey: { name: 'barTitle', type: DataTypes.TEXT } });
            Baz.belongsTo(Bar, { targetKey: 'title', foreignKey: 'barTitle' });
            await sequelize.sync();

            // 
            let foo = await Foo.create({ name: 'my foo' });
            let bar = await Bar.create({ title: 'my bar' });
            let baz1 = await Baz.create({ summary: 'add baz' });
            let baz2 = await Baz.create({ summary: 'set baz' });

            // 
            await bar.setFoo('my foo');
            await bar.addBaz(baz1);
            await baz1.reload();
            await baz2.setBar('my bar');
            console.log(`
                --- foo = ${JSON.stringify(foo.dataValues)} 
                --- bar = ${JSON.stringify(bar.dataValues)} 
                --- baz1 = ${JSON.stringify(baz1.dataValues)}
                --- baz2 = ${JSON.stringify(baz2.dataValues)}`);
        }
        catch (err) {
            console.log(colors.red(err));
        }
        finally {
            await clearSequelize(sequelize);
        }
    })();

    console.log(colors.white(`--- использование sourceKey и targetKey вместе с through`));

    // --- belongsToMany
    ; await (async () => {
        let sequelize = await getSqliteSequelize(); // getPostgresSequelize(); // 

        // belongsToMany включает два внешних ключа, которые хранятся в дополнительной таблице
        Foo = sequelize.define('foo', { name: { type: DataTypes.TEXT, unique: true } }, { timestamps: false });
        Bar = sequelize.define('bar', { title: { type: DataTypes.TEXT, unique: true } }, { timestamps: false });
        // первичные ключей по умолчанию для Foo и Bar: `foo_bar` -> `fooId` / `barId`
        Foo.belongsToMany(Bar, { through: 'foo_bar' });
        // первичный ключ по умолчанию для Foo и другое поле для Bar: `foo_bar` -> `fooId` / `barTitle`
        Foo.belongsToMany(Bar, { through: 'foo_bar', targetKey: 'title' });
        // другое поле для Foo и первичный ключ по умолчанию для Bar: `foo_bar` -> `fooName` / `barId`
        Foo.belongsToMany(Bar, { through: 'foo_bar', sourceKey: 'name' });
        // другие поля для Foo и Bar: `foo_bar` -> `fooName` / `barTitle`
        Foo.belongsToMany(Bar, { through: 'foo_bar', sourceKey: 'name', targetKey: 'title' });
        await sequelize.sync();

        await clearSequelize(sequelize);
    })();
}

// --------------- Paranoid

// https://sequelize.org/master/manual/paranoid.html

// это таблицы из которых при DELETE записи не удаляются, а в поле deletedAt устанавливается дата удаления
// такие таблицы поддерживают soft-deletion вместо hard-deletion

async function technoParanoid() {

    console.log(colors.green(`
        --- --- --- paranoid таблицы (таблицы с мягким удалением записей) --- --- ---
    `));

    ; await (async () => {
        let sequelize = await getPostgresSequelize(); // getSqliteSequelize(); // 
        try {

            class Post extends Model { }
            Post.init(
                { title: DataTypes.TEXT, likes: DataTypes.INTEGER },
                {
                    sequelize,
                    paranoid: true,             // создать паранаидальную таблицу
                    timestamps: true,           // временные метки должны работать
                    deletedAt: 'destroyTime'    // можно задать имя столбца deletedAt
                }
            );
            await sequelize.sync();

            await Post.create({ id: 1, title: 'test', likes: 1 });
            await Post.create({ id: 2, title: 'foo', likes: 10 });
            await Post.create({ id: 3, title: 'bar', likes: 100 });

            // мягкое удаление: UPDATE "posts" SET "deletedAt"=[timestamp] WHERE "deletedAt" IS NULL AND "id" = 1
            await Post.destroy({ where: { id: 3 } });
            // жесткое удаление: DELETE FROM "posts" WHERE "id" = 1
            await Post.destroy({ where: { id: 1 }, force: true });
            // теже операции работаю с экземпляром модели
            let post = await Post.create({ id: 4, title: 'test' });
            await post.destroy();
            await post.destroy({ force: true });

            // восстановление удаленных записей
            await Post.restore({ where: { likes: { [Op.gt]: 30 } } });
            post = await Post.create({ id: 5, title: 'test' });
            await post.destroy();
            await post.restore();

            // запросы Sequelize (кроме необработанных запросов) автоматически игнорируют удаленные записи
            // чтобы запрашивать удаленные записи следует передать в запрос опцию 'paranoid:false'

            // This will return `null` if the record of id 123 is soft-deleted
            post = await Post.findByPk(2);
            // This will retrieve the record
            post = await Post.findByPk(3, { paranoid: false });
            // This will not retrieve soft-deleted records
            post = await Post.findAll({ where: { title: 'bar' } });
            // This will also retrieve soft-deleted records
            post = await Post.findAll({ where: { title: 'foo' }, paranoid: false });
        }
        catch (err) {
            console.log(colors.red(err));
        }
        finally {
            await clearSequelize(sequelize);
        }
    })();
}

// --------------- Many-to-Many Eager Loading 

async function technoEagerLoadingMtoM() {

    console.log(colors.green(`
        --- --- --- активная загрузка для ассоциаций 'Many-to-Many' --- --- ---
    `));

    console.log(colors.white(`--- простой запрос`));

    ; await (async () => {
        let sequelize = await getPostgresSequelize(); // getSqliteSequelize(); // 
        try {
            const Foo = sequelize.define('Foo', { name: DataTypes.TEXT });
            const Bar = sequelize.define('Bar', { name: DataTypes.TEXT });
            Foo.belongsToMany(Bar, { through: 'Foo_Bar' });
            Bar.belongsToMany(Foo, { through: 'Foo_Bar' });
            await sequelize.sync();

            // данные соединительной таблицы извлекаются автоматически
            let foo = await Foo.create({ name: 'foo' });
            let bar = await Bar.create({ name: 'bar' });
            await foo.addBar(bar);
            let fetchedFoo = Foo.findOne({ include: Bar });
            console.log(JSON.stringify(fetchedFoo, null, 2));
            //      {
            //          "id": 1, "name": "foo",
            //              "Bars": [{
            //                  "id": 1, "name": "bar",
            //                  по умолчанию Sequelize выбирает все атрибуты из соединительной таблицы
            //                  "Foo_Bar": { "FooId": 1, "BarId": 1 }
            //              }]
            //      }

            // указать выбираемые атрибуты из соединительной таблицы, если указать пустой массив, то данные 
            // не будут извлечены и свойство не будет создано
            foo = await Foo.findAll({ include: [{ model: Bar, through: { attributes: [/* список атрибутов */] } }] });
            console.log(JSON.stringify(foo));
            //      {
            //          "id": 1, "name": "foo",
            //          "Bars": [{ "id": 1, "name": "bar" }]
            //      }
        }
        catch (err) {
            console.log(colors.red(err));
        }
        finally {
            await clearSequelize(sequelize);
        }
    })();

    console.log(colors.white(`--- сложные запросы (многоуровневые, псевдонимы)`));

    ; await (async () => {
        let sequelize = await getPostgresSequelize(); // getSqliteSequelize(); // 
        try {
            const User = sequelize.define('user', { name: DataTypes.TEXT });
            const Project = sequelize.define('project', { name: DataTypes.TEXT, status: DataTypes.TEXT });
            const UserProject = sequelize.define('user_project', { completed: DataTypes.BOOLEAN });
            const Task = sequelize.define('task', { name: DataTypes.TEXT, status: DataTypes.TEXT });
            const ProjectTask = sequelize.define('project_task');
            const Post = sequelize.define('post', { body: DataTypes.TEXT });
            User.belongsToMany(Project, { through: UserProject });
            Project.belongsToMany(User, { through: UserProject });
            Project.belongsToMany(Task, { through: ProjectTask });
            Task.belongsToMany(Project, { through: ProjectTask });
            Project.hasMany(ProjectTask);
            User.hasMany(Post);
            await sequelize.sync();

            // 
            let project1 = await Project.create({ name: 'project 1', status: 'active' });
            let project2 = await Project.create({ name: 'project 2', status: 'complete' });
            let task1 = await Task.create({ name: 'task 1', status: 'active' });
            let task2 = await Task.create({ name: 'task 2', status: 'none' });
            let task3 = await Task.create({ name: 'task 3', status: 'active' });
            let task4 = await Task.create({ name: 'task 4', status: 'complete' });
            let task5 = await Task.create({ name: 'task 5', status: 'complete' });
            await project1.addTasks([task1, task2, task3]);
            await project2.addTasks([task4, task5]);

            // 
            let user = await User.create({ name: 'user 1' });
            await UserProject.create({ userId: user.id, projectId: project1.id, completed: false });
            await UserProject.create({ userId: user.id, projectId: project2.id, completed: true });

            // применить фильтр 'completed = true' к таблице соединений 
            user = await User.findAll({ include: [{ model: Project, through: { where: { completed: true } } }] });
            //      SELECT
            //          `User`.`id`, `User`.`name`,
            //          `Projects`.`id` AS `Projects.id`, `Projects`.`name` AS `Projects.name`,
            //          `Projects->User_Project`.`completed` AS `Projects.User_Project.completed`,
            //          `Projects->User_Project`.`UserId` AS `Projects.User_Project.UserId`,
            //          `Projects->User_Project`.`ProjectId` AS `Projects.User_Project.ProjectId`
            //      FROM `Users` AS `User`
            //      LEFT OUTER JOIN `User_Projects` AS `Projects->User_Project` 
            //          ON `User`.`id` = `Projects->User_Project`.`UserId`
            //      LEFT OUTER JOIN `Projects` AS `Projects` 
            //          ON `Projects`.`id` = `Projects->User_Project`.`ProjectId` AND `Projects->User_Project`.`completed` = 1;

            // --- ORDER BY

            // элементы order это массивы: [модель, стобец, модификатор]
            user = await User.findAll({ include: Project, order: [[Project, 'name', 'ASC']] });
            user = await User.findAll({ include: Project, order: [[Project, 'name', 'DESC']] });

            // с учетом псевдонима
            try {
                user = await User.findAll({
                    include: { model: Project, as: 'Div' },
                    order: [[{ model: Project, as: 'Div' }, 'name', 'DESC']]
                });
            }
            catch (err) {
                console.log(colors.red(`вызов с учетом псевдонима, будет работать если дать псевдоним: 'Project' as 'Div'`));
            }

            // несколько уровней вложенности
            // If we have includes nested in several levels we replicate the include chain of interest at the beginning of the order array
            user = await User.findAll({
                include: { model: Project, include: Task },
                order: [[Project, Task, 'name', 'DESC']]
            });

            // many-to-many сортировать по столбцам соединительной таблицы (ProjectTask)
            //      ошибка если не добавить ассоциацию между hasMany: Project -> ProjectTask
            //          SequelizeEagerLoadingError: project_task is not associated to project!
            //      ошибка если не добавить ProjectTask в include массив
            //          SequelizeDatabaseError: таблица "projects->project_tasks" отсутствует в предложении FROM
            user = await User.findAll({
                include: { model: Project, include: [Task, ProjectTask] },
                order: [[Project, ProjectTask, 'createdAt', 'ASC']]
            });

            // свойство order используется не на верхнем уровне только вместе с `separate:true`
            // This only works for `separate:true` (which in turn only works for has-many relationships).
            user = await User.findAll({ include: { model: Post, separate: true, order: [['createdAt', 'DESC']] } });

            // --- Nested eager loading

            // рекурсивная вложенная загрузка: для User загрузить Tool, для Tool загрузить Teacher
            users = await User.findAll({
                include: {
                    model: Project,
                    include: { model: Task, include: [] }
                }
            });
            console.log(JSON.stringify(users, null, 2));
            //      [{
            //          "name": "John Doe", "id": 1,
            //          // 1:M and N:M association
            //          "Instruments": [{
            //              "name": "Scissor", "id": 1, "userId": 1,
            //              // 1:1 association
            //              "Teacher": {
            //                  "name": "Jimi Hendrix"
            //              }
            //          }]
            //      }]

            // where создаст внутреннее соединение Tool с Teacher и вернет Users у которых есть как Tool так и Teaher
            // чтобы этого избежать следует добавить опцию 'required:false', тогда запрос вернет всех Users,
            // все Tools соответствующие Users, и Teachers удовлетворяющих условию 'school:"Woodstock Music School"'
            users = await User.findAll({
                include: [{
                    model: Project,
                    include: [{
                        model: Task, required: false,
                        where: { status: 'active' }
                    }]
                }]
            });

            // findAndCountAll

            // найти и подсчитать всех User, у которых есть Profile
            // учитываются только те связи для которых установлена опция 'required:true'
            // если 'required:false' то будут учитываться User у которых нет Profile
            users = await User.findAndCountAll({ include: [{ model: Project, required: true }], limit: 3 });

            // where автоматически устанавливает 'required:true'
            users = await User.findAndCountAll({ include: [{ model: Project, where: { status: 'active' } }], limit: 3 });
            console.log('--- --- ---');
        }
        catch (err) {
            console.log(colors.red(err));
        }
        finally {
            await clearSequelize(sequelize);
        }
    })();
}

// --------------- Creating with Associations

// https://sequelize.org/master/manual/creating-with-associations.html

async function technoAssociationCreating() {

    console.log(colors.green(`
        --- --- --- создание данных для нескольких таблиц через ассоциации --- --- ---
    `));

    ; await (async () => {
        let sequelize = await getPostgresSequelize(); // getSqliteSequelize(); // 
        try {

            // экземпляр может быть создан с вложенной ассоциацией за один шаг, если все элементы новые
            // выполнение обновлений и удалений с участием вложенных объектов в настоящее время невозможно

            class Product extends Model { }
            Product.init({ title: Sequelize.STRING }, { sequelize, modelName: 'product' });

            class User extends Model { }
            User.init({ firstName: Sequelize.STRING, lastName: Sequelize.STRING }, { sequelize, modelName: 'user' });

            class Address extends Model { }
            Address.init({ type: DataTypes.STRING, line1: Sequelize.STRING, line2: Sequelize.STRING, city: Sequelize.STRING, state: Sequelize.STRING, zip: Sequelize.STRING }, { sequelize, modelName: 'address' });

            class Tag extends Model { }
            Tag.init({ name: Sequelize.STRING }, { sequelize, modelName: 'tag' });

            Product.User = Product.belongsTo(User, { as: 'user' });
            Product.Creator = Product.belongsTo(User, { as: 'creator' });
            User.Addresses = User.hasMany(Address);
            Product.Tag = Product.hasMany(Tag, { as: 'tags' });
            Product.Categories = Product.hasMany(Tag, { as: 'categories' });
            await sequelize.sync();

            // BelongsTo / HasMany / HasOne association

            // создать продукт с пользоватлем и адресом для пользователя за один вызов
            let product = await Product.create(
                {
                    title: 'Chair',
                    // имя 'user' в нижнем регистре, значит свойство в объекте также должно быть 'user'
                    // если же sequelize.define дал имя 'User', то ключ в объекте так же должен быть 'User'
                    user: {
                        firstName: 'Mick', lastName: 'Broadstone',
                        addresses: [{ type: 'home', line1: '100 Main St.', city: 'Austin', state: 'TX', zip: '78704' }]
                    }
                },
                { include: [{ association: Product.User, include: [User.Addresses] }] }
            );

            // BelongsTo association with an alias

            // создать продукт с пользователем, используя псевдоним
            product = await Product.create(
                {
                    title: 'Chair',
                    creator: { firstName: 'Matt', lastName: 'Hansen' }
                },
                { include: [Product.Creator] }
            );

            // HasMany / BelongsToMany association

            // создать продукт с несколькими тегами (Also works for `belongsToMany`)
            product = await Product.create(
                {
                    title: 'Chair',
                    tags: [{ name: 'Alpha' }, { name: 'Beta' }]
                },
                { include: [{ association: Product.Tag, as: 'tags' }] }
            );

            // с учетом псевдонима
            product = await Product.create(
                {
                    title: 'Chair',
                    categories: [{ name: 'Alpha' }, { name: 'Beta' }]
                },
                { include: [{ association: Product.Categories, as: 'categories' }] }
            );
            console.log('--- --- ---');
        }
        catch (err) {
            console.log(colors.red(err));
        }
        finally {
            await clearSequelize(sequelize);
        }
    })();
}

// --------------- Advanced M:N Associations

async function technoAssociationAdvancedMtoM() {

    console.log(colors.green(`
        --- --- --- дополнительно про ассоциацию 'Many-to-Many' --- --- ---
    `));

    ; await (async () => {
        let sequelize = await getPostgresSequelize(); // getSqliteSequelize(); // 
        try {

            const User = sequelize.define('user', { username: DataTypes.STRING, points: DataTypes.INTEGER }, { timestamps: false });
            const Profile = sequelize.define('profile', { name: DataTypes.STRING }, { timestamps: false });

            // Sequelize автоматически генерировать модель 'User_Profiles' (junction table) с двумя колонками: userId и profileId
            // эти два столбца определяют составной уникальный ключ
            User.belongsToMany(Profile, { through: 'user_profiles', as: 'test_1' });
            Profile.belongsToMany(User, { through: 'user_profiles', as: 'test_2' });

            // составной уникальный ключ можно настроить при помощи опции uniqueKey
            User.belongsToMany(Profile, { through: 'user_profiles', uniqueKey: 'my_custom_unique', as: 'test_3' });

            // можно определить модель, которая будет использоваться в качестве junction таблицы, результат будет тот же
            const UserProfile = sequelize.define('user_profile',
                {
                    // вместо настройки составного уникального ключа, можно настроить первичный ключ в junction таблице 
                    //      два столбца userId и profileId не будут созадаваться как составной ключ
                    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true, allowNull: false },
                    selfGranted: DataTypes.BOOLEAN
                },
                { timestamps: false }
            );
            User.belongsToMany(Profile, { through: UserProfile });
            Profile.belongsToMany(User, { through: UserProfile });
            await sequelize.sync();

            // пример:
            let amidala = await User.create({ username: 'p4dm3', points: 1000 });
            let queen = await Profile.create({ name: 'Queen' });
            await amidala.addProfile(queen, { through: { selfGranted: false } });
            let result = await User.findOne({ where: { username: 'p4dm3' }, include: Profile });
            console.log(result);
            //      {
            //          "id": 4, "username": "p4dm3", "points": 1000,
            //          "profiles": [
            //              {
            //                  "id": 6, "name": "queen",
            //                  "User_Profile": { "userId": 4, "profileId": 6, "selfGranted": false }
            //              }
            //          ]
            //      }

            // пример:
            amidala = await User.create(
                {
                    username: 'p4dm3', points: 1000,
                    profiles: [{
                        name: 'Queen',
                        user_profile: { selfGranted: true }
                    }]
                },
                { include: [Profile] }
            );
            result = await User.findOne({ where: { username: 'p4dm3' }, include: Profile });
            console.log(result);
            //      {
            //          "id": 1, "username": "p4dm3", "points": 1000,
            //          "profiles": [
            //              {
            //                  "id": 1, "name": "Queen",
            //                  "User_Profile": { "selfGranted": true, "userId": 1, "profileId": 1 }
            //              }
            //          ]
            //      }
        }
        catch (err) {
            console.log(colors.red(err));
        }
        finally {
            await clearSequelize(sequelize);
        }
    })();
}

// --------------- 'Super Many-to-Many relationship'

async function technoSuperManyToMany() {

    console.log(colors.green(`
        --- --- --- ассоциация 'Super Many-to-Many' --- --- ---
    `));

    console.log(colors.white(`--- описание подходов: 'Many-to-Many' / 'One-to-Many' + 'One-to-Many' `));

    // --- сравнение двух подходов: 'Many-to-Many' / 'One-to-Many' + 'One-to-Many'
    ; await (async () => {

        const User = sequelize.define('user', { username: DataTypes.STRING, points: DataTypes.INTEGER }, { timestamps: false });
        const Profile = sequelize.define('profile', { name: DataTypes.STRING }, { timestamps: false });
        const Grant = sequelize.define('grant',
            {
                id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true, allowNull: false },
                selfGranted: DataTypes.BOOLEAN
            },
            { timestamps: false }
        );

        // вариант 1: Many-to-Many
        User.belongsToMany(Profile, { through: Grant });
        Profile.belongsToMany(User, { through: Grant });
        // вариант 2: One-to-Many между User и Grant, One-to-Many между Profile и Grant
        User.hasMany(Grant);
        Grant.belongsTo(User);
        Profile.hasMany(Grant);
        Grant.belongsTo(Profile);

        // одно отношение 'Many-to-Many' не сильно отличается от двух отношений 'One-to-Many'
        // разница будет заключаться в том как происходит активная загрузка

        // вариант 1, вы можете:
        User.findAll({ include: Profile });
        Profile.findAll({ include: User });
        // вариант 1, вы не можете:
        //      User.findAll({ include: Grant });
        //      Profile.findAll({ include: Grant });
        //      Grant.findAll({ include: User });
        //      Grant.findAll({ include: Profile });

        // вариант 2, вы можете: 
        User.findAll({ include: Grant });
        Profile.findAll({ include: Grant });
        Grant.findAll({ include: User });
        Grant.findAll({ include: Profile });
        // вариант 2, вы не можете:
        //      User.findAll({ include: Profile });
        //      Profile.findAll({ include: User });
        // вариант 2, эмуляция `User.findAll({ include: Profile })`: 
        //      но результат будет содержать поле user.grants вместо user.profiles
        //      User.findAll({ include: { model: Grant, include: Profile } });

        // --- 'Super Many-to-Many'

        // комбинируем оба подхода
        User.belongsToMany(Profile, { through: Grant });
        Profile.belongsToMany(User, { through: Grant });
        User.hasMany(Grant);
        Grant.belongsTo(User);
        Profile.hasMany(Grant);
        Grant.belongsTo(Profile);
        // мы можем выполнять все виды активной загрузки:
        User.findAll({ include: Profile });
        Profile.findAll({ include: User });
        User.findAll({ include: Grant });
        Profile.findAll({ include: Grant });
        Grant.findAll({ include: User });
        Grant.findAll({ include: Profile });
        User.findAll({
            include: [
                { model: Grant, include: [User, Profile] },
                {
                    model: Profile,
                    include: {
                        model: User,
                        include: { model: Grant, include: [User, Profile] }
                    }
                }
            ]
        });
    });

    // --- aliases / custom key names

    console.log(colors.white(`--- псевдонимы / именование ключей`));

    ; await (async () => {
        let sequelize = await getSqliteSequelize(); // getPostgresSequelize(); // 
        try {
            const Product = sequelize.define('product', { name: DataTypes.STRING }, { timestamps: false });
            const Category = sequelize.define('category', { name: DataTypes.STRING }, { timestamps: false });

            // определение псевдонима для belongsToMany влияет на способ выполнения findAll-include
            Product.belongsToMany(Category, { as: 'groups', through: 'product_categories' });
            Category.belongsToMany(Product, { as: 'items', through: 'product_categories' });
            await sequelize.sync();

            // This works, passing the alias
            let products = await Product.findAll({ include: { model: Category, as: 'groups' } });
            // This also works
            products = await Product.findAll({ include: 'groups' });
            // This doesn't work
            try {
                products = await Product.findAll({ include: Category });
            }
            catch (err) {
                console.log(colors.red(`запланированная ошибка --- не указан псевдоним --- ${err}`));
            }

            // определение псевдонима не влияет на имена внешних ключей, которые именубтся Sequelize на основе имен связанных моделей
            //      CREATE TABLE IF NOT EXISTS `product_categories`(
            //          `createdAt` DATETIME NOT NULL,
            //          `updatedAt` DATETIME NOT NULL,
            //          `productId` INTEGER NOT NULL REFERENCES `products`(`id`) ON DELETE CASCADE ON UPDATE CASCADE,
            //          `categoryId` INTEGER NOT NULL REFERENCES `categories`(`id`) ON DELETE CASCADE ON UPDATE CASCADE,
            //          PRIMARY KEY(`productId`, `categoryId`)
            //      );
        }
        catch (err) {
            console.log(colors.red(err));
        }
        finally {
            await clearSequelize(sequelize);
        }
    })();

    ; await (async () => {
        let sequelize = await getSqliteSequelize(); // getPostgresSequelize(); // 
        try {
            const Product = sequelize.define('product', { name: DataTypes.STRING }, { timestamps: false });
            const Category = sequelize.define('category', { name: DataTypes.STRING }, { timestamps: false });

            // чтобы изменить имена внешних ключей следует использовать опции: foreignKey (source model) и otherKey (target model)
            // для отношения 'Many-to-Many' следует указать имена ключей в обоих вызовах belongsToMany
            Product.belongsToMany(Category, {
                through: 'product_categories',
                foreignKey: 'objectId',             // replaces `productId`
                otherKey: 'typeId'                  // replaces `categoryId`
            });
            Category.belongsToMany(Product, {
                through: 'product_categories',
                foreignKey: 'typeId',               // replaces `categoryId`
                otherKey: 'objectId'                // replaces `productId`
            });
            await sequelize.sync();

            products = await Product.findAll({ include: Category });
            console.log(products);

            //      CREATE TABLE IF NOT EXISTS`product_categories`(
            //          `createdAt` DATETIME NOT NULL,
            //          `updatedAt` DATETIME NOT NULL,
            //          `objectId` INTEGER NOT NULL REFERENCES `products`(`id`) ON DELETE CASCADE ON UPDATE CASCADE,
            //          `typeId` INTEGER NOT NULL REFERENCES `categories`(`id`) ON DELETE CASCADE ON UPDATE CASCADE,
            //          PRIMARY KEY(`objectId`, `typeId`)
            //      );
        }
        catch (err) {
            console.log(colors.red(err));
        }
        finally {
            await clearSequelize(sequelize);
        }
    })();

    // --- Self-references (Many-to-Many)

    console.log(colors.white(`--- ассоциация таблицы на саму себя (tree table)`));

    ; await (async () => {
        let sequelize = await getSqliteSequelize(); // getPostgresSequelize(); // 

        // This will create the table PersonChildren which stores the ids of the objects.
        const Person = sequelize.define('person', { name: DataTypes.STRING });
        Person.belongsToMany(Person, { as: 'children', through: 'PersonChildren' })
        await sequelize.sync();

        // 
        let parent = await Person.create({ name: 'parent' });
        let children = await Person.create({ name: 'children' });
        await parent.addChildren(children);
        person = await Person.findOne({ include: { model: Person, as: 'children' } });

        await clearSequelize(sequelize);
    })();

    // --- атрибуты

    console.log(colors.white(`--- опции attributes и joinTableAttributes для ассоциации 'Many-to-Many'`));

    ; await (async () => {
        let sequelize = await getSqliteSequelize(); // getPostgresSequelize(); // 
        try {
            const User = sequelize.define('user', { name: DataTypes.STRING });
            const Profile = sequelize.define('profile', { name: DataTypes.STRING });
            const Grant = sequelize.define('grant', { selfGranted: DataTypes.BOOLEAN });
            User.belongsToMany(Profile, { through: Grant })
            await sequelize.sync();

            // 
            let user = await User.create(
                {
                    name: 'user 1',
                    profiles: [{
                        name: 'profile 1',
                        grant: { selfGranted: true }
                    }]
                },
                { include: [Profile] }
            );

            // если нужен только selfGranted атрибут из сквозной таблицы
            user = await User.findOne({ include: { model: Profile, through: { attributes: ['selfGranted'] } } });
            //      {
            //          "id": 4, "username": "p4dm3", "points": 1000,
            //          "profiles": [
            //              {
            //                  "id": 6, "name": "queen",
            //                  "grant": { "selfGranted": false }
            //              }
            //          ]
            //      }

            // если вам вообще не нужно вложенное grant поле, используйте 'attributes:[]'
            user = await User.findOne({ include: { model: Profile, through: { attributes: [] } } });
            //      {
            //          "id": 4, "username": "p4dm3", "points": 1000,
            //          "profiles": [{ "id": 6, "name": "queen" }]
            //      }

            // при использовании mixins следует использовать опцию 'joinTableAttributes:[...]' вместо 'attributes:[...]'
            let profiles = await user.getProfiles({ joinTableAttributes: ['selfGranted'] });
            //      [
            //          {
            //              "id": 6, "name": "queen",
            //              "grant": { "selfGranted": false }
            //          }
            //      ]
            console.log(profiles);
        }
        catch (err) {
            console.log(colors.red(err));
        }
        finally {
            await clearSequelize(sequelize);
        }
    })();

    // --- many-to-many-to-many

    console.log(colors.white(`--- пример ассоциации 'Super Many-to-Many'`));

    // детальные объяснения здесь: 
    //      https://sequelize.org/master/manual/advanced-many-to-many.html

    ; await (async () => {
        let sequelize = await getSqliteSequelize(); // getPostgresSequelize(); // 
        try {
            const Player = sequelize.define('Player', { username: DataTypes.STRING });
            const Team = sequelize.define('Team', { name: DataTypes.STRING });
            const Game = sequelize.define('Game', { name: DataTypes.STRING });

            // We apply a Super Many-to-Many relationship between Game and Team
            const GameTeam = sequelize.define('GameTeam', {
                id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true, allowNull: false }
            });
            Team.belongsToMany(Game, { through: GameTeam });
            Game.belongsToMany(Team, { through: GameTeam });
            GameTeam.belongsTo(Game);
            GameTeam.belongsTo(Team);
            Game.hasMany(GameTeam);
            Team.hasMany(GameTeam);

            // We apply a Super Many-to-Many relationship between Player and GameTeam
            const PlayerGameTeam = sequelize.define('PlayerGameTeam', {
                id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true, allowNull: false }
            });
            Player.belongsToMany(GameTeam, { through: PlayerGameTeam });
            GameTeam.belongsToMany(Player, { through: PlayerGameTeam });
            PlayerGameTeam.belongsTo(Player);
            PlayerGameTeam.belongsTo(GameTeam);
            Player.hasMany(PlayerGameTeam);
            GameTeam.hasMany(PlayerGameTeam);
            await sequelize.sync();

            // 
            await Player.bulkCreate([
                { username: 's0me0ne' },
                { username: 'empty' },
                { username: 'greenhead' },
                { username: 'not_spock' },
                { username: 'bowl_of_petunias' }
            ]);
            await Game.bulkCreate([
                { name: 'The Big Clash' },
                { name: 'Winter Showdown' },
                { name: 'Summer Beatdown' }
            ]);
            await Team.bulkCreate([
                { name: 'The Martians' },
                { name: 'The Earthlings' },
                { name: 'The Plutonians' }
            ]);

            // Let's start defining which teams were in which games. This can be done
            // in several ways, such as calling `.setTeams` on each game. However, for
            // brevity, we will use direct `create` calls instead, referring directly
            // to the IDs we want. We know that IDs are given in order starting from 1.
            await GameTeam.bulkCreate([
                { GameId: 1, TeamId: 1 },   // this GameTeam will get id 1
                { GameId: 1, TeamId: 2 },   // this GameTeam will get id 2
                { GameId: 2, TeamId: 1 },   // this GameTeam will get id 3
                { GameId: 2, TeamId: 3 },   // this GameTeam will get id 4
                { GameId: 3, TeamId: 2 },   // this GameTeam will get id 5
                { GameId: 3, TeamId: 3 }    // this GameTeam will get id 6
            ]);

            // Now let's specify players.
            // For brevity, let's do it only for the second game (Winter Showdown).
            // Let's say that that s0me0ne and greenhead played for The Martians, while
            // not_spock and bowl_of_petunias played for The Plutonians:
            await PlayerGameTeam.bulkCreate([
                // In 'Winter Showdown' (i.e. GameTeamIds 3 and 4):
                { PlayerId: 1, GameTeamId: 3 },   // s0me0ne played for The Martians
                { PlayerId: 3, GameTeamId: 3 },   // greenhead played for The Martians
                { PlayerId: 4, GameTeamId: 4 },   // not_spock played for The Plutonians
                { PlayerId: 5, GameTeamId: 4 }    // bowl_of_petunias played for The Plutonians
            ]);

            // Now we can make queries!
            const game = await Game.findOne({
                where: { name: "Winter Showdown" },
                include: {
                    model: GameTeam,
                    include: [
                        // Hide unwanted `PlayerGameTeam` nested object from results
                        { model: Player, through: { attributes: [] } },
                        Team
                    ]
                }
            });

            console.log(`Found game: "${game.name}"`);
            for (let i = 0; i < game.GameTeams.length; i++) {
                const team = game.GameTeams[i].Team;
                const players = game.GameTeams[i].Players;
                console.log(`- Team "${team.name}" played game "${game.name}" with the following players:`);
                console.log(players.map(p => `--- ${p.username}`).join('\n'));
            }

            //      Found game: "Winter Showdown"
            //      - Team "The Martians" played game "Winter Showdown" with the following players:
            //      --- s0me0ne
            //      --- greenhead
            //      - Team "The Plutonians" played game "Winter Showdown" with the following players:
            //      --- not_spock
            //      --- bowl_of_petunias
        }
        catch (err) {
            console.log(colors.red(err));
        }
        finally {
            await clearSequelize(sequelize);
        }
    })();

}

/*
; await (async () => {
    let sequelize = await getSqliteSequelize(); // getPostgresSequelize(); //
    try {
        await sequelize.sync();
    }
    catch (err) {
        console.log(err);
    }
    finally {
        await clearSequelize(sequelize);
    }
})();
*/