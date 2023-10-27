import { expect } from "chai";
import { ethers } from "hardhat";
import { AuctionToken, DutchAuction } from "../typechain-types";

describe("DutchAuction", function () {
  it("Should allow bids and distribute tokens correctly", async function () {
    const accounts = await ethers.getSigners();
    const [owner, bidder1, bidder2] = accounts;

    const prevBalanceBidder1 = await ethers.provider.getBalance(bidder1);
    const prevBalanceBidder2 = await ethers.provider.getBalance(bidder2);
    const prevBalanceOwner = await ethers.provider.getBalance(owner);

    const AuctionToken = await ethers.getContractFactory("AuctionToken");
    const DutchAuction = await ethers.getContractFactory("DutchAuction");
    const AuctionFactory = await ethers.getContractFactory("AuctionFactory");

    const auctionFactory = await AuctionFactory.deploy();
    await auctionFactory.waitForDeployment();

    // create auction
    await auctionFactory.createAuction(
      "TestToken",
      "TT",
      // token supply = 1000 * 10^18
      ethers.parseEther("1000"),
      // start price = 1 ether
      ethers.parseEther("1"),
      // reserved price = 0,5 ether
      ethers.parseEther("0.5"),
    );

    // get auction and token contracts
    const auctionAddress = (await auctionFactory.getAllAuctions())[0];
    const auction = DutchAuction.attach(auctionAddress) as DutchAuction;
    const token = AuctionToken.attach(await auction.getToken()) as AuctionToken;

    // bid 400 ether as bidder 1
    await auction
      .connect(bidder1)
      .placeBid({ value: ethers.parseEther("400") });

    // Simulate time moving forward by 10 minutes
    await ethers.provider.send("evm_increaseTime", [10 * 60]);
    await ethers.provider.send("evm_mine");

    // bid 200 ether as bidder 2
    await auction
      .connect(bidder2)
      .placeBid({ value: ethers.parseEther("200") });

    // Simulate time moving forward by 15 minutes to end auction
    await ethers.provider.send("evm_increaseTime", [15 * 60]);
    await ethers.provider.send("evm_mine");

    // Auction Ended
    expect(await auction.getAuctionEnded()).to.equal(true);

    await auction.distributeTokens();

    const balanceBidder1 = await ethers.provider.getBalance(bidder1);
    const balanceBidder2 = await ethers.provider.getBalance(bidder2);
    const balanceOwner = await ethers.provider.getBalance(owner);

    // bidder 1 and 2 paid ethers
    expect(prevBalanceBidder1).to.gt(balanceBidder1);
    expect(prevBalanceBidder2).to.gt(balanceBidder2);
    // owner received ethers
    expect(prevBalanceOwner).to.lt(balanceOwner);

    const bidder1Tokens = await token.balanceOf(bidder1.address);
    const bidder2Tokens = await token.balanceOf(bidder2.address);
    const auctionContractTokens = await token.balanceOf(auctionAddress);

    // bidders received tokens
    expect(bidder1Tokens).to.gt(0);
    expect(bidder2Tokens).to.gt(0);
    // auction contract distributed and burned all tokens
    expect(auctionContractTokens).to.equal(0);
  });
});
