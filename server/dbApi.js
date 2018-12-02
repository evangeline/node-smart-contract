const low = require('lowdb');
const _ = require('underscore');
const FileSync = require('lowdb/adapters/FileSync');
const uuidv4 = require('uuid/v4'); // to create order ids


const adapter = new FileSync('./db.json');

const db = low(adapter);
db.defaults({
    orders: [],
}).write();

function buyOrSell(buy, callback) {
    if (buy === 'true') {
        callback('false');
    } else {
        callback('true');
    }
}

module.exports = {
    placeOrder(body, callback) {
        const buy = body.buy;
        const tubeAmount = body.tubeAmount;
        const pipeAmount = body.pipeAmount;
        const sender = body.sender;
        const id = uuidv4();
        console.log('placing order...');
        // create order in order book
        db.get('orders').push({ id, buy, tubeAmount, pipeAmount, sender, active: true }).write();

        // find match? returns true or false depending on whether a match has been found.
        buyOrSell(body.buy, (buysell) => {
            const order = db.get('orders').find({ buy: buysell, pipeAmount: tubeAmount, tubeAmount: pipeAmount, active: true }).value();
            if (order) {
                callback(true, order.sender);
            } else {
                callback(false, null);
            }
        });
    },
    outstandingOrders(sender, callback) {
        console.log('getting outstanding orders...');
        const orders = db.get('orders').value();
        console.log(`all orders ${orders}`);
        console.log(_.where(orders, {active: true}));
        const outstanding = _.where(orders, {active: true});
        // remove active key from JSON
        const cleanedOutstanding = _.map(outstanding, o => _.omit(o, 'active'));
        callback(cleanedOutstanding);
    }
};
