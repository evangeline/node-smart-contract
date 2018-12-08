// ### External Dependencies
const express = require('express');
const cors = require('cors');
const dbApi = require('./dbApi');
const web3Api = require('./web3Api');
const _ = require('underscore');
const ethereumAddresses = web3Api.getAccounts();

// middleware to check if address is valid

module.exports = function routing(app) {
    app.use(cors({
        credentials: true,
        methods: ['GET', 'PUT', 'POST', 'DELETE'],
    }));
    app.use(express.urlencoded({ extended: false })); // body parser functions
    app.use(express.json());

    const router = new express.Router();

    app.use('/', router);

    app.use((error, req, res, next) => {
        // Gets called because of `wrapAsync()`
        res.status(400).json({ error: error.message }).send();
    });

    function wrapAsync(fn) {
        return function (req, res, next) {
            // Make sure to `.catch()` any errors and pass them along to the `next()`
            // middleware in the chain, in this case the error handler.
            fn(req, res, next).catch(next);
        };
    }

    router.post('/api/placeOrder', wrapAsync(async (req, res, next) => {
        const body = req.body;
        // Is sender allowed to place an order? what if they want to sell more than they can buy?
        // The smart contract would handle it but ideally I want to reduce throwing
        // bad data over and then doing error handling
        const validOrder = await web3Api.validOrder(body);
        const matchingOrders = await dbApi.getMatchingParty(body);

        // Checking for matching orders, and executing starting from the oldest
        console.log(`matchingOrders... ${matchingOrders}`);
        if (validOrder && matchingOrders) {
            console.log('executing order...');
            const confirmedOrders = await web3Api.placeOrder(body, matchingOrders);
            const txHash = confirmedOrders[0][0];
            // TODO update all transacted orders as false
            // Transaction may not take place at all, which is why we check if a txHash is returned
            if (txHash) {
                (console.log(`txHash received ${txHash}`));
                // Order was filled and it's set active = false
                await dbApi.placeOrder(body, confirmedOrders, true);
                res.status(201).json({ matched: true, txHash: txHash }).send();
                return next();
            } else {
                (console.log('txHash not received'));
                // Order wasn't filled and it's set active = true
                await dbApi.placeOrder(body, confirmedOrders, false);
                res.status(201).json({ matched: true, txHash: null }).send();
                return next();
            }
        } else if (validOrder && !matchingOrders) {
            console.log('valid order but no match found');
            // No matches were found
            await dbApi.placeOrder(body, null, false);
            res.status(201).json({ matched: false, txHash: null }).send();
            return next();
        } else if (!validOrder) {
            console.log('not valid order')
            res.status(201).json({ matched: false, txHash: null }).send();
            return next();
        }
    }));

    router.get('/api/:sender/tubeBalance', wrapAsync(async (req, res, next) => {
        const sender = req.params.sender;
        const tubeBalance = await web3Api.getTubeBalance(sender);
        res.status(200).json({ balance: tubeBalance }).send();
        return next();
    }));

    router.get('/api/:sender/pipeBalance', wrapAsync(async (req, res, next) => {
        const sender = req.params.sender;
        const pipeBalance = await web3Api.getPipeBalance(sender);
        res.status(200).json({ balance: pipeBalance }).send();
        return next();
    }));

    router.get('/api/:sender/outstandingOrders', wrapAsync(async (req, res, next) => {
        const sender = req.params.sender;
        const outstandingOrders = await dbApi.outstandingOrders(sender);
        res.status(200).json(outstandingOrders).send();
        return next();
    }));
};
