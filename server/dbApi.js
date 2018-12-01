const low = require('lowdb');
const FileSync = require('lowdb/adapters/FileSync');
// const uuidv4 = require('uuid/v4'); // to create order ids

const adapter = new FileSync('./db.json');

const db = low(adapter);
db.defaults({
    orders: [],
}).write();

module.exports = {
    getTubeBalance(sender) {
        const user = db.get('people').find({ id: Number(sender) }).value();
        return user.tubeBalance;
    },
    getPipeBalance(sender) {
        const user = db.get('people').find({ id: Number(sender) }).value();
        return user.pipeBalance;
    }
};
