// ### External Dependencies
const express = require('express');
const cors = require('cors');
const dbApi = require('./dbApi');
const web3Api = require('./web3Api');
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

    router.post('/api/placeOrder', async (req, res, next) => {
        res.status(201).json({}).send();
        return next();
    });

    router.get('/api/:sender/tubeBalance', async (req, res, next) => {
        const sender = req.params.sender;
        res.status(200).json({ balance: 0 }).send();
        return next();
    });

    router.get('/api/:sender/pipeBalance', async (req, res, next) => {
        const sender = req.params.sender;
        web3Api.getPipeBalance(sender, function(pipeBalance) {
            res.status(200).json({ balance: pipeBalance }).send();
            return next();
        });
    });

    router.get('/api/:sender/outstandingOrders', async (req, res, next) => {
        res.status(200).json({}).send();
        return next();
    });
};
