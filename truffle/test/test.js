var SimpleExchange = artifacts.require('../contracts/SimpleExchange');

contract('SimpleExchange', function(accounts) {
    let contract;
    beforeEach(async () => {
        const initialtubeBalance = accounts.map((a, i) => {
            return i;
        });
        const initialPipeBalance = accounts.map((a, i) => {
            return 2*i;
        })
        contract = await SimpleExchange.new(accounts, initialtubeBalance, initialPipeBalance);
    });

    it('has correct initial balances', async () => {
        const someBalance = await contract.tubeBalance(accounts[2]);
        assert.equal(someBalance, 2);
    });

    it('can succesfully fill order', async () => {
        await contract.placeOrder(true, 6, 5, accounts[8], accounts[7]);
        const tubeBalanceA = await contract.tubeBalance(accounts[8]);
        const tubeBalanceB = await contract.tubeBalance(accounts[7]);
        const pipeBalanceA = await contract.pipeBalance(accounts[8]);
        const pipeBalanceB = await contract.pipeBalance(accounts[7]);
        assert.equal(tubeBalanceA, 2);
        assert.equal(tubeBalanceB, 13);
        assert.equal(pipeBalanceA, 21);
        assert.equal(pipeBalanceB, 9);
    });
});
