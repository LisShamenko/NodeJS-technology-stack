// --------------- отладка тестов через chrome

// сделать запись в scripts файла package.json:
//      "only-test-swagger": "mocha --inspect-brk test/test_swagger.js"
// запустить тесты:
//      npm run only-test-swagger
// запустить в хроме и выбрать Remote Target:
//      chrome://inspect
// остановка в коде:
//      debugger

// --------------- 

process.env.NODE_ENV = 'test';

// --------------- chai

const chai = require('chai');
const chaiHttp = require('chai-http');
chai.use(chaiHttp);
const expect = chai.expect;

// --------------- app

const path = require('path');
const app = require(path.join(process.cwd(), 'App/Swagger/SwaggerApp'));

// --------------- database

const pg = require('pg');
const PostgresOperations = require(path.join(process.cwd(), 'App/Swagger/Operations/PostgresOperations'));
const operations = PostgresOperations(path, pg);

// --------------- test

describe('swagger application', () => {
    console.log('describe --- 1');

    //before(async function () { });

    //after(function () { });

    // --------------- test: tables and columns

    describe.skip('series: tables and columns', () => {
        console.log('');

        before(async function () {
            await operations.clearDatabase();
        });

        // 
        let seriesResult = {
            sourceTable: {
                name: 'goods',
                schema: 'metadata',
            },
            sourceColumns: [
                { name: 'title', type: 'text' },
                { name: 'arrived_at', type: 'timestamp with time zone' },
                { name: 'count', type: 'integer' },
            ],
            sourceNewColumn: {
                name: 'new_field_text',
                type: 'text',
                is_not_null: true,
            }
        };

        // 
        function getColumnFromBody(body) {
            return {
                id: body.id,
                name: body.name,
                type: body.type,
                is_not_null: body.is_not_null,
            };
        }

        // 
        it('insert table', async () => {

            let res = await chai.request(app)
                .post('/api/insert_table')
                .send({ table: seriesResult.sourceTable, columns: seriesResult.sourceColumns });

            //debugger;

            seriesResult.table = res.body.table;
            seriesResult.columns = res.body.columns;
            let columnsResult = seriesResult.columns.map(item => {
                return { name: item.name, type: item.type };
            })

            expect(seriesResult.table).to.deep.include(seriesResult.sourceTable);
            expect(seriesResult.columns[0]).to.include.all.keys('id', 'name', 'type', 'is_not_null');
            expect(seriesResult.columns[1]).to.include.all.keys('id', 'name', 'type', 'is_not_null');
            expect(seriesResult.columns[2]).to.include.all.keys('id', 'name', 'type', 'is_not_null');
            expect(seriesResult.sourceColumns).to.deep.equal(columnsResult);
        });

        // 
        it('select table', async () => {
            let res = await chai.request(app)
                .get('/api/select_table')
                .query({ id: seriesResult.table.id });

            //debugger;

            expect(seriesResult.table).to.deep.include(res.body.table);
            expect(seriesResult.columns).to.deep.include(res.body.columns[0]);
            expect(seriesResult.columns).to.deep.include(res.body.columns[1]);
            expect(seriesResult.columns).to.deep.include(res.body.columns[2]);
        });

        // 
        it('insert column', async () => {
            let res = await chai.request(app)
                .post('/api/insert_column')
                .send({ table_id: seriesResult.table.id, column: seriesResult.sourceNewColumn });

            //debugger;

            seriesResult.newColumn = getColumnFromBody(res.body);
            expect(seriesResult.newColumn).to.include.all.keys('id', 'name', 'type', 'is_not_null');
            expect(seriesResult.newColumn).to.deep.include(seriesResult.sourceNewColumn);
        });

        // 
        it('select column', async () => {
            let res = await chai.request(app)
                .get('/api/select_column')
                .query({ table_id: seriesResult.table.id, column_id: seriesResult.newColumn.id });

            //debugger;

            let selectColumn = getColumnFromBody(res.body);
            expect(seriesResult.newColumn).to.deep.equal(selectColumn);
        });

        // 
        it('delete column', async () => {
            let res = await chai.request(app)
                .delete('/api/delete_column')
                .query({ table_id: seriesResult.table.id, column_id: seriesResult.newColumn.id });

            //debugger;

            expect(res.body.rowCount).to.equal(1);
        });

        // 
        it('select columns', async () => {
            let res = await chai.request(app)
                .get('/api/select_columns')
                .query({ table_id: seriesResult.table.id });

            //debugger;

            expect(res.body.length).to.equal(seriesResult.columns.length);
            expect(seriesResult.columns).to.deep.equal(res.body);
        });

        // 
        it('delete table', async () => {
            let res = await chai.request(app)
                .delete('/api/delete_table')
                .query({ id: seriesResult.table.id });

            //debugger;

            expect(res.body.rowCountTable).to.equal(1);
            expect(res.body.rowCountColumns).to.equal(seriesResult.columns.length);
        });

        // 
        it('select tables', async () => {
            let res = await chai.request(app)
                .get('/api/select_tables');

            //debugger;

            expect(res.body.length).to.equal(0);
        });

    });

    // --------------- test: queries and links

    describe.skip('series: queries and links', () => {
        console.log('');

        before(async function () {
            await operations.clearDatabase();
        });

        // 
        let seriesResult = {
            sourceQuery: {
                name: 'first_request',
            },
            sourceLinks: [
                {
                    index: 0, type: 'root',
                    table_id: 10, table_key_id: 21,
                    parent_id: 0, parent_key_id: 0,
                    groups: [
                        { column_id: 20, agg_func: 'count' },
                        { column_id: 21, agg_func: 'count' },
                        { column_id: 22, agg_func: 'count' },
                    ]
                }
            ],
            sourceNewLink: {
                index: 1, type: 'join',
                table_id: 20, table_key_id: 44,
                parent_id: 10, parent_key_id: 21,
                groups: [
                    { column_id: 43, agg_func: 'count' },
                    { column_id: 44, agg_func: 'count' },
                    { column_id: 45, agg_func: 'count' },
                ]
            },
            sourceUpdateLink: {
                index: 1, type: 'join',
                table_id: 40, table_key_id: 88,
                parent_id: 20, parent_key_id: 42,
                groups: [
                    { column_id: 86, agg_func: 'count' },
                    { column_id: 88, agg_func: 'count' },
                    { column_id: 90, agg_func: 'count' },
                ]
            },
        };

        // 
        function getSourceWithId(newLink, sourceLink) {
            return {
                id: newLink.id,
                query_id: newLink.query_id,
                ...sourceLink
            };
        }

        // 
        it('insert query', async () => {
            let res = await chai.request(app)
                .post('/api/insert_query')
                .send({ query: seriesResult.sourceQuery, links: seriesResult.sourceLinks });

            //debugger;

            seriesResult.query = res.body.query;
            seriesResult.links = res.body.links;
            let columnsResult = getSourceWithId(seriesResult.links[0], seriesResult.sourceLinks[0]);

            expect(seriesResult.query).to.deep.include(seriesResult.sourceQuery);
            expect(seriesResult.links[0]).to.include.all.keys('index', 'table_id', 'table_key_id', 'parent_id', 'parent_key_id', 'type', 'groups');
            expect(seriesResult.links[0]).to.deep.equal(columnsResult);
        });

        // 
        it('select query', async () => {
            let res = await chai.request(app)
                .get('/api/select_query')
                .query({ id: seriesResult.query.id });

            //debugger;

            expect(seriesResult.query).to.deep.equal(res.body.query);
            expect(seriesResult.query).to.deep.include(res.body.query);
            expect(seriesResult.links).to.deep.include(res.body.links[0]);
        });

        // 
        it('insert link', async () => {
            let res = await chai.request(app)
                .post('/api/insert_link')
                .send({ query_id: seriesResult.query.id, link: seriesResult.sourceNewLink })

            //debugger;

            seriesResult.newLink = res.body;
            expect(seriesResult.newLink).to.include.all.keys('index', 'table_id', 'table_key_id', 'parent_id', 'parent_key_id', 'type', 'groups');
            expect(seriesResult.newLink).to.deep.include(seriesResult.sourceNewLink);
        });

        // 
        it('update link', async () => {
            let res = await chai.request(app)
                .post('/api/update_link')
                .send(getSourceWithId(seriesResult.newLink, seriesResult.sourceUpdateLink));

            //debugger;

            seriesResult.updateLink = res.body;
            let updateLink = getSourceWithId(res.body, seriesResult.sourceUpdateLink);
            expect(seriesResult.updateLink).to.deep.equal(updateLink);
        });

        // 
        it('select link', async () => {
            let res = await chai.request(app)
                .get('/api/select_link')
                .query({ query_id: seriesResult.query.id, link_id: seriesResult.updateLink.id });

            //debugger;

            expect(seriesResult.updateLink).to.deep.equal(res.body);
        });

        // 
        it('delete link', async () => {
            let res = await chai.request(app)
                .delete('/api/delete_link')
                .query({ query_id: seriesResult.query.id, link_id: seriesResult.updateLink.id });

            //debugger;

            expect(res.body.rowCount).to.equal(1);
        });

        // 
        it('select links', async () => {
            let res = await chai.request(app)
                .get('/api/select_links')
                .query({ query_id: seriesResult.query.id });

            //debugger;

            expect(res.body.length).to.equal(seriesResult.links.length);
            expect(seriesResult.links).to.deep.equal(res.body);
        });

        // 
        it('delete query', async () => {
            let res = await chai.request(app)
                .delete('/api/delete_query')
                .query({ id: seriesResult.query.id });

            //debugger;

            expect(res.body.rowCountQueries).to.equal(1);
            expect(res.body.rowCountLinks).to.equal(seriesResult.links.length);
        });

        // 
        it('select queries', async () => {
            let res = await chai.request(app)
                .get('/api/select_queries');

            //debugger;

            expect(res.body.length).to.equal(0);
        });

    });

    // --------------- test: tree / data

    describe('series: data, tree and executors', () => {
        console.log('');

        // необходимые таблицы и связи
        let seriesSource = {
            test_parent: {
                table: { name: "test_parent", schema: "metadata" },
                columns: [
                    { name: "title", type: "text" },
                    { name: "first_key", type: "integer" },
                    { name: "second_key", type: "integer" },
                    { name: "third_key", type: "integer" }
                ]
            },
            test_child: {
                table: { name: "test_child", schema: "metadata" },
                columns: [
                    { name: "title", type: "text" },
                    { name: "to_first_key", type: "integer" },
                    { name: "tree_child_key", type: "integer" },
                    { name: "tree_parent_key", type: "integer" }
                ]
            },
            getColumns(parentTable, childTable) {
                return {
                    // parent table
                    parentTitle: parentTable.columns.find(item => item.name === "title"),
                    firstKey: parentTable.columns.find(item => item.name === "first_key"),
                    secondKey: parentTable.columns.find(item => item.name === "second_key"),
                    thirdKey: parentTable.columns.find(item => item.name === "third_key"),
                    // child table
                    childTitle: childTable.columns.find(item => item.name === "title"),
                    toFirstKey: childTable.columns.find(item => item.name === "to_first_key"),
                    treeChildKey: childTable.columns.find(item => item.name === "tree_child_key"),
                    treeParentKey: childTable.columns.find(item => item.name === "tree_parent_key"),
                }
            },
            getSourceQuery(columns, parentTable, childTable) {
                return {
                    query: { name: "first_request_join" },
                    links: [
                        {
                            index: 0, type: "root", groups: [],
                            table_id: parentTable.table.id, table_key_id: columns.firstKey.id,
                            parent_id: 0, parent_key_id: 0
                        },
                        {
                            index: 1, type: "join", groups: [],
                            table_id: childTable.table.id, table_key_id: columns.toFirstKey.id,
                            parent_id: parentTable.table.id, parent_key_id: columns.firstKey.id
                        },
                        {
                            index: 2, type: "tree", groups: [],
                            table_id: childTable.table.id, table_key_id: columns.treeChildKey.id,
                            parent_id: childTable.table.id, parent_key_id: columns.treeParentKey.id
                        }
                    ]
                }
            },
        };

        before(async function () {

            debugger;
            await operations.clearDatabase();
            debugger;

            console.log('1');

            let testParentTable = await metadataOperations.insertTable(
                seriesSource.test_parent.table,
                seriesSource.test_parent.columns);

            console.log('2');

            let testChildTable = await metadataOperations.insertTable(
                seriesSource.test_child.table,
                seriesSource.test_child.columns);

            console.log('3');

            let columns = seriesSource.getColumns(testParentTable, testChildTable);
            let sourceQuery = seriesSource.getSourceQuery(columns, testParentTable, testChildTable);

            debugger;

            let testQuery = await operations.queries.insertQuery(sourceQuery.query, sourceQuery.links);

            console.log('4');

            seriesResult.parentTable = testParentTable;
            seriesResult.childTable = testChildTable;
            seriesResult.columns = columns;
            seriesResult.testQuery = testQuery;

            // 
            seriesSource.executorDataJoin = {
                "query_id": testQuery.query.id,
                "title": "test query 1",
                "options": {
                    "type": "select",
                    "links": [
                        {
                            "link_id": testQuery.links[0].id,
                            "columns": [
                                { "column_id": columns.parentTitle.id, "type": "select" },
                                { "column_id": columns.firstKey.id, "type": "select" },
                                { "column_id": columns.firstKey.id, "type": "where", "where": { "left": 3, "right": 7 } },
                                { "column_id": columns.secondKey.id, "type": "select" },
                                { "column_id": columns.secondKey.id, "type": "order" },
                                { "column_id": columns.thirdKey.id, "type": "select" }
                            ]
                        },
                        {
                            "link_id": testQuery.links[1].id,
                            "columns": [
                                { "column_id": columns.childTitle.id, "type": "select" },
                                { "column_id": columns.toFirstKey.id, "type": "select" },
                                { "column_id": columns.treeChildKey.id, "type": "select" },
                                { "column_id": columns.treeParentKey.id, "type": "select" },
                            ]
                        }
                    ]
                }
            }

            // 
            seriesSource.executorDataTree = {
                "query_id": testQuery.query.id,
                "title": "test query 2",
                "options": {
                    "type": "group",
                    "links": [
                        {
                            "link_id": testQuery.links[0].id,
                            "columns": [
                                { "column_id": columns.firstKey.id, "type": "group" },
                                { "column_id": columns.firstKey.id, "type": "where", "where": { "left": 3, "right": 7 } },
                                { "column_id": columns.secondKey.id, "type": "agg", "agg_func": "count", "alias": "count_field" },
                                { "column_id": columns.secondKey.id, "type": "order" }
                            ]
                        },
                        {
                            "link_id": testQuery.links[1].id,
                            "columns": [
                                { "column_id": columns.toFirstKey.id, "type": "having", "where": { "left": 3, "right": 7 } },
                                { "column_id": columns.treeChildKey.id, "type": "group" },
                                { "column_id": columns.treeParentKey.id, "type": "group" }
                            ]
                        },
                        {
                            "link_id": testQuery.links[2].id,
                            "tree_options": { "layer": 1, "parent": 0, "path": "0" },
                            "columns": [
                                { "column_id": columns.treeChildKey.id, "type": "group" },
                                { "column_id": columns.treeParentKey.id, "type": "group" }
                            ]
                        }
                    ]
                }
            }
        });

        // исходные данные
        let seriesResult = {
            getParentTableData() {
                return {
                    "table_id": this.parentTable.table.id,
                    "data_rows": [
                        [{ "column_id": this.columns.parentTitle.id, "column_value": "title 0" }, { "column_id": this.columns.firstKey.id, "column_value": 0 }],
                        [{ "column_id": this.columns.parentTitle.id, "column_value": "title 1" }, { "column_id": this.columns.firstKey.id, "column_value": 1 }],
                        [{ "column_id": this.columns.parentTitle.id, "column_value": "title 2" }, { "column_id": this.columns.firstKey.id, "column_value": 2 }],
                        [{ "column_id": this.columns.parentTitle.id, "column_value": "title 3" }, { "column_id": this.columns.firstKey.id, "column_value": 3 }],
                        [{ "column_id": this.columns.parentTitle.id, "column_value": "title 4" }, { "column_id": this.columns.firstKey.id, "column_value": 4 }],
                        [{ "column_id": this.columns.parentTitle.id, "column_value": "title 5" }, { "column_id": this.columns.firstKey.id, "column_value": 5 }],
                        [{ "column_id": this.columns.parentTitle.id, "column_value": "title 6" }, { "column_id": this.columns.firstKey.id, "column_value": 6 }],
                        [{ "column_id": this.columns.parentTitle.id, "column_value": "title 7" }, { "column_id": this.columns.firstKey.id, "column_value": 7 }],
                        [{ "column_id": this.columns.parentTitle.id, "column_value": "title 8" }, { "column_id": this.columns.firstKey.id, "column_value": 8 }],
                        [{ "column_id": this.columns.parentTitle.id, "column_value": "title 9" }, { "column_id": this.columns.firstKey.id, "column_value": 9 }],
                        [{ "column_id": this.columns.parentTitle.id, "column_value": "delete" }, { "column_id": this.columns.firstKey.id, "column_value": 10 }],
                    ]
                }
            },
            getParentTableResult() {
                return [
                    { "title": "title 0", "first_key": 0 },
                    { "title": "title 1", "first_key": 1 },
                    { "title": "title 2", "first_key": 2 },
                    { "title": "title 3", "first_key": 3 },
                    { "title": "title 4", "first_key": 4 },
                    { "title": "title 5", "first_key": 5 },
                    { "title": "title 6", "first_key": 6 },
                    { "title": "title 7", "first_key": 7 },
                    { "title": "title 8", "first_key": 8 },
                    { "title": "title 9", "first_key": 9 },
                    { "title": "delete", "first_key": 10 },
                ]
            },
            getChildTableData() {
                return {
                    "table_id": this.childTable.table.id,
                    "data_rows": [
                        [{ "column_id": this.columns.childTitle.id, "column_value": "title 0" }, { "column_id": this.columns.toFirstKey.id, "column_value": 0 }, { "column_id": this.columns.treeChildKey.id, "column_value": 0 }, { "column_id": this.columns.treeParentKey.id, "column_value": null }],
                        [{ "column_id": this.columns.childTitle.id, "column_value": "title 1" }, { "column_id": this.columns.toFirstKey.id, "column_value": 1 }, { "column_id": this.columns.treeChildKey.id, "column_value": 1 }, { "column_id": this.columns.treeParentKey.id, "column_value": null }],
                        [{ "column_id": this.columns.childTitle.id, "column_value": "title 2" }, { "column_id": this.columns.toFirstKey.id, "column_value": 2 }, { "column_id": this.columns.treeChildKey.id, "column_value": 2 }, { "column_id": this.columns.treeParentKey.id, "column_value": 0 }],
                        [{ "column_id": this.columns.childTitle.id, "column_value": "title 3" }, { "column_id": this.columns.toFirstKey.id, "column_value": 3 }, { "column_id": this.columns.treeChildKey.id, "column_value": 3 }, { "column_id": this.columns.treeParentKey.id, "column_value": 0 }],
                        [{ "column_id": this.columns.childTitle.id, "column_value": "title 4" }, { "column_id": this.columns.toFirstKey.id, "column_value": 4 }, { "column_id": this.columns.treeChildKey.id, "column_value": 4 }, { "column_id": this.columns.treeParentKey.id, "column_value": 1 }],
                        [{ "column_id": this.columns.childTitle.id, "column_value": "title 5" }, { "column_id": this.columns.toFirstKey.id, "column_value": 5 }, { "column_id": this.columns.treeChildKey.id, "column_value": 5 }, { "column_id": this.columns.treeParentKey.id, "column_value": 1 }],
                        [{ "column_id": this.columns.childTitle.id, "column_value": "title 6" }, { "column_id": this.columns.toFirstKey.id, "column_value": 6 }, { "column_id": this.columns.treeChildKey.id, "column_value": 6 }, { "column_id": this.columns.treeParentKey.id, "column_value": 2 }],
                        [{ "column_id": this.columns.childTitle.id, "column_value": "title 7" }, { "column_id": this.columns.toFirstKey.id, "column_value": 7 }, { "column_id": this.columns.treeChildKey.id, "column_value": 7 }, { "column_id": this.columns.treeParentKey.id, "column_value": 3 }],
                        [{ "column_id": this.columns.childTitle.id, "column_value": "title 8" }, { "column_id": this.columns.toFirstKey.id, "column_value": 8 }, { "column_id": this.columns.treeChildKey.id, "column_value": 8 }, { "column_id": this.columns.treeParentKey.id, "column_value": 4 }],
                        [{ "column_id": this.columns.childTitle.id, "column_value": "title 9" }, { "column_id": this.columns.toFirstKey.id, "column_value": 9 }, { "column_id": this.columns.treeChildKey.id, "column_value": 9 }, { "column_id": this.columns.treeParentKey.id, "column_value": 5 }],
                        [{ "column_id": this.columns.childTitle.id, "column_value": "delete" }, { "column_id": this.columns.toFirstKey.id, "column_value": 10 }, { "column_id": this.columns.treeChildKey.id, "column_value": 10 }, { "column_id": this.columns.treeParentKey.id, "column_value": 0 }],
                    ]
                }
            },
            getChildTableResult() {
                return [
                    { "title": "title 0", "to_first_key": 0, "tree_child_key": 0, "tree_parent_key": null },
                    { "title": "title 1", "to_first_key": 1, "tree_child_key": 1, "tree_parent_key": null },
                    { "title": "title 2", "to_first_key": 2, "tree_child_key": 2, "tree_parent_key": 0 },
                    { "title": "title 3", "to_first_key": 3, "tree_child_key": 3, "tree_parent_key": 0 },
                    { "title": "title 4", "to_first_key": 4, "tree_child_key": 4, "tree_parent_key": 1 },
                    { "title": "title 5", "to_first_key": 5, "tree_child_key": 5, "tree_parent_key": 1 },
                    { "title": "title 6", "to_first_key": 6, "tree_child_key": 6, "tree_parent_key": 2 },
                    { "title": "title 7", "to_first_key": 7, "tree_child_key": 7, "tree_parent_key": 3 },
                    { "title": "title 8", "to_first_key": 8, "tree_child_key": 8, "tree_parent_key": 4 },
                    { "title": "title 9", "to_first_key": 9, "tree_child_key": 9, "tree_parent_key": 5 },
                    { "title": "delete", "to_first_key": 10, "tree_child_key": 10, "tree_parent_key": 0 },
                ]
            },
            getUpdateRow(i) { return this.childTableResult[i]; },
            getDeleteRow() { return this.childTableResult[10]; },
            getUpdateTitleData() {
                let row = this.getUpdateRow(5);
                return {
                    "table_id": this.childTable.table.id,
                    "data_rows": [
                        { is_primary: true, column_id: 0, column_value: row.id },
                        { is_primary: false, column_id: this.columns.childTitle.id, column_value: 'update title' },
                    ]
                }
            },
            getUpdateParentData(i, newParentId) {
                let row = this.getUpdateRow(i);
                return {
                    "table_id": this.childTable.table.id,
                    "data_rows": [
                        { is_primary: true, column_id: 0, column_value: row.id },
                        { is_primary: false, column_id: this.columns.treeParentKey.id, column_value: newParentId },
                    ]
                }
            },
            getUpdateTitleResult() {
                let retRes = { ...this.getUpdateRow(5) };
                retRes.title = 'update title';
                return retRes;
            },

        };

        // 
        it('select tree links', async () => {
            let allTreeLinks = await operations.queries.selectTreeLinksById(null, null, null);
            let treeLinks = await operations.queries.selectTreeLinks(allTreeLinks);
            let atl = allTreeLinks[0];
            let tl = treeLinks[0];

            //debugger;
            seriesResult.treeLink = allTreeLinks[0];
            expect(allTreeLinks[0]).to.include.all.keys('id', 'table_id', 'table_key_id', 'parent_key_id', 'tree_table_name');
            expect(treeLinks[0]).to.include.all.keys('id', 'table_id', 'table_key_id', 'parent_key_id', 'tree_table_name');
            expect(atl.tree_table_name).to.equal(`tree_${atl.table_id}_${atl.table_key_id}_${atl.parent_key_id}`);
            expect(tl.tree_table_name).to.equal(`tree_${tl.table_id}_${tl.table_key_id}_${tl.parent_key_id}`);
            expect(allTreeLinks.length).to.equal(1);
            expect(treeLinks.length).to.equal(1);
        });

        it('insert parent data', async () => {
            let parentTableData = seriesResult.getParentTableData();
            let res = await chai.request(app)
                .post('/api/insert_data')
                .send({ table_id: parentTableData.table_id, data_rows: parentTableData.data_rows });

            //debugger;

            res.body.sort((a, b) => a.id - b.id);
            seriesResult.parentTableResult = res.body;
            let result = res.body.map(item => {
                return { "title": item.title, "first_key": item.first_key };
            });

            expect(result.length).to.equal(parentTableData.data_rows.length);
            expect(result).to.deep.equal(seriesResult.getParentTableResult());
        });

        it('insert child data', async () => {
            let childTableData = seriesResult.getChildTableData();
            let res = await chai.request(app)
                .post('/api/insert_data')
                .send({ table_id: childTableData.table_id, data_rows: childTableData.data_rows });

            //debugger;

            res.body.sort((a, b) => a.id - b.id);
            seriesResult.childTableResult = res.body;
            let result = res.body.map(item => {
                return {
                    "title": item.title,
                    "to_first_key": item.to_first_key,
                    "tree_child_key": item.tree_child_key,
                    "tree_parent_key": item.tree_parent_key
                };
            });

            expect(result.length).to.equal(childTableData.data_rows.length);
            expect(result).to.deep.equal(seriesResult.getChildTableResult());
        });

        it('update child data', async () => {
            let updateTitleData = seriesResult.getUpdateTitleData();

            //debugger;

            let res = await chai.request(app)
                .post('/api/update_data')
                .send({ table_id: updateTitleData.table_id, data_rows: updateTitleData.data_rows });

            //debugger;

            let rows = res.body;
            expect(rows.length).to.equal(1);
            expect(rows[0]).to.deep.equal(seriesResult.getUpdateTitleResult());
        });

        it('delete child data', async () => {
            let row = seriesResult.getDeleteRow();
            let res = await chai.request(app)
                .delete('/api/delete_data')
                .query({
                    table_id: seriesResult.childTable.table.id,
                    options: [
                        { is_primary: true, column_id: 0, column_value: row.id }
                    ]
                });

            //debugger;

            expect(res.body.rowCount).to.equal(1);
        });

        it('select child data', async () => {
            let row = seriesResult.getUpdateRow(5);
            let res = await chai.request(app)
                .get('/api/select_data')
                .query({
                    executor_id: null,
                    table_id: seriesResult.childTable.table.id,
                    options: [
                        { is_primary: true, column_id: 0, column_value: row.id }
                    ]
                });

            //debugger;

            let rows = res.body;
            expect(rows.length).to.equal(1);
            expect(rows[0]).to.deep.equal(seriesResult.getUpdateTitleResult());
        });

        it('select from tree link table', async () => {
            let treeLinkData = await operations.selectTreeTable(seriesResult.treeLink.tree_table_name);
            treeLinkData.rows.sort((a, b) => a.id - b.id);
            //debugger;
            expect(treeLinkData.rows.length).to.equal(11);
        });

        it('update child data - parent I', async () => {
            let updateData = seriesResult.getUpdateParentData(9, 8);
            let res = await chai.request(app)
                .post('/api/update_data')
                .send({ table_id: updateData.table_id, data_rows: updateData.data_rows });

            //debugger;

            let rows = res.body;
            expect(rows.length).to.equal(1);
        });

        it('select from tree link table - check parent I', async () => {
            let treeLinkData = await operations.selectTreeTable(seriesResult.treeLink.tree_table_name, [9]);
            let newRow = treeLinkData.rows[0];

            //debugger;

            expect(newRow).to.deep.equal({ id: 9, parent: 8, layer: 3, path: "1.4.8" });
        });

        it('update child data - parent II', async () => {
            let updateData = seriesResult.getUpdateParentData(8, 3);
            let res = await chai.request(app)
                .post('/api/update_data')
                .send({ table_id: updateData.table_id, data_rows: updateData.data_rows });

            //debugger;

            let rows = res.body;
            expect(rows.length).to.equal(1);
        });

        it('select from tree link table - check parent II', async () => {
            let treeLinkData = await operations.selectTreeTable(seriesResult.treeLink.tree_table_name, [8, 9]);
            treeLinkData.rows.sort((a, b) => a.id - b.id);

            //debugger;

            expect(treeLinkData.rows[0]).to.deep.equal({ id: 8, parent: 3, layer: 2, path: "0.3" });
            expect(treeLinkData.rows[1]).to.deep.equal({ id: 9, parent: 8, layer: 3, path: "0.3.8" });
        });

        // --- executor

        it('insert executor 1', async () => {
            let res = await chai.request(app)
                .post('/api/insert_executor')
                .send(seriesSource.executorDataJoin);

            //debugger;

            seriesResult.executorJoinId = res.body.id;
            expect(res.body).to.include.all.keys('id', 'title');
        });

        it('insert executor 2', async () => {
            let res = await chai.request(app)
                .post('/api/insert_executor')
                .send(seriesSource.executorDataTree);

            //debugger;

            seriesResult.executorTreeId = res.body.id;
            expect(res.body).to.include.all.keys('id', 'title');
        });

        it('select executors', async () => {
            let res = await chai.request(app)
                .get('/api/select_executors');

            //debugger;

            expect(res.body.length).to.equal(2);
        });

        // разные запросы данных по executor
        it('select executor data 1', async () => {
            let res = await chai.request(app)
                .get('/api/select_data')
                .query({ executor_id: seriesResult.executorJoinId, table_id: null, options: [] });

            //debugger;

            expect(res.body.length).to.equal(5);
        });

        it('select executor data 2', async () => {
            let res = await chai.request(app)
                .get('/api/select_data')
                .query({ executor_id: seriesResult.executorTreeId, table_id: null, options: [] });

            //debugger;

            expect(res.body.length).to.equal(1);
        });

        it('delete executor', async () => {
            let res = await chai.request(app)
                .delete('/api/delete_executor')
                .query({ id: seriesResult.executorJoinId });

            //debugger;

            expect(res.body.rowCount).to.equal(1);
        });

    });

});
