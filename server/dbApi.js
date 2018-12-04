const low = require('lowdb');
const _ = require('underscore');
const FileSync = require('lowdb/adapters/FileSync');
const uuidv4 = require('uuid/v4'); // to create order ids


const adapter = new FileSync('./db.json');

const db = low(adapter);
db.defaults({
    orders: [],
}).write();

module.exports = {
    placeOrder(body) {
        return new Promise((resolve) => {
            const buy = (body.buy === 'true');
            const tubeAmount = parseInt(body.tubeAmount);
            const pipeAmount = parseInt(body.pipeAmount);
            const sender = body.sender;
            const id = uuidv4();
            // create order in order book
            db.get('orders').push({ id, buy, tubeAmount, pipeAmount, sender, active: true }).write();
            const order = db.get('orders').find({ buy: !buy, pipeAmount: tubeAmount, tubeAmount: pipeAmount, active: true }).value();
            // filter out orders when it's the same person?
            if (order) {
                resolve(order.sender);
            } else {
                resolve(null);
            }
        });
    },

    outstandingOrders(sender) {
        return new Promise((resolve) => {
            const orders = db.get('orders').value();
            const outstanding = _.filter(orders, order => order.sender === sender && order.active === true);
            // remove active key from JSON
            const cleanedOutstanding = _.map(outstanding, o => _.omit(o, 'active'));
            resolve(cleanedOutstanding);
        });
    },
};
