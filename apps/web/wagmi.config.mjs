import { defineConfig } from "@wagmi/cli";
import { react } from "@wagmi/cli/plugins";
import AuctionFactoryAbi from "hardhat/artifacts/contracts/AuctionFactory.sol/AuctionFactory.json" assert { type: "json" };
import AuctionTokenAbi from "hardhat/artifacts/contracts/AuctionToken.sol/AuctionToken.json" assert { type: "json" };
import DutchAuctionAbi from "hardhat/artifacts/contracts/DutchAuction.sol/DutchAuction.json" assert { type: "json" };

export default defineConfig({
  out: "./src/generated.ts",
  contracts: [
    {
      name: "auctionFactory",
      abi: AuctionFactoryAbi.abi,
      address: process.env.NEXT_PUBLIC_AUCTION_FACTORY_ADDRESS,
    },
    {
      name: "dutchAuction",
      abi: DutchAuctionAbi.abi,
    },
    {
      name: "auctionToken",
      abi: AuctionTokenAbi.abi,
    },
  ],
  plugins: [react()],
});
