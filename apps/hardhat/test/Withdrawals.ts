import { expect } from "chai";
import { ethers } from "hardhat";
import { AuctionToken, DutchAuction } from "../typechain-types";

describe("Withdrawals", function () {
  // case 1
  describe("Case: Demand < Supply", function () {
    it("Should burn the unsold token", async function () {
      const AuctionToken = await ethers.getContractFactory("AuctionToken");
      const DutchAuction = await ethers.getContractFactory("DutchAuction");
      const AuctionFactory = await ethers.getContractFactory("AuctionFactory");

      const auctionFactory = await AuctionFactory.deploy();
      await auctionFactory.waitForDeployment();

      // create auction
      await auctionFactory.createAuction(
        "TestToken",
        "TT",
        // token supply = 500 (since AuctionToken's decimals = 18, parseEther can be used)
        ethers.parseEther("500"),
        // start price = 1.1 ether
        ethers.parseEther("1.1"),
        // reserved price = 0.1 ether
        ethers.parseEther("0.1"),
      );

      // get auction and token contracts
      const auctionAddress = (await auctionFactory.getAllAuctions())[0];
      const auction = DutchAuction.attach(auctionAddress) as DutchAuction;
      const token = AuctionToken.attach(
        await auction.getToken(),
      ) as AuctionToken;

      // get initial token supply
      const initialTokenSupply = await token.balanceOf(auctionAddress);

      // initial token supply should be 500
      expect(initialTokenSupply).to.equal(ethers.parseEther("500"));

      // simulate time moving forward by 20 minutes and no bid
      await ethers.provider.send("evm_increaseTime", [20 * 60]);
      await ethers.provider.send("evm_mine");

      // auction should end
      expect(await auction.getAuctionEnded()).to.equal(true);

      // call distribute tokens
      await auction.distributeTokens();
      expect(await auction.getTokensDistributed()).to.equal(true);

      // get final token supply
      const finalTokenSupply = await token.balanceOf(auctionAddress);

      // auction contract distributed and burned all tokens
      // final token supply should be 500 if not burned and 0 if burned
      expect(finalTokenSupply).to.equal(0);
    });

    it("Should the clearing price and reserved price be equal", async function () {
      const AuctionToken = await ethers.getContractFactory("AuctionToken");
      const DutchAuction = await ethers.getContractFactory("DutchAuction");
      const AuctionFactory = await ethers.getContractFactory("AuctionFactory");

      const auctionFactory = await AuctionFactory.deploy();
      await auctionFactory.waitForDeployment();

      // create auction
      await auctionFactory.createAuction(
        "TestToken",
        "TT",
        // token supply = 2000 (since AuctionToken's decimals = 18, parseEther can be used)
        ethers.parseEther("2000"),
        // start price = 1.5 ether
        ethers.parseEther("1.5"),
        // reserved price = 1 ether
        ethers.parseEther("1"),
      );

      // get auction and token contracts
      const auctionAddress = (await auctionFactory.getAllAuctions())[0];
      const auction = DutchAuction.attach(auctionAddress) as DutchAuction;
      const token = AuctionToken.attach(
        await auction.getToken(),
      ) as AuctionToken;

      // get reserved price
      const tokenReservedPrice = await auction.getReservedPrice();
      expect(tokenReservedPrice).to.equal(ethers.parseEther("1"));

      // simulate time moving forward by 20 minutes and no bid
      await ethers.provider.send("evm_increaseTime", [20 * 60]);
      await ethers.provider.send("evm_mine");

      // auction should end
      expect(await auction.getAuctionEnded()).to.equal(true);

      // get clearing price of 1 token at t=20 min
      const clearingPrice = await auction.getClearingPrice();

      // call distribute tokens
      await auction.distributeTokens();
      expect(await auction.getTokensDistributed()).to.equal(true);

      // clearing price should be equal to reserved price
      expect(clearingPrice).to.equal(ethers.parseEther("1"));
      expect(clearingPrice).to.equal(tokenReservedPrice);
    });
  });

  // case 2
  describe("Case: Demand >= Supply", function () {
    it("Should sell tokens at correct clearing price", async function () {
      const accounts = await ethers.getSigners();
      const [owner, bidder1, bidder2, bidder3] = accounts;

      // get initial ether balances
      const prevBalanceBidder1 = await ethers.provider.getBalance(bidder1);
      const prevBalanceBidder2 = await ethers.provider.getBalance(bidder2);
      const prevBalanceBidder3 = await ethers.provider.getBalance(bidder3);
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
        // token supply = 1500 (since AuctionToken's decimals = 18, parseEther can be used)
        ethers.parseEther("1500"),
        // start price = 2 ether
        ethers.parseEther("2"),
        // reserved price = 1 ether
        ethers.parseEther("1"),
      );

      // get auction and token contracts
      const auctionAddress = (await auctionFactory.getAllAuctions())[0];
      const auction = DutchAuction.attach(auctionAddress) as DutchAuction;
      const token = AuctionToken.attach(
        await auction.getToken(),
      ) as AuctionToken;

      // get current price
      const price1 = await auction.getCurrentPrice();

      // price should be equal to starting price
      expect(price1).to.equal(ethers.parseEther("2"));

      // bid 900 ether as bidder 1
      await auction
        .connect(bidder1)
        .placeBid({ value: ethers.parseEther("900") });

      // simulate time moving forward by 10 minutes
      await ethers.provider.send("evm_increaseTime", [10 * 60]);
      await ethers.provider.send("evm_mine");

      // get current price
      const price2 = await auction.getCurrentPrice();

      // price should be around 1.5 at 10 min
      expect(price2).to.approximately(
        ethers.parseEther("1.50"),
        ethers.parseEther("0.01"),
      );

      // bid 600 ether as bidder 2
      await auction
        .connect(bidder2)
        .placeBid({ value: ethers.parseEther("600") });

      // bidder 1 has around 900/1.5=600 tokens
      // bidder 2 has around 600/1.5=400 tokens
      // auction continue with around 500 token unsold
      expect(await auction.getAuctionEnded()).to.equal(false);

      // simulate time moving forward by 5 minutes
      await ethers.provider.send("evm_increaseTime", [5 * 60]);
      await ethers.provider.send("evm_mine");

      // get current price
      const price3 = await auction.getCurrentPrice();

      // price should be around 1.25 at 15 min
      expect(price3).to.approximately(
        ethers.parseEther("1.25"),
        ethers.parseEther("0.01"),
      );

      // bid 380 ether as bidder 3
      await auction
        .connect(bidder3)
        .placeBid({ value: ethers.parseEther("380") });

      // bidder 1 has 900/1.25 = 720 tokens
      // bidder 2 has 600/1.25 = 480 tokens
      // bidder 3 has 380/1.25 = 304 tokens
      // demand of 1504 > supply of 1500 tokens, auction has ended
      // auction should end
      expect(await auction.getAuctionEnded()).to.equal(true);

      // call distribute tokens
      await auction.distributeTokens();
      expect(await auction.getTokensDistributed()).to.equal(true);

      // get clearing price
      const finalClearingPrice = await auction.getClearingPrice();

      // clearing price should be around 1.25 eth at 15 min
      expect(finalClearingPrice).to.approximately(
        ethers.parseEther("1.25"),
        ethers.parseEther("0.01"),
      );

      // get final ether balances (after token distribution)
      const balanceBidder1 = await ethers.provider.getBalance(bidder1);
      const balanceBidder2 = await ethers.provider.getBalance(bidder2);
      const balanceBidder3 = await ethers.provider.getBalance(bidder3);
      const balanceOwner = await ethers.provider.getBalance(owner);

      // bidder 1,2,3 paid ethers
      expect(prevBalanceBidder1).to.gt(balanceBidder1);
      expect(prevBalanceBidder2).to.gt(balanceBidder2);
      expect(prevBalanceBidder3).to.gt(balanceBidder3);

      // owner received ethers
      expect(prevBalanceOwner).to.lt(balanceOwner);

      // get final token balances (after token distribution)
      const bidder1Tokens = await token.balanceOf(bidder1.address);
      const bidder2Tokens = await token.balanceOf(bidder2.address);
      const bidder3Tokens = await token.balanceOf(bidder3.address);
      const auctionContractTokens = await token.balanceOf(auctionAddress);

      // bidders received tokens
      expect(bidder1Tokens).to.gt(0);
      expect(bidder2Tokens).to.gt(0);
      expect(bidder3Tokens).to.gt(0);

      // auction contract distributed and burned all tokens
      expect(auctionContractTokens).to.equal(0);
    });

    it("Should refund bids if demand exceed token supply", async function () {
      const accounts = await ethers.getSigners();
      const [owner, bidder1] = accounts;

      // get initial ether balances
      const prevBalanceBidder1 = await ethers.provider.getBalance(bidder1);
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
        // token supply = 100 (since AuctionToken's decimals = 18, parseEther can be used)
        ethers.parseEther("100"),
        // start price = 1 ether
        ethers.parseEther("1"),
        // reserved price = 0,5 ether
        ethers.parseEther("0.1"),
      );

      // get auction and token contracts
      const auctionAddress = (await auctionFactory.getAllAuctions())[0];
      const auction = DutchAuction.attach(auctionAddress) as DutchAuction;
      const token = AuctionToken.attach(
        await auction.getToken(),
      ) as AuctionToken;

      // bid 150 ether as bidder 1
      await auction
        .connect(bidder1)
        .placeBid({ value: ethers.parseEther("150") });

      // auction should end
      expect(await auction.getAuctionEnded()).to.equal(true);

      // call distribute tokens
      await auction.distributeTokens();
      expect(await auction.getTokensDistributed()).to.equal(true);

      // get final ether balances (after token distribution)
      const balanceBidder1 = await ethers.provider.getBalance(bidder1);
      const balanceOwner = await ethers.provider.getBalance(owner);

      // bidder 1 paid ethers
      // pass if only 100 eth is deducted (not 150 eth)
      expect(prevBalanceBidder1 - ethers.parseEther("100")).to.approximately(
        balanceBidder1,
        ethers.parseEther("1"),
      );

      // owner received ethers
      expect(prevBalanceOwner).to.lt(balanceOwner);

      // get final token balances
      const bidder1Tokens = await token.balanceOf(bidder1.address);
      const auctionContractTokens = await token.balanceOf(auctionAddress);

      // bidders received tokens
      expect(bidder1Tokens).to.gt(0);

      // auction contract distributed and burned all tokens
      expect(auctionContractTokens).to.equal(0);
    });
  });

  // transfer
  describe("Transfer", function () {
    it("Should distribute correct amount of token to the correct bidder", async function () {
      const accounts = await ethers.getSigners();
      const [owner, bidder1, bidder2, bidder3] = accounts;

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
        // start price = 1 ether
        ethers.parseEther("1"),
        // reserved price = 0,5 ether
        ethers.parseEther("0.5"),
      );

      // get auction and token contracts
      const auctionAddress = (await auctionFactory.getAllAuctions())[0];
      const auction = DutchAuction.attach(auctionAddress) as DutchAuction;
      const token = AuctionToken.attach(
        await auction.getToken(),
      ) as AuctionToken;

      // bid 312.5 ether as bidder 1
      await auction
        .connect(bidder1)
        .placeBid({ value: ethers.parseEther("312.5") });

      // simulate time moving forward by 5 minutes
      await ethers.provider.send("evm_increaseTime", [5 * 60]);
      await ethers.provider.send("evm_mine");

      // bid 187.5 ether as bidder 2
      await auction
        .connect(bidder2)
        .placeBid({ value: ethers.parseEther("187.5") });

      // simulate time moving forward by 5 minutes
      await ethers.provider.send("evm_increaseTime", [5 * 60]);
      await ethers.provider.send("evm_mine");

      // bid 125 ether as bidder 3
      await auction
        .connect(bidder3)
        .placeBid({ value: ethers.parseEther("125") });

      // auction shouldn't end yet
      // at t=10min, price=0.75 eth
      // 312.5/0.75 = 416.66 | 187.5/0.75 = 250 | 125/0.75 = 166.66, still have enough supply of token
      expect(await auction.getAuctionEnded()).to.equal(false);

      // simulate time moving forward by 5 minutes
      await ethers.provider.send("evm_increaseTime", [5 * 60]);
      await ethers.provider.send("evm_mine");

      // auction should end
      // at t=15min, price=0.625 eth
      // 312.5/0.625 = 500 | 187.5/0.625 = 300 | 125/0.625 = 200, 500+300+200=1000 token supply
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

      const bidder1Tokens = await token.balanceOf(bidder1.address);
      const bidder2Tokens = await token.balanceOf(bidder2.address);
      const bidder3Tokens = await token.balanceOf(bidder3.address);
      const auctionContractTokens = await token.balanceOf(auctionAddress);

      // bidders received tokens
      expect(bidder1Tokens).to.gt(0);
      expect(bidder2Tokens).to.gt(0);
      expect(bidder3Tokens).to.gt(0);
      expect(bidder1Tokens).to.equal(ethers.parseEther("500"));
      expect(bidder2Tokens).to.equal(ethers.parseEther("300"));
      expect(bidder3Tokens).to.equal(ethers.parseEther("200"));

      // auction contract distributed and burned all tokens
      expect(auctionContractTokens).to.equal(0);
    });
  });
});
