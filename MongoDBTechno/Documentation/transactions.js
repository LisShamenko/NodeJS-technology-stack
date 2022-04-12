const { MongoError, MongoClient } = require('mongodb');



// --------------- 4. Transactions.

//      https://www.mongodb.com/docs/drivers/node/current/fundamentals/transactions/
//      https://www.mongodb.com/docs/manual/core/transactions/

// Транзакция - это последовательность операций, которые выполняются, как одна 
//      неделимая операция, что называется атомарностью. 

// Все операции записи в один документ являются атомарными, поэтому транзакции
//      дают наибольшую выгоду при записи в несколько разных документов, что 
//      называется многодокументной транзакцией. Такие транзакции совместимы 
//      с ACID, то есть гарантируется согласованность данных.

// Multi-транзакции (многодокументные транзакции) выполняются в рамках сеанса 
//      клиента. Сеанс клиента - это группа связанных операций чтения/записи, 
//      которые должны выполняться последовательно.

// --- --- Transaction: Core API 

// Core API вклюяает методы объекта Session для работы с транзакциями:
// - startTransaction       запуск транзакции;
// - commitTransaction      фиксация транзакции;
// - abortTransaction       отмена транзакции;

// При фиксации транзакции отправляется запрос на сервер, чтобы атомарно внести 
//      изменения. При использовании этого API необходимо вручную обработать ошибки 
//      транзакций, возвращаемые сервером: 
//      - TransientTransactionError;
//      - UnknownTransactionCommitResult;

// --- --- Transaction: Callback API

// Callback API позволяет выполнить транзакцию, передав в метод Session.withTransaction 
//      функцию обратного вызова, которая инкапсулирует последовательность операций, 
//      составляющих транзакцию. Этот API автоматически обрабатывает ошибки транзакций, 
//      возвращаемые сервером.

// --- --- Transaction: Settings

// При создании транзакции можно указать следующие параметры: 
//      readConcern - указывает, как проверять согласованность данных, извлекаемых 
//          операциями чтения из набора реплик;
//      writeConcern - задает условия подтверждения записи;
//      readPreference - описание того, как клиенты MongoDB направляют операции 
//          чтения набору реплик;
//      maxCommitTimeMS - указывает максимальное количество времени, в течение 
//          которого может выполняться фиксация транзакции в миллисекундах.

// По умолчанию используются параметры клиента. 

// Для Core API параметры транзакции можно указать следующим образом:
//      const transactionOptions = {
//          readPreference: 'primary',
//          readConcern: { level: 'local' },
//          writeConcern: { w: 'majority' },
//          maxCommitTimeMS: 1000
//      };
//      session.startTransaction(transactionOptions);

// Для Callback API параметры транзакции можно указать следующим образом:
//      const transactionOptions = {
//          readPreference: 'primary',
//          readConcern: { level: 'local' },
//          writeConcern: { w: 'majority' },
//          maxCommitTimeMS: 1000
//      };
//      await session.withTransaction(async (session) => { }, transactionOptions);

// --- --- Реализация.

// Сценарий: покупатель покупает товары в интернет-магазине. Чтобы зарегистрировать 
//      покупку, приложение должно обновить информацию о запасах товара и заказах 
//      клиента, а потом зарегистрировать детали заказа.

//       Collection | Operation | Description
//      ────────────┼───────────┼───────────────────────
//      orders      | insert    | запись информации о покупке
//      customers   | update    | связать идентификатор заказа с клиентом
//      inventory   | update    | вычесть количество заказанных товаров

// В случае сбоя при выполнении покупки следует использовать транзакцию, чтобы 
//      избежать раскрытия любых частичных обновлений, способных вызвать
//      проблемы с согласованностью данных для других операций.

// --- --- Core API Implementation

async function example_coreAPI() {

    const client = new MongoClient("mongodb://localhost:27017");

    try {
        await client.connect();
        const database = client.db("testdb");

        // --- --- Sample Data

        //
        const orders = database.collection('orders');

        // customers - описывает клиентов и их заказы
        const customers = database.collection("customers");
        await customers.insertMany([
            { _id: 98765, orders: [] }
        ]);

        // inventory - отслеживает количество и описание товара
        const inventory = database.collection("inventory");
        await inventory.insertMany([
            { name: "sunblock", sku: 5432, qty: 85 },
            { name: "beach towel", sku: 7865, qty: 41 }
        ]);

        // список приобретенных товаров
        const cart = [
            { name: 'sunblock', sku: 5432, qty: 1, price: 5.19 },
            { name: 'beach towel', sku: 7865, qty: 2, price: 15.99 }
        ];

        // сведения об оплате заказа 
        const payment = { customer: 98765, total: 37.17 };

        // --- --- Implementation

        // - запуск сеанса;
        // - запуск транзакции с указанными параметрами;
        // - выполнение операций в рамках одного сеанса;
        // - фиксация транзакции или ее отмена в случае ошибки;
        // - завершение сеанса.

        // 
        const session = client.startSession();

        // 
        session.startTransaction({
            readConcern: { level: 'snapshot' },
            writeConcern: { w: 'majority' },
            readPreference: 'primary'
        });

        // 
        const orderResult = await orders.insertOne(
            {
                customer: payment.customer,
                items: cart,
                total: payment.total,
            },
            { session }
        );

        // 
        for (let i = 0; i < cart.length; i++) {
            const item = cart[i];

            //
            const checkInventory = await inventory.findOne(
                {
                    sku: item.sku,
                    qty: { $gte: item.qty }
                },
                { session }
            )

            // Cancel the transaction when you have insufficient inventory
            if (checkInventory === null) {
                throw new Error('Insufficient quantity or SKU not found.');
            }

            // 
            await inventory.updateOne(
                { sku: item.sku },
                { $inc: { 'qty': -item.qty } },
                { session }
            );
        }

        // 
        await customers.updateOne(
            { _id: payment.customer },
            { $push: { orders: orderResult.insertedId } },
            { session }
        );

        // 
        await session.commitTransaction();
        console.log('Transaction successfully committed.');
    }
    catch (error) {

        // логика обработки ошибок
        if (error instanceof MongoError &&
            error.hasErrorLabel('UnknownTransactionCommitResult')) {
            // add your logic to retry or handle the error
        }
        else if (error instanceof MongoError &&
            error.hasErrorLabel('TransientTransactionError')) {
            // add your logic to retry or handle the error
        }
        else {
            console.log('An error occured in the transaction, performing a data rollback:' + error);
        }

        // 
        await session.abortTransaction();
    }
    finally {

        // 
        await session.endSession();
        await client.close();
    }
}

