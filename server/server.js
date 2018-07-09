
// ### App Initialization

// ### External Dependencies

const express = require('express');

// ### Inernal Dependencies

const routes = require('./routes');

// ### App Initialization
function makeServer() {
    const app = express();

    routes(app, {});
    const server = app.listen(4000, () => {
        console.log(`Server is running on http://localhost:4000 or http://127.0.0.1:4000`);
    });

    return server;
}

module.exports = makeServer;
