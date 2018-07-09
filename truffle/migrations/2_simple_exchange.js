/* global artifacts:true */
const { ethereumAddresses } = require('../../config');

const SimpleExchange = artifacts.require('./SimpleExchange.sol');

module.exports = (deployer) => {
    const pipeBalances = ethereumAddresses.map((a, i) => i);
    const tubeBalances = ethereumAddresses.map((a, i) => 2*i);
    deployer.deploy(SimpleExchange, ethereumAddresses, pipeBalances, tubeBalances);
    // Deployment complete
};