// --- --- Callback API Implementation

// 
async function example_callbackAPI(transactFunc) {

    const client = new MongoClient("mongodb://localhost:27017");

    try {
        await client.connect();
        const database = client.db("testdb");

        // --- --- Sample Data

        //
        const orders = database.collection('orders');

        // customers - описывает клиентов и их заказы
        const customers = database.collection("customers");
        await customers.insertMany([
            { _id: 98765, orders: [] }
        ]);

        // inventory - отслеживает количество и описание товара
        const inventory = database.collection("inventory");
        await inventory.insertMany([
            { name: "sunblock", sku: 5432, qty: 85 },
            { name: "beach towel", sku: 7865, qty: 41 }
        ]);

        // список приобретенных товаров
        const cart = [
            { name: 'sunblock', sku: 5432, qty: 1, price: 5.19 },
            { name: 'beach towel', sku: 7865, qty: 2, price: 15.99 }
        ];

        // сведения об оплате заказа 
        const payment = { customer: 98765, total: 37.17 };

        // --- --- Implementation

        // - запуск сеанса;
        // - запуск транзакции с указанными параметрами;
        // - выполнение операций в рамках одного сеанса;
        // - фиксация транзакции или ее отмена в случае ошибки;
        // - завершение сеанса.

        //
        const session = client.startSession();
        await session.withTransaction(
            async (session) => {
                await transactFunc(client, session, cart, payment);
            },
            {
                readPreference: 'primary',
                readConcern: { level: 'local' },
                writeConcern: { w: 'majority' },
                maxCommitTimeMS: 1000
            }
        );
    }
    catch (error) {
        console.log('Encountered an error during the transaction: ' + error);
    }
    finally {
        await session.endSession();
        await client.close();
    }
}

// Вместо передачи обратного вызова можно использовать функцию Promise. Функция 
//      обратного вызова transactFunc передается в withTransaction для запуска 
//      в качестве транзакции.

async function transactFunc(client, session, cart, payment) {

    const database = client.db("testdb");
    const orders = database.collection('orders');
    const inventory = database.collection("inventory");
    const customers = database.collection("customers");

    // 
    const orderResult = await orders.insertOne(
        {
            customer: payment.customer,
            items: cart,
            total: payment.total,
        },
        { session }
    );

    // 
    for (let i = 0; i < cart.length; i++) {
        const item = cart[i];

        // Cancel the transaction when you have insufficient inventory
        const checkInventory = await inventory.findOne(
            {
                sku: item.sku,
                qty: { $gte: item.qty }
            },
            { session }
        );

        if (checkInventory === null) {
            await session.abortTransaction();
            console.error('Insufficient quantity or SKU not found.');
        }

        await inventory.updateOne(
            { sku: item.sku },
            { $inc: { 'qty': -item.qty } },
            { session }
        );
    }

    // 
    await customers.updateOne(
        { _id: payment.customer },
        { $push: { orders: orderResult.insertedId } },
        { session }
    );
}

// --- --- Payment Transaction Result

// Коллекция customers:
//      { "_id": 98765, "orders": ["61dc..."] }

// Коллекция inventory:
//      [
//          { "_id": '', "name": "sunblock", "sku": 5432, "qty": 84 },
//          { "_id": '', "name": "beach towel", "sku": 7865, "qty": 39 }
//      ]

// Коллекция orders:
//      [
//          {
//              "_id": "...",
//              "customer": 98765,
//              "items": [
//                  { "name": "sunblock", "sku": 5432, "qty": 1, "price": 5.19 },
//                  { "name": "beach towel", "sku": 7865, "qty": 2, "price": 15.99 }
//              ],
//              "total": 37.17
//          }
//      ]

// --- Запуск.

(async () => {
    await example_coreAPI();
    await example_callbackAPI(transactFunc);
})();