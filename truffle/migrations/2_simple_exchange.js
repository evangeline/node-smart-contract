/* global artifacts:true */

const SimpleExchange = artifacts.require('./SimpleExchange.sol');

module.exports = (deployer, network, accounts) => {
    const pipeBalances = accounts.map((a, i) => i);
    const tubeBalances = accounts.map((a, i) => 2 * i);
    deployer.deploy(SimpleExchange, accounts, pipeBalances, tubeBalances);
    // Deployment complete
};
