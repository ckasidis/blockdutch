# Dev Project for NTU CZ4153 Blockchain Technology

## Structure

- apps
  - hardhat = Hardhat project for developing and deploying smart contracts
  - web = Next.js frontend for interacting with smart contract

## Commands

### Root project commands

```sh
# run git commit
npm run commit

# run prettier fix
npm run format:fix

# run prettier check
npm run format:check
```

### Hardhat project (`apps/hardhat`) commands

```sh
# compile solidity contract
npm run compile

# start hardhat local network
npm run dev

# run hardhat test
npm run test
```

### Frontend project (`apps/web`) commands

```sh
# stat dev server
npm run dev

# generate wagmi types and hooks
npm run generate

# run linter
npm run lint
```
