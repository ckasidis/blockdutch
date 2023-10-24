const sharedConfig = require("@ck-oss/prettier-config/with-tailwind");

module.exports = {
  ...sharedConfig,
  plugins: [...sharedConfig.plugins, "prettier-plugin-solidity"],
};
