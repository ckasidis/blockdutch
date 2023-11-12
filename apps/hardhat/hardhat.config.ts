import "@nomicfoundation/hardhat-chai-matchers";
import "@nomicfoundation/hardhat-toolbox";

import { type HardhatUserConfig } from "hardhat/config";

const config: HardhatUserConfig = {
  solidity: "0.8.20",
  networks: {
    ...(process.env.SEPOLIA_GATEWAY_URL && process.env.SEPOLIA_PRIVATE_KEY
      ? {
          sepolia: {
            url: process.env.SEPOLIA_GATEWAY_URL,
            accounts: [process.env.SEPOLIA_PRIVATE_KEY],
          },
        }
      : {}),
    hardhat: {
      chainId: 1337,
      // only set mining interval in dev, not test
      ...(process.env.NODE_ENV === "development"
        ? {
            mining: {
              auto: false,
              interval: 5000,
            },
          }
        : {}),
    },
  },
};

export default config;
