import "@nomicfoundation/hardhat-chai-matchers";
import "@nomicfoundation/hardhat-toolbox";

import { type HardhatUserConfig } from "hardhat/config";

const config: HardhatUserConfig = {
  solidity: "0.8.20",
  networks: {
    hardhat: {
      accounts: {
        mnemonic: process.env.SEED_PHRASE,
      },
      chainId: 1337,
      // only set mining interval in development
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
