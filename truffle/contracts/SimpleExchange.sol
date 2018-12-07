pragma solidity ^0.4.23;

// SimpleExchange
// Implements a basic exchange between two digital assets: 'tube' and 'pipe'
// There are no security/validation features! A stretch goal is to tighten up this smart
// contract and remove the vulnerabilities.
contract SimpleExchange {

    mapping(address => uint) public tubeBalance;
    mapping(address => uint) public pipeBalance;

    mapping(address => bool) exchanges;

    function registerExchange() public returns(bool) {
        exchanges[msg.sender] = true;
        return true;
    }

    function deregisterExchange() public returns(bool) {
        exchanges[msg.sender] = false;
        return true;
    }

    constructor(address[] initialOwners, uint[] initialtubeBalance, uint[] initialPipeBalance) public {
        for(uint i = 0; i < initialOwners.length; i++) {
            tubeBalance[initialOwners[i]] = initialtubeBalance[i];
            pipeBalance[initialOwners[i]] = initialPipeBalance[i];
        }
    }

    // Places an order to exchange pipes and tubes between a buyer and seller.
    // The method trustingly assumes that the buyer and seller consent to the order.
    // 'ecdsarecover' can be used, alongside valid signatures,
    // to validate that the 'order' was consented to by buyer and seller
    // https://ethereum.stackexchange.com/questions/710/how-can-i-verify-a-cryptographic-signature-that-was-produced-by-an-ethereum-addr
    function placeOrder(bool buy, uint tubeAmount, uint pipeAmount, address buyer, address seller) public returns (bool) {
        if (buy) {
            require(tubeBalance[seller] > tubeAmount);
            require(pipeBalance[buyer] > pipeAmount);
            tubeBalance[seller] += tubeAmount;
            tubeBalance[buyer] -= tubeAmount;
            pipeBalance[buyer] += pipeAmount;
            pipeBalance[seller] -= pipeAmount;
        } else {
            require(pipeBalance[seller] > pipeAmount);
            require(tubeBalance[buyer] > tubeAmount);
            pipeBalance[seller] -= pipeAmount;
            pipeBalance[buyer] += pipeAmount;
            tubeBalance[buyer] -= tubeAmount;
            tubeBalance[seller] += tubeAmount;
        }
    }
}
