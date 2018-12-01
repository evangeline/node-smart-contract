// ### External Dependencies
const express = require('express');
const cors = require('cors');
const dbApi = require('./dbApi');

module.exports = function routing(app) {
    app.use(cors({
        credentials: true,
        methods: ['GET', 'PUT', 'POST', 'DELETE'],
    }));
    app.use(express.urlencoded({ extended: false })); // body parser functions
    app.use(express.json());

    const router = new express.Router();

    app.use('/', router);

    router.get('/api', async (req, res, next) => {
        res.status(200).json({ message: 'woohoo' }).send();
        return next();
    });

    router.post('/api/placeOrder', async (req, res, next) => {
        res.status(201).json({}).send();
        return next();
    });

    router.get('/api/:sender/tubeBalance', async (req, res, next) => {
        let sender = req.params.sender;
        let tubeBalance = dbApi.getTubeBalance(sender);
        res.status(200).json({ balance: tubeBalance }).send();
        return next();
    });

    router.get('/api/:sender/pipeBalance', async (req, res, next) => {
        let sender = req.params.sender;
        let pipeBalance = dbApi.getPipeBalance(sender);
        res.status(200).json({ balance: pipeBalance }).send();
        return next();
    });

    router.get('/api/:sender/outstandingOrders', async (req, res, next) => {
        console.log('tube balance sender:'+req.params.sender);
        let sender = req.params.sender;
        res.status(200).json({}).send();
        return next();
    });
};
