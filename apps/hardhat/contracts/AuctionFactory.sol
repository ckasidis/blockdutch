// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./AuctionToken.sol";
import "./DutchAuction.sol";

contract AuctionFactory {
    mapping(address => DutchAuction[]) private _auctionsByCreator;
    DutchAuction[] private _allAuctions;

    // Events
    event AuctionCreated(address indexed creator, DutchAuction auction);

    // Getters
    function getAllAuctions() external view returns (DutchAuction[] memory) {
        return _allAuctions;
    }

    function getAuctionsByCreator(
        address creator
    ) external view returns (DutchAuction[] memory) {
        return _auctionsByCreator[creator];
    }

    // Function to create a dutch auction contract
    function createAuction(
        string memory tokenName,
        string memory tokenSymbol,
        uint256 totalSupply,
        uint256 startPrice,
        uint256 reservedPrice
    ) public returns (DutchAuction) {
        // Create a new DutchAuction contract
        DutchAuction newAuction = new DutchAuction(
            tokenName,
            tokenSymbol,
            totalSupply,
            startPrice,
            reservedPrice,
            msg.sender
        );

        // Add the auction to the creator's list and to the total list
        _auctionsByCreator[msg.sender].push(newAuction);
        _allAuctions.push(newAuction);

        // Emit an event to notify
        emit AuctionCreated(msg.sender, newAuction);

        // Return the addresses of the new contracts
        return newAuction;
    }
}
