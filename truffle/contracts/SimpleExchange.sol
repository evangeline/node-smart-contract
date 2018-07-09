pragma solidity ^0.4.23;

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
    }

    constructor(address[] initialOwners, uint[] initialtubeBalance, uint[] initialPipeBalance) public {
        for(uint i = 0; i < initialOwners.length; i++) {
            tubeBalance[initialOwners[i]] = initialtubeBalance[i];
            pipeBalance[initialOwners[i]] = initialPipeBalance[i];
        }
    }

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
            tubeBalance[buyer] += tubeAmount;
            tubeBalance[seller] -= tubeAmount;
        }
    }
}