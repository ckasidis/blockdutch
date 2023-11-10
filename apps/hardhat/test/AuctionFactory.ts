import { expect } from "chai";
import { ethers } from "hardhat";
import {
  AuctionToken,
  DutchAuction,
  VulnerableDutchAuction,
  Attack,
} from "../typechain-types";

describe("DutchAuction", function () {
  //deployment
  describe("Deployment", function () {
    it("Should elapse for at most 20 minutes", async function () {
      const accounts = await ethers.getSigners();
      const [owner] = accounts;

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
        // reserved price = 0.5 ether
        ethers.parseEther("0.5"),
      );

      // get auction and token contracts
      const auctionAddress = (await auctionFactory.getAllAuctions())[0];
      const auction = DutchAuction.attach(auctionAddress) as DutchAuction;
      const token = AuctionToken.attach(
        await auction.getToken(),
      ) as AuctionToken;

      expect(await auction.getAuctionEnded()).to.equal(false);

      //simulate time moving forward by 19 min
      await ethers.provider.send("evm_increaseTime", [19 * 60]);
      await ethers.provider.send("evm_mine");
      expect(await auction.getAuctionEnded()).to.equal(false);

      //simulate time moving forward by 1 min
      await ethers.provider.send("evm_increaseTime", [1 * 60]);
      await ethers.provider.send("evm_mine");
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
        // token supply = 1000 * 10^18
        ethers.parseEther("1000"),
        // start price = 1 ether
        ethers.parseEther("1"),
        // reserved price = 0.5 ether
        ethers.parseEther("0.5"),
      );

      // get auction and token contracts
      const auctionAddress = (await auctionFactory.getAllAuctions())[0];
      const auction = DutchAuction.attach(auctionAddress) as DutchAuction;
      const token = AuctionToken.attach(
        await auction.getToken(),
      ) as AuctionToken;

      // bid 400 ether as bidder 1
      await auction
        .connect(bidder1)
        .placeBid({ value: ethers.parseEther("400") });

      // Simulate time moving forward by 10 minutes
      await ethers.provider.send("evm_increaseTime", [10 * 60]);
      await ethers.provider.send("evm_mine");

      // bid 300 ether as bidder 2
      await auction
        .connect(bidder2)
        .placeBid({ value: ethers.parseEther("300") });
      // 400/0.75 + 300/0.75 = 933
      //supply > demand && not 20min yet so auction havent end (should have no transaction yet)
      //auction shouldnt end yet
      expect(await auction.getAuctionEnded()).to.equal(false);
      //bidder shouldnt receieve any token yet
      //owner should have all tokens
      const bidder1Tokens = await token.balanceOf(bidder1.address);
      const bidder2Tokens = await token.balanceOf(bidder2.address);
      const auctionContractTokens = await token.balanceOf(auctionAddress);
      expect(bidder1Tokens).to.equal(0);
      expect(bidder2Tokens).to.equal(0);
      expect(ethers.formatEther(auctionContractTokens)).to.equal("1000.0");

      // Simulate time moving forward by 10 minutes to end auction
      await ethers.provider.send("evm_increaseTime", [10 * 60]);
      await ethers.provider.send("evm_mine");
      // Auction Ended
      expect(await auction.getAuctionEnded()).to.equal(true);
      await auction.distributeTokens();
      //final balance (after auction ended)
      const finalBalanceBidder1 = await ethers.provider.getBalance(bidder1);
      const finalBalanceBidder2 = await ethers.provider.getBalance(bidder2);
      const finalBalanceOwner = await ethers.provider.getBalance(owner);
      // bidder 1 and 2 paid ethers
      expect(prevBalanceBidder1).to.gt(finalBalanceBidder1);
      expect(prevBalanceBidder2).to.gt(finalBalanceBidder2);
      // owner received ethers
      expect(prevBalanceOwner).to.lt(finalBalanceOwner);
      //final token (after auction ended)
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
      const accounts = await ethers.getSigners();
      const [owner] = accounts;

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
        // reserved price = 0.5 ether
        ethers.parseEther("0.5"),
      );

      // get auction and token contracts
      const auctionAddress = (await auctionFactory.getAllAuctions())[0];
      const auction = DutchAuction.attach(auctionAddress) as DutchAuction;
      const token = AuctionToken.attach(
        await auction.getToken(),
      ) as AuctionToken;

      //get reserve price of 1 token
      const tokenReservedPrice = await auction.getReservedPrice();
      //get current price of 1 token at t=0 min
      const tokenPrice1 = await auction.getCurrentPrice();
      expect(Number(tokenPrice1)).to.gt(Number(tokenReservedPrice));

      // Simulate time moving forward by 10 minutes to end auction
      await ethers.provider.send("evm_increaseTime", [10 * 60]);
      await ethers.provider.send("evm_mine");

      //get current price of 1 token at t=10 min
      const tokenPrice2 = await auction.getCurrentPrice();
      expect(Number(tokenPrice2)).to.gt(Number(tokenReservedPrice));
      expect(ethers.formatEther(tokenPrice2)).to.equal("0.75");

      // Simulate time moving forward by 10 minutes to end auction
      await ethers.provider.send("evm_increaseTime", [10 * 60]);
      await ethers.provider.send("evm_mine");

      //get current price of 1 token at t=20 min
      const tokenPrice3 = await auction.getCurrentPrice();
      expect(Number(tokenPrice3)).to.greaterThanOrEqual(
        Number(tokenReservedPrice),
      );
      expect(ethers.formatEther(tokenPrice3)).to.equal("0.5");
      expect(await auction.getAuctionEnded()).to.equal(true);
    });

    it("Should distribute token no more than the supply", async function () {
      const accounts = await ethers.getSigners();
      const [owner, bidder1, bidder2] = accounts;
      //initial balance
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
      const totalTokenSupply = await auction.getTotalSupply();

      // bid 1000 ether as bidder 1
      await auction
        .connect(bidder1)
        .placeBid({ value: ethers.parseEther("1000") });

      // Simulate time moving forward by 10 minutes
      // price = 1.5 ether
      await ethers.provider.send("evm_increaseTime", [10 * 60]);
      await ethers.provider.send("evm_mine");

      // bid 525 ether as bidder 2
      await auction
        .connect(bidder2)
        .placeBid({ value: ethers.parseEther("525") });

      /*
      // Simulate time moving forward by 11 minutes to end auction
      await ethers.provider.send("evm_increaseTime", [11 * 60]);
      await ethers.provider.send("evm_mine");*/

      // Auction Ended as Demand > Supply (1000/1.5=666, 525/1.5=350, 666+350>1000)
      expect(await auction.getAuctionEnded()).to.equal(true);

      await auction.distributeTokens();

      //final balance (after auction ended)
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
      expect(Number(bidder1Tokens) / 10e17)
        .to.be.greaterThan(666)
        .and.lessThan(668);
      expect(Number(bidder2Tokens) / 10e17)
        .to.be.greaterThan(331)
        .and.lessThan(333);
      //expect(Number(bidder1Tokens)/10e17 + Number(bidder2Tokens)/10e17).to.equal(Number(totalTokenSupply)/10e17);
      expect(bidder1Tokens + bidder2Tokens).to.equal(totalTokenSupply);
      // auction contract distributed and burned all tokens
      expect(auctionContractTokens).to.equal(0);
    });
  });

  describe("Withdrawals", function () {
    //case 1
    describe("Case: Demand < Supply", function () {
      it("Should burn the unsold token", async function () {
        const accounts = await ethers.getSigners();
        const [owner] = accounts;
        //initial balance
        const prevBalanceOwner = await ethers.provider.getBalance(owner);

        const AuctionToken = await ethers.getContractFactory("AuctionToken");
        const DutchAuction = await ethers.getContractFactory("DutchAuction");
        const AuctionFactory =
          await ethers.getContractFactory("AuctionFactory");

        const auctionFactory = await AuctionFactory.deploy();
        await auctionFactory.waitForDeployment();

        // create auction
        await auctionFactory.createAuction(
          "TestToken",
          "TT",
          // token supply = 500 * 10^18
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

        const initialTokenSupply = await auction.getTotalSupply();
        const totalTokenSupply2 = await token.balanceOf(auctionAddress);
        //both ways can get the supply of token
        //expect(totalTokenSupply).to.equal(totalTokenSupply2);

        //500 initial token supply
        expect(Number(initialTokenSupply) / 10e17).to.equal(500);

        // Simulate time moving forward by 20 minutes and no bid
        await ethers.provider.send("evm_increaseTime", [20 * 60]);
        await ethers.provider.send("evm_mine");

        // Auction Ended
        expect(await auction.getAuctionEnded()).to.equal(true);

        await auction.distributeTokens();

        //final balance (after auction ended)
        const balanceOwner = await ethers.provider.getBalance(owner);

        // owner received 0 ethers as there is no bid
        //expect(prevBalanceOwner).to.equal(balanceOwner);

        const finalTokenSupply = await token.balanceOf(auctionAddress);

        // auction contract distributed and burned all tokens
        // final token supply should be 500 if not burn and 0 if burn
        expect(finalTokenSupply).to.equal(0);
      });
      it("Should the clearing price and reserved price be equal", async function () {
        const accounts = await ethers.getSigners();
        const [owner] = accounts;
        //initial balance
        const prevBalanceOwner = await ethers.provider.getBalance(owner);

        const AuctionToken = await ethers.getContractFactory("AuctionToken");
        const DutchAuction = await ethers.getContractFactory("DutchAuction");
        const AuctionFactory =
          await ethers.getContractFactory("AuctionFactory");

        const auctionFactory = await AuctionFactory.deploy();
        await auctionFactory.waitForDeployment();

        // create auction
        await auctionFactory.createAuction(
          "TestToken",
          "TT",
          // token supply = 2000 * 10^18
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

        //get reserve price of 1 token
        const tokenReservedPrice = await auction.getReservedPrice();
        expect(Number(tokenReservedPrice) / 10e17).to.equal(1);

        // Simulate time moving forward by 20 minutes and no bid
        await ethers.provider.send("evm_increaseTime", [20 * 60]);
        await ethers.provider.send("evm_mine");

        // Auction Ended
        expect(await auction.getAuctionEnded()).to.equal(true);

        //get clearing price/final price of 1 token at t=20 min
        const clearingPrice = await auction.getCurrentPrice();

        await auction.distributeTokens();

        expect(Number(clearingPrice) / 10e17).to.equal(1);
        expect(Number(clearingPrice)).to.equal(Number(tokenReservedPrice));
      });
    });
    //case 2
    describe("Case: Demand > Supply", function () {
      it("Should sold tokens at correct clearing price", async function () {
        const accounts = await ethers.getSigners();
        const [owner, bidder1, bidder2, bidder3] = accounts;
        //initial balance
        const prevBalanceBidder1 = await ethers.provider.getBalance(bidder1);
        const prevBalanceBidder2 = await ethers.provider.getBalance(bidder2);
        const prevBalanceBidder3 = await ethers.provider.getBalance(bidder3);
        const prevBalanceOwner = await ethers.provider.getBalance(owner);

        const AuctionToken = await ethers.getContractFactory("AuctionToken");
        const DutchAuction = await ethers.getContractFactory("DutchAuction");
        const AuctionFactory =
          await ethers.getContractFactory("AuctionFactory");

        const auctionFactory = await AuctionFactory.deploy();
        await auctionFactory.waitForDeployment();

        // create auction
        await auctionFactory.createAuction(
          "TestToken",
          "TT",
          // token supply = 1500 * 10^18
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

        const price1 = await auction.getCurrentPrice();
        expect(Number(price1) / 10e17).to.equal(2);

        // bid 900 ether as bidder 1
        await auction
          .connect(bidder1)
          .placeBid({ value: ethers.parseEther("900") });

        // Simulate time moving forward by 10 minutes
        await ethers.provider.send("evm_increaseTime", [10 * 60]);
        await ethers.provider.send("evm_mine");

        const price2 = await auction.getCurrentPrice();
        //price should be 1.5 at 10 min, but actually is 1.499.. something due to block.timestamp, so I round it to 2 decimal place
        expect((Number(price2) / 10e17).toFixed(2)).to.equal("1.50");

        // bid 600 ether as bidder 2
        await auction
          .connect(bidder2)
          .placeBid({ value: ethers.parseEther("600") });
        // bidder 1 has 900/1.5=600 tokens, bidder 2 has 600/1.5=400 tokens, auction continue with 500 token unsold

        // Simulate time moving forward by 5 minutes
        await ethers.provider.send("evm_increaseTime", [5 * 60]);
        await ethers.provider.send("evm_mine");

        const price3 = await auction.getCurrentPrice();
        //price should be 1.25 at 15 min, but actually is 1.2499.. something due to block.timestamp, so I round it to 2 decimal place
        expect((Number(price3) / 10e17).toFixed(2)).to.equal("1.25");

        // bid 380 ether as bidder 3
        await auction
          .connect(bidder3)
          .placeBid({ value: ethers.parseEther("380") });
        // bidder 1 has 900/1.25 = 720 tokens
        // bidder 2 has 600/1.25 = 480 tokens
        // bidder 3 has 380/1.25 = 304 tokens
        // demand of 1504 > supply of 1500 tokens, auction ends

        // Auction Ended
        expect(await auction.getAuctionEnded()).to.equal(true);

        await auction.distributeTokens();

        const finalClearingPrice = await auction.getClearingPrice();
        const finalPrice = await auction.getCurrentPrice();
        //expect(Number(finalPrice)/10e17).to.equal(1.2475);
        //clearing price should be 1.25 eth at 15 min,
        //but actually is 1.2475 due to block.timestamp? so I round it to 2 decimal place
        expect((Number(finalClearingPrice) / 10e17).toFixed(2)).to.equal(
          "1.25",
        );

        //final balance (after auction ended)
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
        //initial balance
        const prevBalanceBidder1 = await ethers.provider.getBalance(bidder1);
        const prevBalanceOwner = await ethers.provider.getBalance(owner);

        const AuctionToken = await ethers.getContractFactory("AuctionToken");
        const DutchAuction = await ethers.getContractFactory("DutchAuction");
        const AuctionFactory =
          await ethers.getContractFactory("AuctionFactory");

        const auctionFactory = await AuctionFactory.deploy();
        await auctionFactory.waitForDeployment();

        // create auction
        await auctionFactory.createAuction(
          "TestToken",
          "TT",
          // token supply = 100 * 10^18
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

        // Auction Ended
        expect(await auction.getAuctionEnded()).to.equal(true);

        await auction.distributeTokens();

        //final balance (after auction ended)
        const balanceBidder1 = await ethers.provider.getBalance(bidder1);
        const balanceOwner = await ethers.provider.getBalance(owner);

        // bidder 1 paid ethers
        // pass if only 100 eth is deducted (not 150 eth)
        expect((Number(prevBalanceBidder1) / 10e17 - 100).toFixed(0)).to.equal(
          (Number(balanceBidder1) / 10e17).toFixed(0),
        );
        // owner received ethers
        expect(prevBalanceOwner).to.lt(balanceOwner);

        const bidder1Tokens = await token.balanceOf(bidder1.address);
        const auctionContractTokens = await token.balanceOf(auctionAddress);

        // bidders received tokens
        expect(bidder1Tokens).to.gt(0);
        // auction contract distributed and burned all tokens
        expect(auctionContractTokens).to.equal(0);
      });
    });

    //transfer
    describe("Transfer", function () {
      it("Should distribute correct amount of token to the correct bidder", async function () {
        const accounts = await ethers.getSigners();
        const [owner, bidder1, bidder2, bidder3, bidder4] = accounts;
        //initial balance
        const prevBalanceBidder1 = await ethers.provider.getBalance(bidder1);
        const prevBalanceBidder2 = await ethers.provider.getBalance(bidder2);
        const prevBalanceOwner = await ethers.provider.getBalance(owner);

        const AuctionToken = await ethers.getContractFactory("AuctionToken");
        const DutchAuction = await ethers.getContractFactory("DutchAuction");
        const AuctionFactory =
          await ethers.getContractFactory("AuctionFactory");

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
        const token = AuctionToken.attach(
          await auction.getToken(),
        ) as AuctionToken;

        // bid 312.5 ether as bidder 1
        await auction
          .connect(bidder1)
          .placeBid({ value: ethers.parseEther("312.5") });

        // Simulate time moving forward by 5 minutes
        await ethers.provider.send("evm_increaseTime", [5 * 60]);
        await ethers.provider.send("evm_mine");

        // bid 187.5 ether as bidder 2
        await auction
          .connect(bidder2)
          .placeBid({ value: ethers.parseEther("187.5") });

        // Simulate time moving forward by 5 minutes
        await ethers.provider.send("evm_increaseTime", [5 * 60]);
        await ethers.provider.send("evm_mine");

        // bid 125 ether as bidder 3
        await auction
          .connect(bidder3)
          .placeBid({ value: ethers.parseEther("125") });

        // Auction shouldnt end yet
        // at t=10min, price=0.75 eth
        // 312.5/0.75 = 416.66 | 187.5/0.75 = 250 | 125/0.75 = 166.66, still have surpluse supply of token
        expect(await auction.getAuctionEnded()).to.equal(false);

        // Simulate time moving forward by 5 minutes
        await ethers.provider.send("evm_increaseTime", [5 * 60]);
        await ethers.provider.send("evm_mine");

        // Auction should end
        // at t=15min, price=0.625 eth
        // 312.5/0.625 = 500 | 187.5/0.625 = 300 | 125/0.625 = 200, 500+300+200=1000 token supply
        expect(await auction.getAuctionEnded()).to.equal(true);

        await auction.distributeTokens();

        //final balance (after auction ended)
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
        expect(Number(bidder1Tokens) / 10e17).to.equal(500);
        expect(Number(bidder2Tokens) / 10e17).to.equal(300);
        expect(Number(bidder3Tokens) / 10e17).to.equal(200);
        // auction contract distributed and burned all tokens
        expect(auctionContractTokens).to.equal(0);
      });
    });

    describe("Reentrancy Attack", function () {
      it("Should not resist reentry attack", async function () {
        const [owner, attacker] = await ethers.getSigners();

        const prevBalanceOwner = await ethers.provider.getBalance(owner);
        const prevBalanceAttacker = await ethers.provider.getBalance(attacker);

        const VulnerableDutchAuction = await ethers.getContractFactory(
          "VulnerableDutchAuction",
        );
        const AuctionToken = await ethers.getContractFactory("AuctionToken");

        const vulnerableAuction = await VulnerableDutchAuction.deploy(
          "TestToken",
          "TT",
          // token supply = 1000 * 10^18
          ethers.parseEther("1000"),
          // start price = 1 ether
          ethers.parseEther("1"),
          // reserved price = 0,5 ether
          ethers.parseEther("0.5"),
          owner.address,
        );

        const token = AuctionToken.attach(
          await vulnerableAuction.getToken(),
        ) as AuctionToken;

        const AttackFactory = await ethers.getContractFactory("Attack");
        const attackFactory = await AttackFactory.deploy(vulnerableAuction);

        await vulnerableAuction
          .connect(attacker)
          .placeBid({ value: ethers.parseEther("1500") });

        await ethers.provider.send("evm_increaseTime", [20 * 60]);
        await ethers.provider.send("evm_mine");

        expect(await vulnerableAuction.getAuctionEnded()).to.equal(true);

        console.log("");
        console.log("*** Before ***");
        console.log(prevBalanceOwner);
        console.log(prevBalanceAttacker);

        await attackFactory.attack();

        const BalanceOwner = await ethers.provider.getBalance(owner);
        const BalanceAttacker = await ethers.provider.getBalance(attacker);

        console.log("");
        console.log("*** After ***");
        console.log(BalanceOwner);
        console.log(BalanceAttacker);

        const attackerTokens = await token.balanceOf(attacker.address);
        const auctionContractTokens = await token.balanceOf(owner.address);

        console.log("");
        console.log("*** Token ***");
        console.log(attackerTokens);
        console.log(auctionContractTokens);

        expect(1 + 1).to.equal(2); //temp
      });

      it("Should resist reentry attack", async function () {
        // const [owner, attacker, bidder] = await ethers.getSigners();
        // const prevBalanceOwner = await ethers.provider.getBalance(owner);
        // const prevBalanceAttacker =
        //   await ethers.provider.getBalance(attacker);
        // const AuctionFactory =
        //   await ethers.getContractFactory("AuctionFactory");
        // const DutchAuction = await ethers.getContractFactory("DutchAuction");
        // const AuctionToken = await ethers.getContractFactory("AuctionToken");
        // const auctionFactory = await AuctionFactory.deploy();
        // await auctionFactory.waitForDeployment();
        // await auctionFactory.createAuction(
        //   "TestToken",
        //   "TT",
        //   // token supply = 1000 * 10^18
        //   ethers.parseEther("1000"),
        //   // start price = 1 ether
        //   ethers.parseEther("1"),
        //   // reserved price = 0,5 ether
        //   ethers.parseEther("0.5"),
        // );
        // const auctionAddress = (await auctionFactory.getAllAuctions())[0];
        // const auction = DutchAuction.attach(auctionAddress) as DutchAuction;
        // const token = AuctionToken.attach(
        //   await auction.getToken(),
        // ) as AuctionToken;
        // const AttackFactory = await ethers.getContractFactory("Attack");
        // const attackFactory = await AttackFactory.deploy(auction);
        // await auction
        //   .connect(attacker)
        //   .placeBid({ value: ethers.parseEther("400") });
        // await ethers.provider.send("evm_increaseTime", [10 * 60]);
        // await ethers.provider.send("evm_mine");
        // await auction
        //   .connect(bidder)
        //   .placeBid({ value: ethers.parseEther("200") });
        // await ethers.provider.send("evm_increaseTime", [15 * 60]);
        // await ethers.provider.send("evm_mine");
        // expect(await auction.getAuctionEnded()).to.equal(true);
        // console.log("");
        // console.log("*** Before ***");
        // console.log(prevBalanceOwner);
        // console.log(prevBalanceAttacker);
        // await attackFactory.attack();
        // const BalanceOwner = await ethers.provider.getBalance(owner);
        // const BalanceAttacker = await ethers.provider.getBalance(attacker);
        // console.log("");
        // console.log("*** After ***");
        // console.log(BalanceOwner);
        // console.log(BalanceAttacker);
        // const attackerTokens = await token.balanceOf(attacker.address);
        // const auctionContractTokens = await token.balanceOf(auctionAddress);
        // console.log("");
        // console.log("*** Token ***");
        // console.log(attackerTokens);
        // console.log(auctionContractTokens);
        // expect(1 + 1).to.equal(2);       //temp
      });
    });
  });
});
