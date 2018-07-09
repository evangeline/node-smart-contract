# CreditMint Interview Project

We are thrilled you are interviewing with CreditMint and we can't wait to meet you in person! Our interview process consists of the following: 
- a phone screening
- a short take home project
- an on-site pairing exercise, which usually extends the project
- a team social

The goal of this project is to see how you think, how you prioritize tasks when there is a lot to do and how quickly you can pick up new coding concepts. It will also give us a starting point for the pair programming exercise we will do when you come in for interview. 

We will add you to our Slack account for the duration of the project and we encourage you to ask lots of questions if you need clarification or advice. We are here to help! This project is as much for us as it is for you, we want you to get a sense of what working with us is like. Don't be afraid to ask questions!

You can also email anyone of arnaud@creditmint.io, joe@creditmint.io or zac@creditmint.io with any questions!

#### The Challenge

The challenge is to build a Node.js server that acts as an exchange for two assets, ```pipes``` and ```tubes```. The assets are goverened by an Ethereum smart contract at ```truffle/contracts/SimpleExchange.sol```. The server must interface with this smart contract via the [web3.js](https://github.com/ethereum/wiki/wiki/JavaScript-API) library.

The server's responsibility is to maintain an order book of buy and sell orders, and transmit orders to the smart contract to be executed. The smart contract implementation is basic and does not allow for partial fills, is not permissioned and lacks vital security features!

Your submission should implement a server that satisfies the following requirements:

1. Maintain an order book in a persistent database.
2. Implement a server route that allows a user to get their balance of ```pipes```
3. Implement a server route that allows a user to get their balance of ```tubes```
4. Implement a server route that allows a user to place a ```buy``` or ```sell``` order
5. Implement a server route that allows a user to get their ```unfilled orders```

To get you started, we've implemented some tests to validate the above in ```./server/test/test.js```. The server implementation relies on calling smart contracts deployed via the [truffle](www.truffle.com) framework. We've built a script which handles this for you and runs the tests, which is called via ```npm run test```.

Truffle is a required dependency and can be installed via ```npm install -g truffle```. Other project dependencies can be installed via ```npm install```.

A ```buy``` order represents buying pipes for tubes. A ```sell``` order represents selling pipes and acquiring tubes.

The backend API specification, and the smart contract specification, is outlined below. 

We've provided a basic module structure, including a basic database module that connects to a [lowdb](https://github.com/typicode/lowdb) instance. Feel free to replace anything you want.

Get in touch with us on Slack if you have any issues getting started, we're aware that interfacing with smart contracts via web3.js can be tricky, especially given the lack of documentation out there.
#### Stretch Goals

1. Upgrade the smart contract and backend interface to allow for partial order fills.
2. The smart contract contains no validation or security features. Add as many as you can!
3. The ```placeOrder``` route contains an ECDSA signature signed by the sender. Use this to implement order authentication in the smart contract.
4. Modify the smart contract to allocate a portion of the trade to the exchange provider's address.


#### Code guidelines

We write code to the latest ES6 Javascript standards and follow the [AirBnb Javascript style guide](https://github.com/airbnb/javascript).

#### Submission

You will have one week to work on the project and we will go through your code with in a pairing exercise at our office in King's Cross.

#### Useful links

- [web3.js](https://github.com/ethereum/wiki/wiki/JavaScript-API)
- [interacting with a smart contract through web3.js (tutorial)](https://coursetro.com/posts/code/99/Interacting-with-a-Smart-Contract-through-Web3.js-(Tutorial))
- [truffle](https://truffleframework.com/)
- [lowdb](https://github.com/typicode/lowdb)
- [express framework](https://expressjs.com/)
- [AirBnB Coding Style guide](https://github.com/airbnb/javascript)


## API Specification

#### (GET) ```/api/:sender/pipeBalance/```

Get pipe balance of sender. The ```sender``` parameter is an Ethereum address.

Expected response format: ```{ balance: <string> }```

#### (GET) ```/api/:sender/tubeBalance/```

Get tube balance of sender. The ```sender``` parameter is an Ethereum address.

Expected response format: ```{ balance: <string> }```

#### (GET) ```/api/:sender/getOutstandingOrders```

Get the outstanding, unfilled orders of sender. The expected response contains an array of orders. Orders have the following structure:

```
{
    id: <string>,           // order id
    buy: <boolean>,         // buy or sell order
    tubeAmount: <number>,
    pipeAmount: <number>,
    sender: <string>,       // ethereum address of order creator  
}
```

#### (POST) ```/api/placeOrder```

Place an order. The request body parameter contains an order, with the following structure:

```
{
    buy: <boolean>,         // buy or sell order
    tubeAmount: <number>,
    pipeAmount: <number>,
    sender: <string>,       // ethereum address of order creator  
}
```

## Smart Contract Methods

#### ```constructor(address[], uint[], uint[])```

Creates the smart contract. Contains 3 input arguments: ```initialOwners, initialTubeBalance, initialPipeBalance```, which are used to construct an initial balance registry

#### ```placeOrder(bool, uint, uint, address, address)```

Method for an exchange to place an order on behalf of a ```buyer``` and ```seller```. Arguments are:

- ```buy (bool)``` whether the order creator is buying pipes for tubes, or selling pipes in exchange for tubes
- ```tubeAmount (uint)``` number of tubes being exchanged
- ```pipeAmount (uint)``` number of pipes being exchanged
- ```buyer (address)``` address of buyer
- ```seller (address)``` address of seller

#### ```registerExchange()```

Adds the message sender's address to a repository of registered exchanges

#### ```deregisterExchange()```

Removes the message sender's address from the repository of registered exchanges