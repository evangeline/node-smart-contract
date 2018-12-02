/* global describe, beforeEach, afterEach, it:true */
const { expect } = require('chai');
const chai = require('chai');
const chaiHttp = require('chai-http');
const low = require('lowdb');
const FileSync = require('lowdb/adapters/FileSync');

const startServer = require('../server.js'); // https://glebbahmutov.com/blog/how-to-correctly-unit-test-express-server/
const web3Api = require('../web3Api');
const ecdsaApi = require('../ecdsaApi');

chai.should();
chai.use(chaiHttp); // we use this to mock network requests

const ethereumAddresses = web3Api.getAccounts();

describe('Exchange', () => {
    let app;
    describe('Without Initial State', () => {
        beforeEach(() => {
            const adapter = new FileSync('./db.json');
            const db = low(adapter);
            db.defaults({
                orders: [],
            }).write();
            db.setState({ orders: [] }).write();
            app = startServer();
        });

        afterEach(() => {
            app.close();
        });

        it('get tube balance', async () => {
            const res = await chai.request(app).get(`/api/${ethereumAddresses[2]}/tubeBalance`);
            expect(res.body.balance).to.equal('2');
            expect(res).status(200);
        });

        it('get pipe balance', async () => {
            const res = await chai.request(app).get(`/api/${ethereumAddresses[2]}/pipeBalance`);
            expect(res.body.balance).to.equal('4');
            expect(res).status(200);
        });

        it('can place order', async () => {
            const order = {
                buy: true,
                tubeAmount: 3,
                pipeAmount: 2,
                sender: ethereumAddresses[7],
            };
            const signature = ecdsaApi.signOrder(order);
            const res = await chai.request(app)
                .post('/api/placeOrder')
                .send({
                    ...order,
                    signature,
                });
            expect(res.body.matched).to.equal(false);
            expect(res.body.txHash).to.equal(null);
            expect(res).status(201);
        });
    });

    describe('With Initial State', () => {
        beforeEach(() => {
            const adapter = new FileSync('./db.json');
            const db = low(adapter);
            db.defaults({
                orders: [],
            }).write();
            db.setState({
                orders: [{
                    id: '1',
                    buy: true,
                    tubeAmount: 4,
                    pipeAmount: 3,
                    sender: ethereumAddresses[7],
                    // TODO ?????
                    active: true,
                }],
            }).write();
            app = startServer();
        });

        afterEach(() => {
            const adapter = new FileSync('./db.json');
            const db = low(adapter);
            db.defaults({
                orders: [],
            }).write();
            db.setState({ orders: [] }).write();
            app.close();
        });

        it('can get outstanding orders', async () => {
            const res = await chai.request(app)
                .get(`/api/${ethereumAddresses[7]}/outstandingOrders`);
            expect(res).status(200);
            expect(res.body).to.deep.equal([{
                id: '1',
                buy: true,
                tubeAmount: 4,
                pipeAmount: 3,
                sender: ethereumAddresses[7],
            }]);
        });

        it('can place order and send transaction', async () => {
            const order = {
                buy: false,
                tubeAmount: 4,
                pipeAmount: 3,
                sender: ethereumAddresses[7],
            };
            const signature = ecdsaApi.signOrder(order);

            const res = await chai.request(app)
                .post('/api/placeOrder')
                .send({
                    ...order,
                    signature,
                });
            expect(res.body.matched).to.equal(true);
            expect(res.body.txHash.length).to.equal(66);
            expect(res).status(201);
        });
    });
});
