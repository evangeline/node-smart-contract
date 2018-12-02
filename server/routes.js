// ### External Dependencies
const express = require('express');
const cors = require('cors');
const dbApi = require('./dbApi');
const web3Api = require('./web3Api');

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
        return function(req, res, next) {
            // Make sure to `.catch()` any errors and pass them along to the `next()`
            // middleware in the chain, in this case the error handler.
            fn(req, res, next).catch(next);
        };
    }

    router.post('/api/placeOrder', wrapAsync(async (req, res, next) => {
        const body = req.body;
        dbApi.placeOrder(body, (matched, matchingParty) => {
            if (matched === true) {
                web3Api.placeOrder(body, matchingParty, function (txHash) {
                    console.log(`matched ${matched}`);
                    res.status(201).json({ matched: matched, txHash: txHash }).send();
                    return next();
                });
            } else if (matched === false) {
                console.log(`matched ${matched}`);
                res.status(201).json({ matched: matched, txHash: null }).send();
                return next();
            }
        });
    }));

    router.get('/api/:sender/tubeBalance', wrapAsync(async (req, res, next) => {
        const sender = req.params.sender;
        web3Api.getTubeBalance(sender, (tubeBalance) => {
            res.status(200).json({ balance: tubeBalance }).send();
            return next();
        });
    }));

    router.get('/api/:sender/pipeBalance', wrapAsync(async (req, res, next) => {
        const sender = req.params.sender;
        web3Api.getPipeBalance(sender, (pipeBalance) => {
            res.status(200).json({ balance: pipeBalance }).send();
            return next();
        });
    }));

    router.get('/api/:sender/outstandingOrders', wrapAsync(async (req, res, next) => {
        const sender = req.params.sender;
        dbApi.outstandingOrders(sender, (orders) => {
            res.status(200).json(orders).send();
            return next();
        });
    }));
};
