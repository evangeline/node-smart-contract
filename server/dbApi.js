const low = require('lowdb');
const _ = require('underscore');
const FileSync = require('lowdb/adapters/FileSync');
const uuidv4 = require('uuid/v4'); // to create order ids
const adapter = new FileSync('./db.json');

module.exports = {
    placeOrder(body, matchingOrderID, transactionOccurred) {
        return new Promise((resolve) => {
            const db = low(adapter);
            const buy = (body.buy === 'true');
            const tubeAmount = parseInt(body.tubeAmount);
            const pipeAmount = parseInt(body.pipeAmount);
            const sender = body.sender;
            const id = uuidv4();
            // create order in order book
            if (matchingOrderID === null || transactionOccurred === false) {
                console.log('update orders as unfulfilled');
                db.get('orders').push({ id, buy, tubeAmount, pipeAmount, sender, active: true }).write();
            } else {
                console.log('update orders as executed');
                db.get('orders').push({ id, buy, tubeAmount, pipeAmount, sender, active: false }).write();
                const updated = db.get('orders').find({ id: matchingOrderID }).assign({ active: false }).write();
            }
            resolve();
        });
    },
    getMatchingParty(body) {
        return new Promise((resolve) => {
            const db = low(adapter);
            const buy = (body.buy === 'true');
            const tubeAmount = parseInt(body.tubeAmount);
            const pipeAmount = parseInt(body.pipeAmount);
            const orders = db.get('orders').value();
            // Filters for any matching orders that are still active
            // Assumption is one can trade with himself cuz tests.
            const matchingOrders = _.filter(orders, order => order.buy === !buy && order.tubeAmount === tubeAmount && order.pipeAmount === pipeAmount && order.active === true);
            if (!Array.isArray(matchingOrders) || !matchingOrders.length) {
                console.log('did not match');
                resolve(null);
            } else {
                console.log('matched');
                resolve(matchingOrders);
            }
        });
    },
    outstandingOrders(sender) {
        return new Promise((resolve) => {
            const db = low(adapter);
            const orders = db.get('orders').value();
            const outstanding = _.filter(orders, order => order.sender === sender && order.active === true);
            // remove active key from JSON
            const cleanedOutstanding = _.map(outstanding, o => _.omit(o, 'active'));
            resolve(cleanedOutstanding);
        });
    },
};
