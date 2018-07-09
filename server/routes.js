// ### External Dependencies
const express = require('express');
const cors = require('cors');

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
        res.status(200).json({}).send();
        return next();
    });

    router.get('/api/:sender/pipeBalance', async (req, res, next) => {
        res.status(200).json({}).send();
        return next();
    });

    router.get('/api/:sender/outstandingOrders', async (req, res, next) => {
        res.status(200).json({}).send();
        return next();
    });
};
