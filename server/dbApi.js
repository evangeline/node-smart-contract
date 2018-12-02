const low = require('lowdb');
const FileSync = require('lowdb/adapters/FileSync');
const uuidv4 = require('uuid/v4'); // to create order ids

const adapter = new FileSync('./db.json');

const db = low(adapter);
db.defaults({
    orders: [],
}).write();

module.exports = {
    placeOrder(body, callback) {
        const buy = body.buy;
        const tubeAmount = body.tubeAmount;
        const pipeAmount = body.pipeAmount;
        const sender = body.sender;
        const id = uuidv4();

        // create order in order book
        db.get('orders').push({ id, buy, tubeAmount, pipeAmount, sender }).write();

        // return the order that's been created
        const order = db.get('orders').find({ id: id }).value();
        callback(order);
    }
};
