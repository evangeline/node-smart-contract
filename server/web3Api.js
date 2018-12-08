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

const web3Api = {
    validOrder(body) {
        return new Promise((resolve) => {
            const sender = body.sender;
            const buy = (body.buy === 'true');
            if (buy) {
                const tubeAmount = parseInt(body.tubeAmount);
                const tubeBalance = simpleExchangeInstance.tubeBalance.call(sender);
                resolve(tubeBalance > tubeAmount);
            } else {
                const pipeAmount = parseInt(body.pipeAmount);
                const pipeBalance = simpleExchangeInstance.pipeBalance.call(sender);
                resolve(pipeBalance > pipeAmount);
            }
        })
    },
    getPipeBalance(sender) {
        return new Promise((resolve, reject) => {
            const pipeBalance = simpleExchangeInstance.pipeBalance.call(sender);
            if (pipeBalance) {
                resolve(pipeBalance.toString(10));
            } else {
                reject(new Error('Could not retrieve pipe balance'));
            }
        });
    },
    getTubeBalance(sender) {
        return new Promise((resolve, reject) => {
            const tubeBalance = simpleExchangeInstance.tubeBalance.call(sender);
            if (tubeBalance) {
                resolve(tubeBalance.toString(10));
            } else {
                reject(new Error('Could not retrieve tube balance'));
            }
        });
    },
    placeOrder(body, matchingOrders) {
        return new Promise((resolve) => {
            const buy = (body.buy === 'true');
            const tubeAmount = parseInt(body.tubeAmount);
            const pipeAmount = parseInt(body.pipeAmount);
            const price = tubeAmount / pipeAmount;
            const orderCreator = body.sender;
            let buyLimit = tubeAmount;
            let sellLimit = pipeAmount;
            let transactedOrders = [];
            let toTransact = 0;
            let transacted = 0;
            // BUY = + PIPES, - TUBES
            // SELL = + TUBES, - PIPES
            // limited by the amount of assets you want to and can sell
            // all orders in db are valid which means you can trade with anyone
            // loop through all matching orders
            // transact the min (what you can sell vs what they want to buy), decrease the limit, repeat
            // TODO return any orders that are partially filled and write as new orders to db:
            //  return and map through all transacted matchingOrders
            //  sum their total pipes and tubes amount
            //  subtract our order from the total amount for each asset
            //  if the result is > 0, it means that the last matchingOrder was partially fulfilled
            //  update the db with a new order for that order creator with the result amount
            //  if the result is < 0, it means the our order was partially fulfilled
            //  update the db with a new order for ourselves with our old order amounts-abs(result)
            for (let i = 0; i < matchingOrders.length; i++) {
                const matchingOrderCreator = matchingOrders[i].sender;
                const matchingOrderId = matchingOrders[i].id;
                console.log(`placing order id... ${matchingOrderId}`);
                if (buy) {
                    toTransact = Math.min(matchingOrders[i].tubeAmount, buyLimit - transacted);
                    console.log(`limit ${toTransact}`);
                    if (toTransact > 0) {
                        const txHash = simpleExchangeInstance.placeOrder.sendTransaction(buy, buyLimit, buyLimit / price, orderCreator, matchingOrderCreator);
                        transactedOrders.push([txHash, matchingOrderId]);
                        console.log(transactedOrders);
                        transacted += toTransact;
                    } else {
                        resolve(transactedOrders);
                    }
                } else {
                    console.log(`sold limit ${sellLimit}`);
                    toTransact = Math.min(matchingOrders[i].pipeAmount, sellLimit - transacted);
                    console.log(`limit ${toTransact}`);
                    if (toTransact > 0) {
                        const txHash = simpleExchangeInstance.placeOrder.sendTransaction(buy, sellLimit * price, sellLimit, matchingOrderCreator, orderCreator);
                        transactedOrders.push([txHash, matchingOrderId]);
                        console.log(transactedOrders);
                        transacted += toTransact;
                    } else {
                        resolve(transactedOrders);
                    }
                }
            }
        });
    },
};

web3Api.getAccounts = () => web3.eth.accounts;
module.exports = web3Api;
