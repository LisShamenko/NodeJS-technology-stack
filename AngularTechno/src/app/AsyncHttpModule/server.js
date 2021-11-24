// --------------- server model

let data = {
    lastId: 9,
    products: [
        { id: 0, name: "product 0", category: "category 1", price: 10 },
        { id: 1, name: "product 1", category: "category 2", price: 15.5 },
        { id: 2, name: "product 2", category: "category 2", price: 20 },
        { id: 3, name: "product 3", category: "category 3", price: 25.5 },
        { id: 4, name: "product 4", category: "category 3", price: 30 },
        { id: 5, name: "product 5", category: "category 3", price: 35.5 },
        { id: 6, name: "product 6", category: "category 4", price: 40 },
        { id: 7, name: "product 7", category: "category 4", price: 45.5 },
        { id: 8, name: "product 8", category: "category 4", price: 50 },
        { id: 9, name: "product 9", category: "category 4", price: 55.5 },
    ]
};

function getLastId() {
    data.lastId++;
    return data.lastId;
}

// --------------- server

// тестовый сервер без проверок данных, запуск:
//      node "E:/4. Unity Projects/7. NodeJS/technology_NodeJS/AngularTechno/src/app/AsyncHttpModule/server.js"

//      https://developer.mozilla.org/ru/docs/Web/HTTP/Status

const express = require('express');
const app = express();
const port = 3000;

app.use(express.json({ strict: false, type: 'application/json' }));
app.use(express.urlencoded({ extended: true, type: 'application/x-www-form-urlencoded' }));
app.use((req, res, next) => {
    res.set('Access-Control-Allow-Origin', req.get('Origin') || '*');
    res.set('Access-Control-Allow-Headers', '*');
    res.set('Access-Control-Allow-Methods', '*');
    res.set('Cache-Control', 'no-store');
    next();
});

app.get('/pagination', (req, res) => {
    console.log(`GET --- url = '/pagination' --- time = ${Date.now()}`);

    let categories = data.products
        .map(p => p.category ? p.category : '')
        .filter((category, index, array) => array.indexOf(category) == index);

    res.json({
        countPtoducts: data.products.length,
        countCategories: categories.length,
    });
});

app.get('/products', (req, res) => {
    console.log(`GET --- url = '/products' --- time = ${Date.now()}`);
    res.json(data);
});

app.get('/products/:id', (req, res) => {
    console.log(`GET --- url = '/products/:id' --- time = ${Date.now()}`);
    console.log('req.params.id = ' + req.params.id);
    console.log('req.body.id = ' + req.body.id);

    let product = data.products.find(item => item.id == req.params.id);
    if (product) {
        res.status(200).json(product);
    }
    else {
        res.status(400).send('Продукт отсутствует!');
    }
});

app.post('/products', (req, res) => {
    console.log(`POST --- url = '/products' --- time = ${Date.now()}`);

    if (req.body.name && req.body.category && req.body.price) {
        let product = {
            id: getLastId(),
            name: req.body.name,
            category: req.body.category,
            price: req.body.price
        };
        data.products.push(product);
        res.status(200).json(product);
    }
    else {
        res.status(400).send('Переданы не все данные!');
    }
});

app.put('/products/:id', (req, res) => {
    console.log(`PUT --- url = '/products' --- time = ${Date.now()}`);

    let product = data.products.find(item => item.id == req.params.id);
    if (product) {
        product.name = req.body.name;
        product.category = req.body.category;
        product.price = req.body.price;
        res.status(200).json(product);
    }
    else {
        res.status(400).send('Продукт отсутствует!');
    }
});

app.delete('/products/:id', (req, res) => {
    console.log(`DELETE --- url = '/products' --- time = ${Date.now()}`);

    console.log(`url --- delete --- '/products/:id' --- time = ${Date.now()}`);
    let index = data.products.findIndex(item => item.id == req.params.id);
    if (index >= 0) {
        data.products.splice(index, 1);
        res.status(200).send();
    }
    else {
        res.status(400).send('Продукт отсутствует!');
    }
});

app.listen(port, () => {
    console.log(`http://localhost:${port}/products`);
});