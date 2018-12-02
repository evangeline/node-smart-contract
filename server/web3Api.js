// web3Api

// A module to interface with smart contracts. We've set up the basics, feel free to ask us
// on Slack if you have any questions getting an implementation up and running.

// We included web3 version 0.20 as a project dependency,
// as version 1.0.0 is in beta and is full of bugs!
// When looking up guides/questions, check the version number of the solution
// as the interfaces are very different
// Api docs: https://github.com/ethereum/wiki/wiki/JavaScript-API

const Web3 = require('web3');
const SimpleExchange = require('../truffle/build/contracts/SimpleExchange.json');

// eslint-disable-next-line no-unused-vars
const { address: contractAddress } = SimpleExchange.networks[4447];
// we use 'truffle develop' in our test script to spawn an in-memory javascript
// implementation of an Ethereum test network. It runs on port 9545.
const web3 = new Web3(new Web3.providers.HttpProvider('http://localhost:9545'));

// eslint-disable-next-line no-unused-vars
const simpleExchangeInterface = web3.eth.contract(SimpleExchange.abi);
const simpleExchangeInstance = simpleExchangeInterface.at(contractAddress);
// setting default account to pay gas?
web3.eth.defaultAccount = web3.eth.accounts[0];

// check is orderCreator is a buyer or seller
function buyerOrSeller(buy, orderCreator, matchingParty, callback) {
    if (buy === 'true') {
        callback(true, orderCreator, matchingParty);
    } else {
        callback(false, matchingParty, orderCreator);
    }
}

const web3Api = {
    getPipeBalance(sender, callback) {
        simpleExchangeInstance.pipeBalance.call(sender, (error, result) => {
            if (error) {
                console.log(error);
            } else {
                const pipeBalance = result.toString(10);
                callback(pipeBalance);
            }
        });
    },
    getTubeBalance(sender, callback) {
        simpleExchangeInstance.tubeBalance.call(sender, (error, result) => {
            if (error) {
                console.log(error);
            } else {
                const pipeBalance = result.toString(10);
                callback(pipeBalance);
            }
        });
    },
    placeOrder(body, matchingParty, callback) {
        const buy = body.buy;
        const tubeAmount = parseInt(body.tubeAmount);
        const pipeAmount = parseInt(body.pipeAmount);
        const orderCreator = body.sender;
        buyerOrSeller(buy, orderCreator, matchingParty, function (boolBuy, buyer, seller) {
            simpleExchangeInstance.placeOrder.sendTransaction(boolBuy, tubeAmount, pipeAmount, buyer, seller, (error, result) => {
                if (error) {
                    console.log(error);
                } else {
                    callback(result);
                }
            });
        });
    }
};

web3Api.getAccounts = () => web3.eth.accounts;
module.exports = web3Api;
