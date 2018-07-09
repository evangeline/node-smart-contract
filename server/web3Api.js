const Web3 = require('web3');
const SimpleExchange = require('../../truffle/build/contracts/SimpleExchange.json');

const { address: contractAddress } = SimpleExchange.networks[4447];
var web3 = new Web3(new Web3.providers.HttpProvider("http://localhost:9545"));

const simpleExchangeInterface = web3.eth.contract(SimpleExchange.abi);
const web3Api = {};

module.exports = web3Api;
