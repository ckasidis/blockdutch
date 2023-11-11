import { expect } from "chai";
import { ethers } from "hardhat";
import { AuctionToken, DutchAuction } from "../typechain-types";

describe("Deployment", function () {
  it("Should elapse for at most 20 minutes", async function () {
    const AuctionToken = await ethers.getContractFactory("AuctionToken");
    const DutchAuction = await ethers.getContractFactory("DutchAuction");
    const AuctionFactory = await ethers.getContractFactory("AuctionFactory");

    const auctionFactory = await AuctionFactory.deploy();
    await auctionFactory.waitForDeployment();

    // create auction
    await auctionFactory.createAuction(
      "TestToken",
      "TT",
      // token supply = 1000 (since AuctionToken's decimal = 18, parseEther)
      ethers.parseEther("1000"),
      // start price = 1 ether
      ethers.parseEther("1"),
      // reserved price = 0.5 ether
      ethers.parseEther("0.5"),
    );

    // get auction and token contracts
    const auctionAddress = (await auctionFactory.getAllAuctions())[0];
    const auction = DutchAuction.attach(auctionAddress) as DutchAuction;
    const token = AuctionToken.attach(await auction.getToken()) as AuctionToken;

    // auction shouldn't end yet
    expect(await auction.getAuctionEnded()).to.equal(false);

    // simulate time moving forward by 19 min
    await ethers.provider.send("evm_increaseTime", [19 * 60]);
    await ethers.provider.send("evm_mine");

    // auction shouldn't end yet
    expect(await auction.getAuctionEnded()).to.equal(false);

    // simulate time moving forward by 1 min
    await ethers.provider.send("evm_increaseTime", [1 * 60]);
    await ethers.provider.send("evm_mine");

    // auction should end
    expect(await auction.getAuctionEnded()).to.equal(true);
  });

  it("Should distributed tokens only after auction has ended", async function () {
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
      // token supply = 1000 (since AuctionToken's decimals = 18, parseEther can be used)
      ethers.parseEther("1000"),
      // start price = 1 ether
      ethers.parseEther("1"),
      // reserved price = 0.5 ether
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

    // simulate time moving forward by 10 minutes
    await ethers.provider.send("evm_increaseTime", [10 * 60]);
    await ethers.provider.send("evm_mine");

    // bid 300 ether as bidder 2
    await auction
      .connect(bidder2)
      .placeBid({ value: ethers.parseEther("300") });

    // 400/0.75 + 300/0.75 = 933
    // supply > demand && not 20 minutes yet so auction hasn't ended yet
    // auction shouldn't end yet
    expect(await auction.getAuctionEnded()).to.equal(false);

    // get token balances
    const bidder1Tokens = await token.balanceOf(bidder1.address);
    const bidder2Tokens = await token.balanceOf(bidder2.address);
    const auctionContractTokens = await token.balanceOf(auctionAddress);

    // bidders shouldn't receive any tokens yet
    // auction contract should own all tokens
    expect(bidder1Tokens).to.equal(0);
    expect(bidder2Tokens).to.equal(0);
    expect(ethers.formatEther(auctionContractTokens)).to.equal("1000.0");

    // distributeTokens should throw an error when auction hasn't ended yet
    expect(auction.distributeTokens()).to.rejectedWith(Error);
    expect(await auction.getTokensDistributed()).to.equal(false);

    // simulate time moving forward by 10 minutes to end auction
    await ethers.provider.send("evm_increaseTime", [10 * 60]);
    await ethers.provider.send("evm_mine");

    // auction should end
    expect(await auction.getAuctionEnded()).to.equal(true);

    // call distribute tokens
    await auction.distributeTokens();
    expect(await auction.getTokensDistributed()).to.equal(true);

    // get final ether balances (after token distribution)
    const finalBalanceBidder1 = await ethers.provider.getBalance(bidder1);
    const finalBalanceBidder2 = await ethers.provider.getBalance(bidder2);
    const finalBalanceOwner = await ethers.provider.getBalance(owner);

    // bidder 1 and 2 paid ethers
    expect(prevBalanceBidder1).to.gt(finalBalanceBidder1);
    expect(prevBalanceBidder2).to.gt(finalBalanceBidder2);

    // owner received ethers
    expect(prevBalanceOwner).to.lt(finalBalanceOwner);

    // get final token balances (after token distribution)
    const finalBidder1Tokens = await token.balanceOf(bidder1.address);
    const finalBidder2Tokens = await token.balanceOf(bidder2.address);
    const finalAuctionContractTokens = await token.balanceOf(auctionAddress);

    // bidders received tokens
    expect(finalBidder1Tokens).to.gt(0);
    expect(finalBidder2Tokens).to.gt(0);

    // auction contract distributed and burned all tokens
    expect(finalAuctionContractTokens).to.equal(0);
  });

  it("Should sell token at price no lower than reserved price", async function () {
    const AuctionToken = await ethers.getContractFactory("AuctionToken");
    const DutchAuction = await ethers.getContractFactory("DutchAuction");
    const AuctionFactory = await ethers.getContractFactory("AuctionFactory");

    const auctionFactory = await AuctionFactory.deploy();
    await auctionFactory.waitForDeployment();

    // create auction
    await auctionFactory.createAuction(
      "TestToken",
      "TT",
      // token supply = 1000 (since AuctionToken's decimals = 18, parseEther can be used)
      ethers.parseEther("1000"),
      // start price = 1 ether
      ethers.parseEther("1"),
      // reserved price = 0.5 ether
      ethers.parseEther("0.5"),
    );

    // get auction and token contracts
    const auctionAddress = (await auctionFactory.getAllAuctions())[0];
    const auction = DutchAuction.attach(auctionAddress) as DutchAuction;
    const token = AuctionToken.attach(await auction.getToken()) as AuctionToken;

    // get reserve price of 1 token
    const tokenReservedPrice = await auction.getReservedPrice();

    // get current price of 1 token at t = 0 min
    const tokenPrice1 = await auction.getCurrentPrice();
    expect(Number(tokenPrice1)).to.gt(Number(tokenReservedPrice));

    // Simulate time moving forward by 10 minutes
    await ethers.provider.send("evm_increaseTime", [10 * 60]);
    await ethers.provider.send("evm_mine");

    // get current price of 1 token at t=10 min
    const tokenPrice2 = await auction.getCurrentPrice();
    expect(Number(tokenPrice2)).to.gt(Number(tokenReservedPrice));
    expect(ethers.formatEther(tokenPrice2)).to.equal("0.75");

    // Simulate time moving forward by 10 minutes to end auction
    await ethers.provider.send("evm_increaseTime", [10 * 60]);
    await ethers.provider.send("evm_mine");

    // auction should end
    expect(await auction.getAuctionEnded()).to.equal(true);

    // get current price of 1 token at t=20 min
    const tokenPrice3 = await auction.getCurrentPrice();

    // expect selling price to be greater than or equal to reserved price
    expect(Number(tokenPrice3)).to.greaterThanOrEqual(
      Number(tokenReservedPrice),
    );

    // in this case, selling price should be equal to reserved price as their is no bid
    expect(tokenPrice3).to.equal(ethers.parseEther("0.5"));
  });

  it("Should distribute token no more than the supply", async function () {
    const accounts = await ethers.getSigners();
    const [owner, bidder1, bidder2] = accounts;

    // get initial ether balances
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
      // token supply = 1000 (since AuctionToken's decimals = 18, parseEther can be used)
      ethers.parseEther("1000"),
      // start price = 2 ether
      ethers.parseEther("2"),
      // reserved price = 1 ether
      ethers.parseEther("1"),
    );

    // get auction and token contracts
    const auctionAddress = (await auctionFactory.getAllAuctions())[0];
    const auction = DutchAuction.attach(auctionAddress) as DutchAuction;
    const token = AuctionToken.attach(await auction.getToken()) as AuctionToken;
    const totalTokenSupply = await auction.getTotalSupply();

    // bid 1000 ether as bidder 1
    await auction
      .connect(bidder1)
      .placeBid({ value: ethers.parseEther("1000") });

    // simulate time moving forward by 10 minutes
    // price = 1.5 ether
    await ethers.provider.send("evm_increaseTime", [10 * 60]);
    await ethers.provider.send("evm_mine");

    // bid 525 ether as bidder 2
    await auction
      .connect(bidder2)
      .placeBid({ value: ethers.parseEther("525") });

    // auction should end as demand > supply (1000/1.5=666, 525/1.5=350, 666+350>1000)
    expect(await auction.getAuctionEnded()).to.equal(true);

    // call distribute tokens
    await auction.distributeTokens();
    expect(await auction.getTokensDistributed()).to.equal(true);

    // get final ether balances (after token distribution)
    const balanceBidder1 = await ethers.provider.getBalance(bidder1);
    const balanceBidder2 = await ethers.provider.getBalance(bidder2);
    const balanceOwner = await ethers.provider.getBalance(owner);

    // bidder 1 and 2 paid ethers
    expect(prevBalanceBidder1).to.gt(balanceBidder1);
    expect(prevBalanceBidder2).to.gt(balanceBidder2);

    // owner received ethers
    expect(prevBalanceOwner).to.lt(balanceOwner);

    // get final token balances (after token distribution)
    const bidder1Tokens = await token.balanceOf(bidder1.address);
    const bidder2Tokens = await token.balanceOf(bidder2.address);
    const auctionContractTokens = await token.balanceOf(auctionAddress);

    // bidders received tokens
    expect(bidder1Tokens).to.gt(0);
    expect(bidder2Tokens).to.gt(0);

    // bidder1 committed 1000 ethers
    // received around 666 tokens
    expect(bidder1Tokens).to.approximately(
      ethers.parseEther("666"),
      ethers.parseEther("2"),
    );

    // bidder2 committed 525 ethers
    // received around 333 tokens from 500 ethers
    // excess ethers refunded (first come first serve)
    expect(bidder2Tokens).to.approximately(
      ethers.parseEther("333"),
      ethers.parseEther("2"),
    );

    // expect sum of token balances of bidder1 and bidder2 to equal to total token supply
    expect(bidder1Tokens + bidder2Tokens).to.equal(totalTokenSupply);

    // auction contract distributed and burned all tokens
    expect(auctionContractTokens).to.equal(0);
  });
});
