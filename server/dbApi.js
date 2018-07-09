const low = require('lowdb');
const FileSync = require('lowdb/adapters/FileSync');
const uuidv4 = require('uuid/v4'); // to create order ids

const adapter = new FileSync('./db.json');

const dbApi = {};
const db = low(adapter);
db.defaults({
    orders: [],
})
.write();

module.exports = dbApi;