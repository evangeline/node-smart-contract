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

    app.use(function(error, req, res, next) {
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
        const matchingOrders = await dbApi.getMatchingParty(body);
        // Mapping over all possible transactions, starting with the oldest.
        // We should terminate checking for possible transactions once an transaction is made.
        console.log(`matchingOrders... ${matchingOrders}`);
        if (matchingOrders) {
            console.log('executing order...');
            const order = _.map(matchingOrders, _.partial(web3Api.placeOrder, body));
            const confirmedOrder = await order[0];
            const txHash = confirmedOrder[0];
            const matchingOrderID = confirmedOrder[1];
            // Transaction may not take place at all, which is why we check if a txHash is returned
            if (txHash) {
                (console.log(`txHash received ${txHash}`));
                // Order was filled and it's set active = false
                await dbApi.placeOrder(body, matchingOrderID, true);
                res.status(201).json({ matched: true, txHash: txHash }).send();
                return next();
            } else {
                (console.log('txHash not received'));
                // Order wasn't filled and it's set active = true
                await dbApi.placeOrder(body, matchingOrderID, false);
                res.status(201).json({ matched: true, txHash: null }).send();
                return next();
            }
        } else if (!matchingOrders) {
            // No matches were found
            await dbApi.placeOrder(body, null, false);
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
