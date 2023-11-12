import { expect } from "chai";
import { ethers } from "hardhat";
import { Attack, AuctionToken, DutchAuction } from "../typechain-types";

describe("Re-entrancy", function () {
  it("Should resist re-entrancy attack", async function () {
    const accounts = await ethers.getSigners();
    const [owner, attacker] = accounts;

    const AuctionToken = await ethers.getContractFactory("AuctionToken");
    const DutchAuction = await ethers.getContractFactory("DutchAuction");
    const AuctionFactory = await ethers.getContractFactory("AuctionFactory");
    const Attack = await ethers.getContractFactory("Attack");

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
    const token = AuctionToken.attach(await auction.getToken()) as AuctionToken;
    const attack = (await Attack.connect(attacker).deploy(auction)) as Attack;

    // get initial ether balances
    const prevBalanceOwner = await ethers.provider.getBalance(owner);
    const prevBalanceAttack = await ethers.provider.getBalance(attack);

    // attack contract call attack
    await attack.connect(attacker).attack({ value: ethers.parseEther("1100") });

    // auction should end
    expect(await auction.getAuctionEnded()).to.equal(true);

    // call distribute tokens
    await auction.distributeTokens();
    expect(await auction.getTokensDistributed()).to.equal(true);

    // get final ether balances
    const finalBalanceOwner = await ethers.provider.getBalance(owner);
    const finalBalanceAttack = await ethers.provider.getBalance(attack);

    // contract creator should at least receive full ether balance
    expect(finalBalanceOwner).to.least(
      prevBalanceOwner + ethers.parseEther("999"),
    );

    // attack contract should not receive more than 100 refund
    expect(finalBalanceAttack).to.most(
      prevBalanceAttack + ethers.parseEther("101"),
    );
  });
});
