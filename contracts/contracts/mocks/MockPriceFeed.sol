// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

contract MockPriceFeed {
    uint80 public roundId = 100;
    int256 public price;
    uint256 public timestamp;
    uint80 public answeredInRound = 100;
    uint256 public lastUpdate;
    uint256 public constant MIN_UPDATE_DELAY = 3; // Reduced from 15 for testing
    uint256 public constant MAX_PRICE_CHANGE = 1000; // 10%
    string private _description;

    constructor(int256 _price) {
        price = _price;
        timestamp = block.timestamp;
        lastUpdate = block.timestamp;
        _description = "BTC"; // Default to BTC for existing tests
    }

    function setPrice(int256 _price) external {
        require(block.timestamp >= lastUpdate + MIN_UPDATE_DELAY, "Price updated too recently");

        // After time check, verify price impact
        if (price > 0) {
            uint256 priceDelta = price > _price ? 
                uint256(price - _price) : 
                uint256(_price - price);
            uint256 priceChange = (priceDelta * 10000) / uint256(price);
            require(priceChange <= MAX_PRICE_CHANGE, "Price impact too high");
        }

        price = _price;
        timestamp = block.timestamp;
        lastUpdate = block.timestamp;
        roundId++;
        answeredInRound = roundId;
    }

    // Add description function
    function description() external view returns (string memory) {
        return _description;
    }

    // Add setter for testing different symbols
    function setDescription(string memory newDescription) external {
        _description = newDescription;
    }

    function latestRoundData() external view returns (
        uint80, int256, uint256, uint256, uint80
    ) {
        return (roundId, price, timestamp, timestamp, answeredInRound);
    }
}